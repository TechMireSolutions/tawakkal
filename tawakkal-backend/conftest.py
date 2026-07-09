import pytest
from rest_framework.test import APIClient
from apps.users.models import User

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def admin_user(db):
    from django.contrib.auth.models import Group
    user = User.objects.create_superuser('admin@example.com', 'password123')
    group, _ = Group.objects.get_or_create(name='Admins')
    user.groups.add(group)
    return user

@pytest.fixture
def admin_api_client(admin_user):
    client = APIClient()
    client.force_authenticate(user=admin_user)
    return client
