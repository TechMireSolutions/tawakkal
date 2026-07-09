from apps.core.repositories import BaseRepository
from .models import Media

class MediaRepository(BaseRepository):
    model = Media
