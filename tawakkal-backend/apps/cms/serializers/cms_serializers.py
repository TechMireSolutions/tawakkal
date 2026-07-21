from rest_framework import serializers
from ..models import (
    BlogCategory, Tag, Author, BlogPost, Page, Policy, HeroBanner, Announcement,
    StaticBlock, HomepageSection, Faq, ContactInformation, SocialLink,
    NavigationMenu, FooterContent, PublishStatus, Testimonial, ContactMessage
)

CMS_READ_ONLY = ['id', 'created_at', 'updated_at', 'created_by', 'updated_by', 'is_deleted', 'deleted_at']

class CmsBaseSerializer(serializers.ModelSerializer):
    pass

class BlogCategorySerializer(CmsBaseSerializer):
    class Meta:
        model = BlogCategory
        fields = '__all__'
        read_only_fields = CMS_READ_ONLY

class TagSerializer(CmsBaseSerializer):
    class Meta:
        model = Tag
        fields = '__all__'
        read_only_fields = CMS_READ_ONLY

class AuthorSerializer(CmsBaseSerializer):
    class Meta:
        model = Author
        fields = '__all__'
        read_only_fields = CMS_READ_ONLY

class BlogPostSerializer(CmsBaseSerializer):
    class Meta:
        model = BlogPost
        fields = '__all__'
        read_only_fields = CMS_READ_ONLY

    def to_representation(self, instance):
        repr = super().to_representation(instance)
        if instance.category:
            repr['category_name'] = instance.category.name
        if instance.featured_image and instance.featured_image.file:
            request = self.context.get('request')
            url = instance.featured_image.file.url
            if request:
                url = request.build_absolute_uri(url)
            repr['featured_image_url'] = url
        return repr

class PageSerializer(CmsBaseSerializer):
    class Meta:
        model = Page
        fields = '__all__'
        read_only_fields = CMS_READ_ONLY

class PolicySerializer(CmsBaseSerializer):
    class Meta:
        model = Policy
        fields = '__all__'
        read_only_fields = CMS_READ_ONLY

class HeroBannerSerializer(CmsBaseSerializer):
    class Meta:
        model = HeroBanner
        fields = '__all__'
        read_only_fields = CMS_READ_ONLY

class AnnouncementSerializer(CmsBaseSerializer):
    class Meta:
        model = Announcement
        fields = '__all__'
        read_only_fields = CMS_READ_ONLY

class StaticBlockSerializer(CmsBaseSerializer):
    class Meta:
        model = StaticBlock
        fields = '__all__'
        read_only_fields = CMS_READ_ONLY

class HomepageSectionSerializer(CmsBaseSerializer):
    class Meta:
        model = HomepageSection
        fields = '__all__'
        read_only_fields = CMS_READ_ONLY

class FaqSerializer(CmsBaseSerializer):
    class Meta:
        model = Faq
        fields = '__all__'
        read_only_fields = CMS_READ_ONLY

class ContactInformationSerializer(CmsBaseSerializer):
    class Meta:
        model = ContactInformation
        fields = '__all__'
        read_only_fields = CMS_READ_ONLY

class SocialLinkSerializer(CmsBaseSerializer):
    class Meta:
        model = SocialLink
        fields = '__all__'
        read_only_fields = CMS_READ_ONLY

class NavigationMenuSerializer(CmsBaseSerializer):
    class Meta:
        model = NavigationMenu
        fields = '__all__'
        read_only_fields = CMS_READ_ONLY

class FooterContentSerializer(CmsBaseSerializer):
    class Meta:
        model = FooterContent
        fields = '__all__'
        read_only_fields = CMS_READ_ONLY

class TestimonialSerializer(CmsBaseSerializer):
    class Meta:
        model = Testimonial
        fields = '__all__'
        read_only_fields = CMS_READ_ONLY

class ContactMessageSerializer(CmsBaseSerializer):
    class Meta:
        model = ContactMessage
        fields = '__all__'
        read_only_fields = CMS_READ_ONLY
