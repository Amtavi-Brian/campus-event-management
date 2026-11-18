
from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdminOrOrganizerOwner(BasePermission):
    """
    Admins have full access.
    Organizers can manage only their own events.
    Students and unauthenticated users have read-only access.
    """

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True

        return (
            request.user.is_authenticated
            and (
                request.user.is_staff
                or request.user.groups.filter(name='Organizer').exists()
            )
        )

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True

        if request.user.is_staff:
            return True

        return (
            request.user.groups.filter(name='Organizer').exists()
            and obj.organizer == request.user
        )

