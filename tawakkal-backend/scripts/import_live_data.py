import json
import os
import sys
import urllib.parse
import urllib.request
from decimal import Decimal, InvalidOperation

import django
from django.core.files.base import ContentFile
from django.utils.text import slugify

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.catalog.models import Category, Product, ProductImage, ProductStatus, ProductVariant, VariantStatus
from apps.core.models import SiteSettings
from apps.media.models import Media

BASE_URL = 'https://tawakkal.store'
API_BASE = f'{BASE_URL}/backend/api'
BRANDING_FIELDS = [
    'main_logo', 'navbar_logo', 'sticky_navbar_logo', 'preloader_logo',
    'footer_logo', 'login_logo', 'favicon', 'apple_touch_icon',
    'social_sharing_image', 'email_header_logo'
]


def fetch_json(path):
    request = urllib.request.Request(
        f'{API_BASE}{path}',
        headers={'User-Agent': 'Mozilla/5.0 (compatible; TawakkalERPImporter/1.0)'}
    )
    with urllib.request.urlopen(request, timeout=30) as response:
        return json.loads(response.read().decode('utf-8'))


def as_decimal(value, default='0'):
    try:
        return Decimal(str(value or default))
    except (InvalidOperation, TypeError):
        return Decimal(default)


def filename_from_url(url, fallback):
    parsed = urllib.parse.urlparse(url)
    filename = os.path.basename(urllib.parse.unquote(parsed.path))
    return filename or fallback


def download_media(url, alt_text=''):
    if not url:
        return None, 'skipped'

    filename = filename_from_url(url, 'tawakkal-media')
    existing = Media.objects.filter(original_filename=filename, is_deleted=False).first()
    if existing:
        return existing, 'skipped'

    request = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(request, timeout=45) as response:
        content = response.read()
        content_type = response.headers.get_content_type() or 'application/octet-stream'

    media = Media(
        original_filename=filename,
        mime_type=content_type,
        size=len(content),
        alt_text=alt_text[:255] if alt_text else ''
    )
    media.file.save(filename, ContentFile(content), save=True)
    return media, 'created'


def import_settings(summary):
    settings_payload = fetch_json('/site-settings/')
    if not settings_payload:
        return

    live = settings_payload[0]
    settings = SiteSettings.load()
    settings.site_name = live.get('brand_name') or 'Tawakkal'
    settings.site_description = live.get('announcement_text') or 'Luxury Defined'
    settings.contact_email = live.get('contact_email') or ''
    settings.contact_phone = live.get('contact_phone') or ''
    settings.address = live.get('address') or ''
    settings.facebook_url = live.get('facebook_url') or ''
    settings.instagram_url = live.get('instagram_url') or ''

    logo_media, logo_status = download_media(live.get('logo'), 'Tawakkal logo')
    favicon_media, favicon_status = download_media(live.get('favicon'), 'Tawakkal favicon')
    summary['media'][logo_status] += 1
    summary['media'][favicon_status] += 1

    if logo_media:
        for field in ['main_logo', 'navbar_logo', 'footer_logo', 'email_header_logo', 'login_logo', 'social_sharing_image']:
            setattr(settings, field, logo_media)
    if favicon_media:
        settings.favicon = favicon_media
        settings.apple_touch_icon = favicon_media
        settings.sticky_navbar_logo = favicon_media
        settings.preloader_logo = favicon_media

    settings.save()
    summary['settings']['updated'] += 1


def import_categories(live_categories, summary):
    categories_by_live_name = {}
    for index, live in enumerate(live_categories):
        name = live.get('name') or 'Uncategorized'
        slug = slugify(name) or f'category-{live.get("id")}'
        image, image_status = download_media(live.get('image'), f'{name} category')
        summary['media'][image_status] += 1

        category, created = Category.objects.update_or_create(
            slug=slug,
            defaults={
                'name': name,
                'description': '',
                'image': image,
                'status': bool(live.get('is_published', True)),
                'display_order': index,
                'is_featured': True,
                'path': name,
                'level': 0,
            }
        )
        summary['categories']['created' if created else 'updated'] += 1
        categories_by_live_name[name.lower()] = category
    return categories_by_live_name


def import_products(live_products, categories_by_live_name, summary):
    fallback_category, created = Category.objects.get_or_create(
        slug='uncategorized',
        defaults={'name': 'Uncategorized', 'path': 'Uncategorized', 'level': 0}
    )
    if created:
        summary['categories']['created'] += 1

    for live in live_products:
        live_id = live.get('id')
        category_name = live.get('category') or 'Uncategorized'
        category = categories_by_live_name.get(str(category_name).lower(), fallback_category)
        name = live.get('name') or f'Tawakkal Product {live_id}'
        article_no = live.get('article_no') or live_id
        volume_no = live.get('volume_no') or ''
        slug = slugify(f'tawakkal-{live_id}-{volume_no}-{article_no}-{name}')[:255]
        stock = int(live.get('stock') or 0)

        product, created = Product.objects.update_or_create(
            slug=slug,
            defaults={
                'name': name,
                'description': live.get('description') or '',
                'category': category,
                'brand': live.get('badge') or 'Tawakkal',
                'status': ProductStatus.ACTIVE if stock > 0 else ProductStatus.OUT_OF_STOCK,
                'is_featured': True,
                'base_price': as_decimal(live.get('price')),
                'seo_title': name,
                'seo_description': (live.get('description') or '')[:500],
                'seo_keywords': ', '.join(filter(None, [str(category_name), str(live.get('badge') or ''), str(volume_no)]))[:255],
            }
        )
        summary['products']['created' if created else 'updated'] += 1

        ProductVariant.objects.update_or_create(
            sku=f'TWK-LIVE-{live_id}',
            defaults={
                'product': product,
                'status': VariantStatus.ACTIVE if stock > 0 else VariantStatus.COMING_SOON,
                'price_override': as_decimal(live.get('price')),
                'stock': stock,
                'reserved_stock': 0,
            }
        )

        image_urls = []
        if live.get('image'):
            image_urls.append((live.get('image'), True))
        for gallery_item in live.get('gallery') or []:
            gallery_url = gallery_item.get('image') if isinstance(gallery_item, dict) else None
            if gallery_url:
                image_urls.append((gallery_url, False))

        for display_order, (image_url, is_primary) in enumerate(image_urls):
            media, media_status = download_media(image_url, name)
            summary['media'][media_status] += 1
            if not media:
                continue
            ProductImage.objects.update_or_create(
                product=product,
                media=media,
                defaults={
                    'display_order': display_order,
                    'is_primary': is_primary,
                }
            )


def run_import():
    summary = {
        'products': {'created': 0, 'updated': 0, 'skipped': 0},
        'categories': {'created': 0, 'updated': 0, 'skipped': 0},
        'media': {'created': 0, 'updated': 0, 'skipped': 0},
        'settings': {'created': 0, 'updated': 0, 'skipped': 0},
    }

    print('Starting Tawakkal public data import...')
    live_categories = fetch_json('/categories/')
    live_products = fetch_json('/products/')

    import_settings(summary)
    categories_by_live_name = import_categories(live_categories, summary)
    import_products(live_products, categories_by_live_name, summary)

    print('\n--- Import Summary ---')
    for label, counts in summary.items():
        print(f'{label.title()}:')
        for status, count in counts.items():
            print(f'- {status.title()}: {count}')
    print(f'Live products seen: {len(live_products)}')
    print(f'Live categories seen: {len(live_categories)}')
    print('Private/non-public endpoints such as messages were intentionally not imported.')


if __name__ == '__main__':
    run_import()