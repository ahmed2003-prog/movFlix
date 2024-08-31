import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { truncateText } from '../utility_functions/utils';
import { Rating } from 'react-simple-star-rating';
import { useUser } from '../utility_functions/useContext';
import './css/rating-reviews.css';

const ReviewsSection = ({ movieId }) => {
  const [reviews, setReviews] = useState([]);
  const { user } = useUser();
  const isLoggedIn = user && user.isLoggedIn;
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [newReview, setNewReview] = useState('');
  const [newRating, setNewRating] = useState(0);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:8000/api/rating-reviews/list/?movie_id=${movieId}`, {
          withCredentials: true,
          headers: { 'X-CSRFToken': getCsrfToken() },
        });
        setReviews(response.data);
        if (isLoggedIn) {
          const userReview = response.data.find(review => review.logged_id === user.user_id);
          setHasReviewed(!!userReview);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    if (movieId) {
      fetchReviews();
    }
  }, [movieId, user, isLoggedIn]);

  const handleToggle = () => {
    setIsExpanded(prev => !prev);
  };

  const getCsrfToken = () => {
    const match = document.cookie.match(/csrftoken=([^;]+)/);
    return match ? match[1] : '';
};

  const handleSubmitReview = async () => {
    if (!isLoggedIn) {
      alert('You must be logged in to leave a review.');
      return;
    }

    try {
      await axios.post(
        'http://localhost:8000/api/rating-reviews/',
        {
          movie: movieId,
          logged_id: user.user_id,
          logged_name: user.username,
          rating: newRating,
          review: newReview,
        },
        {
          withCredentials: true,
          headers: { 'X-CSRFToken': getCsrfToken() },
        }
      );
      setHasReviewed(true);
      setReviews(prev => [
        ...prev,
        { rating: newRating, review: newReview, logged_name: user.username, created_at: new Date() }
      ]);
      setNewReview('');
      setNewRating(0);
    } catch (error) {
      console.error('Error submitting review:', error.response?.data);
    }
  };

  return (
    <div className="reviews-section">
      <h2 onClick={handleToggle} style={{ cursor: 'pointer', color: 'gold' }}>
        {isExpanded ? 'Hide Reviews' : 'Show Reviews'}
        {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
      </h2>
      {isExpanded && (
        <div className="reviews-content">
          {loading ? (
            <p>Loading reviews...</p>
          ) : reviews.length > 0 ? (
            reviews.map((review, index) => (
              <div key={index} className="review-card">
                <p style={{ color: 'lightpink', fontSize: '1.2em', fontStyle: 'italic' }}>
                  <strong>{review.logged_name || 'AnonymousUser'}</strong>
                  <span style={{ color: 'lightpink', fontSize: '0.8em', fontStyle: 'italic' }}>
                    ({new Date(review.created_at).toLocaleDateString()})
                  </span>
                </p>
                <div>
                  <Rating
                    readonly
                    initialValue={review.rating}
                    size={20}
                    iconsCount={5}
                  />
                </div>
                <p>{truncateText(review.review, 100)}</p>
              </div>
            ))
          ) : (
            <p style={{ color: 'lightcoral' }}>No reviews available</p>
          )}
        </div>
      )}
      {isLoggedIn && !hasReviewed && (
        <div className="review-form">
          <Rating
            onClick={(rate) => setNewRating(rate)}
            initialValue={newRating}
            size={25}
            className='rating-class'
          />
          <input
            type="text"
            className="review-input-field"
            placeholder="Leave a review..."
            value={newReview}
            onChange={(e) => setNewReview(e.target.value)}
          />
          <button className='review-submit-button' onClick={handleSubmitReview}>Submit Review</button>
        </div>
      )}
      {!isLoggedIn && !hasReviewed && (
        <p style={{ color: 'red' }}>You must be logged in to leave a review.</p>
      )}
    </div>
  );
};

export default ReviewsSection;
