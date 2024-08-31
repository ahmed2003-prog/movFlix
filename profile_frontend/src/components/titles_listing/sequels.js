import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactPaginate from 'react-paginate';
import Sidebar from '../page_layout/sidebar';
import { useUser } from '../utility_functions/useContext';
import { truncateText } from '../utility_functions/utils';
import './css/sequels.css';
import { RiMovie2Line } from "react-icons/ri";

/**
 * Component for displaying and filtering movie sequels.
 *
 * @returns {JSX.Element} The Sequels component.
 */
const Sequels = () => {
    const { user, logout } = useUser();
    const isLoggedIn = user && user.isLoggedIn;
    const navigate = useNavigate();
    const [sequels, setSequels] = useState([]);
    const [filteredSequels, setFilteredSequels] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [hoveredSerial, setHoveredSerial] = useState(null);
    const [loading, setLoading] = useState(true);
    const sequelsPerPage = 16;

    useEffect(() => {
        const fetchSequels = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/sequels/');
                console.log('Received sequels data:', response.data);
                const sequelsData = response.data.filter(sequel => sequel.image_url);
                setSequels(sequelsData);
                setFilteredSequels(sequelsData);
            } catch (error) {
                console.error('Error fetching sequels:', error);
                alert('Failed to fetch sequels. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchSequels();
    }, []);

    /**
     * Handles page changes in the pagination component.
     *
     * @param {object} event - The event object containing the selected page.
     */
    const handlePageClick = ({ selected }) => {
        setCurrentPage(selected);
    };

    const handleFilterChange = useCallback((filters) => {
        let filtered = sequels.filter(sequel => sequel.image_url);

        if (filters.genres && filters.genres.length > 0) {
            filtered = filtered.filter(sequel => {
                const sequelGenres = sequel.genre ? sequel.genre.split(', ') : [];
                return filters.genres.some(genre => sequelGenres.includes(genre));
            });
        }

        if (filters.rating) {
            const [minPopularity, maxPopularity] = filters.rating.split('-').map(Number);
            filtered = filtered.filter(sequel =>
                sequel.tmdb_popularity >= minPopularity && sequel.tmdb_popularity <= maxPopularity
            );
        }

        if (filters.year) {
            filtered = filtered.filter(sequel => {
                const releaseYear = new Date(sequel.release_date).getFullYear();
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

        setFilteredSequels(filtered);
    }, [sequels]);

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
            const videoId = response.data.items[0]?.id?.videoId;
            return videoId;
        } catch (error) {
            console.error('Error fetching trailer:', error);
            return null;
        }
    };

    const getCsrfToken = () => {
        const match = document.cookie.match(/csrftoken=([^;]+)/);
        return match ? match[1] : '';
    };

    const handleMovieClick = useCallback(async (sequel) => {
        try {
            // Fetch the trailer ID
            const trailerId = await fetchTrailerId(sequel.title);

            // Send the movie to watch history
            if (isLoggedIn) {
                await axios.post('http://localhost:8000/api/watch-history/', {
                    logged_id: user.user_id,
                    logged_name: user.username,
                    movie: sequel.id,
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
                    id: sequel.id,
                    title: sequel.title,
                    description: sequel.description,
                    releaseDate: sequel.release_date,
                    popularity: sequel.tmdb_popularity,
                    genre: sequel.genre,
                    imageUrl: sequel.image_url,
                    trailerId: trailerId
                }
            });
        } catch (error) {
            console.error('Error storing watch history:', error);
            alert('Failed to store watch history, please try again later.');
        }
    }, [navigate, user, isLoggedIn]);

    const displaySequels = useMemo(() => {
        return filteredSequels.slice(
            currentPage * sequelsPerPage,
            (currentPage + 1) * sequelsPerPage
        );
    }, [filteredSequels, currentPage, sequelsPerPage]);

    return (
        <div style={{ display: 'flex' }}>
            <Sidebar onFilterChange={handleFilterChange} />
            <div className="sequels-content" style={{ flex: 1, padding: '16px' }}>
                {loading ? (
                    <div className="loading">
                        <div className="loading-spinner"></div>
                        <p className="loading-text">
                            Fetching sequels from database...
                        </p>
                    </div>
                ) : (
                    <>
                        <h3 className='sequels-header'>
                            <RiMovie2Line className='sequels-icon' />
                            Movies and Sequels
                        </h3>
                        <div className="sequels-container">
                            {displaySequels.length > 0 ? (
                                displaySequels.map((sequel) => (
                                    <div
                                        key={sequel.id} // Use a unique identifier
                                        className="sequel-card"
                                        onMouseEnter={() => setHoveredSerial(sequel.id)}
                                        onMouseLeave={() => setHoveredSerial(null)}
                                    >
                                        <img src={sequel.image_url} alt={sequel.title} className="sequel-image" />
                                        {hoveredSerial === sequel.id && (
                                            <div className="sequel-overlay" onClick={() => handleMovieClick(sequel)}>
                                                <div className="sequel-director">
                                                    Director: {sequel.director}
                                                </div>
                                                <div className="sequel-description">
                                                    {truncateText(sequel.description, 15)}
                                                </div>
                                                <div className="release-date">
                                                    Release Date: <span>{sequel.release_date || 'Unknown'}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p>No sequels found for the selected filters.</p>
                            )}
                        </div>

                        <ReactPaginate
                            previousLabel={'Previous'}
                            nextLabel={'Next'}
                            breakLabel={'...'}
                            breakClassName={'break-me'}
                            pageCount={Math.ceil(filteredSequels.length / sequelsPerPage)}
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

export default Sequels;
