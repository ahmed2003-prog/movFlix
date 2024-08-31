"""
This module contains views and utility functions for user authentication and profile management.

It includes:
- API views for user signup, email verification, login, logout, and profile management.
- Utility functions for sending verification emails and generating verification URLs.

Classes:
    - SignUpView: API view for user registration.
    - VerifyEmailView: API view for handling email verification.
Functions:
    - login_view: API view for user login.
    - logout_view: API view for user logout.
    - profile_view: API view for retrieving and updating user profiles.
    - check_user: API view to check the current user's authentication status.
"""
import logging

from django.conf import settings
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.core.mail import send_mail
from django.shortcuts import redirect, get_object_or_404
from django.urls import reverse
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from rest_framework import generics, status
from rest_framework.decorators import api_view
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from user_auth.models import CustomUser, Profile
from .messages import ERROR_MESSAGES, SUCCESS_MESSAGES

from .serializers import UserSerializer, ProfileSerializer

# Set up logging
logger = logging.getLogger(__name__)

FRONTEND_URL = settings.FRONTEND_BASE_URL

class SignUpView(generics.CreateAPIView):
    """
    API view for user registration.
    Provides the `POST` method to create a new user and send an email verification link.
    """
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer

    def perform_create(self, serializer):
        """
        Create a user with the validated data, create a profile, and send a verification email.
        """
        try:
            user = serializer.save()
            user.generate_verification_token()

            # Create a profile for the user with initial values
            # pylint: disable=no-member
            Profile.objects.create(
                user=user,
                first_name=user.username,
                last_name='',
                email=user.email,
                bio=''
            )

            verification_url = self.get_verification_url(user)
            send_mail(
                subject='Verify your email address',
                message=f'Click the link to verify your email: {verification_url}',
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[user.email],
                fail_silently=False,
            )
        except ValidationError as e:
            logger.error("Validation error during signup %s", {e})
            raise

    def get_verification_url(self, user):
        """
        Generate a URL for email verification.
        """
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = user.verification_token
        return self.request.build_absolute_uri(
            reverse('verify-email', kwargs={'uidb64': uid, 'token': token})
        )

class VerifyEmailView(generics.GenericAPIView):
    """
    API view to handle email verification.
    Provides the `GET` method to verify the email using a verification token.
    """
    def get(self, request, uidb64, token):
        """
        Verify the user's email with the provided uid and token.
        """
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = get_object_or_404(CustomUser, pk=uid)

        if user.verify_email(token):
            return redirect(f'{FRONTEND_URL}/login/')
        else:
            return Response({'error': ERROR_MESSAGES['verification_link_invalid']},
                            status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def login_view(request):
    """
    API view for user login.
    Provides the `POST` method to authenticate and log in a user.
    """
    username = request.data.get('username')
    password = request.data.get('password')

    if username and password:
        user = authenticate(username=username, password=password)
        if user and user.is_active and not user.is_superuser:  # Exclude superusers
            auth_login(request, user)
            return Response({
                'message': SUCCESS_MESSAGES['login_successful'],
                'user': {
                    'username': user.username,
                    'id': user.id,
                    'isLoggedIn': True
                }
            }, status=status.HTTP_200_OK)
        elif user and user.is_superuser:
            return Response({'error': ERROR_MESSAGES['superuser_not_allowed']},
                            status=status.HTTP_403_FORBIDDEN)
        else:
            return Response({'error': ERROR_MESSAGES['invalid_credentials']},
                            status=status.HTTP_401_UNAUTHORIZED)
    else:
        return Response({'error': ERROR_MESSAGES['missing_credentials']},
                        status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def logout_view(request):
    """
    API view for user logout.
    Provides the `POST` method to log out the currently authenticated user.
    """
    auth_logout(request)
    return Response({'message': SUCCESS_MESSAGES['logout_successful']}, status=status.HTTP_200_OK)

@api_view(['GET', 'POST'])
def profile_view(request, username):
    """
    API view for retrieving and updating user profiles.
    """
    # pylint: disable=no-member
    if request.method == 'GET':
        try:
            profile = Profile.objects.get(user__username=username)
            serializer = ProfileSerializer(profile)
            return Response(serializer.data)
        except Profile.DoesNotExist:
            return Response(
                {'error': ERROR_MESSAGES['profile_not_found']},
                status=status.HTTP_404_NOT_FOUND)
    elif request.method == 'POST':
        try:
            profile = Profile.objects.get(user__username=username)
        except Profile.DoesNotExist:
            return Response(
                {'error': ERROR_MESSAGES['profile_not_found']},
                status=status.HTTP_404_NOT_FOUND
                )

        serializer = ProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {'message': SUCCESS_MESSAGES['profile_updated']},
                status=status.HTTP_200_OK
                )
        logger.error("Request Data: %s", request.data)
        logger.error("Validation Errors: %s", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def check_user(request):
    """
    Check the current user's authentication status.
    """
    if request.user.is_authenticated and (request.user.is_superuser):
        return Response(
                {'error': 'Not found'},
                status=status.HTTP_404_NOT_FOUND)
    elif request.user.is_authenticated :
        user_data = {
            'username': request.user.username,
            'email': request.user.email
        }
        return Response({'user': user_data})
    return Response({'user': None})
