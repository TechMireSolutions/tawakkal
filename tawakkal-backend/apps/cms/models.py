from django.db import models
from django.utils import timezone
from apps.core.models import BaseModel
from apps.media.models import Media

class PublishStatus(models.TextChoices):
    DRAFT = 'draft', 'Draft'
    PUBLISHED = 'published', 'Published'
    ARCHIVED = 'archived', 'Archived'

class SEOBaseModel(models.Model):
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    seo_title = models.CharField(max_length=255, blank=True)
    seo_description = models.TextField(blank=True)
    meta_keywords = models.CharField(max_length=255, blank=True)
    canonical_url = models.URLField(blank=True)
    
    class Meta:
        abstract = True

class PublishableBaseModel(BaseModel):
    status = models.CharField(max_length=20, choices=PublishStatus.choices, default=PublishStatus.DRAFT)
    publish_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    sort_order = models.IntegerField(default=0)
    
    class Meta:
        abstract = True

# ---------------------------------------------------------
# Blog Content
# ---------------------------------------------------------

class BlogCategory(PublishableBaseModel, SEOBaseModel):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)

class Tag(PublishableBaseModel, SEOBaseModel):
    name = models.CharField(max_length=50)

class Author(PublishableBaseModel):
    name = models.CharField(max_length=100)
    bio = models.TextField(blank=True)
    avatar = models.ForeignKey(Media, on_delete=models.SET_NULL, null=True, blank=True)
    social_links = models.JSONField(default=dict, blank=True)

class BlogPost(PublishableBaseModel, SEOBaseModel):
    title = models.CharField(max_length=255)
    excerpt = models.TextField(blank=True)
    content = models.TextField()
    featured_image = models.ForeignKey(Media, on_delete=models.SET_NULL, null=True, blank=True)
    category = models.ForeignKey(BlogCategory, on_delete=models.SET_NULL, null=True, related_name='posts')
    tags = models.ManyToManyField(Tag, blank=True, related_name='posts')
    author = models.ForeignKey(Author, on_delete=models.SET_NULL, null=True, related_name='posts')
    views = models.PositiveIntegerField(default=0)

# ---------------------------------------------------------
# Structural Content
# ---------------------------------------------------------

class Page(PublishableBaseModel, SEOBaseModel):
    title = models.CharField(max_length=255)
    content = models.TextField(blank=True)
    template = models.CharField(max_length=50, default='default')
    featured_image = models.ForeignKey(Media, on_delete=models.SET_NULL, null=True, blank=True)

class PolicyType(models.TextChoices):
    PRIVACY = 'privacy', 'Privacy Policy'
    TERMS = 'terms', 'Terms & Conditions'
    SHIPPING = 'shipping', 'Shipping Policy'
    RETURN = 'return', 'Return Policy'
    COOKIE = 'cookie', 'Cookie Policy'

class Policy(PublishableBaseModel, SEOBaseModel):
    type = models.CharField(max_length=20, choices=PolicyType.choices, unique=True)
    title = models.CharField(max_length=255)
    content = models.TextField()

# ---------------------------------------------------------
# UI Elements
# ---------------------------------------------------------

class HeroBanner(PublishableBaseModel):
    title = models.CharField(max_length=255, blank=True)
    subtitle = models.CharField(max_length=255, blank=True)
    image = models.ForeignKey(Media, on_delete=models.SET_NULL, null=True, blank=True)
    link_url = models.CharField(max_length=255, blank=True)
    link_text = models.CharField(max_length=100, blank=True)
    placement = models.CharField(max_length=50, default='homepage')

class Announcement(PublishableBaseModel):
    text = models.TextField()
    link_url = models.CharField(max_length=255, blank=True)
    start_date = models.DateTimeField(null=True, blank=True)
    end_date = models.DateTimeField(null=True, blank=True)

class StaticBlock(PublishableBaseModel):
    identifier = models.CharField(max_length=100, unique=True)
    title = models.CharField(max_length=255, blank=True)
    content = models.TextField()

class HomepageSection(PublishableBaseModel):
    title = models.CharField(max_length=255)
    type = models.CharField(max_length=50) # e.g., 'featured_products', 'categories', 'custom'
    content = models.JSONField(default=dict, blank=True)

# ---------------------------------------------------------
# Information
# ---------------------------------------------------------

class Faq(PublishableBaseModel):
    question = models.CharField(max_length=255)
    answer = models.TextField()
    category = models.CharField(max_length=100, blank=True)

class ContactInformation(PublishableBaseModel):
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=50, blank=True)
    address = models.TextField(blank=True)
    business_hours = models.TextField(blank=True)
    is_primary = models.BooleanField(default=False)

class SocialLink(PublishableBaseModel):
    platform = models.CharField(max_length=50) # e.g., 'facebook', 'twitter'
    url = models.URLField()
    icon = models.ForeignKey(Media, on_delete=models.SET_NULL, null=True, blank=True)

# ---------------------------------------------------------
# Navigation
# ---------------------------------------------------------

class NavigationMenu(PublishableBaseModel):
    name = models.CharField(max_length=100)
    location = models.CharField(max_length=50, unique=True) # e.g., 'header_main'
    items = models.JSONField(default=list, blank=True) # hierarchical menu items

class FooterContent(PublishableBaseModel):
    column_name = models.CharField(max_length=100)
    items = models.JSONField(default=list, blank=True)

class Testimonial(PublishableBaseModel):
    name = models.CharField(max_length=100)
    role = models.CharField(max_length=100, blank=True)
    text = models.TextField()
    initials = models.CharField(max_length=5, blank=True)
    rating = models.IntegerField(default=5)

    def __str__(self):
        return f"{self.name} - {self.rating} Stars"
