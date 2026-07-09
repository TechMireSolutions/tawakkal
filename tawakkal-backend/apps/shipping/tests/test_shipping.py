import pytest
from decimal import Decimal
from django.urls import reverse
from rest_framework import status
from rest_framework.exceptions import ValidationError

from apps.customers.models import Customer, CustomerAddress
from apps.catalog.models import Category, Product, ProductVariant
from apps.orders.models import Order, OrderStatus
from apps.orders.services.order_service import OrderService

from apps.shipping.models.carrier import ShippingCarrier, ShippingMethod
from apps.shipping.models.shipment import Shipment, ShipmentStatus, ShipmentItem
from apps.shipping.models.returns import ReturnRequest, ReturnStatus, ReturnReason
from apps.shipping.services.shipment_service import ShipmentService
from apps.shipping.services.return_service import ReturnService

from apps.payments.models.payment import PaymentMethod
from apps.payments.services.payment_service import PaymentService

@pytest.fixture
def setup_data(db):
    category = Category.objects.create(name="Clothing", slug="clothing")
    product = Product.objects.create(name="Test Product", slug="test-product", category=category, base_price="20.00")
    # Set physical stock to 100
    variant = ProductVariant.objects.create(product=product, sku="TEST-SKU", stock=100)
    
    customer = Customer.objects.create(customer_code="CUS-001", email="test@example.com", first_name="Test", last_name="User")
    address = CustomerAddress.objects.create(customer=customer, address_type='SHIPPING', address_line1="123 St", city="City", state="State", country="Country", postal_code="12345")
    
    carrier = ShippingCarrier.objects.create(name="FedEx", code="FEDEX")
    shipping_method = ShippingMethod.objects.create(carrier=carrier, name="Overnight", code="OVERNIGHT")
    
    payment_method = PaymentMethod.objects.create(name="Credit Card", slug="credit-card", provider="Stripe")
    
    return {
        'customer': customer,
        'address': address,
        'variant': variant,
        'carrier': carrier,
        'shipping_method': shipping_method,
        'payment_method': payment_method
    }

@pytest.fixture
def test_order(setup_data):
    order_data = {
        'customer': setup_data['customer'],
        'shipping_address': setup_data['address'],
        'shipping_amount': Decimal('10.00'),
    }
    # Order 5 items
    items_data = [
        {'variant_id': setup_data['variant'].id, 'quantity': 5, 'tax_amount': Decimal('2.00'), 'discount_amount': Decimal('0.00')}
    ]
    
    order = OrderService.create_order(data=order_data, items_data=items_data)
    
    # Process payment to enable refund flows
    PaymentService.process_payment(order, setup_data['payment_method'], order.total_amount, "txn_123")
    order.refresh_from_db()
    
    if order.status == OrderStatus.PENDING:
        OrderService.update_status(order.id, OrderStatus.PROCESSING)
        order.refresh_from_db()
    
    return order

