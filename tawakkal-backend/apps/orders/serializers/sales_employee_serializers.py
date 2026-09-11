from rest_framework import serializers
from rest_framework.exceptions import ValidationError as DRFValidationError
from django.core.exceptions import ValidationError as DjangoValidationError
from apps.orders.models import SalesEmployee

class SalesEmployeeSerializer(serializers.ModelSerializer):
    total_orders = serializers.SerializerMethodField()

    class Meta:
        model = SalesEmployee
        fields = ['id', 'first_name', 'last_name', 'coupon_code', 'is_active', 'total_orders', 'created_at']
        read_only_fields = ['id', 'coupon_code', 'created_at']

    def validate(self, attrs):
        # We need an instance to run clean if we are updating, or empty for create
        instance = self.instance or SalesEmployee(**attrs)
        # Update instance with new attrs for validation
        if self.instance:
            for k, v in attrs.items():
                setattr(instance, k, v)
        try:
            instance.clean()
        except DjangoValidationError as e:
            raise DRFValidationError(e.message_dict if hasattr(e, 'message_dict') else list(e.messages))
        return attrs

    def get_total_orders(self, obj):
        # We'll use a simple count here, it can be optimized with annotations in the ViewSet if needed
        return obj.orders.count()
