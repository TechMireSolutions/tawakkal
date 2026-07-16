import django_filters
from django.db.models import Q
from .models.product import Product
from apps.core.utils import is_valid_uuid

class ProductFilter(django_filters.FilterSet):
    brand = django_filters.CharFilter(method='filter_brand')
    category = django_filters.CharFilter(method='filter_category')
    category__name = django_filters.CharFilter(method='filter_category_name')
    badge = django_filters.CharFilter(method='filter_badge')

    class Meta:
        model = Product
        fields = ['status', 'is_featured', 'category_id']

    def filter_brand(self, queryset, name, value):
        brands = self.request.query_params.getlist('brand')
        if not brands and value:
            brands = [value]
            
        if brands:
            brand_query = Q()
            for brand in brands:
                brand_query |= Q(brand__slug=brand)
                if is_valid_uuid(brand):
                    brand_query |= Q(brand__id=brand)
            return queryset.filter(brand_query)
        return queryset

    def filter_category(self, queryset, name, value):
        categories = self.request.query_params.getlist('category')
        if not categories and value:
            categories = [value]
            
        if categories:
            category_query = Q()
            for category in categories:
                category_query |= Q(category__slug=category)
                category_query |= Q(category__name__iexact=category)
                if is_valid_uuid(category):
                    category_query |= Q(category__id=category)
            return queryset.filter(category_query)
        return queryset

    def filter_category_name(self, queryset, name, value):
        categories = self.request.query_params.getlist('category__name')
        if not categories and value:
            categories = [value]
            
        if categories:
            category_query = Q()
            for category in categories:
                category_query |= Q(category__name__iexact=category)
                category_query |= Q(category__slug=category)
            return queryset.filter(category_query)
        return queryset

    def filter_badge(self, queryset, name, value):
        badges = self.request.query_params.getlist('badge')
        if not badges and value:
            badges = [value]
            
        if badges:
            badge_query = Q()
            for badge in badges:
                badge_query |= Q(badges__slug=badge)
                if is_valid_uuid(badge):
                    badge_query |= Q(badges__id=badge)
            return queryset.filter(badge_query).distinct()
        return queryset
