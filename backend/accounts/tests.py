from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()


class AccountsApiTests(APITestCase):
    def setUp(self):
        Group.objects.get_or_create(name='Student')
        Group.objects.get_or_create(name='Organizer')

    def test_user_registration_with_full_name(self):
        url = reverse('register')
        data = {
            'fullName': 'Alice Smith',
            'email': 'alice@example.com',
            'password': 'StrongPassword123!',
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email='alice@example.com').exists())
        user = User.objects.get(email='alice@example.com')
        self.assertEqual(user.first_name, 'Alice')
        self.assertEqual(user.last_name, 'Smith')
        self.assertTrue(user.groups.filter(name='Student').exists())

    def test_login_and_token_obtain(self):
        user = User.objects.create_user(
            username='bob',
            email='bob@example.com',
            password='SecretPassword123!',
            first_name='Bob',
            last_name='Jones'
        )
        url = reverse('token_obtain_pair')
        response = self.client.post(url, {
            'email': 'bob@example.com',
            'password': 'SecretPassword123!'
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['user']['email'], 'bob@example.com')

    def test_profile_retrieve_and_json_update(self):
        user = User.objects.create_user(
            username='carol',
            email='carol@example.com',
            password='SecretPassword123!',
            first_name='Carol',
            last_name='Danvers'
        )
        self.client.force_authenticate(user=user)
        url = reverse('profile')

        # GET profile
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'carol')
        self.assertIn('role', response.data)

        # PATCH profile with JSON
        response = self.client.patch(url, {'phone_number': '+254700112233'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        user.refresh_from_db()
        self.assertEqual(user.phone_number, '+254700112233')
