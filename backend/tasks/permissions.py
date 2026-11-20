
from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdminOrEventOrganizer(BasePermission):
    """
    Admins can manage all tasks.
    Organizers can manage tasks belonging to their events.
    Other users have read-only access.
    """

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True

        return (
            request.user.is_authenticated
            and (
                request.user.is_staff
                or request.user.groups.filter(name='Organizer').exists()
                or request.user.organized_events.exists()
            )
        )

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True

        if request.user.is_staff:
            return True

        return (
            obj.event.organizer == request.user
            or obj.assigned_to == request.user
        )
