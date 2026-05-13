from rest_framework import permissions

class IsOwner(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to access or edit it.
    """
    def has_object_permission(self, request, view, obj):
        # This checks if the 'user' field on the data (like a product) 
        # matches the person currently logged in.
        return obj.user == request.user