"""
Utility functions for user authentication, email handling, and token management.
"""
from datetime import datetime
from django.core.mail import send_mail
from django.conf import settings
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from django.core.exceptions import ValidationError
from rest_framework_simplejwt.tokens import RefreshToken
from user_auth.messages import ERROR_MESSAGES

def generate_auth_token(user):
    """
    Generate authentication tokens for a given user.

    Args:
        user (CustomUser): The user for whom the tokens will be generated.

    Returns:
        dict: A dictionary containing 'refresh' and 'access' tokens.
    """
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

def send_verification_email(user, verification_url):
    """
    Send an email with a verification link to the user.

    Args:
        user (CustomUser): The user to whom the verification email will be sent.
        verification_url (str): The URL for email verification.
    """
    send_mail(
        'Verify your email address',
        f'Click the link to verify your email: {verification_url}',
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        fail_silently=False,
    )

def generate_verification_url(user):
    """
    Generate a URL for email verification.

    Args:
        user (CustomUser): The user for whom the verification URL will be generated.

    Returns:
        str: The URL for email verification.
    """
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = user.verification_token
    base_url = settings.FRONTEND_BASE_URL
    return f'{base_url}/verifyEmail/{uid}/{token}/'

def validate_expiry_date(value):
    """
    Validate the expiry date format.

    Args:
        value (str): The expiry date in string format.

    Returns:
        str: The validated expiry date in 'YYYY-MM-DD' format if valid.

    Raises:
        ValidationError: If the expiry date format is invalid or if it is not a string.
    """
    if value:
        if isinstance(value, str):  # Ensure value is a string
            try:
                # Check if the format is YYYY-MM-DD
                parsed_date = datetime.strptime(value, '%Y-%m-%d').date()
                return parsed_date.strftime('%Y-%m-%d')  # Return in string format
            except ValueError as exc:
                raise ValidationError(ERROR_MESSAGES['invalid_expiry_date']) from exc
        else:
            raise ValidationError(ERROR_MESSAGES['invalid_expiry_date_format'])
    return value
