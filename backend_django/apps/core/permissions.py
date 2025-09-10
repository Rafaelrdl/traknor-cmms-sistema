from rest_framework import permissions


class RoleBasedPermission(permissions.BasePermission):
    """
    Custom permission to check user roles.
    """
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # Allow access based on user role
        if request.user.role == 'ADMIN':
            return True
        elif request.user.role == 'TECHNICIAN':
            # Technicians can view most things and edit work orders
            if request.method in permissions.SAFE_METHODS:
                return True
            elif view.basename in ['workorder', 'workorders']:
                return True
        elif request.user.role == 'OPERATOR':
            # Operators can view and create some things
            if request.method in permissions.SAFE_METHODS:
                return True
            elif request.method == 'POST' and view.basename in ['workorder', 'solicitation']:
                return True
        elif request.user.role == 'REQUESTER':
            # Requesters can mainly view and create solicitations
            if request.method in permissions.SAFE_METHODS:
                return True
            elif request.method == 'POST' and view.basename == 'solicitation':
                return True
        
        return False