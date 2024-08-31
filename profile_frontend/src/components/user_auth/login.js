import React, { useState } from 'react';
import axios from 'axios';
import { NavLink, useNavigate } from 'react-router-dom';
import { useUser } from '../utility_functions/useContext';
import { FaRegUser } from "react-icons/fa";
import { TbPasswordUser } from "react-icons/tb";
import './css/login.css';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login } = useUser();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const csrfToken = document.cookie.match(/csrftoken=([^;]+)/)?.[1] || '';
      const response = await axios.post(
        'http://localhost:8000/login/',
        { username, password },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken,
          },
        }
      );
  
      if (response.data.message === 'Login successful') {
        alert('Login successful!');
        const userData = {
          user_id: response.data.user.id,
          username: response.data.user.username,
          isLoggedIn: true,
        };
        login(userData); // Store user data in context and localStorage
        navigate('/home');
      } else {
        alert('Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error.response ? error.response.data : error.message);
      alert('There was an error logging in. Please try again.');
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} aria-labelledby="login-form">
        <div className="input-container">
          <FaRegUser className="input-icon" />
          <input
            type="text"
            className="input-field"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            aria-label="Username"
          />
        </div>
        <div className="input-container">
          <TbPasswordUser className="input-icon" />
          <input
            type="password"
            className="input-field"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            aria-label="Password"
          />
        </div>
        <button className="login-button" type="submit">Login</button>
      </form>
      <div className="signup-link">
        <p className="separator" style={{color:'lightpink'}}>_______________________________________________________</p>
        <p className="signup-text" style={{textAlign:'center'}}>
          Don't have an account? &nbsp;
          <NavLink to="/signup" className="signup-link-text" style={{color:'lightpink', textDecoration:'none'}}>Sign Up</NavLink>
        </p>
      </div>
    </div>
  );
}

export default Login;
