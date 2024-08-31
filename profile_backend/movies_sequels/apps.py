"""
Configuration for the 'movies_sequels' Django app.

This module defines the application configuration for the 'movies_sequels' app,
which manages movie and sequel data. The configuration includes setting the default
auto field type to 'BigAutoField' and specifying the app name.

Attributes:
    default_auto_field (str): The default type of primary key field to use for models in this app.
    name (str): The name of the application, used by Django to identify and configure it.
"""

from django.apps import AppConfig


class MoviesSequelsConfig(AppConfig):
    """
    Configuration class for the 'movies_sequels' app.

    Sets the default primary key field type and specifies the application name.
    """
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'movies_sequels'
