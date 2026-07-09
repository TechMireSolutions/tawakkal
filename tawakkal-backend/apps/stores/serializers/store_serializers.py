from rest_framework import serializers
from apps.stores.models import Store, StoreHours, Warehouse, StoreInventory, StoreStaff, StoreTimeline
from apps.users.serializers import UserSerializer

class StoreHoursSerializer(serializers.ModelSerializer):
    class Meta:
        model = StoreHours
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'is_deleted', 'deleted_at']

class WarehouseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Warehouse
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'is_deleted', 'deleted_at']

class StoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Store
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'is_deleted', 'deleted_at']

class StoreDetailSerializer(StoreSerializer):
    hours = StoreHoursSerializer(many=True, read_only=True)
    warehouses = WarehouseSerializer(many=True, read_only=True)
    
class StoreStaffSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    
    class Meta:
        model = StoreStaff
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'is_deleted', 'deleted_at']

class StoreInventorySerializer(serializers.ModelSerializer):
    class Meta:
        model = StoreInventory
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'is_deleted', 'deleted_at']

class InventoryTransferSerializer(serializers.Serializer):
    variant_id = serializers.UUIDField()
    source_warehouse_id = serializers.UUIDField()
    dest_warehouse_id = serializers.UUIDField()
    quantity = serializers.IntegerField(min_value=1)
    
class AssignManagerSerializer(serializers.Serializer):
    manager_id = serializers.UUIDField()

class AssignStaffSerializer(serializers.Serializer):
    staff_id = serializers.UUIDField()
    role = serializers.CharField()
