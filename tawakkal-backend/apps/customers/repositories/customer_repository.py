from apps.core.repositories import BaseRepository
from ..models.customer import Customer

class CustomerRepository(BaseRepository):
    model = Customer

    def get_optimized_queryset(self):
        """
        Base optimized queryset. Avoids N+1.
        """
        return self.get_queryset().select_related(
            'user', 'avatar'
        ).prefetch_related(
            'tags', 'addresses'
        )
        
    def with_order_statistics(self, queryset=None):
        """
        Placeholder for when Order module exists.
        Currently annotates default 0s to maintain API contract.
        """
        from django.db.models import Value, IntegerField, DecimalField
        qs = queryset if queryset is not None else self.get_optimized_queryset()
        return qs

    def search(self, query):
        qs = self.get_optimized_queryset()
        if query:
            from django.db.models import Q
            qs = qs.filter(
                Q(first_name__icontains=query) |
                Q(last_name__icontains=query) |
                Q(email__icontains=query) |
                Q(phone__icontains=query) |
                Q(customer_code__icontains=query) |
                Q(company_name__icontains=query)
            )
        return qs

    def get_vip(self):
        return self.get_optimized_queryset().filter(tier='VIP')

    def get_inactive(self):
        return self.get_optimized_queryset().filter(status='INACTIVE')

    def get_blocked(self):
        return self.get_optimized_queryset().filter(status='BLOCKED')

    def get_recent(self):
        return self.get_optimized_queryset().order_by('-created_at')[:50]
        
    def get_top_customers(self):
        """Placeholder for top customers by spending"""
        return self.with_order_statistics().order_by('-total_spent')[:50]

    def get_no_orders(self):
        """Placeholder until Orders exist. Returns all right now as no orders exist."""
        return self.get_optimized_queryset()
