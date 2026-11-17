from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from .models import Task
from .serializers import TaskSerializer
# Create your views here.

class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.select_related(
        "event",
        "assigned_to"
    ).all()

    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = super().get_queryset()

        event_id = self.request.query_params.get("event_id")

        assigned_to = self.request.query_params.get("assigned_to")

        status = self.request.query_params.get("status")
        
        if event_id:
            queryset = queryset.filter(event_id=event_id)
        if assigned_to:
            queryset = queryset.filter(assigned_to=assigned_to)
        
        if status:
            queryset = queryset.filter(status=status)
        return queryset
