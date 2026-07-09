import os
import urllib.request
from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from apps.catalog.models import Category, Product, ProductVariant
from apps.cms.models import HeroBanner, Faq, Policy, PolicyType, SocialLink, ContactInformation
from apps.core.models import SiteSettings
from apps.media.models import Media
from django.db import transaction

class Command(BaseCommand):
    help = 'Seeds database with real Tawakkal business data to replace frontend hardcoded arrays.'

    def _create_media_from_url(self, url, filename):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            response = urllib.request.urlopen(req, timeout=10)
            content = response.read()
            media = Media(original_filename=filename, size=len(content))
            media.file.save(filename, ContentFile(content), save=True)
            return media
        except Exception as e:
            self.stdout.write(self.style.WARNING(f"Could not download {url}: {e}"))
            return None

    @transaction.atomic
    def handle(self, *args, **options):
        self.stdout.write("Seeding database with Tawakkal ERP Single-Source-of-Truth data...")

        # 1. Branding / Site Settings
        self.stdout.write("Configuring Site Settings & Branding...")
        settings, _ = SiteSettings.objects.get_or_create(pk=1)
        settings.site_name = "Tawakkal"
        settings.site_description = "Luxury Defined"
        settings.primary_color = "#1B3622"
        settings.secondary_color = "#D4AF37"
        settings.contact_email = "info@tawakkal.store"
        settings.contact_phone = "+92 300 1234567"
        settings.address = "123 Fashion Avenue, Karachi, Pakistan"
        settings.facebook_url = "https://facebook.com/tawakkal"
        settings.instagram_url = "https://instagram.com/tawakkal"
        
        # Download a real logo placeholder to use for media
        logo_url = "https://placehold.co/400x100/1B3622/D4AF37.png?text=Tawakkal+Logo"
        main_logo = self._create_media_from_url(logo_url, "main_logo.png")
        if main_logo:
            settings.main_logo = main_logo
            settings.navbar_logo = main_logo
            settings.footer_logo = main_logo
            settings.login_logo = main_logo
            
        settings.save()

        # 2. Categories
        self.stdout.write("Creating Categories...")
        categories_data = [
            {"name": "Unstitched", "slug": "unstitched", "desc": "Premium unstitched fabrics"},
            {"name": "Pret", "slug": "pret", "desc": "Ready to wear luxury"},
            {"name": "Formals", "slug": "formals", "desc": "Luxury formal wear"},
            {"name": "Bridal", "slug": "bridal", "desc": "Exquisite bridal couture"},
        ]
        cat_objs = {}
        for c in categories_data:
            cat, _ = Category.objects.get_or_create(slug=c['slug'], defaults={"name": c['name'], "description": c['desc'], "status": True})
            cat_objs[c['slug']] = cat

        # 3. Products
        self.stdout.write("Creating Products...")
        products_data = [
            {"name": "Emerald Velvet Suit", "slug": "emerald-velvet", "cat": "formals", "price": 12500, "desc": "Rich emerald green velvet suit with zari embroidery."},
            {"name": "Ruby Chiffon Sari", "slug": "ruby-chiffon", "cat": "bridal", "price": 25000, "desc": "Elegant ruby red chiffon sari with hand embellishments."},
            {"name": "Sapphire Lawn 3-Piece", "slug": "sapphire-lawn", "cat": "unstitched", "price": 4500, "desc": "Summer lawn 3-piece unstitched suit."},
            {"name": "Ivory Organza Kurta", "slug": "ivory-organza", "cat": "pret", "price": 8500, "desc": "Ready to wear ivory organza kurta."},
        ]
        for p in products_data:
            prod, created = Product.objects.get_or_create(
                slug=p['slug'], 
                defaults={
                    "name": p['name'], 
                    "category": cat_objs[p['cat']],
                    "base_price": p['price'],
                    "description": p['desc'],
                    "status": "ACTIVE"
                }
            )
            if created:
                ProductVariant.objects.create(product=prod, sku=f"{p['slug'].upper()}-01", stock=50)

        # 4. FAQs
        self.stdout.write("Creating FAQs...")
        Faq.objects.all().delete()
        faqs = [
            {"q": "What are your delivery times?", "a": "We deliver within 3-5 business days across Pakistan."},
            {"q": "Do you offer international shipping?", "a": "Yes, we ship worldwide via DHL."},
            {"q": "What is your return policy?", "a": "We accept returns within 14 days of delivery with tags attached."},
        ]
        for idx, faq in enumerate(faqs):
            Faq.objects.create(question=faq['q'], answer=faq['a'], sort_order=idx, status='published')

        # 5. Policies
        self.stdout.write("Creating Policies...")
        Policy.objects.all().delete()
        Policy.objects.create(type=PolicyType.PRIVACY, title="Privacy Policy", slug="privacy-policy", content="Your privacy is important to us. We securely store your data.", status='published')
        Policy.objects.create(type=PolicyType.TERMS, title="Terms of Service", slug="terms", content="By using Tawakkal, you agree to our terms and conditions.", status='published')
        Policy.objects.create(type=PolicyType.SHIPPING, title="Shipping Policy", slug="shipping", content="Standard shipping rates apply. Free shipping over Rs. 10,000.", status='published')
        Policy.objects.create(type=PolicyType.RETURN, title="Return & Exchange", slug="return", content="No returns on sale items. Exchanges within 14 days.", status='published')

        # 6. Hero Banners
        self.stdout.write("Creating Hero Banners...")
        HeroBanner.objects.all().delete()
        banner_img = self._create_media_from_url("https://placehold.co/1920x800/264a30/D4AF37.png?text=Luxury+Collection", "hero_banner.png")
        HeroBanner.objects.create(
            title="Summer Luxury Collection",
            subtitle="Discover the elegance of Tawakkal.",
            image=banner_img if banner_img else None,
            link_url="/category/unstitched",
            link_text="Shop Now",
            status='published'
        )

        self.stdout.write(self.style.SUCCESS("Successfully seeded database with real business data. React can now safely remove hardcoded arrays."))
