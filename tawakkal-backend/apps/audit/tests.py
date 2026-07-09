from django.test import TestCase, override_settings
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from apps.audit.models import AuditLog, LoginHistory, SystemEvent, ApiRequestLog, ErrorLog
from apps.audit.services.audit_service import AuditService
from apps.audit.utils import log_audit

User = get_user_model()

class MockInstance:
    class Meta:
        app_label = 'mock_app'
        object_name = 'MockModel'
        
    def __init__(self):
        self.pk = '123'
        self._meta = self.Meta()

class AuditModuleTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_superuser(email="test@tawakkal.com", password="password", is_staff=True)
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_log_action_service(self):
        log = AuditService.log_action(
            user=self.user,
            action='CREATE',
            module='catalog',
            entity_type='Product',
            entity_id='prod_1',
            new_values={'name': 'Test'},
            severity='INFO'
        )
        self.assertIsNotNone(log.id)
        self.assertEqual(log.module, 'catalog')

    def test_legacy_log_audit(self):
        instance = MockInstance()
        
        log_audit(
            action='UPDATE',
            instance=instance,
            user=self.user,
            before_state={'name': 'Old'},
            after_state={'name': 'New'}
        )
        log = AuditLog.objects.filter(module='mock_app', action='UPDATE').first()
        self.assertIsNotNone(log)
        self.assertEqual(log.entity_id, '123')
        self.assertEqual(log.new_values, {'name': 'New'})

    def test_login_history(self):
        history = AuditService.log_login_event(
            user=self.user,
            action='LOGIN',
            status='SUCCESS',
            ip_address='127.0.0.1'
        )
        self.assertEqual(history.action, 'LOGIN')

    def test_api_request_log(self):
        AuditService.log_api_request(
            endpoint='/api/test/',
            method='GET',
            response_code=200,
            execution_time=0.5
        )
        self.assertEqual(ApiRequestLog.objects.count(), 1)

    def test_audit_api_statistics(self):
        AuditService.log_api_request('/test/', 'GET', 200, 1.0)
        AuditService.log_error('TEST_ERR', 'Test error')
        
        response = self.client.get('/api/v1/admin/audit/logs/statistics/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()['data']
        self.assertIn('total_activity_logs', data)
        self.assertIn('requests_per_minute', data)

    def test_audit_api_export_json(self):
        log_audit('TEST', MockInstance(), self.user, after_state={'a': 1})
        response = self.client.get('/api/v1/admin/audit/logs/export/?export=json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response['Content-Type'], 'application/json')
        data = response.json()
        self.assertTrue(len(data) > 0)
        self.assertEqual(data[0]['action'], 'TEST')

    def test_audit_api_export_csv(self):
        log_audit('TEST', MockInstance(), self.user, after_state={'a': 1})
        response = self.client.get('/api/v1/admin/audit/logs/export/?export=csv')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response['Content-Type'], 'text/csv')

    @override_settings(MIDDLEWARE=['apps.audit.middleware.AuditMiddleware'])
    def test_middleware_logging(self):
        # Trigger an API request to see if middleware logs it
        response = self.client.get('/api/v1/admin/audit/logs/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
