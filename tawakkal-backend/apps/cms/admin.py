from django.contrib import admin
from .models import *

@admin.register(BlogCategory)
class BlogCategoryAdmin(admin.ModelAdmin):
    list_display = tuple(['id', 'slug', 'seo_title', 'seo_description', 'meta_keywords', 'canonical_url', 'created_at', 'is_deleted'])
    search_fields = tuple(['slug', 'seo_title', 'meta_keywords', 'canonical_url'])
    list_filter = tuple(['is_deleted', 'is_active'])
    readonly_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_at')

@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = tuple(['id', 'slug', 'seo_title', 'seo_description', 'meta_keywords', 'canonical_url', 'created_at', 'is_deleted'])
    search_fields = tuple(['slug', 'seo_title', 'meta_keywords', 'canonical_url'])
    list_filter = tuple(['is_deleted', 'is_active'])
    readonly_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_at')

@admin.register(Author)
class AuthorAdmin(admin.ModelAdmin):
    list_display = tuple(['id', 'status', 'publish_at', 'is_active', 'sort_order', 'name', 'created_at', 'is_deleted'])
    search_fields = tuple(['status', 'name'])
    list_filter = tuple(['is_deleted', 'is_active', 'avatar__id'])
    readonly_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_at')

@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = tuple(['id', 'slug', 'seo_title', 'seo_description', 'meta_keywords', 'canonical_url', 'created_at', 'is_deleted'])
    search_fields = tuple(['slug', 'seo_title', 'meta_keywords', 'canonical_url'])
    list_filter = tuple(['is_deleted', 'is_active', 'featured_image__id', 'category__id'])
    readonly_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_at')

@admin.register(Page)
class PageAdmin(admin.ModelAdmin):
    list_display = tuple(['id', 'slug', 'seo_title', 'seo_description', 'meta_keywords', 'canonical_url', 'created_at', 'is_deleted'])
    search_fields = tuple(['slug', 'seo_title', 'meta_keywords', 'canonical_url'])
    list_filter = tuple(['is_deleted', 'is_active', 'featured_image__id'])
    readonly_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_at')

@admin.register(Policy)
class PolicyAdmin(admin.ModelAdmin):
    list_display = tuple(['id', 'slug', 'seo_title', 'seo_description', 'meta_keywords', 'canonical_url', 'created_at', 'is_deleted'])
    search_fields = tuple(['slug', 'seo_title', 'meta_keywords', 'canonical_url'])
    list_filter = tuple(['is_deleted', 'is_active'])
    readonly_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_at')

@admin.register(HeroBanner)
class HeroBannerAdmin(admin.ModelAdmin):
    list_display = tuple(['id', 'status', 'publish_at', 'is_active', 'sort_order', 'title', 'created_at', 'is_deleted'])
    search_fields = tuple(['status', 'title', 'subtitle', 'link_url'])
    list_filter = tuple(['is_deleted', 'is_active', 'image__id'])
    readonly_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_at')

@admin.register(Announcement)
class AnnouncementAdmin(admin.ModelAdmin):
    list_display = tuple(['id', 'status', 'publish_at', 'is_active', 'sort_order', 'text', 'created_at', 'is_deleted'])
    search_fields = tuple(['status', 'link_url'])
    list_filter = tuple(['is_deleted', 'is_active'])
    readonly_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_at')

@admin.register(StaticBlock)
class StaticBlockAdmin(admin.ModelAdmin):
    list_display = tuple(['id', 'status', 'publish_at', 'is_active', 'sort_order', 'identifier', 'created_at', 'is_deleted'])
    search_fields = tuple(['status', 'identifier', 'title'])
    list_filter = tuple(['is_deleted', 'is_active'])
    readonly_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_at')

@admin.register(HomepageSection)
class HomepageSectionAdmin(admin.ModelAdmin):
    list_display = tuple(['id', 'status', 'publish_at', 'is_active', 'sort_order', 'title', 'created_at', 'is_deleted'])
    search_fields = tuple(['status', 'title', 'type'])
    list_filter = tuple(['is_deleted', 'is_active'])
    readonly_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_at')

@admin.register(Faq)
class FaqAdmin(admin.ModelAdmin):
    list_display = tuple(['id', 'status', 'publish_at', 'is_active', 'sort_order', 'question', 'created_at', 'is_deleted'])
    search_fields = tuple(['status', 'question', 'category'])
    list_filter = tuple(['is_deleted', 'is_active'])
    readonly_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_at')

@admin.register(ContactInformation)
class ContactInformationAdmin(admin.ModelAdmin):
    list_display = tuple(['id', 'status', 'publish_at', 'is_active', 'sort_order', 'email', 'created_at', 'is_deleted'])
    search_fields = tuple(['status', 'email', 'phone'])
    list_filter = tuple(['is_deleted', 'is_active', 'is_primary'])
    readonly_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_at')

@admin.register(SocialLink)
class SocialLinkAdmin(admin.ModelAdmin):
    list_display = tuple(['id', 'status', 'publish_at', 'is_active', 'sort_order', 'platform', 'created_at', 'is_deleted'])
    search_fields = tuple(['status', 'platform', 'url'])
    list_filter = tuple(['is_deleted', 'is_active', 'icon__id'])
    readonly_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_at')

@admin.register(NavigationMenu)
class NavigationMenuAdmin(admin.ModelAdmin):
    list_display = tuple(['id', 'status', 'publish_at', 'is_active', 'sort_order', 'name', 'created_at', 'is_deleted'])
    search_fields = tuple(['status', 'name', 'location'])
    list_filter = tuple(['is_deleted', 'is_active'])
    readonly_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_at')

@admin.register(FooterContent)
class FooterContentAdmin(admin.ModelAdmin):
    list_display = tuple(['id', 'status', 'publish_at', 'is_active', 'sort_order', 'column_name', 'created_at', 'is_deleted'])
    search_fields = tuple(['status', 'column_name'])
    list_filter = tuple(['is_deleted', 'is_active'])
    readonly_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_at')

@admin.register(Testimonial)
class TestimonialAdmin(admin.ModelAdmin):
    list_display = ('name', 'role', 'rating', 'status', 'is_active')
    list_filter = ('status', 'rating', 'is_active')
    search_fields = ('name', 'text')
