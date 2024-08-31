from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.utils.translation import gettext_lazy as _




class CustomUserManager(BaseUserManager):
    """
    Custom manager for the CustomUser model.
    """

    def create_user(self, username, email, password=None, **extra_fields):
        """
        Creates and returns a regular user with an email and password.
        """
        if not email:
            raise ValueError(_('The Email field must be set'))

        email = self.normalize_email(email)
        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password=None, **extra_fields):
        """
        Creates and returns a superuser with an email and password.
        """
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('Superuser must have is_staff=True.'))

        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Superuser must have is_superuser=True.'))

        return self.create_user(username, email, password, **extra_fields)


class CustomUser(AbstractUser):
    """
    CustomUser model extends the default Django AbstractUser model.
    Adds additional fields for email verification and token management.
    """
    email_verified = models.BooleanField(default=False)
    verification_token = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = CustomUserManager()  # Assign the custom manager

    def generate_verification_token(self):
        """
        Generates and saves a verification token for the user.
        """
        self.verification_token = default_token_generator.make_token(self)
        self.save()

    def verify_email(self, token) -> bool:
        """
        Verifies the user's email with the provided token.
        """
        if default_token_generator.check_token(self, token):
            self.email_verified = True
            self.verification_token = None
            self.save()
            return True
        return False

    def __str__(self):
        """
        Returns the username as the string representation of the user.
        """
        return str(self.username)


class Profile(models.Model):
    """
    Profile model that extends the CustomUser model with additional fields.
    """
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    first_name = models.CharField(max_length=100, blank=True, null=True)
    last_name = models.CharField(max_length=100, blank=True, null=True)
    email = models.EmailField(unique=True, blank=True, null=True)  # Consider if this is necessary
    bio = models.TextField(blank=True, null=True)
    card_number = models.CharField(max_length=16, blank=True, null=True)
    card_holder_name = models.CharField(max_length=100, blank=True, null=True)
    cvv = models.CharField(max_length=3, blank=True, null=True)
    expiry_date = models.CharField(max_length=10, blank=True, null=True)
    current_address = models.TextField(blank=True, null=True)
    permanent_address = models.TextField(blank=True, null=True)
    billing_address = models.TextField(blank=True, null=True)

    def __str__(self):
        """
        Returns a string representation of the profile, including the username.
        """
        return f'{self.user.username} Profile'

