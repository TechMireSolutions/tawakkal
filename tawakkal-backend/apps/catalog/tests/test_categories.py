from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from apps.catalog.models.category import Category
from apps.catalog.services.category_service import CategoryService
from django.core.exceptions import ValidationError

User = get_user_model()

class CategoryTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(email='admin@test.com', password='pw', is_superuser=True)
        admin_group, _ = Group.objects.get_or_create(name='Admins')
        self.user.groups.add(admin_group)
        
        self.client = APIClient()
        login_res = self.client.post(reverse('token_obtain_pair'), {
            'email': 'admin@test.com',
            'password': 'pw'
        })
        self.token = login_res.data['data']['access']
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.token)
        
        self.list_url = reverse('category-list')
        self.tree_url = reverse('category-tree')
        self.flat_url = reverse('category-flat')

    def test_create_category_slug_and_path(self):
        res = self.client.post(self.list_url, {'name': 'Men'})
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data['data']['slug'], 'men')
        self.assertEqual(res.data['data']['path'], 'Men')
        self.assertEqual(res.data['data']['level'], 0)
        
        parent_id = res.data['data']['id']
        
        # Test child
        child_res = self.client.post(self.list_url, {'name': 'Hoodies', 'parent': parent_id})
        self.assertEqual(child_res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(child_res.data['data']['slug'], 'hoodies')
        self.assertEqual(child_res.data['data']['path'], 'Men/Hoodies')
        self.assertEqual(child_res.data['data']['level'], 1)

    def test_duplicate_slug_generation(self):
        cat1 = CategoryService.create(name="Shoes", user=self.user)
        self.assertEqual(cat1.slug, 'shoes')
        
        cat2 = CategoryService.create(name="Shoes", user=self.user)
        self.assertEqual(cat2.slug, 'shoes-2')

    def test_max_depth_validation(self):
        parent = None
        # Create 10 levels (0 to 9)
        for i in range(10):
            parent = CategoryService.create(name=f"Level {i}", parent=parent, user=self.user)
            
        # 11th level should fail
        with self.assertRaises(ValidationError) as context:
            CategoryService.create(name="Level 10", parent=parent, user=self.user)
        
        self.assertIn('parent', str(context.exception))
        self.assertIn('Maximum category depth', str(context.exception))

    def test_circular_reference(self):
        cat_a = CategoryService.create(name="A", user=self.user)
        cat_b = CategoryService.create(name="B", parent=cat_a, user=self.user)
        cat_c = CategoryService.create(name="C", parent=cat_b, user=self.user)
        
        with self.assertRaises(ValidationError) as context:
            CategoryService.update(cat_a, parent=cat_c, user=self.user)
            
        self.assertIn('parent', str(context.exception))
        self.assertIn('Circular reference', str(context.exception))

    def test_soft_delete_with_children(self):
        parent = CategoryService.create(name="Parent", user=self.user)
        child = CategoryService.create(name="Child", parent=parent, user=self.user)
        
        with self.assertRaises(ValidationError) as context:
            CategoryService.soft_delete(parent, user=self.user)
            
        self.assertIn('Cannot delete category with active children', str(context.exception))

    def test_path_update_on_parent_change(self):
        men = CategoryService.create(name="Men", user=self.user)
        women = CategoryService.create(name="Women", user=self.user)
        
        hoodies = CategoryService.create(name="Hoodies", parent=men, user=self.user)
        premium = CategoryService.create(name="Premium", parent=hoodies, user=self.user)
        
        self.assertEqual(premium.path, "Men/Hoodies/Premium")
        self.assertEqual(premium.level, 2)
        
        # Move Hoodies to Women
        CategoryService.update(hoodies, parent=women, user=self.user)
        
        # Refresh Premium
        premium.refresh_from_db()
        self.assertEqual(premium.path, "Women/Hoodies/Premium")
        self.assertEqual(premium.level, 2)

    def test_tree_api(self):
        cat_a = CategoryService.create(name="A", user=self.user)
        cat_b = CategoryService.create(name="B", parent=cat_a, user=self.user)
        
        res = self.client.get(self.tree_url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        # Should return only root
        self.assertEqual(len(res.data['data']), 1)
        self.assertEqual(res.data['data'][0]['name'], 'A')
        # Children should contain B
        self.assertEqual(len(res.data['data'][0]['children']), 1)
        self.assertEqual(res.data['data'][0]['children'][0]['name'], 'B')

    def test_bulk_operations(self):
        cat1 = CategoryService.create(name="Bulk 1", user=self.user)
        cat2 = CategoryService.create(name="Bulk 2", user=self.user)
        
        # Bulk status
        res = self.client.post(reverse('category-bulk-status'), {'ids': [cat1.id, cat2.id], 'status': False}, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        cat1.refresh_from_db()
        self.assertFalse(cat1.status)
        
        # Bulk delete
        res = self.client.post(reverse('category-bulk-delete'), {'ids': [cat1.id, cat2.id]}, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        
        cat1 = Category.all_objects.get(id=cat1.id)
        self.assertTrue(cat1.is_deleted)
        
        # Bulk restore
        res = self.client.post(reverse('category-bulk-restore'), {'ids': [cat1.id, cat2.id]}, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        
        cat1.refresh_from_db()
        self.assertFalse(cat1.is_deleted)
