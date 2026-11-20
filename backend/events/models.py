from django.db import models
from django.conf import settings


class EventCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Event(models.Model):
    class EventStatus(models.TextChoices):
        PLANNING = 'PLANNING', 'Planning'
        UPCOMING = 'UPCOMING', 'Upcoming'
        ONGOING = 'ONGOING', 'Ongoing'
        COMPLETED = 'COMPLETED', 'Completed'
        CANCELED = 'CANCELED', 'Canceled'

    organizer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='organized_events'
    )

    category = models.ForeignKey(
        EventCategory,
        on_delete=models.PROTECT,
        related_name='events'
    )

    title = models.CharField(max_length=200)
    description = models.TextField()
    event_date = models.DateField()
    event_time = models.TimeField()
    location = models.CharField(max_length=255)
    maximum_guests = models.PositiveIntegerField(blank=True, null=True)
    status = models.CharField(
        max_length=20,
        choices=EventStatus.choices,
        default=EventStatus.PLANNING
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
