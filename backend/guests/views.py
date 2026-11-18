from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied

from .models import Guest
from .serializers import GuestSerializer
from .permissions import GuestPermission

# Create your views here.

class GuestViewSet(viewsets.ModelViewSet):
    queryset = Guest.objects.select_related(
        "event", "user"
    ).all()

    serializer_class = GuestSerializer
    permission_classes = [IsAuthenticated, GuestPermission]

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user

        if user.is_staff:
            pass

        elif user.groups.filter(name='Organizer').exists():
            queryset = queryset.filter(event__organizer=user)

        elif user.groups.filter(name='Student').exists():
            queryset = queryset.filter(user=user)

        else:
            queryset = queryset.none()

        event_id = self.request.query_params.get("event_id")

        if event_id:
            queryset = queryset.filter(event_id=event_id)

        return queryset

    def perform_create(self, serializer):
        user = self.request.user
        event = serializer.validated_data['event']

        is_organizer = user.groups.filter(
            name='Organizer'
        ).exists()

        is_student = user.groups.filter(
            name='Student'
        ).exists()

        if user.is_staff:
            serializer.save()
            return

        if is_organizer and event.organizer == user:
            serializer.save(user=None)
            return

        if is_student:
            serializer.save(
                user=user,
                name=user.get_full_name() or user.username,
                email=user.email,
                phone_number=user.phone_number or ''
            )
            return
        raise PermissionDenied(
            "You are not allowed to create a guest for this event."
        )
    
    def perform_update(self, serializer):
        user = self.request.user
        updated_fields = set(serializer.validated_data.keys())

        if user.is_staff:
            serializer.save()
            return

        is_student = user.groups.filter(
            name='Student'
        ).exists()

        is_organizer = user.groups.filter(
            name='Organizer'
        ).exists()

        if is_student:
            if not updated_fields.issubset({'rsvp_status'}):
                raise PermissionDenied(
                    "You can only update your RSVP status."
                )

            serializer.save(user=user)
            return

        if is_organizer:
            if updated_fields.intersection({'event', 'user'}):
                raise PermissionDenied(
                    "You cannot transfer a guest to another event or user."
                )

            serializer.save()
            return

        raise PermissionDenied(
            "You are not allowed to update this guest record."
        )
