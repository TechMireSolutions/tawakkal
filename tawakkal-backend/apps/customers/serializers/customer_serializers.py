from rest_framework import serializers
from ..models.customer import Customer
from ..models.address import CustomerAddress
from ..models.note import CustomerNote
from ..models.tag import CustomerTag
from ..models.timeline import CustomerTimeline

class CustomerTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerTag
        fields = ['id', 'name', 'slug', 'color']

class CustomerAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerAddress
        fields = [
            'id', 'address_type', 'is_default', 'first_name', 'last_name', 
            'phone', 'address_line1', 'address_line2', 'city', 'state', 
            'country', 'postal_code', 'company'
        ]

class CustomerNoteSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.get_full_name', read_only=True)
    
    class Meta:
        model = CustomerNote
        fields = ['id', 'text', 'author_name', 'created_at']

class CustomerTimelineSerializer(serializers.ModelSerializer):
    performed_by_name = serializers.CharField(source='performed_by.get_full_name', read_only=True)
    
    class Meta:
        model = CustomerTimeline
        fields = ['id', 'event_type', 'description', 'performed_by_name', 'created_at']

class CustomerListSerializer(serializers.ModelSerializer):
    tags = CustomerTagSerializer(many=True, read_only=True)
    
    class Meta:
        model = Customer
        fields = [
            'id', 'customer_code', 'first_name', 'last_name', 'email', 
            'phone', 'status', 'tier', 'loyalty_points', 'tags', 'created_at'
        ]

class CustomerDetailSerializer(serializers.ModelSerializer):
    tags = CustomerTagSerializer(many=True, read_only=True)
    addresses = CustomerAddressSerializer(many=True, read_only=True)
    internal_notes = CustomerNoteSerializer(many=True, read_only=True)
    timeline_events = CustomerTimelineSerializer(many=True, read_only=True)
    
    # Statistics from annotations (or model properties)
    total_orders = serializers.IntegerField(read_only=True, default=0)
    total_spent = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True, default=0)
    average_order_value = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True, default=0)

    class Meta:
        model = Customer
        fields = [
            'id', 'customer_code', 'first_name', 'last_name', 'email', 
            'phone', 'alternate_phone', 'gender', 'date_of_birth', 
            'company_name', 'tax_number', 'status', 'tier', 'notes', 
            'preferred_language', 'preferred_currency', 'accepts_marketing', 
            'accepts_sms', 'loyalty_points', 'tags', 'addresses', 
            'internal_notes', 'timeline_events', 'created_at', 'updated_at',
            'total_orders', 'total_spent', 'average_order_value'
        ]

class CustomerCreateSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=50, required=False, allow_blank=True)
    alternate_phone = serializers.CharField(max_length=50, required=False, allow_blank=True)
    
    gender = serializers.CharField(max_length=20, required=False, allow_blank=True)
    date_of_birth = serializers.DateField(required=False, allow_null=True)
    
    company_name = serializers.CharField(max_length=255, required=False, allow_blank=True)
    tax_number = serializers.CharField(max_length=100, required=False, allow_blank=True)
    
    status = serializers.CharField(required=False)
    tier = serializers.CharField(required=False)
    
    preferred_language = serializers.CharField(max_length=10, required=False)
    preferred_currency = serializers.CharField(max_length=3, required=False)
    
    accepts_marketing = serializers.BooleanField(default=False)
    accepts_sms = serializers.BooleanField(default=False)
    
    tags = serializers.ListField(child=serializers.UUIDField(), required=False)
    addresses = CustomerAddressSerializer(many=True, required=False)

    def validate_email(self, value):
        email = value.lower().strip()
        if Customer.objects.filter(email=email).exists():
            raise serializers.ValidationError("A customer with this email already exists.")
        return email

class CustomerUpdateSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=150, required=False)
    last_name = serializers.CharField(max_length=150, required=False)
    email = serializers.EmailField(required=False)
    phone = serializers.CharField(max_length=50, required=False, allow_blank=True)
    alternate_phone = serializers.CharField(max_length=50, required=False, allow_blank=True)
    
    gender = serializers.CharField(max_length=20, required=False, allow_blank=True)
    date_of_birth = serializers.DateField(required=False, allow_null=True)
    
    status = serializers.CharField(required=False)
    tier = serializers.CharField(required=False)
    
    accepts_marketing = serializers.BooleanField(required=False)
    accepts_sms = serializers.BooleanField(required=False)
    
    tags = serializers.ListField(child=serializers.UUIDField(), required=False)
