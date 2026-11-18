from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from .models import Event, EventCategory
from .serializers import EventSerializer, EventCategorySerializer
from .permissions import IsAdminOrOrganizerOwner, IsAdminOrReadOnly
class EventCategoryViewSet(viewsets.ModelViewSet):
    queryset = EventCategory.objects.all()
    serializer_class = EventCategorySerializer
    permission_classes = [IsAdminOrReadOnly]


class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.select_related(
        "category", "organizer"
    ).all()

    serializer_class = EventSerializer
    permission_classes = [IsAdminOrOrganizerOwner]

    def perform_create(self, serializer):
        serializer.save(organizer=self.request.user)