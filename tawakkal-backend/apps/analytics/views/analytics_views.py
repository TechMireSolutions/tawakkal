from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated

from apps.core.utils import format_api_response
from apps.users.permissions import HasModulePermission
from ..services.analytics_service import AnalyticsService

from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiTypes

class AnalyticsViewSet(viewsets.ViewSet):
    """
    ViewSet for Admin Analytics & Reporting.
    """
    permission_classes = [IsAuthenticated, HasModulePermission]
    module_name = 'analytics'
    service_class = AnalyticsService

    @extend_schema(summary="Get Dashboard Statistics", responses={200: dict})
    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        stats = self.service_class.get_dashboard_stats()
        return format_api_response(success=True, data=stats)

    @extend_schema(summary="Get Recent Activity Feed", responses={200: dict})
    @action(detail=False, methods=['get'])
    def recent_activity(self, request):
        activities = self.service_class.get_recent_activity(limit=10)
        return format_api_response(success=True, data=activities)

    @extend_schema(
        summary="Get Analytics Overview",
        parameters=[OpenApiParameter(name='period', type=OpenApiTypes.STR, location=OpenApiParameter.QUERY, description='Time period (e.g., 30d, 7d)')],
        responses={200: dict}
    )
    @action(detail=False, methods=['get'])
    def overview(self, request):
        period = request.query_params.get('period', '30d')
        overview_data = self.service_class.get_analytics_overview(period)
        return format_api_response(success=True, data=overview_data)
