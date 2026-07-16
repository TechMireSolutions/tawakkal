from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.db import transaction
import uuid

from apps.customers.models import Customer, CustomerAddress
from ..services.order_service import OrderService
from ..serializers.order_serializers import OrderDetailSerializer

class PublicCheckoutView(APIView):
    permission_classes = [AllowAny]

    @transaction.atomic
    def post(self, request, *args, **kwargs):
        data = request.data
        
        # 1. Extract customer details
        customer_name = data.get('customer_name', '')
        email = data.get('email')
        phone = data.get('phone', '')
        address_str = data.get('address', '')
        
        if not email:
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
            
        parts = customer_name.split(' ', 1)
        first_name = parts[0] if parts else ''
        last_name = parts[1] if len(parts) > 1 else ''
        
        # 2. Get or create Customer
        customer, created = Customer.objects.get_or_create(
            email=email,
            defaults={
                'first_name': first_name,
                'last_name': last_name,
                'phone': phone,
                'customer_code': f'CUST-{uuid.uuid4().hex[:8].upper()}'
            }
        )
        
        # Update details if existing
        if not created:
            customer.first_name = first_name or customer.first_name
            customer.last_name = last_name or customer.last_name
            customer.phone = phone or customer.phone
            customer.save(update_fields=['first_name', 'last_name', 'phone'])
            
        # 3. Create Customer Address
        # Parse city and country from address_str (Address, City, Country)
        addr_parts = [p.strip() for p in address_str.split(',')]
        country = addr_parts[-1] if len(addr_parts) > 0 else 'Pakistan'
        city = addr_parts[-2] if len(addr_parts) > 1 else ''
        line1 = ', '.join(addr_parts[:-2]) if len(addr_parts) > 2 else address_str
        
        shipping_address = CustomerAddress.objects.create(
            customer=customer,
            first_name=first_name,
            last_name=last_name,
            phone=phone,
            address_line1=line1,
            city=city,
            state='',
            country=country,
            postal_code='',
            is_default=True
        )
        
        # 4. Prepare Service Data
        service_data = {
            'customer': customer,
            'shipping_address': shipping_address,
            'billing_address': shipping_address,
            'currency': 'PKR',
            'shipping_amount': data.get('shipping_amount', 0),
            'discount_amount': data.get('discount_amount', 0),
            'payment_method': data.get('payment_method', 'COD'),
        }
        
        # 5. Call Order Service
        try:
            order = OrderService.create_order(
                data=service_data,
                items_data=data.get('order_items', []),
                user=None,
                request=request
            )
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
            
        return Response(OrderDetailSerializer(order).data, status=status.HTTP_201_CREATED)
