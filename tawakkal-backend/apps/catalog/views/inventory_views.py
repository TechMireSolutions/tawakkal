from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema, inline_serializer
from rest_framework import serializers

from apps.core.utils import format_api_response
from apps.users.permissions import HasModulePermission
from ..services.product_service import ProductService
from ..models.product import InventoryReason

class BulkAdjustSerializer(serializers.Serializer):
    variant_id = serializers.UUIDField()
    quantity = serializers.IntegerField()
    reason = serializers.ChoiceField(choices=InventoryReason.choices)
    reference_type = serializers.CharField(max_length=100, required=False, allow_blank=True)
    reference_id = serializers.CharField(max_length=100, required=False, allow_blank=True)

class InventoryViewSet(viewsets.ViewSet):
    """
    ViewSet for Inventory Bulk Operations.
    """
    permission_classes = [IsAuthenticated, HasModulePermission]
    module_name = 'catalog'

    @extend_schema(
        request=inline_serializer(
            name="BulkAdjustRequest",
            fields={
                "adjustments": BulkAdjustSerializer(many=True)
            }
        ),
        responses={200: dict}
    )
    @action(detail=False, methods=['post'], url_path='bulk-adjust')
    def bulk_adjust(self, request):
        adjustments = request.data.get('adjustments', [])
        if not adjustments:
            return format_api_response(success=False, message="No adjustments provided", status_code=status.HTTP_400_BAD_REQUEST)
            
        success_count = 0
        errors = []
        
        for adj in adjustments:
            try:
                ProductService.adjust_stock(
                    variant_id=adj.get('variant_id'),
                    quantity=adj.get('quantity'),
                    reason=adj.get('reason'),
                    user=request.user,
                    reference_type=adj.get('reference_type', ''),
                    reference_id=adj.get('reference_id', '')
                )
                success_count += 1
            except Exception as e:
                errors.append({"variant_id": adj.get('variant_id'), "error": str(e)})
                
        if errors:
            return format_api_response(
                success=False, 
                message=f"Completed {success_count} adjustments. {len(errors)} failed.",
                errors=errors,
                status_code=status.HTTP_207_MULTI_STATUS
            )
            
        return format_api_response(success=True, message=f"Successfully applied {success_count} inventory adjustments.")

    @extend_schema(responses={200: dict})
    @action(detail=False, methods=['post'], url_path='bulk-import')
    def bulk_import(self, request):
        # Placeholder for actual bulk import logic (e.g., CSV parsing)
        return format_api_response(success=True, message="Bulk import processing started.")

    @extend_schema(responses={200: dict})
    @action(detail=False, methods=['post'], url_path='bulk-export')
    def bulk_export(self, request):
        # Placeholder for actual bulk export logic
        return format_api_response(success=True, message="Bulk export processing started.")
