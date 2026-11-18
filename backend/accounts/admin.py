
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ('Additional Information', {
            'fields': ('phone_number', 'profile_picture')
        }),
    )

    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Additional Information', {
            'fields': ('email', 'phone_number', 'profile_picture')
        }),
    )

    list_display = (
        'username',
        'email',
        'first_name',
        'last_name',
        'is_staff',
    )
