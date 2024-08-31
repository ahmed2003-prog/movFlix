"""
Admin interface configuration for the 'user_auth' app.

This module defines the custom admin interfaces for managing `CustomUser` and `Profile` models
within the Django admin site. It includes:

- `CustomUserAdmin`: Custom admin interface for the `CustomUser` model.
- `ProfileAdmin`: Admin interface for the `Profile` model.

Admin Interfaces:
    CustomUserAdmin: Custom admin configuration for `CustomUser` with fields for user details,
    permissions, and verification.
    ProfileAdmin: Standard admin configuration for `Profile` with fields for user profile details.

Registered Models:
    CustomUser: The custom user model with extended fields and permissions.
    Profile: The user profile model including personal and payment information.
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import CustomUser, Profile
from .forms import CustomUserCreationForm, CustomUserChangeForm

class CustomUserAdmin(BaseUserAdmin):
    """
    Custom admin interface for the CustomUser model.
    """
    add_form = CustomUserCreationForm
    form = CustomUserChangeForm

    list_display = ('id','username', 'email','is_superuser', 'is_staff', 'email_verified')
    list_filter = ('id','is_staff', 'is_active','is_superuser', 'email_verified')
    fieldsets = (
        (None, {'fields': ('username', 'email', 'password')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
        ('Verification', {'fields': ('email_verified', 'verification_token')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2')}
        ),
    )
    search_fields = ('username', 'email')
    ordering = ('email',)

class ProfileAdmin(admin.ModelAdmin):
    """
    Admin interface for Profile model.
    """
    list_display = ('user', 'first_name', 'last_name', 'email', 'card_number')
    search_fields = ('user__username', 'first_name', 'last_name', 'email')
    ordering = ('user__username',)

admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(Profile, ProfileAdmin)
