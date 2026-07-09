from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .serializers import UserSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from drf_spectacular.utils import extend_schema
import traceback
import logging
from rest_framework.exceptions import AuthenticationFailed

logger = logging.getLogger(__name__)

class CustomTokenObtainPairView(TokenObtainPairView):
    @extend_schema(responses={200: dict})
    def post(self, request, *args, **kwargs):
        try:
            response = super().post(request, *args, **kwargs)
        except AuthenticationFailed as e:
            # Authentication failures should return 401 with a clear message
            return Response({
                'success': False,
                'message': 'Authentication failed.',
                'data': None,
                'errors': {'detail': str(e)}
            }, status=status.HTTP_401_UNAUTHORIZED)
        except Exception as e:
            # Log traceback to help diagnose the 500 in production
            tb = traceback.format_exc()
            logger.error('Token obtain error: %s', tb)
            return Response({
                'success': False,
                'message': 'Internal server error during token obtain.',
                'data': None,
                'errors': {'detail': str(e), 'trace': tb}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Module 15: Notify Login (best-effort)
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            user = serializer.user
            from apps.notifications.services.notification_service import NotificationService
            try:
                NotificationService.dispatch(
                    recipient=user,
                    template_code='USER_LOGIN',
                    variables={'customer_name': user.first_name, 'ip_address': request.META.get('REMOTE_ADDR', 'Unknown')},
                    sender=None
                )
            except Exception as notify_exc:
                # Log notification errors but do not block login
                logger.warning('Notification dispatch failed: %s', traceback.format_exc())
        except Exception:
            # if serializer validation fails, we ignore here since super().post handles auth errors
            pass

        return Response({
            'success': True,
            'message': 'Login successful.',
            'data': response.data,
            'errors': None
        })

class CustomTokenRefreshView(TokenRefreshView):
    @extend_schema(responses={200: dict})
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        return Response({
            'success': True,
            'message': 'Token refreshed.',
            'data': response.data,
            'errors': None
        })

from rest_framework import serializers

class LogoutRequestSerializer(serializers.Serializer):
    refresh = serializers.CharField()

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(request=LogoutRequestSerializer, responses={200: dict})
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response({
                'success': True,
                'message': 'Logout successful.',
                'data': {},
                'errors': None
            })
        except Exception as e:
            return Response({
                'success': False,
                'message': 'Logout failed.',
                'data': None,
                'errors': {'detail': str(e)}
            }, status=status.HTTP_400_BAD_REQUEST)

class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(responses={200: UserSerializer})
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response({
            'success': True,
            'message': 'Current user retrieved.',
            'data': serializer.data,
            'errors': None
        })
