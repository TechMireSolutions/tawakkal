from django.db import transaction
from rest_framework.exceptions import ValidationError
from apps.core.services import BaseService
from apps.payments.services.sequence_service import SequenceGeneratorService
from apps.payments.services.refund_service import RefundService
from apps.catalog.services.product_service import ProductService
from ..models.returns import ReturnRequest, ReturnItem, ReturnStatus, ReturnTimeline
from ..models.shipment import ShipmentItem
from ..repositories.return_repository import ReturnRequestRepository

class ReturnService(BaseService):
    repository = ReturnRequestRepository

    VALID_TRANSITIONS = {
        ReturnStatus.REQUESTED: [ReturnStatus.APPROVED, ReturnStatus.REJECTED, ReturnStatus.CLOSED],
        ReturnStatus.APPROVED: [ReturnStatus.RECEIVED, ReturnStatus.CLOSED],
        ReturnStatus.RECEIVED: [ReturnStatus.REFUNDED, ReturnStatus.CLOSED],
        ReturnStatus.REFUNDED: [ReturnStatus.CLOSED],
        ReturnStatus.REJECTED: [ReturnStatus.CLOSED],
        ReturnStatus.CLOSED: []
    }

    @classmethod
    @transaction.atomic
    def create_return_request(cls, order, items_data, notes="", user=None):
        """
        items_data format: [{'shipment_item_id': UUID, 'quantity': int, 'reason_id': UUID (optional)}, ...]
        """
        # Validate returned quantities do not exceed shipped quantities
        for item_data in items_data:
            shipment_item = ShipmentItem.objects.get(id=item_data['shipment_item_id'])
            
            # Check previously returned amounts
            returned_qty = sum(
                ri.quantity for ri in shipment_item.returned_items.filter(
                    return_request__status__in=[ReturnStatus.REQUESTED, ReturnStatus.APPROVED, ReturnStatus.RECEIVED, ReturnStatus.REFUNDED, ReturnStatus.CLOSED]
                ) if ri.return_request.status != ReturnStatus.REJECTED
            )
            
            if returned_qty + item_data['quantity'] > shipment_item.quantity:
                raise ValidationError(f"Cannot return more {shipment_item.sku} than shipped. Shipped: {shipment_item.quantity}, Already processing return: {returned_qty}")

        return_number = SequenceGeneratorService.generate("RET", ReturnRequest)
        
        return_req = ReturnRequest.objects.create(
            return_number=return_number,
            order=order,
            notes=notes,
            status=ReturnStatus.REQUESTED
        )
        
        for item_data in items_data:
            shipment_item = ShipmentItem.objects.get(id=item_data['shipment_item_id'])
            qty = item_data['quantity']
            
            from decimal import Decimal
            ratio = Decimal(qty) / Decimal(shipment_item.quantity)
            
            ReturnItem.objects.create(
                return_request=return_req,
                shipment_item=shipment_item,
                reason_id=item_data.get('reason_id'),
                quantity=qty,
                sku=shipment_item.sku,
                product_name=shipment_item.product_name,
                variant_id=shipment_item.variant_id,
                price=shipment_item.unit_price,
                tax=shipment_item.tax_amount * ratio,
                discount=shipment_item.discount_amount * ratio
            )

        ReturnTimeline.objects.create(
            return_request=return_req,
            event_type='Created',
            description='Return request created.',
            performed_by=user
        )

        return return_req

    @classmethod
    @transaction.atomic
    def update_status(cls, return_id, new_status, user=None):
        return_req = ReturnRequest.objects.select_for_update().get(id=return_id)
        old_status = return_req.status
        
        if old_status == new_status:
            return return_req

        if new_status not in cls.VALID_TRANSITIONS.get(old_status, []):
            raise ValidationError(f"Invalid transition from {old_status} to {new_status}")

        return_req.status = new_status
        return_req.save()
        
        ReturnTimeline.objects.create(
            return_request=return_req,
            event_type=f'Status Changed: {new_status}',
            description=f'Return request transitioned from {old_status} to {new_status}.',
            performed_by=user
        )
        
        if new_status == ReturnStatus.RECEIVED:
            cls._handle_received(return_req)
            
        elif new_status == ReturnStatus.REFUNDED:
            cls._handle_refunded(return_req, user)
            
        # Module 15: Notify Return Status
        if hasattr(return_req.order.customer, 'user') and return_req.order.customer.user:
            from apps.notifications.services.notification_service import NotificationService
            template_code = f"RETURN_{new_status.upper()}"
            NotificationService.dispatch(
                recipient=return_req.order.customer.user,
                template_code=template_code,
                variables={'order_number': return_req.order.order_number, 'return_number': return_req.return_number, 'customer_name': return_req.order.customer.user.first_name, 'status': new_status},
                related_object=return_req,
                sender=user
            )
            
        return return_req

    @classmethod
    def _handle_received(cls, return_req):
        # Restore physical stock
        for item in return_req.items.all():
            if item.variant_id:
                ProductService.adjust_stock(item.variant_id, item.quantity, 'RETURN', user=None, reference_type='RETURN', reference_id=return_req.return_number)

    @classmethod
    def _handle_refunded(cls, return_req, user):
        # Auto-trigger payment refund. 
        # Calculate total value of returned items
        total_refund_amount = sum(
            (i.price * i.quantity) + i.tax - i.discount for i in return_req.items.all()
        )
        
        # Get the first paid payment of the order
        from apps.payments.models.payment import PaymentStatus
        payment = return_req.order.payments.filter(status__in=[PaymentStatus.PAID, PaymentStatus.PARTIALLY_REFUNDED]).first()
        
        if payment:
            # We don't want to refund more than the payment has available
            refundable = payment.amount - sum(r.amount for r in payment.refunds.filter(status='COMPLETED'))
            actual_refund = min(total_refund_amount, refundable)
            
            if actual_refund > 0:
                RefundService.create_refund(
                    payment=payment,
                    amount=actual_refund,
                    reason=f"Refund for return {return_req.return_number}",
                    user=user
                )
