import React, { useState } from 'react';
import axios from 'axios';
import { FaRegUser } from "react-icons/fa";
import { TbPasswordUser } from "react-icons/tb";
import { MdOutlineAlternateEmail } from "react-icons/md";
import './css/signup.css';

/**
 * SignUp component that handles user registration.
 *
 * @returns {JSX.Element} The rendered SignUp component.
 */
const SignUp = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Handles input change event.
   *
   * @param {Object} e - The input change event.
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validatePassword = (password) => {
    const minLength = 8;
    const hasNumber = /[0-9]/.test(password);
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return (
      password.length >= minLength &&
      hasNumber &&
      hasLetter &&
      hasSpecial
    );
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  /**
   * Handles form submit event.
   *
   * @param {Object} e - The form submit event.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { password, email, username } = formData;

    // Reset error and success messages
    setError('');
    setSuccess('');
    setIsLoading(true);

    if (!validatePassword(password)) {
      setError('Password must be at least 8 characters long, and include a mix of numbers, letters, and special characters.');
      setIsLoading(false);
      return;
    }

    if (!validateEmail(email)) {
      setError('Invalid email address.');
      setIsLoading(false);
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError('Username can only contain letters, numbers, and underscores.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:8000/signup/', formData);
      console.log(response.data);
      setSuccess('Registration successful! Please check your email for the verification link.');
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.detail || 'An error occurred');
      } else {
        setError('An error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='signup-container'>
      <form onSubmit={handleSubmit}>
        <div className="input-container">
          <FaRegUser className="input-icon" style={{color:'goldenrod'}} />
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Username"
            required
          />
        </div>
        <div className="input-container">
          <TbPasswordUser className="input-icon" style={{color:'goldenrod'}}/>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            required
          />
        </div>
        <div className="input-container">
          <MdOutlineAlternateEmail className="input-icon" style={{color:'goldenrod'}} />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            required
          />
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Signing Up...' : 'Sign Up'}
        </button>
      </form>
      {success && <div className="success">{success}</div>}
      {error && <div className="error">{error}</div>}
    </div>
  );
};

export default SignUp;
