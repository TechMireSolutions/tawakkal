from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from .services import SiteSettingsService, SystemConfigService
from .serializers import BRANDING_MEDIA_FIELDS, SiteSettingsSerializer, SystemConfigSerializer


class SiteSettingsAPIView(APIView):
    def get_permissions(self):
        if self.request.method == 'GET':
            return []
        from rest_framework.permissions import IsAuthenticated, IsAdminUser
        return [IsAuthenticated(), IsAdminUser()]

    def get(self, request):
        settings = SiteSettingsService.get_settings()
        serializer = SiteSettingsSerializer(settings, context={'request': request})
        return Response(serializer.data)

    def put(self, request):
        from apps.media.models import Media

        data = request.data.copy()
        files = request.FILES

        for field in BRANDING_MEDIA_FIELDS:
            remove_key = f'{field}_remove'
            if field in files:
                uploaded_file = files[field]
                media = Media.objects.create(
                    file=uploaded_file,
                    original_filename=uploaded_file.name,
                    size=uploaded_file.size,
                    created_by=request.user,
                    updated_by=request.user,
                )
                data[field] = media.id
            elif str(data.get(remove_key, '')).lower() == 'true':
                data[field] = None
            if remove_key in data:
                data.pop(remove_key)

        serializer = SiteSettingsSerializer(data=data, partial=True, context={'request': request})
        if serializer.is_valid():
            updated = SiteSettingsService.update_settings(
                data=serializer.validated_data,
                user=request.user,
                request=request
            )
            return Response(SiteSettingsSerializer(updated, context={'request': request}).data)
        return Response(serializer.errors, status=400)

    def patch(self, request):
        return self.put(request)


class SystemConfigAPIView(APIView):
    def get_permissions(self):
        if self.request.method == 'GET':
            return []
        from rest_framework.permissions import IsAuthenticated, IsAdminUser
        return [IsAuthenticated(), IsAdminUser()]

    def get(self, request):
        config = SystemConfigService.get_config()
        serializer = SystemConfigSerializer(config)
        return Response(serializer.data)

    def put(self, request):
        serializer = SystemConfigSerializer(data=request.data, partial=True)
        if serializer.is_valid():
            updated = SystemConfigService.update_config(
                data=serializer.validated_data,
                user=request.user,
                request=request
            )
            return Response(SystemConfigSerializer(updated).data)
        return Response(serializer.errors, status=400)

    def patch(self, request):
        return self.put(request)