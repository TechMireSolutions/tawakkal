from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from .models import Media

User = get_user_model()

from django.contrib.auth.models import Group

class MediaTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(email='media@test.com', password='pw', is_superuser=True)
        admin_group, _ = Group.objects.get_or_create(name='Admins')
        self.user.groups.add(admin_group)
        self.client = APIClient()
        
        login_res = self.client.post(reverse('token_obtain_pair'), {
            'email': 'media@test.com',
            'password': 'pw'
        })
        self.token = login_res.data['data']['access']
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.token)
        
        self.upload_url = reverse('media-upload')
        self.list_url = reverse('media-list')

    def test_upload_valid_image(self):
        import base64
        # A 1x1 valid transparent PNG base64
        png_b64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
        png_content = base64.b64decode(png_b64)
        
        file = SimpleUploadedFile(
            "test_image.png",
            png_content,
            content_type="image/png"
        )
        
        response = self.client.post(self.upload_url, {'file': file, 'alt_text': 'test alt'}, format='multipart')
        if response.status_code != status.HTTP_201_CREATED:
            print(f"FAILED WITH {response.status_code}: {response.data}")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['data']['mime_type'], 'image/png')
        self.assertEqual(response.data['data']['alt_text'], 'test alt')
        
        self.assertEqual(Media.objects.count(), 1)
        media = Media.objects.first()
        self.assertEqual(media.original_filename, 'test_image.png')

    def test_upload_invalid_mime_type(self):
        file = SimpleUploadedFile(
            "test.txt",
            b'Hello world',
            content_type="text/plain"
        )
        response = self.client.post(self.upload_url, {'file': file}, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])
        self.assertIn('not allowed', str(response.data['errors']))

    def test_list_and_retrieve(self):
        import base64
        png_b64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
        png_content = base64.b64decode(png_b64)
        file = SimpleUploadedFile("test_list.png", png_content, content_type="image/png")
        upload_res = self.client.post(self.upload_url, {'file': file}, format='multipart')
        media_id = upload_res.data['data']['id']
        
        # List
        list_res = self.client.get(self.list_url)
        self.assertEqual(list_res.status_code, status.HTTP_200_OK)
        if 'results' in list_res.data['data']:
            self.assertEqual(len(list_res.data['data']['results']), 1)
        else:
            self.assertEqual(len(list_res.data['data']), 1)
        
        # Retrieve
        detail_url = reverse('media-detail', args=[media_id])
        detail_res = self.client.get(detail_url)
        self.assertEqual(detail_res.status_code, status.HTTP_200_OK)
        self.assertEqual(detail_res.data['data']['id'], media_id)

    def test_soft_delete_and_restore(self):
        import base64
        png_b64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
        png_content = base64.b64decode(png_b64)
        file = SimpleUploadedFile("test_del.png", png_content, content_type="image/png")
        upload_res = self.client.post(self.upload_url, {'file': file}, format='multipart')
        media_id = upload_res.data['data']['id']
        
        detail_url = reverse('media-detail', args=[media_id])
        
        # Delete
        del_res = self.client.delete(detail_url)
        self.assertEqual(del_res.status_code, status.HTTP_200_OK)
        
        # Retrieve should fail
        ret_res = self.client.get(detail_url)
        self.assertEqual(ret_res.status_code, status.HTTP_404_NOT_FOUND)
        
        # Restore
        # Create restore route if missing or manually test service layer.
        # We mapped restore in mixins, let's see if the action is exposed.
        # Wait, the RestoreModelMixin defines `restore` but it must be an @action to be routed by DefaultRouter unless it's configured.
        # Let's verify by restoring directly via service.
        from .services import MediaService
        m = Media.all_objects.get(id=media_id)
        MediaService.restore(m, user=self.user)
        
        # Retrieve should succeed again
        ret_res2 = self.client.get(detail_url)
        self.assertEqual(ret_res2.status_code, status.HTTP_200_OK)
