from django.db.models import Q, Prefetch, F
from apps.core.repositories import BaseRepository
from apps.catalog.models import Product, ProductVariant, ProductStatus, VariantStatus

class ProductRepository(BaseRepository):
    model = Product

    @classmethod
    def get_optimized_queryset(cls):
        """
        Optimizes fetching with select_related and prefetch_related to prevent N+1 queries.
        """
        return cls.get_queryset().select_related(
            'category'
        ).prefetch_related(
            'images',
            Prefetch(
                'variants',
                queryset=ProductVariant.objects.select_related('color', 'size').filter(is_deleted=False)
            )
        )

    @classmethod
    def search(cls, query):
        if not query:
            return cls.get_optimized_queryset()
        return cls.get_optimized_queryset().filter(
            Q(name__icontains=query) |
            Q(slug__icontains=query) |
            Q(seo_title__icontains=query) |
            Q(seo_keywords__icontains=query) |
            Q(description__icontains=query) |
            Q(variants__sku__icontains=query)
        ).distinct()

    @classmethod
    def filter(cls, **kwargs):
        return cls.get_optimized_queryset().filter(**kwargs)

    @classmethod
    def active(cls):
        return cls.get_optimized_queryset().filter(status=ProductStatus.ACTIVE)

    @classmethod
    def featured(cls):
        return cls.get_optimized_queryset().filter(is_featured=True, status=ProductStatus.ACTIVE)

    @classmethod
    def by_category(cls, category_id):
        # To get descendants we would ideally use the category tree, 
        # but for direct relationship we filter directly.
        return cls.get_optimized_queryset().filter(category_id=category_id)

    @classmethod
    def by_slug(cls, slug):
        return cls.get_optimized_queryset().filter(slug=slug).first()

    @classmethod
    def low_stock(cls, threshold=5):
        return cls.get_optimized_queryset().filter(
            variants__status=VariantStatus.ACTIVE,
            variants__is_deleted=False
        ).annotate(
            avail_stock=F('variants__stock') - F('variants__reserved_stock')
        ).filter(avail_stock__lte=threshold, avail_stock__gt=0).distinct()


class ProductVariantRepository(BaseRepository):
    model = ProductVariant

    @classmethod
    def get_optimized_queryset(cls):
        return cls.get_queryset().select_related(
            'product', 'product__category', 'color', 'size'
        )

    @classmethod
    def by_sku(cls, sku):
        return cls.get_optimized_queryset().filter(sku=sku).first()

    @classmethod
    def active(cls):
        return cls.get_optimized_queryset().filter(
            status=VariantStatus.ACTIVE,
            product__status=ProductStatus.ACTIVE
        )

    @classmethod
    def low_stock(cls, threshold=5):
        return cls.get_optimized_queryset().annotate(
            avail_stock=F('stock') - F('reserved_stock')
        ).filter(avail_stock__lte=threshold, status=VariantStatus.ACTIVE)
