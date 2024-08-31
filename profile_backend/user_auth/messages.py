"""
Defines error and success messages for the application.
"""

ERROR_MESSAGES = {
    'email_exists': 'A user with this email already exists.',
    'inactive_account': 'User account is disabled.',
    'invalid_credentials': 'Incorrect username or password.',
    'missing_credentials': "Must include 'username' and 'password'.",
    'invalid_expiry_date': 'Invalid expiry date format.',
    'invalid_expiry_date_format': 'Expiry date must be a string in the format YYYY-MM-DD.',
    'profile_not_found': 'Profile not found',
    'verification_link_invalid': 'Invalid verification link',
}

SUCCESS_MESSAGES= {
    'operation_completed': 'Operation completed successfully.',
    'login_successful': 'Login successful',
    'logout_successful': 'Logout successful',
    'profile_updated': 'Profile updated successfully'
}
