from django.urls import path
from .views import (
    UserRegistrationView,
    LogoutView,
    UserProfileView,
    AssignableUsersView,
)

urlpatterns = [
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    path(
        'assignable-users/',
        AssignableUsersView.as_view(),
        name='assignable-users'
    ),
]