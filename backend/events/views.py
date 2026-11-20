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
    ).all().order_by("-event_date", "-id")

    serializer_class = EventSerializer
    permission_classes = [IsAdminOrOrganizerOwner]

    def get_queryset(self):
        queryset = super().get_queryset()

        category = self.request.query_params.get("category")
        status = self.request.query_params.get("status")
        organizer = self.request.query_params.get("organizer")

        if category:
            queryset = queryset.filter(category_id=category)
        if status:
            queryset = queryset.filter(status=status)
        if organizer:
            queryset = queryset.filter(organizer_id=organizer)

        return queryset

    def perform_create(self, serializer):
        serializer.save(organizer=self.request.user)