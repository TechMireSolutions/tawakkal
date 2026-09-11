import pytest
from rest_framework.test import APIClient
from rest_framework import status
from django.urls import reverse
from apps.orders.models.sales_employee import SalesEmployee
from apps.orders.models.order import Order
from apps.customers.models import Customer
from apps.users.models import User
import json

@pytest.mark.django_db
class TestSalesEmployee:
    def setup_method(self):
        self.client = APIClient()
        self.admin = User.objects.create_superuser(
            email='admin@example.com',
            password='password123',
            first_name='Admin',
            last_name='User'
        )
        
        self.customer = Customer.objects.create(
            email='customer@example.com',
            first_name='Test',
            last_name='Customer'
        )

    def test_create_sales_employee_admin(self):
        self.client.force_authenticate(user=self.admin)
        url = reverse('sales-employee-list')
        data = {
            'first_name': 'John',
            'last_name': 'Doe'
        }
        response = self.client.post(url, data)
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['first_name'] == 'John'
        assert response.data['last_name'] == 'Doe'
        assert response.data['coupon_code'] == 'JOHN-DOE'

    def test_unique_name_constraint(self):
        self.client.force_authenticate(user=self.admin)
        url = reverse('sales-employee-list')
        
        # Create first employee
        self.client.post(url, {'first_name': 'Jane', 'last_name': 'Smith'})
        
        # Try creating duplicate
        response = self.client.post(url, {'first_name': 'JANE', 'last_name': 'smith'})
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_coupon_validation_endpoint(self):
        SalesEmployee.objects.create(first_name='Alice', last_name='Wonder')
        
        url = reverse('storefront-coupon-validate')
        # Test valid case-insensitive
        response = self.client.post(url, {'coupon_code': 'alice-wonder'})
        assert response.status_code == status.HTTP_200_OK
        assert response.data['valid'] is True
        
        # Test invalid
        response = self.client.post(url, {'coupon_code': 'INVALID-CODE'})
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_create_order_with_coupon(self):
        emp = SalesEmployee.objects.create(first_name='Bob', last_name='Builder')
        
        url = reverse('storefront-checkout')
        data = {
            'customer_name': 'Test Customer',
            'email': 'buyer@example.com',
            'phone': '1234567890',
            'address': '123 Street',
            'payment_method': 'COD',
            'coupon_code': 'BOB-BUILDER'
        }
        
        response = self.client.post(url, data, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        
        order = Order.objects.first()
        assert order.sold_by_employee == emp

    def test_create_order_invalid_coupon(self):
        url = reverse('storefront-checkout')
        data = {
            'customer_name': 'Test Customer',
            'email': 'buyer@example.com',
            'phone': '1234567890',
            'address': '123 Street',
            'payment_method': 'COD',
            'coupon_code': 'FAKE-CODE'
        }
        
        response = self.client.post(url, data, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'coupon_code' in str(response.data)
