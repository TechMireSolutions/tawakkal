from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.cms.views.cms_views import (
    BlogCategoryViewSet, TagViewSet, AuthorViewSet, BlogPostViewSet,
    PageViewSet, PolicyViewSet, HeroBannerViewSet, AnnouncementViewSet,
    StaticBlockViewSet, HomepageSectionViewSet, FaqViewSet,
    ContactInformationViewSet, SocialLinkViewSet, NavigationMenuViewSet,
    FooterContentViewSet, TestimonialViewSet
)

router = DefaultRouter()
router.register(r'blog-categories', BlogCategoryViewSet, basename='blog-category')
router.register(r'tags', TagViewSet, basename='tag')
router.register(r'authors', AuthorViewSet, basename='author')
router.register(r'blog-posts', BlogPostViewSet, basename='blog-post')
router.register(r'pages', PageViewSet, basename='page')
router.register(r'policies', PolicyViewSet, basename='policy')
router.register(r'hero-banners', HeroBannerViewSet, basename='hero-banner')
router.register(r'announcements', AnnouncementViewSet, basename='announcement')
router.register(r'static-blocks', StaticBlockViewSet, basename='static-block')
router.register(r'homepage-sections', HomepageSectionViewSet, basename='homepage-section')
router.register(r'faqs', FaqViewSet, basename='faq')
router.register(r'contact-info', ContactInformationViewSet, basename='contact-info')
router.register(r'social-links', SocialLinkViewSet, basename='social-link')
router.register(r'navigation-menus', NavigationMenuViewSet, basename='navigation-menu')
router.register(r'footer-content', FooterContentViewSet, basename='footer-content')
router.register(r'testimonials', TestimonialViewSet, basename='testimonial')

urlpatterns = [
    path('', include(router.urls)),
]
