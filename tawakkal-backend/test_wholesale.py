import json
from decimal import Decimal
from rest_framework.test import APIClient
from apps.catalog.models import Product, Category
from apps.users.models import User

# 1. Get or create a product
category, _ = Category.objects.get_or_create(name='Test Category', slug='test-category')
product = Product.objects.first()
if not product:
    product = Product.objects.create(
        name='Test Product',
        slug='test-product',
        category=category,
        base_price=Decimal('100.00'),
        stock=50,
        status='ACTIVE'
    )
else:
    product.status = 'ACTIVE'
    product.save()

print(f"Testing on Product: {product.name} (ID: {product.id}, Slug: {product.slug})")

# Create superuser client
admin_user = User.objects.filter(is_superuser=True).first()
if not admin_user:
    # Just grab first user or create one
    admin_user = User.objects.create_superuser('test_admin@test.com', 'password123')
    
client = APIClient(SERVER_NAME='localhost')
client.force_authenticate(user=admin_user)

# 2. Simulate the exact PUT request payload from ProductForm.jsx
# We must include required fields from ProductUpdateSerializer / ProductCreateSerializer
payload = {
    "name": product.name,
    "category_id": str(product.category.id),
    "base_price": float(product.base_price),
    "stock": product.stock,
    "wholesale_enabled": True,
    "wholesale_price": 99.99,
    "wholesale_min_quantity": 10,
    "wholesale_step_quantity": 5
}

print("\n--- 1. PUT Request Payload (ProductForm.jsx) ---")
print(json.dumps(payload, indent=2))

# Send the PUT request
response = client.put(
    f'/api/v1/admin/catalog/products/{product.id}/',
    data=payload,
    format='json'
)

print(f"\n--- 2. PUT Response Status: {response.status_code} ---")
if response.status_code != 200:
    print(response.json())

# 3. Check DB values immediately after
product.refresh_from_db()
print("\n--- 3. Database Values ---")
print(f"wholesale_enabled: {product.wholesale_enabled}")
print(f"wholesale_price: {product.wholesale_price}")
print(f"wholesale_min_quantity: {product.wholesale_min_quantity}")
print(f"wholesale_step_quantity: {product.wholesale_step_quantity}")

# Logout for public storefront
client.logout()
client.force_authenticate(user=None)

# 4. Call the exact Product Detail API used by storefront
response_detail = client.get(f'/api/v1/admin/catalog/products/{product.id}/')
print(f"\n--- 4. GET Response Status (Storefront): {response_detail.status_code} ---")
if response_detail.status_code == 200:
    data = response_detail.json().get('data', response_detail.json())
    print("\n--- 5. API Response Data (Wholesale Fields) ---")
    print(f"wholesale_enabled: {data.get('wholesale_enabled')}")
    print(f"wholesale_price: {data.get('wholesale_price')}")
    print(f"wholesale_min_quantity: {data.get('wholesale_min_quantity')}")
    print(f"wholesale_step_quantity: {data.get('wholesale_step_quantity')}")
else:
    print(response_detail.json())
