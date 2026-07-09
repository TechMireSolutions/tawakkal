import pytest
from decimal import Decimal
from django.urls import reverse
from rest_framework import status
from django.utils import timezone

from apps.customers.models import Customer, CustomerAddress, CustomerStatus, CustomerTier
from apps.catalog.models import Category, Product, ProductVariant, ProductColor, ProductSize
from apps.orders.models import Order, OrderStatus
from apps.orders.services.order_service import OrderService

from apps.payments.models.method import PaymentMethod
from apps.payments.models.invoice import Invoice, InvoiceStatus
from apps.payments.models.payment import Payment, PaymentStatus
from apps.payments.models.refund import Refund, RefundStatus
from apps.payments.services.payment_service import PaymentService
from apps.payments.services.refund_service import RefundService

@pytest.fixture
def setup_data(db):
    category = Category.objects.create(name="Clothing", slug="clothing")
    product = Product.objects.create(name="Test T-Shirt", slug="test-tshirt", category=category, base_price="20.00")
    variant = ProductVariant.objects.create(product=product, sku="TEST-RED-L", stock=100)
    
    customer = Customer.objects.create(customer_code="CUS-001", email="test@example.com", first_name="Test", last_name="User")
    address = CustomerAddress.objects.create(customer=customer, address_type='SHIPPING', address_line1="123 St", city="City", state="State", country="Country", postal_code="12345")
    
    payment_method = PaymentMethod.objects.create(name="Credit Card", slug="credit-card", provider="Stripe")
    
    return {
        'customer': customer,
        'address': address,
        'variant': variant,
        'payment_method': payment_method
    }

@pytest.fixture
def test_order(setup_data):
    order_data = {
        'customer': setup_data['customer'],
        'shipping_address': setup_data['address'],
        'shipping_amount': Decimal('10.00'),
    }
    items_data = [
        {'variant_id': setup_data['variant'].id, 'quantity': 2, 'tax_amount': Decimal('2.00'), 'discount_amount': Decimal('0.00')}
    ]
    
    order = OrderService.create_order(data=order_data, items_data=items_data)
    return order

@pytest.mark.django_db
class TestPaymentsModule:
    
    def test_invoice_auto_generated(self, test_order):
        # Order should have a draft invoice automatically created
        invoices = test_order.invoices.all()
        assert invoices.count() == 1
        
        invoice = invoices.first()
        assert invoice.status == InvoiceStatus.DRAFT
        # Subtotal: 2 * 20 = 40. Tax = 2. Shipping = 10. Total = 52.
        assert invoice.total_amount == Decimal('52.00')
        assert invoice.subtotal == Decimal('40.00')

    def test_process_payment_allocates_invoice(self, admin_api_client, test_order, setup_data):
        url = reverse('payment-process-payment')
        data = {
            'order_id': str(test_order.id),
            'payment_method_id': str(setup_data['payment_method'].id),
            'amount': '52.00',
            'transaction_id': 'txn_123456'
        }
        
        response = admin_api_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_201_CREATED, response.data
        
        # Verify invoice is paid
        invoice = test_order.invoices.first()
        assert invoice.status == InvoiceStatus.PAID
        assert invoice.amount_paid == Decimal('52.00')
        
        # Verify order payment status
        test_order.refresh_from_db()
        assert test_order.payment_status == 'PAID'

    def test_partial_payment(self, admin_api_client, test_order, setup_data):
        url = reverse('payment-process-payment')
        data = {
            'order_id': str(test_order.id),
            'payment_method_id': str(setup_data['payment_method'].id),
            'amount': '20.00',
            'transaction_id': 'txn_partial'
        }
        
        response = admin_api_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        
        invoice = test_order.invoices.first()
        assert invoice.status == InvoiceStatus.PARTIALLY_PAID
        assert invoice.amount_paid == Decimal('20.00')

    def test_create_refund(self, test_order, setup_data):
        payment = PaymentService.process_payment(
            order=test_order,
            payment_method=setup_data['payment_method'],
            amount=Decimal('52.00'),
            transaction_id='txn_full'
        )
        
        refund = RefundService.create_refund(
            payment=payment,
            amount=Decimal('52.00'),
            reason="Customer dissatisfied"
        )
        
        assert refund.status == RefundStatus.COMPLETED
        assert hasattr(refund, 'credit_note')
        assert refund.credit_note.amount == Decimal('52.00')
        
        payment.refresh_from_db()
        assert payment.status == PaymentStatus.REFUNDED
