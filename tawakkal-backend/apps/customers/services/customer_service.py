from django.db import transaction
from django.utils import timezone
from apps.core.services import BaseService
from ..models.customer import Customer, CustomerStatus, CustomerTier
from ..models.address import CustomerAddress
from ..models.note import CustomerNote
from ..models.timeline import CustomerTimeline
from ..repositories.customer_repository import CustomerRepository
from apps.audit.utils import log_audit
from django.forms.models import model_to_dict

class CustomerService(BaseService):
    repository = CustomerRepository

    @classmethod
    def _normalize_email(cls, email):
        if not email:
            return ""
        return email.strip().lower()

    @classmethod
    def _normalize_phone(cls, phone):
        if not phone:
            return ""
        # Simple normalization: keep only digits and leading plus
        return ''.join(c for c in phone if c.isdigit() or c == '+')

    @classmethod
    def _generate_customer_code(cls):
        count = Customer.all_objects.count()
        return f"CUS-{count + 1:06d}"

    @classmethod
    @transaction.atomic
    def create_customer(cls, data, user=None, request=None):
        email = cls._normalize_email(data.get('email'))
        phone = cls._normalize_phone(data.get('phone'))
        
        customer_code = cls._generate_customer_code()
        
        customer = Customer(
            customer_code=customer_code,
            email=email,
            phone=phone,
            first_name=data.get('first_name', '').strip(),
            last_name=data.get('last_name', '').strip(),
            user_id=data.get('user_id'),
            alternate_phone=cls._normalize_phone(data.get('alternate_phone', '')),
            avatar_id=data.get('avatar_id'),
            gender=data.get('gender', ''),
            date_of_birth=data.get('date_of_birth'),
            company_name=data.get('company_name', '').strip(),
            tax_number=data.get('tax_number', '').strip(),
            status=data.get('status', CustomerStatus.ACTIVE),
            tier=data.get('tier', CustomerTier.BRONZE),
            preferred_language=data.get('preferred_language', 'en'),
            preferred_currency=data.get('preferred_currency', 'USD'),
            accepts_marketing=data.get('accepts_marketing', False),
            accepts_sms=data.get('accepts_sms', False)
        )
        customer.save()
        
        tags = data.get('tags', [])
        if tags:
            customer.tags.set(tags)
            
        addresses_data = data.get('addresses', [])
        for addr_data in addresses_data:
            CustomerAddress.objects.create(
                customer=customer,
                **addr_data
            )
            
        CustomerTimeline.objects.create(
            customer=customer,
            event_type='Customer Created',
            description=f'Customer {customer.customer_code} created.',
            performed_by=user
        )
        
        log_audit(
            action='CREATE',
            instance=customer,
            user=user,
            after_state=model_to_dict(customer),
            request=request
        )
        return customer

    @classmethod
    @transaction.atomic
    def update_customer(cls, customer, data, user=None, request=None):
        old_status = customer.status
        old_tier = customer.tier
        
        if 'email' in data:
            customer.email = cls._normalize_email(data['email'])
        if 'phone' in data:
            customer.phone = cls._normalize_phone(data['phone'])
        if 'alternate_phone' in data:
            customer.alternate_phone = cls._normalize_phone(data['alternate_phone'])
            
        for field in ['first_name', 'last_name', 'company_name', 'tax_number']:
            if field in data:
                setattr(customer, field, data[field].strip())
                
        for field in ['gender', 'date_of_birth', 'status', 'tier', 'preferred_language', 'preferred_currency', 'accepts_marketing', 'accepts_sms', 'avatar_id']:
            if field in data:
                setattr(customer, field, data[field])
                
        customer.save()
        
        if 'tags' in data:
            customer.tags.set(data['tags'])
            
        if old_status != customer.status:
            CustomerTimeline.objects.create(
                customer=customer,
                event_type='Status Changed',
                description=f'Status changed from {old_status} to {customer.status}',
                performed_by=user
            )
            
        if old_tier != customer.tier:
            CustomerTimeline.objects.create(
                customer=customer,
                event_type='Loyalty Updated',
                description=f'Tier changed from {old_tier} to {customer.tier}',
                performed_by=user
            )
            
        log_audit(
            action='UPDATE',
            instance=customer,
            user=user,
            after_state=model_to_dict(customer),
            request=request
        )
        return customer

    @classmethod
    @transaction.atomic
    def block_customer(cls, customer_id, reason="No reason provided", user=None, request=None):
        customer = cls.repository().get_by_id(customer_id)
        customer.status = CustomerStatus.BLOCKED
        customer.save(update_fields=['status', 'updated_at'])
        
        CustomerNote.objects.create(
            customer=customer,
            author=user,
            text=f"Blocked: {reason}"
        )
        
        CustomerTimeline.objects.create(
            customer=customer,
            event_type='Status Changed',
            description=f'Customer blocked. Reason: {reason}',
            performed_by=user
        )
        log_audit(
            action='UPDATE',
            instance=customer,
            user=user,
            after_state=model_to_dict(customer),
            request=request
        )
        return customer

    @classmethod
    @transaction.atomic
    def unblock_customer(cls, customer_id, user=None, request=None):
        customer = cls.repository().get_by_id(customer_id)
        customer.status = CustomerStatus.ACTIVE
        customer.save(update_fields=['status', 'updated_at'])
        
        CustomerTimeline.objects.create(
            customer=customer,
            event_type='Status Changed',
            description='Customer unblocked.',
            performed_by=user
        )
        log_audit(
            action='UPDATE',
            instance=customer,
            user=user,
            after_state=model_to_dict(customer),
            request=request
        )
        return customer

    @classmethod
    @transaction.atomic
    def add_note(cls, customer_id, text, user=None, request=None):
        customer = cls.repository().get_by_id(customer_id)
        note = CustomerNote.objects.create(
            customer=customer,
            author=user,
            text=text
        )
        CustomerTimeline.objects.create(
            customer=customer,
            event_type='Note Added',
            description='Internal note added.',
            performed_by=user
        )
        return note

    @classmethod
    @transaction.atomic
    def merge_customers(cls, primary_customer_id, secondary_customer_id, user=None, request=None):
        """
        Placeholder service for merging duplicate customers.
        Every ERP eventually needs this.
        """
        raise NotImplementedError("Merge customers is not fully implemented yet.")
