import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Rating } from 'react-simple-star-rating';
import axios from 'axios';
import './css/movieTrailer.css';
import { BsCalendar2Heart } from "react-icons/bs";
import { FaChartLine } from "react-icons/fa";
import { truncateText } from '../utility_functions/utils';
import ReviewsSection from '../page_layout/ratings-reviews';

const MovieTrailer = () => {
  const location = useLocation();
  const { id, title, description, releaseDate, genre, imageUrl, popularity, trailerId } = location.state || {};
  const [sequels, setSequels] = useState([]);
  const [hoveredSerial, setHoveredSerial] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchSequels = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:8000/api/${title}/sequels`, {
          withCredentials: true, // Ensure cookies are sent
        });
        setSequels(response.data);
      } catch (error) {
        console.error('Error fetching sequels:', error);
      } finally {
        setLoading(false);
      }
    };

    if (title) {
      fetchSequels();
    }
  }, [title]);

  const handleNextPage = () => {
    if ((currentPage + 1) * itemsPerPage < sequels.length) {
      setCurrentPage(prevPage => prevPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prevPage => prevPage - 1);
    }
  };

  const displayedSequels = sequels.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  return (
    <div className="movie-sequels-container">
      <div className="movie-header">
        <h1 className="movie-title">{title}</h1>
      </div>
      <div className='movie-genre-user-rating'>
        <div className="movie-genre">
          <p>{genre}</p>
        </div>
      </div>
      <div className="movie-content">
        <div className="movie-image">
          <img src={imageUrl} alt={title} />
        </div>
        <div className="movie-details">
          <div className="movie-trailer">
            {trailerId ? (
              <iframe
                src={`https://www.youtube.com/embed/${trailerId}`}
                title={`${title} Trailer`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            ) : (
              <p>No trailer available</p>
            )}
            <div className="release-popularity-container">
              <div className="movie-user-rating"
                style={{
                  marginTop: '-10px',
                  padding: '5px',
                  marginLeft: '10px',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  backgroundColor: 'rgba(51, 51, 51, 0.9)',
                  marginBottom: '10px',
                  borderRadius: '5px',
                  color: 'lightpink',
                  fontSize: '1.1em'
                }}>
                Average Rating
                <br />
                <Rating
                  style={{ scale: '0.7' }}
                />
              </div>
              <div className='movie-release'>
                <div className='Release-date'>
                  <div className='cl-icon'><BsCalendar2Heart /></div>
                  <br />
                  <p className="movie-release-date">{releaseDate}</p>
                </div>
              </div>
              <div className="popularity-container">
                <div className='tmdb-popularity'>
                  <div className='pop-icon'><FaChartLine /></div>
                  <br />
                  <p className='tmdb-rating'>TMDB : {popularity || 'N/A'}</p>
                </div>
              </div>
            </div>
            <div className="movie-description">
              <h3 style={{ color: 'lightpink', margin: '15px' }}>Synopsis:</h3>
              <p>{truncateText(description, 50)}</p>
            </div>
          </div>
        </div>
      </div>
      <ReviewsSection movieId={id} />
      <h2 style={{ color: 'goldenrod', marginTop: '25px' }}>Sequels</h2>
      {loading ? (
        <p>Loading sequels...</p>
      ) : (
        <div className="sequels-gallery">
          <div className="movie-sequels-content" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
            {displayedSequels.length > 0 ? (
              displayedSequels.map((sequel, index) => (
                <div
                  key={index}
                  className="movie-sequel-card"
                  onMouseEnter={() => setHoveredSerial(index)}
                  onMouseLeave={() => setHoveredSerial(null)}
                  style={{ color: '#4f4d46', borderRadius: '5px', margin: '6px' }}
                >
                  <img src={sequel.image_url} alt={sequel.title} className="movie-sequel-image" />
                  {hoveredSerial === index && (
                    <div className="movie-sequel-overlay">
                      <div className="movie-sequel-title" style={{ color: 'gold', fontSize: '1.3em', padding: '5px' }}>
                        {truncateText(sequel.title, 20)}
                      </div>
                      <div className="movie-sequel-description">{truncateText(sequel.description, 20)}</div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p>No sequels available</p>
            )}
          </div>
          {displayedSequels.length > 0 && (
            <div className="movie-info-pagination">
              <button onClick={handlePreviousPage} disabled={currentPage === 0}>&lt;</button>
              <button onClick={handleNextPage} disabled={(currentPage + 1) * itemsPerPage >= sequels.length}>&gt;</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MovieTrailer;
