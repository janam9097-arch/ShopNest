from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse

User = get_user_model()

class AuthAPITests(APITestCase):
    """Auth API unit tests for register, login, and profile fetching."""

    def setUp(self):
        self.register_url = reverse('auth_register')
        self.login_url = reverse('auth_login')
        self.profile_url = reverse('user_profile')
        
        self.user_data = {
            'email': 'tester@shopnest.com',
            'first_name': 'Test',
            'last_name': 'User',
            'password': 'TestPassword123',
            'password2': 'TestPassword123'
        }

    def test_user_registration(self):
        """Test user can register via API."""
        response = self.client.post(self.register_url, self.user_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['data']['user']['email'], self.user_data['email'])

    def test_user_login(self):
        """Test registered user can log in and retrieve tokens."""
        # First register
        self.client.post(self.register_url, self.user_data)
        
        # Then login
        login_data = {
            'email': self.user_data['email'],
            'password': self.user_data['password']
        }
        response = self.client.post(self.login_url, login_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertIn('access', response.data['data'])
        self.assertIn('refresh', response.data['data'])

    def test_profile_fetching(self):
        """Test authenticated user can fetch profile details."""
        # First register
        self.client.post(self.register_url, self.user_data)
        
        # Then login
        login_data = {
            'email': self.user_data['email'],
            'password': self.user_data['password']
        }
        login_res = self.client.post(self.login_url, login_data)
        token = login_res.data['data']['access']
        
        # Fetch profile
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['data']['email'], self.user_data['email'])
