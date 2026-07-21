import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.catalog.models import Category

def get_lvl(c):
    return 0 if not c.parent else get_lvl(c.parent) + 1

cats = list(Category.objects.all())
for c in cats:
    c.level = get_lvl(c)
    c.save()
