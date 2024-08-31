import React, { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { MdNewReleases, MdExpandMore, MdRecommend } from "react-icons/md";
import { RiMovie2Line } from "react-icons/ri";
import { useUser } from '../utility_functions/useContext';
import Marquee from 'react-fast-marquee';
import '../home/css/home.css';

function Home() {
    const navigate = useNavigate();
    const { user } = useUser();
    const [recentlyReleasedMovies, setRecentlyReleasedMovies] = useState([]);
    const [recentlyReleasedSequels, setRecentlyReleasedSequels] = useState([]);
    const [mostPopular, setMostPopular] = useState([]);
    const [userRecommendations, setUserRecommendations] = useState([]);
    const [visibleCountRecent, setVisibleCountRecent] = useState(5);
    const [visibleCountPopular, setVisibleCountPopular] = useState(5);
    const [loading, setLoading] = useState({ recentlyReleased: true, mostPopular: true, recommendations: true });
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                const [recentlyReleasedResponse, mostPopularResponse] = await axios.all([
                    axios.get('http://localhost:8000/api/recently-released/'),
                    axios.get('http://localhost:8000/api/most-popular/')
                ]);
                setRecentlyReleasedMovies(recentlyReleasedResponse.data.recently_released_movies || []);
                setRecentlyReleasedSequels(recentlyReleasedResponse.data.recently_released_sequels || []);
                setMostPopular(mostPopularResponse.data.tmdb_popular_movies || []);
            } catch (error) {
                setError('Error fetching data. Please try again later.');
            } finally {
                setLoading(prev => ({ ...prev, recentlyReleased: false, mostPopular: false }));
            }
        };

        const fetchRecommendations = async (username) => {
            try {
                console.log(username);
                const response = await axios.get(`http://localhost:8000/api/recommendations/${username}`, {
                    params: { user_id: user.user_id }
                });
                setUserRecommendations(response.data.recommended_movies || []);
                setLoading(prev => ({ ...prev, recommendations: false }));
            } catch (error) {
                setError('Error fetching recommendations.');
                setLoading(prev => ({ ...prev, recommendations: false }));
            }
        };

        setLoading({ recentlyReleased: true, mostPopular: true, recommendations: true });
        setError('');

        fetchMovies();
        if (user) {
            fetchRecommendations(user.username);
        } else {
            setLoading(prev => ({ ...prev, recommendations: false }));
        }
    }, [user]);

    const combinedRecentTitles = [
        ...recentlyReleasedMovies,
        ...recentlyReleasedSequels
    ];

    const handleShowMoreRecent = () => {
        setVisibleCountRecent(prevCount => prevCount + 5);
    };

    const handleShowMorePopular = () => {
        setVisibleCountPopular(prevCount => prevCount + 5);
    };

    const fetchTrailerId = async (title) => {
        try {
            const apiKey = process.env.REACT_APP_YOUTUBE_API_KEY;
            const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
                params: {
                    part: 'snippet',
                    q: `${title} trailer`,
                    key: apiKey,
                    maxResults: 1,
                    type: 'video'
                }
            });
            return response.data.items[0]?.id?.videoId;
        } catch {
            return null;
        }
    };

    const handleMovieClick = useCallback(async (item) => {
        const trailerId = await fetchTrailerId(item.title);
        navigate('/title-info/movieTrailer', {
            state: {
                id: item.id,
                title: item.title,
                description: item.description,
                releaseDate: item.release_date,
                popularity: item.tmdb_popularity,
                genre: item.genre,
                imageUrl: item.image_url,
                trailerId: trailerId
            }
        });
    }, [navigate]);

    if (loading.recentlyReleased || loading.mostPopular || loading.recommendations) {
        return (
            <div className="loading">
                <div className="loading-spinner"></div>
                <p style={{ color: 'gold', fontSize: 'large' }}>
                    Fetching titles from database
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <p style={{ color: 'red' }}>{error}</p>
        );
    }

    return (
        <div>
            {/* User Recommendations Section */}
            {userRecommendations.length === 0 && !loading.recommendations && (
                <section className="user-recommendations">
                    <h3>
                        <MdRecommend style={{ color: 'gold', scale: '2', marginRight: '20px' }} />
                        Recommended for You
                    </h3>
                    <p>No specific recommendations available. </p>
                </section>
            )}
            {user && userRecommendations.length > 0 &&  !loading.recommendations && (
                <section className="user-recommendations">
                    <h3>
                        <MdRecommend style={{ color: 'gold', scale: '2', marginRight: '20px' }} />
                        Recommended for You
                    </h3>
                    <div className="marquee-container" style={{ marginTop: '20px' }}>
                        <Marquee>
                            <div className="marquee-content" style={{ marginTop: '20px', marginBottom: '20px' }}>
                                {userRecommendations.map(movie => (
                                    <div key={movie.id} className="home-movie-card" style={{ borderColor: 'lightblue', margin: '0 10px', maxWidth: '150px' }}>
                                        <img
                                            src={movie.image_url}
                                            alt={movie.title}
                                            className="home-movie-image"
                                        />
                                        <div className="home-movie-overlay" onClick={() => handleMovieClick(movie)}></div>
                                    </div>
                                ))}
                            </div>
                        </Marquee>
                    </div>
                </section>
            )}

            {/* Render the Most Popular section */}
            <section className="most-popular">
                <h3>
                    <RiMovie2Line style={{ color: 'gold', scale: '2', marginRight: '20px' }} />
                    Most Popular
                </h3>
                <div className="home-movies-list">
                    {mostPopular.length > 0 ? (
                        mostPopular.slice(0, visibleCountPopular).map(movie => (
                            <div key={movie.id} className="home-movie-card" style={{ borderColor: 'lightpink' }}>
                                <img
                                    src={movie.image_url}
                                    alt={movie.title}
                                    className="home-movie-image"
                                />
                                <div className="home-movie-overlay" onClick={() => handleMovieClick(movie)}>
                                    <div className="home-movie-title">{movie.title || 'Unknown'}</div>
                                    <div className="home-movie-genre">Genre: {movie.genre || 'Unknown'}</div>
                                    <div className="home-movie-director">Director: {movie.director || 'Unknown'}</div>
                                    <div className="release-date">Release Date: {movie.release_date || 'Unknown'}</div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>No popular movies available.</p>
                    )}
                </div>
                {visibleCountPopular < mostPopular.length && (
                    <button className="show-more" onClick={handleShowMorePopular}>
                        <MdExpandMore />
                    </button>
                )}
            </section>

            {/* Render the Recently Released section */}
            <section className="recently-released">
                <a href='/movies' style={{ color: 'white', textDecoration: 'none' }}>
                    <h3>
                        <MdNewReleases style={{ color: 'gold', scale: '2', marginRight: '20px' }} />
                        Recently Released Titles
                    </h3>
                </a>
                <div className="home-movies-list">
                    {combinedRecentTitles.length > 0 ? (
                        combinedRecentTitles.slice(0, visibleCountRecent).map(movie => (
                            <div key={movie.id} className="home-movie-card" style={{ borderColor: 'lightpink' }}>
                                <img
                                    src={movie.image_url}
                                    alt={movie.title}
                                    className="home-movie-image"
                                />
                                <div className="home-movie-overlay" onClick={() => handleMovieClick(movie)}>
                                    <div className="home-movie-title">{movie.title || 'Unknown'}</div>
                                    <div className="home-movie-genre">Genre: {movie.genre || 'Unknown'}</div>
                                    <div className="home-movie-director">Director: {movie.director || 'Unknown'}</div>
                                    <div className="release-date">Release Date: {movie.release_date || 'Unknown'}</div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>No recently released movies available.</p>
                    )}
                </div>
                {visibleCountRecent < combinedRecentTitles.length && (
                    <button className="show-more" onClick={handleShowMoreRecent}>
                        <MdExpandMore />
                    </button>
                )}
            </section>
        </div>
    );
}

export default Home;
