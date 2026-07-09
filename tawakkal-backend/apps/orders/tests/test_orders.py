import pytest
from django.urls import reverse
from rest_framework import status
from django.utils import timezone
from decimal import Decimal
from apps.customers.models import Customer, CustomerAddress, CustomerStatus, CustomerTier
from apps.catalog.models import Category, Product, ProductVariant, ProductColor, ProductSize
from apps.orders.models import Order, OrderStatus, PaymentStatus

@pytest.fixture
def setup_data(db):
    # Category and Product
    category = Category.objects.create(name="Clothing", slug="clothing")
    product = Product.objects.create(
        name="Test T-Shirt",
        slug="test-tshirt",
        category=category,
        base_price="20.00"
    )
    
    # Variant
    color = ProductColor.objects.create(name="Red", code="#FF0000")
    size = ProductSize.objects.create(name="Large", code="L")
    variant = ProductVariant.objects.create(
        product=product,
        sku="TEST-RED-L",
        color=color,
        size=size,
        stock=10,
        reserved_stock=0
    )
    
    # Customer
    customer = Customer.objects.create(
        customer_code="CUS-000001",
        email="test@example.com",
        phone="+1234567890",
        first_name="Test",
        last_name="User",
        status=CustomerStatus.ACTIVE,
        tier=CustomerTier.BRONZE
    )
    
    # Address
    address = CustomerAddress.objects.create(
        customer=customer,
        address_type='SHIPPING',
        address_line1="123 Test St",
        city="Testville",
        state="TestState",
        country="Testland",
        postal_code="12345"
    )
    
    return {
        'customer': customer,
        'address': address,
        'variant': variant,
        'product': product
    }

@pytest.mark.django_db
class TestOrderModule:

    def test_create_order(self, admin_api_client, setup_data):
        url = reverse('order-list')
        data = {
            'customer': str(setup_data['customer'].id),
            'shipping_address': str(setup_data['address'].id),
            'currency': 'USD',
            'shipping_amount': '5.00',
            'items': [
                {
                    'variant_id': str(setup_data['variant'].id),
                    'quantity': 2,
                    'tax_amount': '1.00',
                    'discount_amount': '0.00'
                }
            ]
        }
        
        response = admin_api_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_201_CREATED, response.data
        
        # Check if stock was reserved
        setup_data['variant'].refresh_from_db()
        assert setup_data['variant'].reserved_stock == 2
        assert setup_data['variant'].stock == 10
        assert setup_data['variant'].available_stock == 8
        
        # Check order amount: (20 * 2) + 1.00 tax + 5.00 shipping = 46.00
        assert response.data['total_amount'] == '46.00'
        assert response.data['tax_amount'] == '1.00'
        assert response.data['status'] == OrderStatus.PENDING

    def test_insufficient_stock(self, admin_api_client, setup_data):
        url = reverse('order-list')
        data = {
            'customer': str(setup_data['customer'].id),
            'shipping_address': str(setup_data['address'].id),
            'items': [
                {
                    'variant_id': str(setup_data['variant'].id),
                    'quantity': 15, # Only 10 available
                }
            ]
        }
        response = admin_api_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        
        setup_data['variant'].refresh_from_db()
        assert setup_data['variant'].reserved_stock == 0

    def test_order_status_transitions(self, admin_api_client, setup_data):
        # 1. Create order
        create_res = admin_api_client.post(reverse('order-list'), {
            'customer': str(setup_data['customer'].id),
            'shipping_address': str(setup_data['address'].id),
            'items': [{'variant_id': str(setup_data['variant'].id), 'quantity': 1}]
        }, format='json')
        order_id = create_res.data['id']
        
        # 2. Transition to PROCESSING
        url = reverse('order-update-status', args=[order_id])
        res = admin_api_client.post(url, {'status': OrderStatus.PROCESSING}, format='json')
        assert res.status_code == status.HTTP_200_OK
        
        # 3. Transition to SHIPPED
        res = admin_api_client.post(url, {'status': OrderStatus.SHIPPED}, format='json')
        assert res.status_code == status.HTTP_200_OK
        
        # Verify physical stock deducted
        setup_data['variant'].refresh_from_db()
        assert setup_data['variant'].reserved_stock == 0
        assert setup_data['variant'].stock == 9
        
        # 4. Transition to DELIVERED
        res = admin_api_client.post(url, {'status': OrderStatus.DELIVERED}, format='json')
        assert res.status_code == status.HTTP_200_OK
        
        # Verify customer stats updated
        setup_data['customer'].refresh_from_db()
        assert setup_data['customer'].total_orders == 1
        assert setup_data['customer'].total_spent == Decimal('20.00')

    def test_order_cancellation(self, admin_api_client, setup_data):
        # Create order
        create_res = admin_api_client.post(reverse('order-list'), {
            'customer': str(setup_data['customer'].id),
            'shipping_address': str(setup_data['address'].id),
            'items': [{'variant_id': str(setup_data['variant'].id), 'quantity': 2}]
        }, format='json')
        order_id = create_res.data['id']
        
        setup_data['variant'].refresh_from_db()
        assert setup_data['variant'].reserved_stock == 2
        
        # Cancel
        res = admin_api_client.post(reverse('order-update-status', args=[order_id]), {'status': OrderStatus.CANCELLED}, format='json')
        assert res.status_code == status.HTTP_200_OK
        
        # Verify stock reservation released
        setup_data['variant'].refresh_from_db()
        assert setup_data['variant'].reserved_stock == 0
        assert setup_data['variant'].stock == 10
