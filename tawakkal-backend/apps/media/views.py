from rest_framework import viewsets, parsers, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from drf_spectacular.utils import extend_schema
from django.core.exceptions import ValidationError

from apps.core.mixins import SoftDeleteModelMixin, RestoreModelMixin
from apps.core.utils import format_api_response
from apps.users.permissions import HasModulePermission
from .models import Media
from .services import MediaService
from .serializers import MediaListSerializer, MediaDetailSerializer, MediaUploadSerializer

class MediaViewSet(SoftDeleteModelMixin, RestoreModelMixin, viewsets.GenericViewSet, viewsets.mixins.ListModelMixin, viewsets.mixins.RetrieveModelMixin):
    """
    ViewSet for Media management.
    """
    queryset = Media.objects.all()
    permission_classes = [IsAuthenticated, HasModulePermission]
    service_class = MediaService
    
    # Needs module_name for HasModulePermission logic if it checks specific modules, 
    # but here we can just use the view name or we can let IsAdminUser or HasModulePermission handle it.
    module_name = 'media'

    def get_serializer_class(self):
        if self.action == 'upload':
            return MediaUploadSerializer
        if self.action == 'retrieve':
            return MediaDetailSerializer
        return MediaListSerializer

    @extend_schema(
        request=MediaUploadSerializer,
        responses={201: MediaDetailSerializer},
        description="Upload a new media file."
    )
    @action(detail=False, methods=['post'], parser_classes=[parsers.MultiPartParser])
    def upload(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            try:
                # Use the Service to create the Media record, performing validation and audit logging
                instance = self.service_class.create(
                    user=request.user,
                    request=request,
                    file=serializer.validated_data['file'],
                    alt_text=serializer.validated_data.get('alt_text', ''),
                    created_by=request.user
                )
                
                res_serializer = MediaDetailSerializer(instance, context={'request': request})
                return format_api_response(
                    success=True,
                    message="File uploaded successfully.",
                    data=res_serializer.data,
                    status_code=status.HTTP_201_CREATED
                )
            except ValidationError as e:
                return format_api_response(
                    success=False,
                    message="Validation Error",
                    errors=list(e.messages) if hasattr(e, 'messages') else str(e),
                    status_code=status.HTTP_400_BAD_REQUEST
                )
            except Exception as e:
                import traceback
                return format_api_response(
                    success=False,
                    message="Upload Error",
                    errors=traceback.format_exc(),
                    status_code=status.HTTP_400_BAD_REQUEST
                )

        return format_api_response(
            success=False,
            message="Invalid request data.",
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            paginated_response = self.get_paginated_response(serializer.data)
            return format_api_response(
                success=True,
                data=paginated_response.data
            )
            
        serializer = self.get_serializer(queryset, many=True)
        return format_api_response(
            success=True,
            data=serializer.data
        )

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return format_api_response(
            success=True,
            data=serializer.data
        )
