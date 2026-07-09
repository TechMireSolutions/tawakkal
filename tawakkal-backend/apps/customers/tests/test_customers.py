import pytest
from django.urls import reverse
from rest_framework import status
from apps.customers.models import Customer, CustomerStatus, CustomerTier, CustomerTimeline, CustomerTag

@pytest.fixture
def base_customer_data():
    return {
        "first_name": "John",
        "last_name": "Doe",
        "email": "JOHN.DOE@EXAMPLE.COM ",
        "phone": "+1 (555) 123-4567 ",
        "company_name": " Acme Corp ",
        "addresses": [
            {
                "address_line1": "123 Main St",
                "city": "New York",
                "state": "NY",
                "country": "USA",
                "postal_code": "10001",
                "address_type": "BILLING"
            }
        ]
    }

@pytest.mark.django_db
class TestCustomerModule:

    def test_customer_creation_and_normalization(self, admin_api_client, base_customer_data):
        url = reverse('customer-list')
        response = admin_api_client.post(url, base_customer_data, format='json')
        assert response.status_code == status.HTTP_201_CREATED, response.data
        
        data = response.data['data']
        # Verify normalization
        assert data['email'] == "john.doe@example.com"
        assert data['phone'] == "+15551234567"
        assert data['company_name'] == "Acme Corp"
        
        # Verify generated code
        assert data['customer_code'].startswith("CUS-")
        
        # Verify default tier/status
        assert data['status'] == CustomerStatus.ACTIVE
        assert data['tier'] == CustomerTier.BRONZE
        
        # Verify Timeline
        customer_id = data['id']
        timeline = CustomerTimeline.objects.filter(customer_id=customer_id)
        assert timeline.count() == 1
        assert timeline.first().event_type == 'Customer Created'
        
        # Verify Address
        assert len(data['addresses']) == 1
        assert data['addresses'][0]['city'] == "New York"

    def test_customer_update_and_timeline(self, admin_api_client, base_customer_data):
        # Create
        create_res = admin_api_client.post(reverse('customer-list'), base_customer_data, format='json')
        customer_id = create_res.data['data']['id']
        
        # Update
        url = reverse('customer-detail', args=[customer_id])
        update_data = {
            "status": "VIP", # using VIP tier
            "tier": "GOLD",
            "first_name": "Jane"
        }
        res = admin_api_client.patch(url, update_data, format='json')
        assert res.status_code == status.HTTP_200_OK
        
        # Check timeline for tier update
        timeline = CustomerTimeline.objects.filter(customer_id=customer_id, event_type='Loyalty Updated')
        assert timeline.exists()
        
    def test_customer_block_and_unblock(self, admin_api_client, base_customer_data):
        # Create
        create_res = admin_api_client.post(reverse('customer-list'), base_customer_data, format='json')
        customer_id = create_res.data['data']['id']
        
        # Block
        block_url = reverse('customer-block', args=[customer_id])
        res = admin_api_client.post(block_url, {"reason": "Spam"}, format='json')
        assert res.status_code == status.HTTP_200_OK
        
        customer = Customer.objects.get(id=customer_id)
        assert customer.status == CustomerStatus.BLOCKED
        assert customer.internal_notes.filter(text__icontains="Spam").exists()
        
        # Unblock
        unblock_url = reverse('customer-unblock', args=[customer_id])
        res = admin_api_client.post(unblock_url, format='json')
        assert res.status_code == status.HTTP_200_OK
        
        customer.refresh_from_db()
        assert customer.status == CustomerStatus.ACTIVE

    def test_customer_duplicate_email(self, admin_api_client, base_customer_data):
        admin_api_client.post(reverse('customer-list'), base_customer_data, format='json')
        # Attempt duplicate
        res = admin_api_client.post(reverse('customer-list'), base_customer_data, format='json')
        assert res.status_code == status.HTTP_400_BAD_REQUEST

    def test_soft_delete_customer(self, admin_api_client, base_customer_data):
        create_res = admin_api_client.post(reverse('customer-list'), base_customer_data, format='json')
        customer_id = create_res.data['data']['id']
        
        delete_url = reverse('customer-detail', args=[customer_id])
        res = admin_api_client.delete(delete_url)
        assert res.status_code == status.HTTP_200_OK
        
        assert not Customer.objects.filter(id=customer_id).exists()
        assert Customer.all_objects.filter(id=customer_id).exists()
        
    def test_default_tags_exist(self):
        assert CustomerTag.objects.filter(name='VIP').exists()
        assert CustomerTag.objects.filter(name='Wholesale').exists()
