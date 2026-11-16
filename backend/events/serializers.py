from rest_framework import serializers
from .models import Event, EventCategory


class EventCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = EventCategory
        fields = "__all__"
        read_only_fields = ["id", "created_at"]


class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = "__all__"
        read_only_fields = ["id", "organizer", "created_at",
                            "updated_at"]