from rest_framework import serializers
from ..models.order import Order
from ..models.item import OrderItem
from ..models.timeline import OrderTimeline
from ..models.note import OrderNote
from decimal import Decimal

class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by', 'updated_by']

class OrderTimelineSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderTimeline
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by', 'updated_by']

class OrderNoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderNote
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by', 'updated_by']

class OrderListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'customer', 'status', 'total_amount', 
            'currency', 'payment_status', 'shipping_status', 'created_at'
        ]

class OrderDetailSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    timeline_events = OrderTimelineSerializer(many=True, read_only=True)
    internal_notes = OrderNoteSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = '__all__'

class OrderItemCreateSerializer(serializers.Serializer):
    variant_id = serializers.UUIDField()
    quantity = serializers.IntegerField(min_value=1)
    tax_amount = serializers.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'), required=False)
    discount_amount = serializers.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'), required=False)

class OrderCreateSerializer(serializers.Serializer):
    customer = serializers.UUIDField()
    shipping_address = serializers.UUIDField()
    billing_address = serializers.UUIDField(required=False)
    currency = serializers.CharField(max_length=3, default='USD')
    shipping_amount = serializers.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'), required=False)
    discount_amount = serializers.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'), required=False)
    payment_provider = serializers.CharField(max_length=50, required=False, allow_blank=True)
    payment_reference = serializers.CharField(max_length=100, required=False, allow_blank=True)
    payment_method = serializers.CharField(max_length=50, required=False, allow_blank=True)
    
    items = OrderItemCreateSerializer(many=True, min_length=1)

class OrderStatusUpdateSerializer(serializers.Serializer):
    status = serializers.CharField(max_length=20)
