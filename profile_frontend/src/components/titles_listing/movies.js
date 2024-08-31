import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import ReactPaginate from 'react-paginate';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../page_layout/sidebar';
import { useUser } from '../utility_functions/useContext';
import './css/movies.css';

const Movies = () => {
    const [items, setItems] = useState([]);
    const { user, logout } = useUser();
    const isLoggedIn = user && user.isLoggedIn;
    const [filteredItems, setFilteredItems] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [hoveredSerial, setHoveredSerial] = useState(null);
    const [loading, setLoading] = useState(true);
    const itemsPerPage = 16;
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [moviesResponse, sequelsResponse] = await axios.all([
                    axios.get('http://localhost:8000/api/movies/'),
                    axios.get('http://localhost:8000/api/sequels/')
                ]);
                const combinedItems = [...moviesResponse.data, ...sequelsResponse.data].filter(item => item.image_url);
                setItems(combinedItems);
                setFilteredItems(combinedItems);
            } catch (error) {
                console.error('Error fetching data:', error);
                alert('Failed to fetch data, please try again later.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handlePageClick = useCallback(({ selected }) => {
        setCurrentPage(selected);
    }, []);

    const handleFilterChange = useCallback((filters) => {
        let filtered = items.filter(item => item.image_url);

        if (filters.genres.length > 0) {
            filtered = filtered.filter(item => {
                const itemGenres = item.genre ? item.genre.split(', ') : [];
                return filters.genres.some(genre => itemGenres.includes(genre));
            });
        }

        if (filters.rating) {
            const [minPopularity, maxPopularity] = filters.rating.split('-').map(Number);
            filtered = filtered.filter(item =>
                item.tmdb_popularity >= minPopularity && item.tmdb_popularity <= maxPopularity
            );
        }

        if (filters.year) {
            filtered = filtered.filter(item => {
                const releaseYear = new Date(item.release_date).getFullYear();
                return releaseYear.toString() === filters.year;
            });
        }

        if (filters.sort) {
            filtered.sort((a, b) => {
                if (filters.sort === 'release_date') {
                    return new Date(b.release_date) - new Date(a.release_date);
                } else if (filters.sort === 'alphabetical') {
                    return a.title.localeCompare(b.title);
                }
                return 0;
            });
        }

        setFilteredItems(filtered);
    }, [items]);

    const fetchTrailerId = async (title) => {
        try {
            const apiKey = process.env.REACT_APP_YOUTUBE_API_KEY;
            const response = await axios.get(
                `https://www.googleapis.com/youtube/v3/search`, {
                    params: {
                        part: 'snippet',
                        q: `${title} trailer`,
                        key: apiKey,
                        maxResults: 1,
                        type: 'video'
                    }
                }
            );
            const videoId = response.data.items[0]?.id?.videoId;
            return videoId;
        } catch (error) {
            console.error('Error fetching trailer:', error);
            return null;
        }
    };

    // Function to get CSRF token from cookies
const getCsrfToken = () => {
    const match = document.cookie.match(/csrftoken=([^;]+)/);
    return match ? match[1] : '';
};

const handleMoviePageClick = useCallback(async (item) => {
    try {
        // Fetch the trailer ID
        const trailerId = await fetchTrailerId(item.title);

        // Send the movie to watch history
        if (isLoggedIn) {
            await axios.post('http://localhost:8000/api/watch-history/', {
                logged_id: user.user_id,
                logged_name: user.username,
                movie: item.id,
                watched_at: new Date().toISOString()
            }, {
                withCredentials: true,
                headers: {
                    'X-CSRFToken': getCsrfToken()
                }
            });
        }

        // Navigate to movie page
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
    } catch (error) {
        console.error('Error storing watch history:', error);
        alert('Failed to store watch history, please try again later.');
    }
}, [navigate, user, isLoggedIn]);


    const displayItems = useMemo(() => {
        return filteredItems.slice(
            currentPage * itemsPerPage,
            (currentPage + 1) * itemsPerPage
        );
    }, [filteredItems, currentPage, itemsPerPage]);

    return (
        <div style={{ display: 'flex' }}>
            <Sidebar onFilterChange={handleFilterChange} />
            <div className="titles-content" style={{ flex: 1, padding: '16px' }}>
                {loading ? (
                    <div className="loading">
                        <div className="loading-spinner"></div>
                        <p style={{ color: 'gold', fontSize: 'large' }}>
                            Fetching titles from database
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="titles-container">
                            {displayItems.length > 0 ? (
                                displayItems.map((item, index) => (
                                    <div
                                        key={index}
                                        className="title-card"
                                        onMouseEnter={() => setHoveredSerial(index)}
                                        onMouseLeave={() => setHoveredSerial(null)}
                                        style={{ borderColor: 'lightpink' }}
                                        onClick={() => handleMoviePageClick(item)}
                                    >
                                        <img
                                            src={item.image_url}
                                            alt={item.title}
                                            className="title-image"
                                        />
                                        {hoveredSerial === index && (
                                            <div className="title-overlay">
                                                <div className="title-title">
                                                    {item.title}
                                                </div>
                                                <div className="title-genre">
                                                    Genre: {item.genre}
                                                </div>
                                                <div className="title-director">
                                                    Director: {item.director}
                                                </div>
                                                <div className="title-release-date">
                                                    Release Date: {item.release_date || 'Unknown'}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p style={{ color: 'gold', fontSize: 'large' }}>
                                    No movies or sequels found for the selected filters.
                                </p>
                            )}
                        </div>

                        <ReactPaginate
                            previousLabel={'previous'}
                            nextLabel={'next'}
                            breakLabel={'...'}
                            breakClassName={'break-me'}
                            pageCount={Math.ceil(filteredItems.length / itemsPerPage)}
                            marginPagesDisplayed={2}
                            pageRangeDisplayed={5}
                            onPageChange={handlePageClick}
                            containerClassName={'pagination'}
                            activeClassName={'active'}
                        />
                    </>
                )}
            </div>
        </div>
    );
};

export default Movies;
