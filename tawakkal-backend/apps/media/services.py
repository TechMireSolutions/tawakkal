from apps.core.services import BaseService
from .repositories import MediaRepository
from django.core.exceptions import ValidationError
import mimetypes

ALLOWED_MIME_TYPES = [
    # Images
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/svg+xml',

    # Documents
    'application/pdf',

    # Videos
    'video/mp4',
    'video/webm',
    'video/quicktime',      # .mov
    'video/x-msvideo',      # .avi
    'video/x-matroska',     # .mkv
]

MAX_UPLOAD_SIZE = 50 * 1024 * 1024  # 50MB

class MediaService(BaseService):
    repository = MediaRepository

    @classmethod
    def validate_file(cls, uploaded_file):
        if uploaded_file.size > MAX_UPLOAD_SIZE:
            raise ValidationError(f"File size exceeds the {MAX_UPLOAD_SIZE/1024/1024}MB limit.")

        mime, _ = mimetypes.guess_type(uploaded_file.name)
        if not mime:
            mime = getattr(uploaded_file, 'content_type', None)

        if not mime:
            raise ValidationError("Unable to determine file type.")

        if mime not in ALLOWED_MIME_TYPES:
            raise ValidationError(f"File type {mime} is not allowed.")

        return mime

    @classmethod
    def create(cls, user=None, request=None, **kwargs):
        uploaded_file = kwargs.get('file')
        if not uploaded_file:
            raise ValidationError("File is required.")

        mime_type = cls.validate_file(uploaded_file)
        
        # Populate kwargs with extracted info
        kwargs['original_filename'] = uploaded_file.name
        kwargs['size'] = uploaded_file.size
        kwargs['mime_type'] = mime_type
        
        # We handle width and height in the serializer or by Pillow automatically
        # if it's an image.
        
        return super().create(user=user, request=request, **kwargs)
