from django.db.models import Prefetch, Count, Q
from apps.core.repositories import BaseRepository
from ..models.category import Category

class CategoryRepository(BaseRepository):
    model = Category

    def get_queryset(self):
        """
        Return the base queryset with necessary annotations and select_related.
        """
        return super().get_queryset().select_related('image').annotate(
            children_count=Count('children', filter=Q(children__is_deleted=False), distinct=True)
            # product_count will be added later when Product model is created,
            # or we can stub it now. Assuming we stub it or wait for Product module.
            # product_count=Count('products', filter=Q(products__is_deleted=False), distinct=True)
        )

    def get_root_categories(self):
        return self.get_queryset().filter(parent__isnull=True)

    def get_children(self, parent_category):
        return self.get_queryset().filter(parent=parent_category)

    def get_tree(self):
        """
        Returns all categories, typically you'd structure them in code 
        or prefetch related children for a deeply nested tree.
        """
        return self.get_root_categories().prefetch_related('children')

    def get_flat(self):
        return self.get_queryset().order_by('path')

    def get_active(self):
        return self.get_queryset().filter(status=True)

    def search(self, query):
        if not query:
            return self.get_queryset()
        return self.get_queryset().filter(
            Q(name__icontains=query) |
            Q(slug__icontains=query) |
            Q(seo_title__icontains=query) |
            Q(seo_keywords__icontains=query)
        )

    def reorder(self, category_ids):
        """
        Bulk update display_order based on the provided list of IDs.
        The index in the list determines the display_order.
        """
        cases = []
        categories_to_update = []
        for index, cat_id in enumerate(category_ids):
            category = self.model.objects.get(id=cat_id)
            category.display_order = index
            categories_to_update.append(category)
        
        self.model.objects.bulk_update(categories_to_update, ['display_order'])
