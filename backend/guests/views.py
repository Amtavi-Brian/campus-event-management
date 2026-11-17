from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from .models import Guest
from .serializers import GuestSerializer
# Create your views here.

class GuestViewSet(viewsets.ModelViewSet):
    queryset = Guest.objects.select_related("event").all()
    serializer_class = GuestSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


    def get_queryset(self):
        queryset = super().get_queryset()

        event_id = self.request.query_params.get("event_id")
        if event_id:
            queryset = queryset.filter(event_id=event_id)

            return queryset
