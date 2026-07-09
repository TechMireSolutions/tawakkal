from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group

User = get_user_model()

class AuthTests(APITestCase):
    def setUp(self):
        # Create groups
        self.admin_group = Group.objects.get_or_create(name='Admins')[0]
        self.manager_group = Group.objects.get_or_create(name='Managers')[0]
        
        # Create users
        self.active_user = User.objects.create_user(email='active@test.com', password='Password123!')
        self.active_user.groups.add(self.admin_group)
        
        self.inactive_user = User.objects.create_user(email='inactive@test.com', password='Password123!', is_active=False)

        self.login_url = reverse('token_obtain_pair')
        self.refresh_url = reverse('token_refresh')
        self.me_url = reverse('current_user')
        self.logout_url = reverse('logout')

    def test_successful_login(self):
        response = self.client.post(self.login_url, {
            'email': 'active@test.com',
            'password': 'Password123!'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertIn('access', response.data['data'])
        self.assertIn('refresh', response.data['data'])

    def test_invalid_credentials(self):
        response = self.client.post(self.login_url, {
            'email': 'active@test.com',
            'password': 'WrongPassword!'
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertFalse(response.data['success'])

    def test_inactive_user_login(self):
        response = self.client.post(self.login_url, {
            'email': 'inactive@test.com',
            'password': 'Password123!'
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertFalse(response.data['success'])

    def test_token_refresh(self):
        login_res = self.client.post(self.login_url, {
            'email': 'active@test.com',
            'password': 'Password123!'
        })
        refresh_token = login_res.data['data']['refresh']

        refresh_res = self.client.post(self.refresh_url, {
            'refresh': refresh_token
        })
        self.assertEqual(refresh_res.status_code, status.HTTP_200_OK)
        self.assertIn('access', refresh_res.data['data'])

    def test_authenticated_me_endpoint(self):
        login_res = self.client.post(self.login_url, {
            'email': 'active@test.com',
            'password': 'Password123!'
        })
        access_token = login_res.data['data']['access']
        
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + access_token)
        response = self.client.get(self.me_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['data']['email'], 'active@test.com')
        self.assertIn('Admins', response.data['data']['groups'])

    def test_unauthenticated_access_rejected(self):
        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertFalse(response.data['success'])

    def test_logout(self):
        login_res = self.client.post(self.login_url, {
            'email': 'active@test.com',
            'password': 'Password123!'
        })
        refresh_token = login_res.data['data']['refresh']
        access_token = login_res.data['data']['access']
        
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + access_token)
        
        logout_res = self.client.post(self.logout_url, {
            'refresh': refresh_token
        })
        # Note: If simplejwt token blacklisting is not configured, this might just pass anyway.
        # But our test ensures the endpoint works.
        self.assertEqual(logout_res.status_code, status.HTTP_200_OK)
