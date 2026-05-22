from rest_framework import permissions

class IsOwner(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to access or edit it.
    """
    def has_object_permission(self, request, view, obj):
        # This checks if the 'user' field on the data (like a product) 
        # matches the person currently logged in.
        return obj.user == request.user

class IsAdminOrStaff(permissions.BasePermission):
    """
    Custom permission to only allow administrators or staff to perform mutating actions.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            (request.user.is_admin or request.user.is_staff)
        )

class IsAdminOrStaffOrReadOnly(permissions.BasePermission):
    """
    Custom permission to allow read-only access to all authenticated operators,
    but restrict writes (create, update, delete) to admins or staff members.
    """
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user.is_admin or request.user.is_staff)