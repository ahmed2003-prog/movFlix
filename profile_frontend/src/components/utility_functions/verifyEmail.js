import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

/**
 * VerifyEmail component that handles email verification.
 *
 * @returns {JSX.Element} The rendered VerifyEmail component.
 */
function VerifyEmail() {
  const { uidb64, token } = useParams();
  const [message, setMessage] = useState('Verifying your email...');
  const navigate = useNavigate();

  useEffect(() => {
    /**
     * Verifies the user's email address by sending a request to the server.
     */
    const verifyEmail = async () => {
      try {
        // Send GET request to verify the email
        await axios.get(`http://localhost:8000/api/verify-email/${uidb64}/${token}/`);
        setMessage('Email verified successfully! You can now log in.');
        setTimeout(() => {
          navigate('/login');
        }, 3000); // Redirect to login page after 3 seconds
      } catch (error) {
        console.error('There was an error during email verification:', error);
        setMessage('Invalid verification link.');
      }
    };

    verifyEmail();
  }, [uidb64, token, navigate]);

  return (
    <div>
      {message}
    </div>
  );
}

export default VerifyEmail;
