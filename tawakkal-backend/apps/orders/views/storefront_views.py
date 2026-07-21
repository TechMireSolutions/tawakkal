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
        try:
            return self._post(request, *args, **kwargs)
        except Exception as e:
            import traceback
            print("Checkout Exception:", traceback.format_exc())
            err_msg = str(e)
            if hasattr(e, 'detail'):
                if isinstance(e.detail, list):
                    err_msg = ' '.join([str(d) for d in e.detail])
                elif isinstance(e.detail, dict):
                    err_msg = ', '.join([f"{k}: {' '.join(v) if isinstance(v, list) else v}" for k, v in e.detail.items()])
                else:
                    err_msg = str(e.detail)
            return Response({'error': err_msg}, status=status.HTTP_400_BAD_REQUEST)

    def _post(self, request, *args, **kwargs):
        data = request.data
        
        # 1. Extract customer details
        customer_name = str(data.get('customer_name', '')).strip()
        email = str(data.get('email', '')).strip()
        phone = str(data.get('phone', '')).strip()[:50]
        address_str = str(data.get('address', '')).strip()
        
        if not email:
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
            
        parts = customer_name.split(' ', 1)
        first_name = parts[0][:150] if parts else ''
        last_name = parts[1][:150] if len(parts) > 1 else ''
        
        # 2. Get or create Customer (using all_objects to handle soft-deleted & case-insensitive matches)
        email_clean = email.strip().lower()
        customer = Customer.all_objects.filter(email__iexact=email_clean).first()
        if customer:
            if customer.is_deleted:
                customer.is_deleted = False
                customer.deleted_at = None
            customer.first_name = first_name or customer.first_name
            customer.last_name = last_name or customer.last_name
            customer.phone = phone or customer.phone
            customer.save()
        else:
            customer = Customer.objects.create(
                email=email_clean,
                first_name=first_name,
                last_name=last_name,
                phone=phone,
                customer_code=f'CUST-{uuid.uuid4().hex[:8].upper()}'
            )
            
        # 3. Create Customer Address
        addr_parts = [p.strip() for p in address_str.split(',')]
        country = (addr_parts[-1] if len(addr_parts) > 0 else 'Pakistan')[:100]
        city = (addr_parts[-2] if len(addr_parts) > 1 else 'N/A')[:100]
        line1 = (', '.join(addr_parts[:-2]) if len(addr_parts) > 2 else address_str)[:255]
        if not line1:
            line1 = 'N/A'
        
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
        order = OrderService.create_order(
            data=service_data,
            items_data=data.get('order_items', []),
            user=None,
            request=request
        )
            
        return Response(OrderDetailSerializer(order).data, status=status.HTTP_201_CREATED)
