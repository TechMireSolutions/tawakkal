import urllib.request
import urllib.error
import json

data = json.dumps({
    'customer_name': 'Hassan Doe',
    'email': 'test@test.com',
    'phone': '12345678',
    'address': '123 St, City, PK',
    'total_amount': 1300,
    'order_items': [{
        'product_id': '72a3e0fd-427d-4d59-b967-34fae3e2e42d',
        'variant_id': None,
        'quantity': 1,
        'size': None,
        'color': None,
        'is_wholesale': False
    }]
})

req = urllib.request.Request(
    'http://127.0.0.1:8000/api/v1/storefront/orders/checkout/',
    data=data.encode('utf-8'),
    headers={'Content-Type': 'application/json'}
)

try:
    print(urllib.request.urlopen(req).read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print(f"HTTP {e.code}")
    print(e.read().decode('utf-8'))
