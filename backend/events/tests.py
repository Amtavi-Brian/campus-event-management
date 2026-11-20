from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from .models import Event, EventCategory

User = get_user_model()


class EventsApiTests(APITestCase):
    def setUp(self):
        self.organizer_group, _ = Group.objects.get_or_create(name='Organizer')
        self.organizer = User.objects.create_user(
            username='org_user',
            email='org@example.com',
            password='Password123!',
            first_name='Organ',
            last_name='Izer'
        )
        self.organizer.groups.add(self.organizer_group)

        self.category = EventCategory.objects.create(
            name='Workshop',
            description='Hands-on training sessions'
        )

    def test_list_categories(self):
        url = reverse('event-category-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(len(response.data) >= 1)

    def test_create_and_retrieve_event(self):
        self.client.force_authenticate(user=self.organizer)
        url = reverse('event-list')
        payload = {
            'title': 'Python Bootcamp',
            'description': 'Learn Django and DRF',
            'category': self.category.id,
            'event_date': '2026-12-01',
            'event_time': '10:00:00',
            'location': 'Lab 4',
            'maximum_guests': 50,
        }
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'Python Bootcamp')
        self.assertEqual(response.data['category_name'], 'Workshop')
        self.assertEqual(response.data['organizer_name'], 'Organ Izer')

        event_id = response.data['id']
        detail_url = reverse('event-detail', args=[event_id])
        get_response = self.client.get(detail_url)
        self.assertEqual(get_response.status_code, status.HTTP_200_OK)
        self.assertEqual(get_response.data['location'], 'Lab 4')

    def test_delete_event(self):
        event = Event.objects.create(
            organizer=self.organizer,
            category=self.category,
            title='Temp Event',
            description='To be deleted',
            event_date='2026-12-05',
            event_time='14:00:00',
            location='Room 1'
        )
        self.client.force_authenticate(user=self.organizer)
        url = reverse('event-detail', args=[event.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Event.objects.filter(id=event.id).exists())
