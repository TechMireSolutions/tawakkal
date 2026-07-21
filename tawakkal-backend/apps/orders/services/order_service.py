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
        OrderStatus.PENDING: [OrderStatus.PROCESSING, OrderStatus.CANCELLED, OrderStatus.DELIVERED, OrderStatus.SHIPPED],
        OrderStatus.PROCESSING: [OrderStatus.SHIPPED, OrderStatus.CANCELLED, OrderStatus.DELIVERED],
        OrderStatus.SHIPPED: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
        OrderStatus.DELIVERED: [OrderStatus.RETURN_REQUESTED, OrderStatus.CANCELLED],
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
            variant_id = item_data.get('variant_id')
            product_id = item_data.get('product_id')
            quantity = item_data.get('quantity', 1)
            
            if not variant_id and product_id:
                # Fallback: Find default variant or first variant for the product
                from apps.catalog.models.product import ProductVariant
                variant = ProductVariant.objects.filter(product_id=product_id).first()
                if not variant:
                    raise ValidationError(f"No variant found for product ID {product_id}")
                variant_id = variant.id
            elif not variant_id:
                raise ValidationError("Either variant_id or product_id must be provided for order items.")
            
            # Select variant for update to prevent concurrent reservation issues
            from apps.catalog.models.product import ProductVariant
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
            
        # Send Thank You & Order Confirmation Email to Buyer
        cls.send_order_confirmation_email(order)
        
        return order

    @classmethod
    def send_order_confirmation_email(cls, order):
        if not order or not order.customer or not order.customer.email:
            return
        
        from django.core.mail import send_mail
        from django.conf import settings
        
        customer_email = order.customer.email.strip()
        first_name = order.customer.first_name or 'Valued'
        last_name = order.customer.last_name or 'Customer'
        customer_name = f"{first_name} {last_name}".strip()
        order_number = order.order_number
        currency = order.currency or 'PKR'
        total_amount = f"{order.total_amount:,.2f}"
        
        subject = f"Order Confirmation - {order_number} | Tawakkal Store"
        
        plain_message = (
            f"Dear {customer_name},\n\n"
            f"Thank you for your purchase with Tawakkal Store!\n"
            f"Your order ID is: {order_number}\n"
            f"Total Amount: {currency} {total_amount}\n\n"
            f"We are preparing your items and will notify you as soon as your order ships.\n\n"
            f"Thank you for shopping with us!\nTawakkal Store Team"
        )
        
        html_message = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
          <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #cda434;">
            <h1 style="color: #1c1c1c; margin: 0; font-size: 26px; font-weight: 700;">Tawakkal Store</h1>
            <p style="color: #cda434; font-size: 16px; font-weight: 600; margin: 6px 0 0;">Thank You For Your Order!</p>
          </div>
          
          <div style="padding: 24px 0;">
            <p style="font-size: 16px; color: #1f2937; margin: 0 0 16px;">Dear <strong>{customer_name}</strong>,</p>
            <p style="font-size: 15px; color: #4b5563; line-height: 1.6; margin: 0 0 20px;">
              Thank you so much for your purchase! We have successfully received your order and our team is now preparing it for shipment.
            </p>
            
            <div style="background-color: #f8fafc; border-left: 4px solid #cda434; border-radius: 8px; padding: 16px 20px; margin: 24px 0;">
              <p style="margin: 0 0 4px; font-size: 12px; font-weight: 600; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em;">Order Reference</p>
              <p style="margin: 0 0 16px; font-size: 22px; font-weight: 700; color: #0f172a;">{order_number}</p>
              
              <p style="margin: 0 0 4px; font-size: 12px; font-weight: 600; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em;">Total Amount</p>
              <p style="margin: 0; font-size: 20px; font-weight: 700; color: #cda434;">{currency} {total_amount}</p>
            </div>
            
            <p style="font-size: 15px; color: #4b5563; line-height: 1.6; margin: 20px 0 0;">
              We will contact you as soon as your parcel is dispatched. If you have any questions, feel free to reply directly to this email.
            </p>
          </div>
          
          <div style="text-align: center; padding-top: 20px; border-top: 1px solid #f1f5f9; font-size: 12px; color: #94a3b8;">
            <p style="margin: 0;">&copy; 2026 Tawakkal Store. All rights reserved.</p>
          </div>
        </div>
        """
        
        from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@tawakkal.store')
        
        try:
            send_mail(
                subject=subject,
                message=plain_message,
                from_email=from_email,
                recipient_list=[customer_email],
                html_message=html_message,
                fail_silently=True
            )
            print(f"Order confirmation email sent to {customer_email} for {order_number}")
        except Exception as e:
            print(f"Failed to send order email: {e}")

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
            customer.total_orders += 1
            customer.total_spent += order.total_amount
            customer.average_order_value = customer.total_spent / customer.total_orders if customer.total_orders > 0 else 0
            customer.last_order_date = timezone.now()
            customer.save(update_fields=['total_orders', 'total_spent', 'average_order_value', 'last_order_date'])
            
            # Send Completion email to customer
            cls.send_order_completion_email(order)
            
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
        
        return order

    @classmethod
    def send_order_completion_email(cls, order):
        if not order or not order.customer or not order.customer.email:
            return
        
        from django.core.mail import send_mail
        from django.conf import settings
        
        customer_email = order.customer.email.strip()
        first_name = order.customer.first_name or 'Valued'
        last_name = order.customer.last_name or 'Customer'
        customer_name = f"{first_name} {last_name}".strip()
        order_number = order.order_number
        currency = order.currency or 'PKR'
        total_amount = f"{order.total_amount:,.2f}"
        
        subject = f"Order Completed - {order_number} | Tawakkal Store"
        
        plain_message = (
            f"Dear {customer_name},\n\n"
            f"Great news! Your order {order_number} has been marked as Completed.\n"
            f"Total Amount: {currency} {total_amount}\n\n"
            f"Thank you so much for shopping with Tawakkal Store. We hope to serve you again soon!\n\n"
            f"Warm regards,\nTawakkal Store Team"
        )
        
        html_message = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
          <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #10b981;">
            <h1 style="color: #1c1c1c; margin: 0; font-size: 26px; font-weight: 700;">Tawakkal Store</h1>
            <p style="color: #10b981; font-size: 16px; font-weight: 600; margin: 6px 0 0;">Order Completed Successfully! 🎉</p>
          </div>
          
          <div style="padding: 24px 0;">
            <p style="font-size: 16px; color: #1f2937; margin: 0 0 16px;">Dear <strong>{customer_name}</strong>,</p>
            <p style="font-size: 15px; color: #4b5563; line-height: 1.6; margin: 0 0 20px;">
              We are delighted to inform you that your order <strong>{order_number}</strong> has been marked as <strong>Completed</strong>!
            </p>
            
            <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; border-radius: 8px; padding: 16px 20px; margin: 24px 0;">
              <p style="margin: 0 0 4px; font-size: 12px; font-weight: 600; text-transform: uppercase; color: #166534; letter-spacing: 0.05em;">Order Reference</p>
              <p style="margin: 0 0 16px; font-size: 22px; font-weight: 700; color: #0f172a;">{order_number}</p>
              
              <p style="margin: 0 0 4px; font-size: 12px; font-weight: 600; text-transform: uppercase; color: #166534; letter-spacing: 0.05em;">Total Amount Paid</p>
              <p style="margin: 0; font-size: 20px; font-weight: 700; color: #10b981;">{currency} {total_amount}</p>
            </div>
            
            <p style="font-size: 15px; color: #4b5563; line-height: 1.6; margin: 20px 0 0;">
              Thank you for trusting Tawakkal Store. We appreciate your business and look forward to serving you again soon!
            </p>
          </div>
          
          <div style="text-align: center; padding-top: 20px; border-top: 1px solid #f1f5f9; font-size: 12px; color: #94a3b8;">
            <p style="margin: 0;">&copy; 2026 Tawakkal Store. All rights reserved.</p>
          </div>
        </div>
        """
        
        from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@tawakkal.store')
        
        try:
            send_mail(
                subject=subject,
                message=plain_message,
                from_email=from_email,
                recipient_list=[customer_email],
                html_message=html_message,
                fail_silently=True
            )
            print(f"Order completion email sent to {customer_email} for {order_number}")
        except Exception as e:
            print(f"Failed to send completion email: {e}")
        
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
