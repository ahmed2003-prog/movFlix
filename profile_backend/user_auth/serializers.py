"""
Import necessary modules and functions for user authentication and email handling.
"""
from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from django.contrib.auth import authenticate
from user_auth.models import CustomUser, Profile
from user_auth.utils import(
send_verification_email,
generate_verification_url,
validate_expiry_date)
from user_auth.messages import ERROR_MESSAGES

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for creating and managing user accounts.
    """

    password = serializers.CharField(write_only=True)
    email = serializers.EmailField()

    class Meta:
        """
        Meta data about user serializer
        """
        model = CustomUser
        fields = ('username', 'password', 'email')

    @classmethod
    def create(cls, validated_data):
        """
        Create a new user with the validated data.

        Ensures the email address is unique before creating the user.
        """
        # Ensure unique email address
        if CustomUser.objects.filter(email=validated_data['email']).exists():
            raise ValidationError(ERROR_MESSAGES['email_exists'])

        user = CustomUser.objects.create_user(**validated_data)
        user.generate_verification_token()
        verification_url = generate_verification_url(user)
        send_verification_email(user, verification_url)
        return user

class LoginSerializer(serializers.Serializer):
    """
    Serializer for user login.
    """

    username = serializers.CharField()
    password = serializers.CharField()

    @classmethod
    def validate(cls, attrs):
        """
        Validate the user's credentials.
        """
        username = attrs.get('username')
        password = attrs.get('password')

        if username and password:
            user = authenticate(username=username, password=password)
            if user:
                if not user.is_active:
                    raise serializers.ValidationError(ERROR_MESSAGES['inactive_account'])
                return user
            else:
                raise serializers.ValidationError(ERROR_MESSAGES['invalid_credentials'])
        else:
            raise serializers.ValidationError(ERROR_MESSAGES['missing_credentials'])

class ProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for managing user profiles.

    This serializer handles the serialization and validation of profile data,
    including personal information, payment details, and addresses.
    """

    expiry_date = serializers.CharField(max_length=10, required=False)

    class Meta:
        """
        Meta class to specify the model and fields to be serialized.
        """
        model = Profile
        fields = [
            'first_name', 'last_name', 'email', 'bio', 'card_number',
            'card_holder_name', 'cvv', 'expiry_date', 'current_address',
            'permanent_address', 'billing_address'
        ]

    @classmethod
    def validate_expiry_date(cls, value):
        """
        Validate the expiry date format.

        Args:
            value (str): The expiry date in string format.

        Returns:
            str: The validated expiry date in 'YYYY-MM-DD' format if valid.

        Raises:
            ValidationError: If the expiry date format is invalid or if it is not a string.
        """
        return validate_expiry_date(value)

