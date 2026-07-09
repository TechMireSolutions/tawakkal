from rest_framework import permissions

class IsAdminUser(permissions.BasePermission):
    """
    Allows access only to admin users or superusers.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True
        return request.user.groups.filter(name='Admins').exists()

class IsManager(permissions.BasePermission):
    """
    Allows access to Managers or superusers.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True
        return request.user.groups.filter(name='Managers').exists()

class HasModulePermission(permissions.BasePermission):
    """
    Check module permissions by validating if user's groups permit access.
    Superusers are granted access to all modules.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        if request.user.is_superuser:
            return True
            
        allowed_groups = ['Admins', 'Managers', 'Content Editors', 'Support Staff', 'Sales']
        return request.user.groups.filter(name__in=allowed_groups).exists()
