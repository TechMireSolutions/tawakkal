from apps.stores.models import Store, StoreStatus, StoreTimeline, StoreStaff

class StoreService:
    @classmethod
    def activate_store(cls, store, user):
        store.status = StoreStatus.ACTIVE
        store.is_active = True
        store.save()
        StoreTimeline.objects.create(
            store=store,
            action="Activated Store",
            performed_by=user
        )
        return store

    @classmethod
    def deactivate_store(cls, store, user):
        store.status = StoreStatus.INACTIVE
        store.is_active = False
        store.save()
        StoreTimeline.objects.create(
            store=store,
            action="Deactivated Store",
            performed_by=user
        )
        return store

    @classmethod
    def assign_manager(cls, store, manager, user):
        store.manager = manager
        store.save()
        StoreTimeline.objects.create(
            store=store,
            action=f"Assigned Manager: {manager.email}",
            performed_by=user
        )
        return store

    @classmethod
    def assign_staff(cls, store, staff_user, role, assigned_by):
        staff, created = StoreStaff.objects.update_or_create(
            store=store,
            user=staff_user,
            defaults={'role': role, 'is_active': True}
        )
        action = "Assigned Staff" if created else "Updated Staff Role"
        StoreTimeline.objects.create(
            store=store,
            action=f"{action}: {staff_user.email} as {role}",
            performed_by=assigned_by
        )
        return staff
