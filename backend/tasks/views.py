from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from .models import Task
from .serializers import TaskSerializer
from .permissions import IsAdminOrEventOrganizer
# Create your views here.


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.select_related(
        "event", "assigned_to"
    ).all()

    serializer_class = TaskSerializer
    permission_classes = [IsAdminOrEventOrganizer]

    def get_queryset(self):
        queryset = super().get_queryset()

        event_id = self.request.query_params.get("event_id")
        assigned_to = self.request.query_params.get("assigned_to")
        status = self.request.query_params.get("status")

        if event_id:
            queryset = queryset.filter(event_id=event_id)

        if assigned_to:
            queryset = queryset.filter(assigned_to_id=assigned_to)

        if status:
            queryset = queryset.filter(status=status)

        return queryset
    
    def perform_create(self, serializer):
        event = serializer.validated_data['event']

        if (
            not self.request.user.is_staff
            and event.organizer != self.request.user
        ):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied(
                "You can only create tasks for your own events."
            )

        serializer.save()

