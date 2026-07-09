from django.db import models, transaction
from django.utils import timezone
from rest_framework.exceptions import ValidationError
from decimal import Decimal

from apps.core.services import BaseService
from apps.audit.utils import log_audit
from django.forms.models import model_to_dict

from ..models.order import Order, OrderStatus, PaymentStatus
from ..models.item import OrderItem
from ..models.timeline import OrderTimeline
from ..models.note import OrderNote
from ..repositories.order_repository import OrderRepository

from apps.catalog.models import ProductVariant, InventoryReason
from apps.catalog.services.product_service import ProductService
from apps.customers.models import CustomerTimeline
from apps.notifications.services.notification_service import NotificationService

class OrderService(BaseService):
    repository = OrderRepository

    # State machine valid transitions
    VALID_TRANSITIONS = {
        OrderStatus.PENDING: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
        OrderStatus.PROCESSING: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
        OrderStatus.SHIPPED: [OrderStatus.DELIVERED],
        OrderStatus.DELIVERED: [OrderStatus.RETURN_REQUESTED],
        OrderStatus.RETURN_REQUESTED: [OrderStatus.RETURNED],
        OrderStatus.RETURNED: [],
        OrderStatus.CANCELLED: [],
        OrderStatus.REFUNDED: [],
    }

    @classmethod
    def _generate_order_number(cls):
        count = Order.all_objects.count()
        return f"ORD-{count + 1:06d}"

    @classmethod
    @transaction.atomic
    def create_order(cls, data, items_data, user=None, request=None):
        """
        Creates an order, reserves inventory for each item, computes totals, and creates timelines.
        """
        customer = data['customer']
        shipping_address = data['shipping_address']
        billing_address = data.get('billing_address') or shipping_address
        
        order = Order(
            order_number=cls._generate_order_number(),
            customer=customer,
            shipping_address=shipping_address,
            billing_address=billing_address,
            currency=data.get('currency', 'USD'),
            shipping_amount=data.get('shipping_amount', Decimal('0.00')),
            discount_amount=data.get('discount_amount', Decimal('0.00')),
            payment_provider=data.get('payment_provider') or '',
            payment_reference=data.get('payment_reference') or '',
            payment_method=data.get('payment_method') or '',
        )
        
        # Save order first to get an ID for related items
        order.save()
        
        total_amount = Decimal('0.00')
        tax_amount = Decimal('0.00')
        
        for item_data in items_data:
            variant_id = item_data['variant_id']
            quantity = item_data['quantity']
            
            # Select variant for update to prevent concurrent reservation issues
            variant = ProductVariant.objects.select_for_update().get(id=variant_id)
            
            if variant.available_stock < quantity:
                raise ValidationError(f"Insufficient stock for {variant.sku}. Requested: {quantity}, Available: {variant.available_stock}")
            
            # Use ProductService to safely reserve stock
            ProductService.reserve_stock(variant.id, quantity, user=user)
            
            # Snapshot variant info
            product = variant.product
            unit_price = variant.get_price()
            item_tax = item_data.get('tax_amount', Decimal('0.00'))
            item_total = (unit_price * quantity) + item_tax - item_data.get('discount_amount', Decimal('0.00'))
            
            OrderItem.objects.create(
                order=order,
                variant=variant,
                product_name=product.name,
                sku=variant.sku,
                barcode=getattr(variant, 'barcode', ''),
                color=variant.color.name if variant.color else '',
                size=variant.size.name if variant.size else '',
                quantity=quantity,
                unit_price=unit_price,
                tax_amount=item_tax,
                discount_amount=item_data.get('discount_amount', Decimal('0.00')),
                total_price=item_total
            )
            
            total_amount += item_total
            tax_amount += item_tax
            
        order.total_amount = total_amount + order.shipping_amount
        order.tax_amount = tax_amount
        order.save()
        
        OrderTimeline.objects.create(
            order=order,
            event_type='Created',
            description='Order created and stock reserved.',
            performed_by=user
        )
        
        # Module 9: Auto-generate draft invoice
        from apps.payments.services.invoice_service import InvoiceService
        InvoiceService.create_invoice(order, user)
        
        CustomerTimeline.objects.create(
            customer=customer,
            event_type='Placed Order',
            description=f'Placed order {order.order_number}',
            performed_by=user
        )
        
        log_audit(
            action='CREATE',
            instance=order,
            user=user,
            after_state=model_to_dict(order),
            request=request
        )
        
        # Module 15: Notify Order Created
        if hasattr(customer, 'user') and customer.user:
            NotificationService.dispatch(
                recipient=customer.user,
                template_code='ORDER_CREATED',
                variables={'order_number': order.order_number, 'customer_name': customer.user.first_name},
                related_object=order,
                sender=user
            )
        
        return order

    @classmethod
    @transaction.atomic
    def update_status(cls, order_id, new_status, user=None, request=None):
        order = cls.repository.get_by_id(order_id)
        if not order:
            raise ValidationError("Order not found.")
            
        old_status = order.status
        
        if old_status == new_status:
            return order
            
        if new_status not in cls.VALID_TRANSITIONS.get(old_status, []):
            raise ValidationError(f"Invalid transition from {old_status} to {new_status}")
            
        order.status = new_status
        
        # State-specific logic
        if new_status == OrderStatus.CANCELLED:
            # Release reservations
            for item in order.items.all():
                if item.variant:
                    ProductService.release_stock(item.variant.id, item.quantity, user=user)
            
            CustomerTimeline.objects.create(
                customer=order.customer,
                event_type='Cancelled Order',
                description=f'Cancelled order {order.order_number}',
                performed_by=user
            )
            
        elif new_status == OrderStatus.SHIPPED:
            order.shipped_at = timezone.now()
            # Note: Inventory deduction is now handled by ShipmentService on a per-shipment basis.
        elif new_status == OrderStatus.DELIVERED:
            order.delivered_at = timezone.now()
            
            # Update customer statistics
            customer = order.customer
            # Safe increment inside atomic
            customer.total_orders += 1
            customer.total_spent += order.total_amount
            customer.average_order_value = customer.total_spent / customer.total_orders
            customer.last_order_date = timezone.now()
            customer.save(update_fields=['total_orders', 'total_spent', 'average_order_value', 'last_order_date'])
            
        elif new_status == OrderStatus.RETURNED:
            # Note: Inventory restoration is now handled by ReturnService on a per-return basis.
            CustomerTimeline.objects.create(
                customer=order.customer,
                event_type='Returned Order',
                description=f'Returned order {order.order_number}',
                performed_by=user
            )

        order.save()
        
        OrderTimeline.objects.create(
            order=order,
            event_type='Status Changed',
            description=f'Status changed from {old_status} to {new_status}',
            performed_by=user
        )
        
        log_audit(
            action='UPDATE',
            instance=order,
            user=user,
            before_state={'status': old_status},
            after_state=model_to_dict(order),
            request=request
        )
        
        # Module 15: Notify Order Status Changed
        if hasattr(order.customer, 'user') and order.customer.user:
            template_code = f"ORDER_{new_status.upper()}"
            NotificationService.dispatch(
                recipient=order.customer.user,
                template_code=template_code,
                variables={'order_number': order.order_number, 'customer_name': order.customer.user.first_name, 'status': new_status},
                related_object=order,
                sender=user
            )
        
        return order

    @classmethod
    @transaction.atomic
    def add_note(cls, order_id, text, user=None):
        order = cls.repository.get_by_id(order_id)
        note = OrderNote.objects.create(
            order=order,
            author=user,
            text=text
        )
        return note
