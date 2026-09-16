import os
import io
from PIL import Image
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage

# Pre-defined deterministic breakpoints
# width sizes in pixels
VARIANTS = {
    'thumb': 150,    # Cart, small lists
    'card': 360,     # Product grids, category listings
    'medium': 720,   # Product detail, medium banners
    'large': 1600    # Hero banners, full width
}

def generate_variants(media_instance):
    """
    Generates WebP variants for a given Media instance.
    Idempotent: Skips if variants already exist.
    """
    if not media_instance.file:
        return False

    mime_type = media_instance.mime_type or ''
    if not mime_type.startswith('image/'):
        return False

    # Avoid processing SVGs or already compressed webp (unless we need resizing)
    if 'svg' in mime_type:
        return False

    try:
        # Open original file
        original_file = media_instance.file
        original_file.open('rb')
        img = Image.open(original_file)
        
        # Ensure image is in RGB for WebP conversion
        if img.mode not in ('RGB', 'RGBA'):
            img = img.convert('RGBA')
            
        original_width, original_height = img.size

        variants_dict = media_instance.variants or {}
        has_changes = False
        
        base_path, original_ext = os.path.splitext(media_instance.file.name)

        for variant_name, target_width in VARIANTS.items():
            # Skip if variant already exists and is tracked
            if variant_name in variants_dict:
                if default_storage.exists(variants_dict[variant_name]):
                    continue

            # Don't upscale
            if original_width < target_width and variant_name != 'thumb':
                # Just use original if it's smaller than target (no point in upscaling)
                # We can store the original path as the variant path
                variants_dict[variant_name] = media_instance.file.name
                has_changes = True
                continue
                
            # Calculate new dimensions preserving aspect ratio
            ratio = target_width / float(original_width)
            target_height = int((float(original_height) * float(ratio)))

            # Resize
            resized_img = img.resize((target_width, target_height), Image.Resampling.LANCZOS)
            
            # Save to memory buffer as WebP
            buffer = io.BytesIO()
            resized_img.save(buffer, format='WEBP', quality=80, method=6)
            buffer.seek(0)
            
            # Construct deterministic variant filename
            variant_filename = f"{base_path}_{variant_name}.webp"
            
            # Save to storage (overwrites if somehow exists but untracked)
            if default_storage.exists(variant_filename):
                default_storage.delete(variant_filename)
                
            saved_path = default_storage.save(variant_filename, ContentFile(buffer.read()))
            
            variants_dict[variant_name] = saved_path
            has_changes = True

        original_file.close()

        if has_changes:
            media_instance.variants = variants_dict
            media_instance.width = original_width
            media_instance.height = original_height
            # Save without triggering signals recursively
            media_instance.save(update_fields=['variants', 'width', 'height'])
            
        return True

    except Exception as e:
        print(f"Error generating variants for media {media_instance.id}: {e}")
        return False
