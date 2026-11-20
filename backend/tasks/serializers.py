from rest_framework import serializers
from .models import Task


class TaskSerializer(serializers.ModelSerializer):
    event_title = serializers.CharField(source="event.title", read_only=True)
    assigned_to_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Task
        fields = "__all__"
        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]

    def get_assigned_to_name(self, obj):
        if obj.assigned_to:
            full_name = obj.assigned_to.get_full_name()
            return full_name if full_name else obj.assigned_to.username
        return None
