"""
Forms for user authentication and management.

This module provides custom forms for user creation and user management
using the `CustomUser` model. It extends Django's built-in user forms to include
additional fields specific to the application's user model.

Forms:
    - CustomUserCreationForm: A form for creating new users, including fields for
    username and email.
    - CustomUserChangeForm: A form for updating existing users, including fields for
    username, email, and user permissions.

"""

from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from .models import CustomUser

class CustomUserCreationForm(UserCreationForm):
    """
    A form for creating new users using the CustomUser model.
    """
    class Meta:
        """
        Meta options for the CustomUserCreationForm.
        Specifies the model to use and the fields to include in the form.
        """
        model = CustomUser
        fields = ('username', 'email')

class CustomUserChangeForm(UserChangeForm):
    """
    A form for updating existing users using the CustomUser model.
    """
    class Meta:
        """
        Meta options for the CustomUserCreationForm.
        Specifies the model to use and the fields to include in the form.
        """
        model = CustomUser
        fields = ('username', 'email', 'is_staff', 'is_active', 'email_verified')
