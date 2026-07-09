from apps.core.repositories import BaseRepository
from ..models.tag import CustomerTag

class CustomerTagRepository(BaseRepository):
    model = CustomerTag

    def get_optimized_queryset(self):
        return self.get_queryset()
