from rest_framework import serializers
from .models import Guest

class GuestSerializer(serializers.ModelSerializer):
    event_title = serializers.CharField(source="event.title", read_only=True)

    class Meta:
        model = Guest
        fields = "__all__"
        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]