from django.db import migrations
from django.utils.text import slugify

def seed_default_tags(apps, schema_editor):
    CustomerTag = apps.get_model('customers', 'CustomerTag')
    default_tags = ['VIP', 'Retail', 'Wholesale', 'Returning', 'High Value', 'Blocked']
    
    for tag_name in default_tags:
        slug = slugify(tag_name)
        CustomerTag.objects.get_or_create(
            name=tag_name,
            defaults={'slug': slug}
        )

def remove_default_tags(apps, schema_editor):
    CustomerTag = apps.get_model('customers', 'CustomerTag')
    default_tags = ['VIP', 'Retail', 'Wholesale', 'Returning', 'High Value', 'Blocked']
    CustomerTag.objects.filter(name__in=default_tags).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('customers', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(seed_default_tags, remove_default_tags)
    ]
