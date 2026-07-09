from django.db import migrations

def create_default_groups(apps, schema_editor):
    Group = apps.get_model('auth', 'Group')
    groups = ['Admins', 'Managers', 'Content Editors', 'Support Staff', 'Sales']
    for group_name in groups:
        Group.objects.get_or_create(name=group_name)

def revert_default_groups(apps, schema_editor):
    Group = apps.get_model('auth', 'Group')
    groups = ['Admins', 'Managers', 'Content Editors', 'Support Staff', 'Sales']
    Group.objects.filter(name__in=groups).delete()

class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(create_default_groups, revert_default_groups),
    ]
