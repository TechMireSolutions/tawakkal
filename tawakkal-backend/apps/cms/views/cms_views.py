from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema, extend_schema_view

from apps.core.utils import format_api_response
from apps.users.permissions import HasModulePermission
from apps.cms.models import (
    BlogCategory, Tag, Author, BlogPost, Page, Policy, HeroBanner, Announcement,
    StaticBlock, HomepageSection, Faq, ContactInformation, SocialLink,
    NavigationMenu, FooterContent, Testimonial, ContactMessage
)
from apps.cms.serializers.cms_serializers import (
    BlogCategorySerializer, TagSerializer, AuthorSerializer, BlogPostSerializer,
    PageSerializer, PolicySerializer, HeroBannerSerializer, AnnouncementSerializer,
    StaticBlockSerializer, HomepageSectionSerializer, FaqSerializer,
    ContactInformationSerializer, SocialLinkSerializer, NavigationMenuSerializer,
    FooterContentSerializer, TestimonialSerializer, ContactMessageSerializer
)
from apps.cms.services.cms_service import CmsService

class BaseCmsViewSet(viewsets.ModelViewSet):
    """
    Base ViewSet for CMS models to handle common format and RBAC.
    """
    module_name = 'cms'
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return []  # Allow public read access
        from rest_framework.permissions import IsAuthenticated
        from apps.users.permissions import HasModulePermission
        return [IsAuthenticated(), HasModulePermission()]

    def get_queryset(self):
        # Allow prefetch/select_related hooks from child classes
        base_qs = super().get_queryset()
        qs = CmsService.get_queryset(base_qs.model)
        if hasattr(self, 'select_related_fields'):
            qs = qs.select_related(*self.select_related_fields)
        if hasattr(self, 'prefetch_related_fields'):
            qs = qs.prefetch_related(*self.prefetch_related_fields)
        return qs

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return format_api_response(success=True, data=serializer.data)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return format_api_response(success=True, data=serializer.data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            instance = CmsService.create_instance(self.queryset.model, serializer.validated_data)
            return format_api_response(success=True, data=self.get_serializer(instance).data, status_code=status.HTTP_201_CREATED)
        return format_api_response(success=False, message="Validation Error", errors=serializer.errors, status_code=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            instance = CmsService.update_instance(instance, serializer.validated_data)
            return format_api_response(success=True, data=self.get_serializer(instance).data)
        return format_api_response(success=False, message="Validation Error", errors=serializer.errors, status_code=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        CmsService.delete_instance(instance)
        return format_api_response(success=True, message="Successfully deleted.")


@extend_schema_view(
    list=extend_schema(summary="List Blog Categories"),
    create=extend_schema(summary="Create Blog Category"),
    retrieve=extend_schema(summary="Retrieve Blog Category"),
    update=extend_schema(summary="Update Blog Category"),
    partial_update=extend_schema(summary="Partially Update Blog Category"),
    destroy=extend_schema(summary="Delete Blog Category"),
)
class BlogCategoryViewSet(BaseCmsViewSet):
    queryset = BlogCategory.objects.all()
    serializer_class = BlogCategorySerializer

@extend_schema_view(
    list=extend_schema(summary="List Tags"),
    create=extend_schema(summary="Create Tag"),
    retrieve=extend_schema(summary="Retrieve Tag"),
    update=extend_schema(summary="Update Tag"),
    partial_update=extend_schema(summary="Partially Update Tag"),
    destroy=extend_schema(summary="Delete Tag"),
)
class TagViewSet(BaseCmsViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer

@extend_schema_view(
    list=extend_schema(summary="List Authors"),
    create=extend_schema(summary="Create Author"),
    retrieve=extend_schema(summary="Retrieve Author"),
    update=extend_schema(summary="Update Author"),
    partial_update=extend_schema(summary="Partially Update Author"),
    destroy=extend_schema(summary="Delete Author"),
)
class AuthorViewSet(BaseCmsViewSet):
    queryset = Author.objects.all()
    serializer_class = AuthorSerializer
    select_related_fields = ['avatar']

@extend_schema_view(
    list=extend_schema(summary="List Blog Posts"),
    create=extend_schema(summary="Create Blog Post"),
    retrieve=extend_schema(summary="Retrieve Blog Post"),
    update=extend_schema(summary="Update Blog Post"),
    partial_update=extend_schema(summary="Partially Update Blog Post"),
    destroy=extend_schema(summary="Delete Blog Post"),
)
class BlogPostViewSet(BaseCmsViewSet):
    queryset = BlogPost.objects.all()
    serializer_class = BlogPostSerializer
    select_related_fields = ['featured_image', 'category', 'author']
    prefetch_related_fields = ['tags']

@extend_schema_view(
    list=extend_schema(summary="List Pages"),
    create=extend_schema(summary="Create Page"),
    retrieve=extend_schema(summary="Retrieve Page"),
    update=extend_schema(summary="Update Page"),
    partial_update=extend_schema(summary="Partially Update Page"),
    destroy=extend_schema(summary="Delete Page"),
)
class PageViewSet(BaseCmsViewSet):
    queryset = Page.objects.all()
    serializer_class = PageSerializer
    select_related_fields = ['featured_image']

@extend_schema_view(
    list=extend_schema(summary="List Policies"),
    create=extend_schema(summary="Create Policy"),
    retrieve=extend_schema(summary="Retrieve Policy"),
    update=extend_schema(summary="Update Policy"),
    partial_update=extend_schema(summary="Partially Update Policy"),
    destroy=extend_schema(summary="Delete Policy"),
)
class PolicyViewSet(BaseCmsViewSet):
    queryset = Policy.objects.all()
    serializer_class = PolicySerializer

@extend_schema_view(
    list=extend_schema(summary="List Hero Banners"),
    create=extend_schema(summary="Create Hero Banner"),
    retrieve=extend_schema(summary="Retrieve Hero Banner"),
    update=extend_schema(summary="Update Hero Banner"),
    partial_update=extend_schema(summary="Partially Update Hero Banner"),
    destroy=extend_schema(summary="Delete Hero Banner"),
)
class HeroBannerViewSet(BaseCmsViewSet):
    queryset = HeroBanner.objects.all()
    serializer_class = HeroBannerSerializer
    select_related_fields = ['image']

@extend_schema_view(
    list=extend_schema(summary="List Announcements"),
    create=extend_schema(summary="Create Announcement"),
    retrieve=extend_schema(summary="Retrieve Announcement"),
    update=extend_schema(summary="Update Announcement"),
    partial_update=extend_schema(summary="Partially Update Announcement"),
    destroy=extend_schema(summary="Delete Announcement"),
)
class AnnouncementViewSet(BaseCmsViewSet):
    queryset = Announcement.objects.all()
    serializer_class = AnnouncementSerializer

@extend_schema_view(
    list=extend_schema(summary="List Static Blocks"),
    create=extend_schema(summary="Create Static Block"),
    retrieve=extend_schema(summary="Retrieve Static Block"),
    update=extend_schema(summary="Update Static Block"),
    partial_update=extend_schema(summary="Partially Update Static Block"),
    destroy=extend_schema(summary="Delete Static Block"),
)
class StaticBlockViewSet(BaseCmsViewSet):
    queryset = StaticBlock.objects.all()
    serializer_class = StaticBlockSerializer

@extend_schema_view(
    list=extend_schema(summary="List Homepage Sections"),
    create=extend_schema(summary="Create Homepage Section"),
    retrieve=extend_schema(summary="Retrieve Homepage Section"),
    update=extend_schema(summary="Update Homepage Section"),
    partial_update=extend_schema(summary="Partially Update Homepage Section"),
    destroy=extend_schema(summary="Delete Homepage Section"),
)
class HomepageSectionViewSet(BaseCmsViewSet):
    queryset = HomepageSection.objects.all()
    serializer_class = HomepageSectionSerializer

@extend_schema_view(
    list=extend_schema(summary="List FAQs"),
    create=extend_schema(summary="Create FAQ"),
    retrieve=extend_schema(summary="Retrieve FAQ"),
    update=extend_schema(summary="Update FAQ"),
    partial_update=extend_schema(summary="Partially Update FAQ"),
    destroy=extend_schema(summary="Delete FAQ"),
)
class FaqViewSet(BaseCmsViewSet):
    queryset = Faq.objects.all()
    serializer_class = FaqSerializer

@extend_schema_view(
    list=extend_schema(summary="List Contact Information"),
    create=extend_schema(summary="Create Contact Information"),
    retrieve=extend_schema(summary="Retrieve Contact Information"),
    update=extend_schema(summary="Update Contact Information"),
    partial_update=extend_schema(summary="Partially Update Contact Information"),
    destroy=extend_schema(summary="Delete Contact Information"),
)
class ContactInformationViewSet(BaseCmsViewSet):
    queryset = ContactInformation.objects.all()
    serializer_class = ContactInformationSerializer

@extend_schema_view(
    list=extend_schema(summary="List Social Links"),
    create=extend_schema(summary="Create Social Link"),
    retrieve=extend_schema(summary="Retrieve Social Link"),
    update=extend_schema(summary="Update Social Link"),
    partial_update=extend_schema(summary="Partially Update Social Link"),
    destroy=extend_schema(summary="Delete Social Link"),
)
class SocialLinkViewSet(BaseCmsViewSet):
    queryset = SocialLink.objects.all()
    serializer_class = SocialLinkSerializer
    select_related_fields = ['icon']

@extend_schema_view(
    list=extend_schema(summary="List Navigation Menus"),
    create=extend_schema(summary="Create Navigation Menu"),
    retrieve=extend_schema(summary="Retrieve Navigation Menu"),
    update=extend_schema(summary="Update Navigation Menu"),
    partial_update=extend_schema(summary="Partially Update Navigation Menu"),
    destroy=extend_schema(summary="Delete Navigation Menu"),
)
class NavigationMenuViewSet(BaseCmsViewSet):
    queryset = NavigationMenu.objects.all()
    serializer_class = NavigationMenuSerializer

@extend_schema_view(
    list=extend_schema(summary="List Footer Contents"),
    create=extend_schema(summary="Create Footer Content"),
    retrieve=extend_schema(summary="Retrieve Footer Content"),
    update=extend_schema(summary="Update Footer Content"),
    partial_update=extend_schema(summary="Partially Update Footer Content"),
    destroy=extend_schema(summary="Delete Footer Content"),
)
class FooterContentViewSet(BaseCmsViewSet):
    queryset = FooterContent.objects.all()
    serializer_class = FooterContentSerializer

@extend_schema_view(
    list=extend_schema(summary="List Testimonials"),
    create=extend_schema(summary="Create Testimonial"),
    retrieve=extend_schema(summary="Retrieve Testimonial"),
    update=extend_schema(summary="Update Testimonial"),
    partial_update=extend_schema(summary="Partially Update Testimonial"),
    destroy=extend_schema(summary="Delete Testimonial"),
)
class TestimonialViewSet(BaseCmsViewSet):
    queryset = Testimonial.objects.all()
    serializer_class = TestimonialSerializer

@extend_schema_view(
    list=extend_schema(summary="List Contact Messages"),
    create=extend_schema(summary="Create Contact Message"),
    retrieve=extend_schema(summary="Retrieve Contact Message"),
    update=extend_schema(summary="Update Contact Message"),
    partial_update=extend_schema(summary="Partially Update Contact Message"),
    destroy=extend_schema(summary="Delete Contact Message"),
)
class ContactMessageViewSet(BaseCmsViewSet):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer

    def get_permissions(self):
        if self.action == 'create':
            return []
        return super().get_permissions()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            instance = serializer.save()
            try:
                from django.core.mail import send_mail
                from django.conf import settings
                send_mail(
                    subject=f"New Contact Inquiry: {instance.subject}",
                    message=f"Name: {instance.name}\nEmail: {instance.email}\nPhone: {instance.phone}\n\nMessage:\n{instance.message}",
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[settings.DEFAULT_FROM_EMAIL],
                    fail_silently=True,
                )
            except Exception as e:
                print(f"Failed to send email notification: {e}")
            
            return format_api_response(
                data=serializer.data,
                message="Message sent successfully"
            )
        return format_api_response(
            success=False,
            message="Invalid data",
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )

    @action(detail=False, methods=['delete'], url_path='clear-all')
    def clear_all(self, request):
        self.get_queryset().delete()
        return format_api_response(message="All messages cleared successfully")

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        old_reply = instance.reply
        
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            from apps.cms.services.cms_service import CmsService
            updated_instance = CmsService.update_instance(instance, serializer.validated_data)
            
            if updated_instance.reply and old_reply != updated_instance.reply and updated_instance.status == 'replied':
                try:
                    from django.core.mail import send_mail
                    from django.conf import settings
                    send_mail(
                        subject=f"Re: {updated_instance.subject}",
                        message=f"Dear {updated_instance.name},\n\nThank you for reaching out.\n\nYour message:\n{updated_instance.message}\n\nOur Reply:\n{updated_instance.reply}\n\nBest regards,\nTawakkal Team",
                        from_email=settings.DEFAULT_FROM_EMAIL,
                        recipient_list=[updated_instance.email],
                        fail_silently=False,
                    )
                except Exception as e:
                    print(f"Failed to send reply email: {e}")
                    return format_api_response(
                        success=False,
                        message=f"Reply saved, but failed to send email. Ensure the recipient email is valid. Error: {str(e)}",
                        status_code=status.HTTP_400_BAD_REQUEST
                    )
                    
            return format_api_response(success=True, data=self.get_serializer(updated_instance).data)
        return format_api_response(success=False, message="Validation Error", errors=serializer.errors, status_code=status.HTTP_400_BAD_REQUEST)
