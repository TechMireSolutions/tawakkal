from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import status
from django.shortcuts import get_object_or_404

class SoftDeleteModelMixin:
    """
    Destroy a model instance using soft delete via the service layer if available,
    otherwise fallback to repository soft_delete.
    """
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # If a service class is defined on the ViewSet, use it for deletion (it handles audit logging)
        if hasattr(self, 'service_class') and self.service_class:
            self.service_class.soft_delete(instance, user=request.user, request=request)
        else:
            # Fallback if no service is defined, try repository or direct model method
            if hasattr(instance, 'soft_delete'):
                instance.soft_delete()
                
        return Response({
            'success': True,
            'message': 'Deleted successfully.',
            'data': None,
            'errors': None
        }, status=status.HTTP_200_OK)

class RestoreModelMixin:
    """
    Restore a soft-deleted model instance.
    """
    @action(detail=True, methods=['post'])
    def restore(self, request, *args, **kwargs):
        # We need to use `all_objects` or equivalent since `get_object()` might filter out deleted items.
        # This requires the queryset to include deleted items for this specific action.
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
        filter_kwargs = {self.lookup_field: self.kwargs[lookup_url_kwarg]}
        
        queryset = self.get_queryset()
        if hasattr(queryset.model, 'all_objects'):
            queryset = queryset.model.all_objects.all()
            
        instance = get_object_or_404(queryset, **filter_kwargs)
        
        if hasattr(self, 'service_class') and self.service_class:
            self.service_class.restore(instance, user=request.user, request=request)
        else:
            if hasattr(instance, 'restore'):
                instance.restore()
                
        return Response({
            'success': True,
            'message': 'Restored successfully.',
            'data': None,
            'errors': None
        }, status=status.HTTP_200_OK)
