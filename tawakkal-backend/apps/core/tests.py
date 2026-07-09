from django.test import TestCase
from django.contrib.auth import get_user_model
from .repositories import BaseRepository

User = get_user_model()

class UserRepository(BaseRepository):
    model = User

class BaseModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(email='test_base@test.com', password='pw')

    def test_base_model_fields(self):
        self.assertIsNotNone(self.user.id)
        self.assertFalse(self.user.is_deleted)
        self.assertIsNotNone(self.user.created_at)
        self.assertIsNotNone(self.user.updated_at)

    def test_soft_delete_and_restore(self):
        self.assertEqual(User.objects.count(), 1)
        
        # Soft delete
        self.user.soft_delete()
        self.assertEqual(User.objects.count(), 0) # Default manager excludes deleted
        self.assertEqual(User.objects.deleted().count(), 1)
        self.assertEqual(User.all_objects.count(), 1)
        
        # Restore
        self.user.restore()
        self.assertEqual(User.objects.count(), 1)
        self.assertFalse(self.user.is_deleted)

    def test_repository_crud(self):
        # Create
        obj = UserRepository.create(email='repo@test.com')
        self.assertEqual(obj.email, 'repo@test.com')
        
        # Get
        fetched = UserRepository.get_by_id(obj.id)
        self.assertEqual(fetched.id, obj.id)
        
        # Update
        updated = UserRepository.update(obj, first_name='Updated')
        self.assertEqual(updated.first_name, 'Updated')
        
        # Soft delete
        UserRepository.soft_delete(obj)
        self.assertIsNone(UserRepository.get_by_id(obj.id))
        self.assertIsNotNone(UserRepository.get_by_id(obj.id, include_deleted=True))
        
        # Restore
        UserRepository.restore(obj)
        self.assertIsNotNone(UserRepository.get_by_id(obj.id))
        
        # Hard delete
        UserRepository.hard_delete(obj)
        self.assertEqual(User.all_objects.filter(id=obj.id).count(), 0)
