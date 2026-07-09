from django.utils import timezone

class SequenceGeneratorService:
    @classmethod
    def generate(cls, prefix, model_class):
        year = timezone.now().year
        # We assume each model has an `id` that increments, but `count()` might be safer if `id` has gaps,
        # or we just rely on `count() + 1`. In a high-concurrency environment, you might need a dedicated Sequence model.
        # For simplicity here, we'll use count() + 1.
        count = model_class.all_objects.count()
        return f"{prefix}-{year}-{count + 1:06d}"
