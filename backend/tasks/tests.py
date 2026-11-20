from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from events.models import Event, EventCategory
from tasks.models import Task

User = get_user_model()


class TasksApiTests(APITestCase):
    def setUp(self):
        self.organizer_group, _ = Group.objects.get_or_create(name='Organizer')
        self.organizer = User.objects.create_user(
            username='task_org',
            email='task_org@example.com',
            password='Password123!'
        )
        self.organizer.groups.add(self.organizer_group)

        self.category = EventCategory.objects.create(name='Meeting')
        self.event = Event.objects.create(
            organizer=self.organizer,
            category=self.category,
            title='Staff Meeting',
            description='Weekly sync',
            event_date='2026-11-25',
            event_time='09:00:00',
            location='Boardroom'
        )

    def test_create_and_list_tasks(self):
        self.client.force_authenticate(user=self.organizer)
        url = reverse('task-list')
        payload = {
            'event': self.event.id,
            'title': 'Prepare Slides',
            'description': 'Gather metrics',
            'deadline': '2026-11-24',
            'priority': 'HIGH',
            'status': 'PENDING',
        }
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'Prepare Slides')
        self.assertEqual(response.data['event_title'], 'Staff Meeting')

        # Filter by event_id
        list_response = self.client.get(url, {'event_id': self.event.id})
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(list_response.data), 1)

    def test_update_and_delete_task(self):
        task = Task.objects.create(
            event=self.event,
            title='Buy snacks',
            deadline='2026-11-24',
            status='PENDING'
        )
        self.client.force_authenticate(user=self.organizer)
        detail_url = reverse('task-detail', args=[task.id])

        # Toggle to COMPLETED
        patch_response = self.client.patch(detail_url, {'status': 'COMPLETED'}, format='json')
        self.assertEqual(patch_response.status_code, status.HTTP_200_OK)
        task.refresh_from_db()
        self.assertEqual(task.status, 'COMPLETED')

        # Delete task
        delete_response = self.client.delete(detail_url)
        self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Task.objects.filter(id=task.id).exists())
