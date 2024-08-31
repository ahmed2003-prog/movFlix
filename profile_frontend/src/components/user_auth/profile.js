import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../utility_functions/useContext';
import { AiFillProfile } from "react-icons/ai";
import './css/profile.css';
import { FaPerson } from "react-icons/fa6";
import { format } from 'date-fns';
import { MdPayment } from "react-icons/md";
import { FaAddressCard } from "react-icons/fa";

function Profile() {
  const { user } = useUser();
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    email: '',
    bio: '',
    card_number: '',
    card_holder_name: '',
    cvv: '',
    expiry_date: '',
    current_address: '',
    permanent_address: '',
    billing_address: ''
  });

  const [isProfileFilled, setIsProfileFilled] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && user.isLoggedIn) {
      const fetchProfile = async () => {
        try {
          const response = await axios.get(`http://localhost:8000/profile/${user.username}/`);
          setProfile(response.data);
          setIsProfileFilled(!!response.data.first_name && !!response.data.last_name && !!response.data.email);
        } catch (error) {
          console.error('Error fetching profile data:', error);
        }
      };
      fetchProfile();
    } else {
      setProfile({
        first_name: '',
        last_name: '',
        email: '',
        bio: '',
        card_number: '',
        card_holder_name: '',
        cvv: '',
        expiry_date: '',
        current_address: '',
        permanent_address: '',
        billing_address: ''
      });
      setIsProfileFilled(false);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prevProfile) => ({
      ...prevProfile,
      [name]: value || ''
    }));
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setProfile((prevProfile) => ({
      ...prevProfile,
      [name]: value ? format(new Date(value), 'yyyy-MM-dd') : ''
    }));
  };

  const validateCardNumber = (cardNumber) => {
    const isNumeric = /^[0-9]+$/.test(cardNumber);
    return isNumeric && cardNumber.length === 16;
  };

  const validateCVV = (cardCVV) => {
    const isNumeric = /^[0-9]+$/.test(cardCVV);
    return isNumeric && cardCVV.length === 3;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateCardNumber(profile.card_number)) {
      setError('Invalid card number. Please enter a valid 16-digit card number.');
      return;
    }
    if (!validateCVV(profile.cvv)) {
      setError('Invalid card CVV. Please enter a valid 3-digit card CVV.');
      return;
    }

    try {
      const csrfToken = document.cookie.match(/csrftoken=([^;]+)/)?.[1];
      await axios.post(
        `http://localhost:8000/profile/${user.username}/`,
        profile,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken
          }
        }
      );
      alert('Profile updated successfully!');
      setIsProfileFilled(true);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('There was an error updating your profile.');
    }
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setProfile((prevProfile) => ({
            ...prevProfile,
            current_address: `Latitude: ${latitude}, Longitude: ${longitude}`
          }));
        },
        (error) => {
          console.error('Geolocation error:', error);
          setError('Unable to retrieve location. Please make sure location services are enabled.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  return (
    <div className="profile-container">
      <h2>
        <AiFillProfile style={{ color: 'lightpink', scale: '1.5', margin: '10px' }} /> Profile
      </h2>
      {user && user.isLoggedIn ? (
        isProfileFilled ? (
          <div className="profile-details">
            <section className="profile-section">
              <h3>Personal Info</h3>
              <p><strong>First Name:</strong> {profile.first_name}</p>
              <p><strong>Last Name:</strong> {profile.last_name}</p>
              <p><strong>Email:</strong> {profile.email}</p>
              <p><strong>Bio:</strong> {profile.bio}</p>
            </section>
            <hr />
            <section className="profile-section">
              <h3>Payment Info</h3>
              <p><strong>Card Number:</strong> **** **** **** {profile.card_number.slice(-4)}</p>
              <p><strong>Card Holder Name:</strong> {profile.card_holder_name}</p>
              <p><strong>CVV:</strong> ***</p>
              <p><strong>Expiry Date:</strong> {profile.expiry_date || 'Not Set'}</p>
            </section>
            <hr />
            <section className="profile-section">
              <h3>Billing Info</h3>
              <p><strong>Current Address:</strong> {profile.current_address}</p>
              <p><strong>Permanent Address:</strong> {profile.permanent_address}</p>
              <p><strong>Billing Address:</strong> {profile.billing_address}</p>
            </section>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="profile-form">
            <section className="profile-section">
              <h3><FaPerson style={{ color: 'lightpink', scale: '1.5', margin: '10px' }} /> Personal Info</h3>
              <div className="input-container">
                <input
                  type="text"
                  name="first_name"
                  value={profile.first_name || ''}
                  onChange={handleChange}
                  placeholder="First Name"
                  required
                />
              </div>
              <div className="input-container">
                <input
                  type="text"
                  name="last_name"
                  value={profile.last_name || ''}
                  onChange={handleChange}
                  placeholder="Last Name"
                  required
                />
              </div>
              <div className="input-container">
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleChange}
                  placeholder="Email"
                  required
                />
              </div>
              <div className="input-container">
                <textarea
                  name="bio"
                  value={profile.bio || ''}
                  onChange={handleChange}
                  placeholder="Bio"
                />
              </div>
            </section>
            <hr />
            <section className="profile-section">
              <h3><MdPayment style={{ color: 'lightpink', scale: '1.5', margin: '10px' }} /> Payment Info</h3>
              <div className="input-container">
                <input
                  type="text"
                  name="card_number"
                  value={profile.card_number || ''}
                  onChange={handleChange}
                  placeholder="Card Number"
                  required
                />
              </div>
              <div className="input-container">
                <input
                  type="text"
                  name="card_holder_name"
                  value={profile.card_holder_name || ''}
                  onChange={handleChange}
                  placeholder="Card Holder Name"
                  required
                />
              </div>
              <div className="input-container">
                <input
                  type="text"
                  name="cvv"
                  value={profile.cvv || ''}
                  onChange={handleChange}
                  placeholder="CVV"
                  required
                />
              </div>
              <div className="input-container">
                <input
                  type="date"
                  name="expiry_date"
                  value={profile.expiry_date || ''}
                  onChange={handleDateChange}
                  placeholder="Expiry Date"
                  required
                />
              </div>
            </section>
            <hr />
            <section className="profile-section">
              <h3><FaAddressCard style={{ color: 'lightpink', scale: '1.5', margin: '10px' }} /> Billing Info</h3>
              <div className="input-container">
                <input
                  type="text"
                  name="current_address"
                  value={profile.current_address || ''}
                  onChange={handleChange}
                  placeholder="Current Address"
                  required
                />
              </div>
              <div className="input-container">
                <input
                  type="text"
                  name="permanent_address"
                  value={profile.permanent_address || ''}
                  onChange={handleChange}
                  placeholder="Permanent Address"
                  required
                />
              </div>
              <div className="input-container">
                <input
                  type="text"
                  name="billing_address"
                  value={profile.billing_address || ''}
                  onChange={handleChange}
                  placeholder="Billing Address"
                  required
                />
              </div>
            </section>
            <div className="submit-button">
              <button type="submit">Save</button>
            </div>
            {/* <div className="submit-button">
              <button type="button" onClick={handleGetCurrentLocation}>Get Current Location</button>
            </div> */}
            {error && <div className="error">{error}</div>}
          </form>
        )
      ) : (
        <p>Please log in to view and edit your profile.</p>
      )}
    </div>
  );
}

export default Profile;
