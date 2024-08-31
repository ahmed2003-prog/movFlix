"""
Import necessary modules from Django for configuring the application.
"""
from django.apps import AppConfig
class UserAuthConfig(AppConfig):
    """Configuration for the User Authentication application."""

    default_auto_field = 'django.db.models.BigAutoField'
    name = 'user_auth'
