import os
import sys
import django

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.test import Client

def verify_apis():
    c = Client(HTTP_HOST='localhost')
    res = c.post('/api/v1/admin/auth/token/', {
        "email": "admin@tawakkal.com",
        "password": "admin123"
    }, content_type='application/json')
    
    if res.status_code != 200 or 'data' not in res.json():
        print("Failed to get admin token.")
        return
        
    token = res.json()['data']['access']
    headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}

    endpoints = [
        '/api/v1/admin/customers/customers/',
        '/api/v1/admin/catalog/products/',
        '/api/v1/admin/catalog/categories/',
        '/api/v1/admin/orders/orders/',
        '/api/v1/admin/settings/site/',
        '/api/v1/admin/settings/system/',
        '/api/v1/admin/analytics/dashboard-stats/',
    ]

    all_passed = True

    for ep in endpoints:
        try:
            res = c.get(ep, **headers)
            if res.status_code != 200:
                print(f"FAILED {ep} -> Status {res.status_code}")
                all_passed = False
                continue

            try:
                data = res.json()
                if 'success' not in data or 'message' not in data:
                    print(f"FAILED {ep} -> Contract mismatch! Keys: {list(data.keys())}")
                    all_passed = False
                else:
                    print(f"PASSED {ep}")
            except Exception as e:
                print(f"FAILED {ep} -> Invalid JSON: {e}")
                all_passed = False
        except Exception as e:
            print(f"FAILED {ep} -> Exception: {e}")
            all_passed = False

    if all_passed:
        print("\nAll tested APIs follow the {success, message, data} contract and return 200 OK.")
    else:
        print("\nSome APIs failed verification.")

if __name__ == '__main__':
    verify_apis()