@pytest.mark.django_db
class TestShippingModule:

    def test_partial_shipment(self, test_order, setup_data, admin_api_client):
        order_item = test_order.items.first()
        url = reverse('shipment-create-shipment')
        
        # Create a partial shipment of 2 items
        data = {
            'order_id': str(test_order.id),
            'carrier_id': str(setup_data['carrier'].id),
            'shipping_method_id': str(setup_data['shipping_method'].id),
            'items': [
                {'order_item_id': str(order_item.id), 'quantity': 2}
            ]
        }
        
        response = admin_api_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_201_CREATED, response.data
        
        shipment_id = response.data['id']
        shipment = Shipment.objects.get(id=shipment_id)
        assert shipment.items.count() == 1
        assert shipment.items.first().quantity == 2

        # Create another shipment of the remaining 3 items
        data['items'][0]['quantity'] = 3
        response2 = admin_api_client.post(url, data, format='json')
        assert response2.status_code == status.HTTP_201_CREATED
        
        # Try to overship - should fail
        data['items'][0]['quantity'] = 1
        response3 = admin_api_client.post(url, data, format='json')
        assert response3.status_code == status.HTTP_400_BAD_REQUEST

    def test_shipment_state_machine_and_inventory(self, test_order, setup_data):
        order_item = test_order.items.first()
        
        shipment = ShipmentService.create_shipment(
            order=test_order,
            items_data=[{'order_item_id': order_item.id, 'quantity': 5}],
            carrier_id=setup_data['carrier'].id,
            shipping_method_id=setup_data['shipping_method'].id
        )
        
        # Initially pending
        assert shipment.status == ShipmentStatus.PENDING
        
        # Progress states
        shipment = ShipmentService.update_status(shipment.id, ShipmentStatus.READY)
        shipment = ShipmentService.update_status(shipment.id, ShipmentStatus.PACKED)
        
        # Variant should have reserved=5, stock=100
        variant = ProductVariant.objects.get(id=setup_data['variant'].id)
        assert variant.reserved_stock == 5
        assert variant.stock == 100
        
        # Shipped -> should deduct physical and reserved
        shipment = ShipmentService.update_status(shipment.id, ShipmentStatus.SHIPPED)
        variant.refresh_from_db()
        assert variant.reserved_stock == 0
        assert variant.stock == 95
    
        # In Transit
        shipment = ShipmentService.update_status(shipment.id, ShipmentStatus.IN_TRANSIT)
        
        # Out for delivery
        shipment = ShipmentService.update_status(shipment.id, ShipmentStatus.OUT_FOR_DELIVERY)
        
        # Delivered
        shipment = ShipmentService.update_status(shipment.id, ShipmentStatus.DELIVERED)
        test_order.refresh_from_db()
        # Ensure order is delivered too
        assert test_order.status == OrderStatus.DELIVERED

        # Invalid transition
        with pytest.raises(ValidationError):
            ShipmentService.update_status(shipment.id, ShipmentStatus.PACKED)

    def test_partial_return_and_refund(self, test_order, setup_data):
        # Ship all items
        order_item = test_order.items.first()
        shipment = ShipmentService.create_shipment(
            order=test_order,
            items_data=[{'order_item_id': order_item.id, 'quantity': 5}],
            carrier_id=setup_data['carrier'].id,
            shipping_method_id=setup_data['shipping_method'].id
        )
        ShipmentService.update_status(shipment.id, ShipmentStatus.READY)
        ShipmentService.update_status(shipment.id, ShipmentStatus.PACKED)
        ShipmentService.update_status(shipment.id, ShipmentStatus.SHIPPED)
        ShipmentService.update_status(shipment.id, ShipmentStatus.IN_TRANSIT)
        ShipmentService.update_status(shipment.id, ShipmentStatus.OUT_FOR_DELIVERY)
        ShipmentService.update_status(shipment.id, ShipmentStatus.DELIVERED)
        
        shipment_item = shipment.items.first()
        reason = ReturnReason.objects.create(code="DEFECTIVE", description="Defective")
        
        # Return 2 out of 5 items
        return_req = ReturnService.create_return_request(
            order=test_order,
            items_data=[{'shipment_item_id': shipment_item.id, 'quantity': 2, 'reason_id': reason.id}],
            notes="Defective items"
        )
        
        assert return_req.items.count() == 1
        assert return_req.items.first().quantity == 2
        
        # Receive return
        ReturnService.update_status(return_req.id, ReturnStatus.APPROVED)
        ReturnService.update_status(return_req.id, ReturnStatus.RECEIVED)
        
        # Variant stock should have increased by 2
        variant = ProductVariant.objects.get(id=setup_data['variant'].id)
        assert variant.stock == 97  # 100 - 5 + 2
        
        # Process Refund
        ReturnService.update_status(return_req.id, ReturnStatus.REFUNDED)
        
        # Should have a credit note
        return_req.refresh_from_db()
        assert return_req.status == ReturnStatus.REFUNDED
