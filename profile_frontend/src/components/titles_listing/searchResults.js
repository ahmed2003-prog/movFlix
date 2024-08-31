import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import ReactPaginate from 'react-paginate';
import { useLocation, useNavigate } from 'react-router-dom';

function SearchResults() {
    const navigate = useNavigate();
    const [results, setResults] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [hoveredSerial, setHoveredSerial] = useState(null);
    const [loading, setLoading] = useState(true);
    const itemsPerPage = 24;
    const location = useLocation();
    const query = new URLSearchParams(location.search).get('q');

    const handlePageClick = useCallback(({ selected }) => {
        setCurrentPage(selected);
    }, []);

    useEffect(() => {
        const fetchResults = async () => {
            if (query) {
                setLoading(true);
                try {
                    const response = await axios.get('http://localhost:8000/api/search/', {
                        params: { q: query },
                    });
                    setResults(response.data.results);
                } catch (error) {
                    console.error('Error fetching search results:', error);
                    alert('Failed to fetch search results. Please try again later.');
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchResults();
    }, [query]);

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

    const handleMovieClick = useCallback(async (item) => {
        const trailerId = await fetchTrailerId(item.title);
        navigate('/title-info/movieTrailer', {
            state: {
                title: item.title,
                description: item.description,
                releaseDate: item.release_date,
                popularity: item.tmdb_popularity,
                genre: item.genre,
                imageUrl: item.image_url,
                trailerId
            }
        });
    }, [navigate]);

    // Calculate the current items for pagination
    const offset = currentPage * itemsPerPage;
    const currentItems = results.slice(offset, offset + itemsPerPage);

    return (
        <div style={{ display: 'flex' }}>
            <div className="titles-content" style={{ flex: 1, padding: '16px' }}>
                {loading ? (
                    <div className="loading">
                        <div className="loading-spinner"></div>
                        <p style={{ color: 'gold', fontSize: 'large' }}>
                            Fetching search results...
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="titles-container">
                            {currentItems.length > 0 ? (
                                currentItems.map((item, index) => (
                                    <div
                                        key={item.id} // Use unique id if available
                                        className="title-card"
                                        onMouseEnter={() => setHoveredSerial(index)}
                                        onMouseLeave={() => setHoveredSerial(null)}
                                        style={{ borderColor: 'lightpink' }}
                                        onClick={() => handleMovieClick(item)}
                                    >
                                        <img
                                            src={item.image_url}
                                            alt={item.title}
                                            className="title-image"
                                            style={{ backgroundColor: 'lightpink', color: '#4f4d46', borderRadius: '5px' }}
                                        />
                                        {hoveredSerial === index && (
                                            <div className="title-overlay">
                                                <div className="title-title">
                                                    {item.title}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p style={{ color: 'gold', fontSize: 'large' }}>
                                    No results found for the query: {query}.
                                </p>
                            )}
                        </div>

                        <ReactPaginate
                            previousLabel={'Previous'}
                            nextLabel={'Next'}
                            breakLabel={'...'}
                            breakClassName={'break-me'}
                            pageCount={Math.ceil(results.length / itemsPerPage)}
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
}

export default SearchResults;
