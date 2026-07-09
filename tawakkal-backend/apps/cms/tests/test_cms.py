from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from apps.users.models import User
from apps.cms.models import BlogPost, BlogCategory, Faq

class CmsTests(TestCase):
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
        self.category = BlogCategory.objects.create(name='Tech', slug='tech')

    def test_blog_post_crud(self):
        self.client.force_authenticate(user=self.admin)
        
        # Create
        url = reverse('blog-post-list')
        data = {
            'title': 'My First Post',
            'content': 'Hello World',
            'category': self.category.id,
            'status': 'published'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, 201)
        post_id = response.json()['data']['id']
        slug = response.json()['data']['slug']
        self.assertEqual(slug, 'my-first-post')
        
        # Read
        detail_url = reverse('blog-post-detail', args=[post_id])
        response = self.client.get(detail_url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['data']['title'], 'My First Post')
        
        # Update
        response = self.client.patch(detail_url, {'title': 'Updated Post'})
        self.assertEqual(response.status_code, 200)
        
        # Delete (Soft delete)
        response = self.client.delete(detail_url)
        self.assertEqual(response.status_code, 200)
        
        # Verify soft delete
        post = BlogPost.all_objects.get(id=post_id)
        self.assertTrue(post.is_deleted)

    def test_slug_generation(self):
        self.client.force_authenticate(user=self.admin)
        url = reverse('blog-post-list')
        
        self.client.post(url, {'title': 'Test Post', 'content': '1'})
        resp2 = self.client.post(url, {'title': 'Test Post', 'content': '2'})
        
        self.assertEqual(resp2.status_code, 201)
        self.assertEqual(resp2.json()['data']['slug'], 'test-post-1')

    def test_rbac(self):
        url = reverse('blog-post-list')
        
        # Unauthenticated read (public)
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        
        # Unauthenticated write
        response = self.client.post(url, {'title': 'T', 'content': 'T'})
        self.assertEqual(response.status_code, 401)
        
        # Regular user write
        self.client.force_authenticate(user=self.user)
        response = self.client.post(url, {'title': 'T', 'content': 'T'})
        self.assertEqual(response.status_code, 403)
        
        # Admin user write
        self.client.force_authenticate(user=self.admin)
        response = self.client.post(url, {'title': 'T', 'content': 'T'})
        self.assertEqual(response.status_code, 201)

    def test_faq_crud(self):
        self.client.force_authenticate(user=self.admin)
        url = reverse('faq-list')
        response = self.client.post(url, {'question': 'How?', 'answer': 'Like this.'})
        self.assertEqual(response.status_code, 201)
        
        faq_id = response.json()['data']['id']
        detail_url = reverse('faq-detail', args=[faq_id])
        
        response = self.client.get(detail_url)
        self.assertEqual(response.status_code, 200)
        
        response = self.client.delete(detail_url)
        self.assertEqual(response.status_code, 200)
