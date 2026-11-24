
from rest_framework import serializers
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import Group

from .models import User


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    username = serializers.CharField(required=False)
    fullName = serializers.CharField(write_only=True, required=False)
    full_name = serializers.CharField(write_only=True, required=False)

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
            'fullName',
            'full_name',
        ]
        read_only_fields = ['id']

    def validate(self, attrs):
        name = attrs.pop('fullName', None) or attrs.pop('full_name', None)
        if name and not attrs.get('first_name'):
            parts = name.strip().split(' ', 1)
            attrs['first_name'] = parts[0]
            if len(parts) > 1:
                attrs['last_name'] = parts[1]

        if not attrs.get('username'):
            email = attrs.get('email', '')
            base_username = email.split('@')[0] if email else 'user'
            candidate = base_username
            counter = 1
            while User.objects.filter(username=candidate).exists():
                candidate = f"{base_username}{counter}"
                counter += 1
            attrs['username'] = candidate

        return attrs

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)

        student_group, _ = Group.objects.get_or_create(name='Student')
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
    role = serializers.SerializerMethodField(read_only=True)

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
            'role',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'role', 'created_at', 'updated_at']

    def get_role(self, obj):
        if obj.is_staff:
            return 'ADMIN'
        if obj.groups.filter(name='Organizer').exists():
            return 'ORGANIZER'
        return 'STUDENT'


class AssignableUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'first_name',
            'last_name',
            'email',
        ]