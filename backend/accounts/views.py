from django.shortcuts import render
from rest_framework import generics
from rest_framework.permissions import AllowAny
from .serializers import CustomTokenObtainPairSerializer, UserRegistrationSerializer, UserProfileSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, BasePermission
from .serializers import LogoutSerializer, AssignableUserSerializer
from rest_framework.generics import RetrieveUpdateAPIView, ListAPIView
from rest_framework.parsers import (MultiPartParser, FormParser, JSONParser,FormParser, JSONParser)
from .models import User

# Create your views here.


class UserRegistrationView(generics.CreateAPIView):
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = LogoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(
            {"message": "Successfully logged out."},
            status=status.HTTP_205_RESET_CONTENT
        )


class UserProfileView(RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_object(self):
        return self.request.user

class IsOrganizerOrAdmin(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and (
                request.user.is_staff
                or request.user.groups.filter(name='Organizer').exists()
            )
        )


class AssignableUsersView(ListAPIView):
    serializer_class = AssignableUserSerializer
    permission_classes = [IsOrganizerOrAdmin]

    def get_queryset(self):
        return User.objects.filter(
            groups__name='Student',
            is_active=True
        ).order_by('first_name', 'last_name')