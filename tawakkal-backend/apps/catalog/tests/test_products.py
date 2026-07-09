import pytest
from django.urls import reverse
from rest_framework import status
from apps.catalog.models import Product, ProductVariant, InventoryLog, ProductStatus
from apps.catalog.services import ProductService
from apps.catalog.repositories import ProductRepository, ProductVariantRepository

@pytest.mark.django_db
class TestProducts:
    def test_product_creation_with_variants(self, admin_api_client, test_category):
        url = reverse('product-list')
        data = {
            "name": "Test Product",
            "category_id": str(test_category.id),
            "base_price": "99.99",
            "variants": [
                {"stock": 10},
                {"stock": 5}
            ]
        }
        response = admin_api_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_201_CREATED, response.data
        
        # Check SKUs are generated and unique
        variants = response.data['data']['variants']
        assert len(variants) == 2
        assert variants[0]['sku'] != variants[1]['sku']
        assert variants[0]['sku'].startswith(test_category.name[:3].upper())
        
        # Check inventory logs were created
        variant_ids = [v['id'] for v in variants]
        logs_count = InventoryLog.objects.filter(variant_id__in=variant_ids).count()
        assert logs_count == 2

    def test_concurrent_stock_adjustment(self, test_product):
        # Note: Testing true concurrency in standard django tests requires threading 
        # which can be flaky. We test the service layer atomic nature directly.
        variant = test_product.variants.first()
        
        # Adjust stock + 5
        ProductService.adjust_stock(variant.id, 5, "RESTOCK")
        variant.refresh_from_db()
        assert variant.stock == 5
        
        # Adjust stock - 2
        ProductService.adjust_stock(variant.id, -2, "ORDER")
        variant.refresh_from_db()
        assert variant.stock == 3
        
        # Try to subtract more than available should raise error
        from django.core.exceptions import ValidationError
        with pytest.raises(ValidationError):
            ProductService.adjust_stock(variant.id, -10, "ORDER")

    def test_soft_delete_and_restore(self, admin_api_client, test_product):
        url = reverse('product-detail', args=[test_product.id])
        
        # Soft delete
        res = admin_api_client.delete(url)
        assert res.status_code == status.HTTP_200_OK
        
        # Ensure it's not in default manager
        assert not Product.objects.filter(id=test_product.id).exists()
        # Ensure it is in all_objects manager
        assert Product.all_objects.filter(id=test_product.id).exists()
        
        # Restore
        restore_url = reverse('product-restore', args=[test_product.id])
        res = admin_api_client.post(restore_url)
        assert res.status_code == status.HTTP_200_OK
        
        # Ensure it's back
        assert Product.objects.filter(id=test_product.id).exists()

    def test_bulk_inventory_adjust(self, admin_api_client, test_product):
        url = reverse('inventory-bulk-adjust')
        variant = test_product.variants.first()
        initial_stock = variant.stock
        
        data = {
            "adjustments": [
                {
                    "variant_id": str(variant.id),
                    "quantity": 10,
                    "reason": "RESTOCK"
                }
            ]
        }
        res = admin_api_client.post(url, data, format='json')
        assert res.status_code == status.HTTP_200_OK
        
        variant.refresh_from_db()
        assert variant.stock == initial_stock + 10
        
        # Verify InventoryLog
        log = InventoryLog.objects.filter(variant=variant).order_by('-created_at').first()
        assert log.change == 10
        assert log.reason == "RESTOCK"

    def test_permissions(self, api_client, test_product):
        # Unauthenticated user should not be able to create
        url = reverse('product-list')
        res = api_client.post(url, {})
        assert res.status_code == status.HTTP_401_UNAUTHORIZED
