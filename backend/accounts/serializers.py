
from rest_framework import serializers
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import Group

from .models import User


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'password',
            'first_name',
            'last_name',
            'phone_number',
        ]
        read_only_fields = ['id']

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)

        student_group = Group.objects.get(name='Student')
        user.groups.add(student_group)

        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):

    username_field = 'email'

    email = serializers.EmailField()
    password = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'}
    )

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            raise AuthenticationFailed(
                'Invalid email or password.'
            )

        if not user.check_password(password) or not user.is_active:
            raise AuthenticationFailed(
                'Invalid email or password.'
            )

        refresh = self.get_token(user)

        data = {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'role': (
                    'ADMIN' if user.is_staff
                    else 'ORGANIZER' if user.groups.filter(
                        name='Organizer'
                    ).exists()
                    else 'STUDENT'
                ),
            },
        }

        return data

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        token['username'] = user.username
        token['email'] = user.email

        return token


class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField()

    def save(self, **kwargs):
        try:
            token = RefreshToken(self.validated_data['refresh'])
            token.blacklist()
        except Exception:
            raise serializers.ValidationError({
                'refresh': 'Invalid or expired refresh token.'
            })


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'phone_number',
            'profile_picture',
            'created_at',
            'updated_at',
        ]
