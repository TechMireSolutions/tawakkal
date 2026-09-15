from django.core.management.base import BaseCommand
from apps.media.models import Media
from apps.media.utils import generate_variants

class Command(BaseCommand):
    help = 'Generates image variants for existing Media objects'

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force regeneration even if variants exist in the DB tracker',
        )

    def handle(self, *args, **options):
        media_items = Media.objects.filter(mime_type__startswith='image/').exclude(mime_type__contains='svg')
        
        force = options['force']
        success_count = 0
        error_count = 0
        skipped_count = 0
        
        self.stdout.write(f"Found {media_items.count()} image media items to process.")
        
        for media in media_items:
            try:
                if force:
                    media.variants = {}
                    media.save(update_fields=['variants'])
                
                # Check if it already has 4 variants and not forcing
                if not force and len(media.variants.keys()) == 4:
                    skipped_count += 1
                    continue
                    
                self.stdout.write(f"Processing: {media.original_filename}")
                if generate_variants(media):
                    success_count += 1
                else:
                    skipped_count += 1
                    
            except Exception as e:
                self.stderr.write(self.style.ERROR(f"Error processing {media.original_filename}: {str(e)}"))
                error_count += 1
                
        self.stdout.write(self.style.SUCCESS(f"Successfully processed {success_count} images. Skipped {skipped_count}. Errors: {error_count}"))
