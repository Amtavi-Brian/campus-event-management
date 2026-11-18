from django.db import models
from django.conf import settings
class Guest(models.Model):
    class RSVPStatus(models.TextChoices):
        ACCEPTED = 'ACCEPTED', 'Accepted'
        PENDING = 'PENDING', 'Pending'
        not_going = 'NOT_GOING', 'Not Going'

    event = models.ForeignKey(
        'events.Event',
        on_delete=models.CASCADE,
        related_name='guests'
    )

    user = models.ForeignKey(
    settings.AUTH_USER_MODEL,
    on_delete=models.SET_NULL,
    null=True,
    blank=True,
    related_name='event_rsvps'
)

    name = models.CharField(max_length=200)
    email = models.EmailField()

    phone_number = models.CharField(max_length=20)
    rsvp_status = models.CharField(
        max_length=15,
        choices=RSVPStatus.choices,
        default=RSVPStatus.PENDING
    )

    created_at = models.DateTimeField(auto_now_add=True)
    update_at = models.DateTimeField(auto_now=True)
    

    def __str__(self):
        return f"{self.name} - {self.event.title}"