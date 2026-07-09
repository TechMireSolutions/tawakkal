from rest_framework import serializers
from ..models.carrier import ShippingCarrier, ShippingMethod
from ..models.shipment import Shipment, ShipmentItem, ShipmentTimeline
from ..models.returns import ReturnRequest, ReturnItem, ReturnReason, ReturnTimeline

class ShippingCarrierSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShippingCarrier
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by', 'updated_by']

class ShippingMethodSerializer(serializers.ModelSerializer):
    carrier_name = serializers.CharField(source='carrier.name', read_only=True)
    class Meta:
        model = ShippingMethod
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by', 'updated_by']

class ShipmentItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShipmentItem
        fields = '__all__'
        read_only_fields = ['id']

class ShipmentSerializer(serializers.ModelSerializer):
    items = ShipmentItemSerializer(many=True, read_only=True)
    carrier_name = serializers.CharField(source='carrier.name', read_only=True)
    shipping_method_name = serializers.CharField(source='shipping_method.name', read_only=True)

    class Meta:
        model = Shipment
        fields = '__all__'
        read_only_fields = ['id', 'shipment_number', 'created_at', 'updated_at', 'created_by', 'updated_by']

class CreateShipmentItemSerializer(serializers.Serializer):
    order_item_id = serializers.UUIDField()
    quantity = serializers.IntegerField(min_value=1)

class CreateShipmentSerializer(serializers.Serializer):
    order_id = serializers.UUIDField()
    carrier_id = serializers.UUIDField(required=False)
    shipping_method_id = serializers.UUIDField(required=False)
    items = CreateShipmentItemSerializer(many=True)

class UpdateShipmentStatusSerializer(serializers.Serializer):
    status = serializers.CharField(max_length=50)
    tracking_number = serializers.CharField(required=False, allow_blank=True)
    label_url = serializers.URLField(required=False, allow_blank=True)

class ReturnReasonSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReturnReason
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by', 'updated_by']

class ReturnItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReturnItem
        fields = '__all__'

class ReturnRequestSerializer(serializers.ModelSerializer):
    items = ReturnItemSerializer(many=True, read_only=True)

    class Meta:
        model = ReturnRequest
        fields = '__all__'
        read_only_fields = ['id', 'return_number', 'created_at', 'updated_at', 'created_by', 'updated_by']

class CreateReturnItemSerializer(serializers.Serializer):
    shipment_item_id = serializers.UUIDField()
    quantity = serializers.IntegerField(min_value=1)
    reason_id = serializers.UUIDField(required=False, allow_null=True)

class CreateReturnRequestSerializer(serializers.Serializer):
    order_id = serializers.UUIDField()
    notes = serializers.CharField(required=False, allow_blank=True)
    items = CreateReturnItemSerializer(many=True)

class UpdateReturnStatusSerializer(serializers.Serializer):
    status = serializers.CharField(max_length=50)
