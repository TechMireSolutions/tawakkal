from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from django.utils import timezone
from apps.users.models import User
from apps.orders.models import Order
from apps.customers.models import Customer, CustomerAddress
from apps.catalog.models import Product, Category

class AnalyticsTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_superuser(
            email='admin@example.com',
            password='password123',
            first_name='Admin',
            last_name='User'
        )
        self.user = User.objects.create_user(
            email='user@example.com',
            password='password123'
        )
        self.dashboard_url = reverse('dashboard-stats')
        self.recent_url = reverse('recent-activity')
        self.overview_url = reverse('overview')

    def test_permissions(self):
        # Unauthenticated
        response = self.client.get(self.dashboard_url)
        self.assertEqual(response.status_code, 401)
        
        # Non-admin user
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.dashboard_url)
        self.assertEqual(response.status_code, 403)
        
        # Admin user
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(self.dashboard_url)
        self.assertEqual(response.status_code, 200)

    def test_empty_database(self):
        self.client.force_authenticate(user=self.admin)
        
        response = self.client.get(self.dashboard_url)
        self.assertEqual(response.status_code, 200)
        data = response.json()['data']
        self.assertEqual(data['totalOrders'], 0)
        self.assertEqual(data['revenue'], 0.0)
        
        response = self.client.get(self.recent_url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()['data']), 0)
        
        response = self.client.get(self.overview_url)
        self.assertEqual(response.status_code, 200)
        data = response.json()['data']
        self.assertEqual(data['revenue']['total'], 0.0)
        self.assertEqual(len(data['topProducts']), 0)

    def test_populated_database_aggregations(self):
        # Create some data
        category = Category.objects.create(name='Test Category', slug='test')
        product = Product.objects.create(name='Test Product', slug='test', category=category, base_price=100.0)
        customer = Customer.objects.create(user=self.user, first_name='Test', last_name='Customer', email='test@test.com')
        address = CustomerAddress.objects.create(
            customer=customer, 
            address_line1='123 Test St', 
            city='Test City', 
            state='Test State', 
            country='Test Country', 
            postal_code='12345', 
            is_default=True
        )
        
        order = Order.objects.create(
            customer=customer,
            shipping_address=address,
            billing_address=address,
            total_amount=150.0,
            status='delivered',
            payment_status='paid'
        )
        
        self.client.force_authenticate(user=self.admin)
        
        # Check Dashboard
        response = self.client.get(self.dashboard_url)
        data = response.json()['data']
        
        self.assertEqual(data['totalProducts'], 1)
        self.assertEqual(data['totalCategories'], 1)
        self.assertEqual(data['totalCustomers'], 1)
        self.assertEqual(data['totalOrders'], 1)
        self.assertEqual(data['revenue'], 150.0)
        
        # Check Recent Activity
        response = self.client.get(self.recent_url)
        activities = response.json()['data']
        self.assertTrue(len(activities) > 0)
        self.assertEqual(activities[0]['type'], 'order')
        
        # Check Overview
        response = self.client.get(self.overview_url)
        overview = response.json()['data']
        self.assertEqual(overview['revenue']['total'], 150.0)
