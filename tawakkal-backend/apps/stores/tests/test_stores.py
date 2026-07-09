from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from apps.users.models import User
from apps.catalog.models.category import Category
from apps.catalog.models.product import Product, ProductVariant
from apps.stores.models import Store, Warehouse, StoreInventory, StoreStatus

class StoreTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_superuser(
            email='admin@example.com',
            password='password123'
        )
        self.client.force_authenticate(user=self.admin)
        
        self.store = Store.objects.create(
            name="Main Store",
            code="MAIN",
            slug="main",
            status=StoreStatus.ACTIVE
        )
        self.warehouse1 = Warehouse.objects.create(store=self.store, name="WH1", code="WH1")
        self.warehouse2 = Warehouse.objects.create(store=self.store, name="WH2", code="WH2")
        
        self.category = Category.objects.create(name="Electronics", slug="electronics")
        self.product = Product.objects.create(name="Phone", slug="phone", category=self.category, base_price=10.00)
        self.variant = ProductVariant.objects.create(product=self.product, sku="PHONE-BLK")

    def test_store_crud(self):
        # Create
        url = reverse('store-list')
        data = {
            'name': 'Second Store',
            'code': 'SEC',
            'slug': 'second',
            'address': '123 Main St',
            'city': 'NY',
            'state': 'NY',
            'postal_code': '10001',
            'country': 'USA'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, 201)
        store_id = response.json()['data']['id']
        
        # Retrieve
        detail_url = reverse('store-detail', args=[store_id])
        response = self.client.get(detail_url)
        self.assertEqual(response.status_code, 200)

    def test_inventory_transfer(self):
        # Seed inventory
        StoreInventory.objects.create(warehouse=self.warehouse1, variant=self.variant, stock=100)
        
        url = reverse('warehouse-transfer-inventory')
        data = {
            'variant_id': str(self.variant.id),
            'source_warehouse_id': str(self.warehouse1.id),
            'dest_warehouse_id': str(self.warehouse2.id),
            'quantity': 30
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, 200)
        
        # Verify db
        w1_inv = StoreInventory.objects.get(warehouse=self.warehouse1, variant=self.variant)
        w2_inv = StoreInventory.objects.get(warehouse=self.warehouse2, variant=self.variant)
        self.assertEqual(w1_inv.stock, 70)
        self.assertEqual(w2_inv.stock, 30)
        
        # Verify aggregates
        self.variant.refresh_from_db()
        self.assertEqual(self.variant.stock, 100)

    def test_inventory_transfer_insufficient_stock(self):
        # Seed inventory
        StoreInventory.objects.create(warehouse=self.warehouse1, variant=self.variant, stock=10)
        
        url = reverse('warehouse-transfer-inventory')
        data = {
            'variant_id': str(self.variant.id),
            'source_warehouse_id': str(self.warehouse1.id),
            'dest_warehouse_id': str(self.warehouse2.id),
            'quantity': 20
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()['message'], "Insufficient stock in source warehouse.")
