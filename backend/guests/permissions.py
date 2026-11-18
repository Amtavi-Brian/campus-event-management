
from rest_framework.permissions import BasePermission, SAFE_METHODS


class GuestPermission(BasePermission):
    """
    Admins manage all guest records.
    Organizers manage guests for their own events.
    Students manage their own RSVPs.
    """

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True

        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.user.is_staff:
            return True

        is_organizer = request.user.groups.filter(
            name='Organizer'
        ).exists()

        is_student = request.user.groups.filter(
            name='Student'
        ).exists()

        if is_organizer:
            return obj.event.organizer == request.user

        if is_student:
            return obj.user == request.user

        return False
