import uuid
import random
import string
from django.db import transaction
from django.utils.text import slugify
from django.core.exceptions import ValidationError
from apps.catalog.models import Product, ProductVariant, InventoryLog, InventoryReason, ProductStatus, VariantStatus, ProductImage
from apps.media.models import Media
from apps.catalog.repositories import ProductRepository, ProductVariantRepository

class ProductService:
    @staticmethod
    def generate_slug(name):
        base_slug = slugify(name)
        slug = base_slug
        counter = 1
        while ProductRepository.get_queryset(include_deleted=True).filter(slug=slug).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1
        return slug

    @staticmethod
    def generate_sku(prefix="SKU"):
        while True:
            suffix = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
            sku = f"{prefix}-{suffix}"
            if not ProductVariantRepository.get_queryset(include_deleted=True).filter(sku=sku).exists():
                return sku

    @staticmethod
    @transaction.atomic
    def create_product(product_data, variants_data, user=None):
        if 'slug' not in product_data or not product_data['slug']:
            product_data['slug'] = ProductService.generate_slug(product_data['name'])
        
        product_data['created_by'] = user
        product_data['updated_by'] = user
        
        media_ids = product_data.pop('media_ids', [])
        badge_ids = product_data.pop('badge_ids', [])
        
        # Filter out fields that might not exist in database yet (for migration compatibility)
        # These fields will be added via migration, but we handle them gracefully
        optional_fields = ['article_no', 'volume_no', 'shipping_price']
        safe_product_data = {k: v for k, v in product_data.items() if k not in optional_fields or v is not None and v != ''}
        
        try:
            product = ProductRepository.create(**safe_product_data)
        except Exception as e:
            # If field doesn't exist, try without the optional fields
            if 'unknown column' in str(e).lower() or 'no such column' in str(e).lower():
                safe_product_data = {k: v for k, v in product_data.items() if k not in optional_fields}
                product = ProductRepository.create(**safe_product_data)
            else:
                raise
        
        if badge_ids:
            product.badges.set(badge_ids)
            
        if media_ids:
            for idx, m_id in enumerate(media_ids):
                media_obj = Media.objects.filter(id=m_id).first()
                if media_obj:
                    ProductImage.objects.create(
                        product=product,
                        media=media_obj,
                        is_primary=(idx == 0),
                        display_order=idx
                    )
        
        for v_data in variants_data:
            if 'sku' not in v_data or not v_data['sku']:
                v_data['sku'] = ProductService.generate_sku(prefix=product.category.name[:3].upper() if product.category else "PRD")
            
            stock = v_data.pop('stock', 0)
            
            v_data['product'] = product
            v_data['created_by'] = user
            v_data['updated_by'] = user
            
            variant = ProductVariantRepository.create(**v_data)
            
            if stock > 0:
                ProductService.adjust_stock(
                    variant_id=variant.id,
                    quantity=stock,
                    reason=InventoryReason.RESTOCK,
                    user=user,
                    reference_type="INITIAL",
                    reference_id="initial_creation"
                )
                
        return product

    @staticmethod
    @transaction.atomic
    def update_product(product_id, product_data, user=None):
        product = ProductRepository.get_by_id(product_id)
        if not product:
            raise ValidationError("Product not found.")
            
        if 'name' in product_data and product_data['name'] != product.name:
            if 'slug' not in product_data:
                product_data['slug'] = ProductService.generate_slug(product_data['name'])
                
        media_ids = product_data.pop('media_ids', None)
        badge_ids = product_data.pop('badge_ids', None)
        product_data['updated_by'] = user
        updated_product = ProductRepository.update(product, **product_data)
        
        if badge_ids is not None:
            updated_product.badges.set(badge_ids)
            
        if media_ids is not None:
            # Re-sync images
            ProductImage.objects.filter(product=updated_product).update(is_deleted=True)
            for idx, m_id in enumerate(media_ids):
                media_obj = Media.objects.filter(id=m_id).first()
                if media_obj:
                    ProductImage.objects.create(
                        product=updated_product,
                        media=media_obj,
                        is_primary=(idx == 0),
                        display_order=idx
                    )
                    
        return updated_product

    @staticmethod
    @transaction.atomic
    def duplicate_product(product_id, user=None):
        product = ProductRepository.get_by_id(product_id)
        if not product:
            raise ValidationError("Product not found.")
            
        new_name = f"Copy of {product.name}"
        new_slug = ProductService.generate_slug(new_name)
        
        new_product = ProductRepository.create(
            name=new_name,
            slug=new_slug,
            description=product.description,
            category=product.category,
            brand=product.brand,
            status=ProductStatus.DRAFT,
            is_featured=False,
            base_price=product.base_price,
            created_by=user,
            updated_by=user
        )
        
        # Duplicate variants but with 0 stock and new SKUs
        for variant in product.variants.all():
            ProductVariantRepository.create(
                product=new_product,
                sku=ProductService.generate_sku(),
                color=variant.color,
                size=variant.size,
                status=VariantStatus.ACTIVE,
                price_override=variant.price_override,
                stock=0,
                reserved_stock=0,
                weight=variant.weight,
                created_by=user,
                updated_by=user
            )
            
        return new_product

    @staticmethod
    @transaction.atomic
    def archive_product(product_id, user=None):
        product = ProductRepository.get_by_id(product_id)
        if not product:
            raise ValidationError("Product not found.")
        
        product = ProductRepository.update(product, status=ProductStatus.ARCHIVED, updated_by=user)
        # Archive variants as well
        for variant in product.variants.all():
            ProductVariantRepository.update(variant, status=VariantStatus.DISCONTINUED, updated_by=user)
        return product

    @staticmethod
    @transaction.atomic
    def restore_product(product_id, user=None):
        product = ProductRepository.get_by_id(product_id, include_deleted=True)
        if not product:
            raise ValidationError("Product not found.")
        
        if product.is_deleted:
            ProductRepository.restore(product)
            
        return ProductRepository.update(product, status=ProductStatus.DRAFT, updated_by=user)

    @staticmethod
    @transaction.atomic
    def soft_delete(instance, user=None, request=None):
        ProductRepository.soft_delete(instance)
        if user:
            ProductRepository.update(instance, updated_by=user)
            
        for variant in instance.variants.all():
            ProductVariantRepository.soft_delete(variant)
            if user:
                ProductVariantRepository.update(variant, updated_by=user)
                
        # Soft delete images
        for img in ProductImage.objects.filter(product=instance, is_deleted=False):
            img.soft_delete()

    @staticmethod
    @transaction.atomic
    def restore(instance, user=None, request=None):
        ProductRepository.restore(instance)
        if user:
            ProductRepository.update(instance, updated_by=user)
            
        # Restore variants
        # We need to query including deleted variants
        variants = ProductVariant.all_objects.filter(product=instance, is_deleted=True)
        for variant in variants:
            ProductVariantRepository.restore(variant)
            if user:
                ProductVariantRepository.update(variant, updated_by=user)
                
        # Restore images
        images = ProductImage.all_objects.filter(product=instance, is_deleted=True)
        for img in images:
            img.restore()

    @staticmethod
    @transaction.atomic
    def adjust_stock(variant_id, quantity, reason, user=None, reference_type='', reference_id=''):
        """
        Adjust stock levels. quantity can be positive (add) or negative (subtract).
        """
        # Lock the row for update to prevent concurrent modification issues
        variant = ProductVariant.objects.select_for_update().get(id=variant_id)
        
        before_quantity = variant.stock
        after_quantity = before_quantity + quantity
        
        if after_quantity < 0:
            raise ValidationError(f"Insufficient stock for SKU {variant.sku}. Current: {before_quantity}, Requested: {abs(quantity)}")
            
        variant.stock = after_quantity
        if user:
            variant.updated_by = user
        variant.save()
        
        InventoryLog.objects.create(
            variant=variant,
            change=quantity,
            before_quantity=before_quantity,
            after_quantity=after_quantity,
            reason=reason,
            reference_type=reference_type,
            reference_id=reference_id,
            performed_by=user
        )
        
        return variant

    @staticmethod
    @transaction.atomic
    def reserve_stock(variant_id, quantity, user=None):
        variant = ProductVariant.objects.select_for_update().get(id=variant_id)
        if variant.available_stock < quantity:
            raise ValidationError(f"Not enough available stock for SKU {variant.sku}.")
            
        variant.reserved_stock += quantity
        if user:
            variant.updated_by = user
        variant.save()
        return variant

    @staticmethod
    @transaction.atomic
    def release_stock(variant_id, quantity, user=None):
        variant = ProductVariant.objects.select_for_update().get(id=variant_id)
        if variant.reserved_stock < quantity:
            raise ValidationError("Cannot release more stock than is reserved.")
            
        variant.reserved_stock -= quantity
        if user:
            variant.updated_by = user
        variant.save()
        return variant

    @staticmethod
    @transaction.atomic
    def recalculate_price(variant_id):
        variant = ProductVariantRepository.get_by_id(variant_id)
        return variant.get_price()
