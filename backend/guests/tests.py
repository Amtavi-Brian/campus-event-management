from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from events.models import Event, EventCategory
from guests.models import Guest

User = get_user_model()


class GuestsApiTests(APITestCase):
    def setUp(self):
        self.organizer_group, _ = Group.objects.get_or_create(name='Organizer')
        self.student_group, _ = Group.objects.get_or_create(name='Student')

        self.organizer = User.objects.create_user(
            username='guest_org',
            email='guest_org@example.com',
            password='Password123!'
        )
        self.organizer.groups.add(self.organizer_group)

        self.category = EventCategory.objects.create(name='Party')
        self.event = Event.objects.create(
            organizer=self.organizer,
            category=self.category,
            title='End of Year Party',
            description='Celebration',
            event_date='2026-12-15',
            event_time='18:00:00',
            location='Student Center'
        )

    def test_create_and_list_guests(self):
        self.client.force_authenticate(user=self.organizer)
        url = reverse('guest-list')
        payload = {
            'event': self.event.id,
            'name': 'David Ochieng',
            'email': 'david@example.com',
            'phone_number': '+254712345678',
            'rsvp_status': 'PENDING',
        }
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'David Ochieng')
        self.assertEqual(response.data['event_title'], 'End of Year Party')

        # Filter by event_id
        list_response = self.client.get(url, {'event_id': self.event.id})
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(list_response.data), 1)

    def test_update_and_delete_guest(self):
        guest = Guest.objects.create(
            event=self.event,
            name='Grace Kelly',
            email='grace@example.com',
            phone_number='+254799887766',
            rsvp_status='PENDING'
        )
        self.client.force_authenticate(user=self.organizer)
        detail_url = reverse('guest-detail', args=[guest.id])

        # Update RSVP status to ACCEPTED
        patch_response = self.client.patch(detail_url, {'rsvp_status': 'ACCEPTED'}, format='json')
        self.assertEqual(patch_response.status_code, status.HTTP_200_OK)
        guest.refresh_from_db()
        self.assertEqual(guest.rsvp_status, 'ACCEPTED')

        # Delete guest
        delete_response = self.client.delete(detail_url)
        self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Guest.objects.filter(id=guest.id).exists())
