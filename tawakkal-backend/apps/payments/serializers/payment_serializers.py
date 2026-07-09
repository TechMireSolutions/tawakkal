from rest_framework import serializers
from ..models.method import PaymentMethod
from ..models.invoice import Invoice, InvoiceItem
from ..models.payment import Payment, PaymentAllocation
from ..models.refund import Refund, CreditNote

class PaymentMethodSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentMethod
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by', 'updated_by']

class InvoiceItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvoiceItem
        fields = '__all__'

class InvoiceSerializer(serializers.ModelSerializer):
    items = InvoiceItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Invoice
        fields = '__all__'
        read_only_fields = ['id', 'invoice_number', 'amount_paid', 'created_at', 'updated_at', 'created_by', 'updated_by']

class PaymentAllocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentAllocation
        fields = '__all__'

class PaymentSerializer(serializers.ModelSerializer):
    allocations = PaymentAllocationSerializer(many=True, read_only=True)
    
    class Meta:
        model = Payment
        fields = '__all__'
        read_only_fields = ['id', 'payment_number', 'created_at', 'updated_at', 'created_by', 'updated_by']

class ProcessPaymentSerializer(serializers.Serializer):
    order_id = serializers.UUIDField()
    payment_method_id = serializers.UUIDField()
    amount = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=0.01)
    transaction_id = serializers.CharField(max_length=255, required=False, allow_blank=True)

class RefundSerializer(serializers.ModelSerializer):
    class Meta:
        model = Refund
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by', 'updated_by']

class CreditNoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = CreditNote
        fields = '__all__'
        read_only_fields = ['id', 'credit_note_number', 'created_at', 'updated_at', 'created_by', 'updated_by']
