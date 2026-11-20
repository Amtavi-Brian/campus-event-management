from rest_framework import serializers
from .models import Event, EventCategory


class EventCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = EventCategory
        fields = "__all__"
        read_only_fields = ["id", "created_at"]


class EventSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    organizer_name = serializers.SerializerMethodField(read_only=True)
    tasks_count = serializers.IntegerField(source="tasks.count", read_only=True)
    pending_tasks_count = serializers.SerializerMethodField(read_only=True)
    guests_count = serializers.IntegerField(source="guests.count", read_only=True)

    class Meta:
        model = Event
        fields = "__all__"
        read_only_fields = ["id", "organizer", "created_at", "updated_at"]

    def get_organizer_name(self, obj):
        full_name = obj.organizer.get_full_name()
        return full_name if full_name else obj.organizer.username

    def get_pending_tasks_count(self, obj):
        return obj.tasks.filter(status__in=["PENDING", "IN_PROGRESS"]).count()