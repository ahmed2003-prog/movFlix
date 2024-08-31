import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaSearch } from "react-icons/fa";
import { MdMovie } from "react-icons/md";
import { CgProfile } from "react-icons/cg";
import { TbMovie } from "react-icons/tb";
import axios from 'axios';
import './css/navbar.css';
import { useUser } from '../utility_functions/useContext';

/**
 * Navbar component that displays navigation links and user actions.
 *
 * @returns {JSX.Element} - The rendered Navbar component.
 */
function Navbar() {
    const { user, logout } = useUser();
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const navigate = useNavigate();
    const isLoggedIn = user && user.isLoggedIn;
    const username = user ? user.username : 'Guest';

    /**
     * Handles user logout by sending a request to the server.
     * Clears user state and localStorage upon successful logout.
     */
    const handleLogout = async () => {
        try {
            if (isLoggedIn) {
                const csrfToken = document.cookie.match(/csrftoken=([^;]+)/)[1];
                await axios.post(
                    'http://localhost:8000/logout/',
                    {},
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRFToken': csrfToken,
                        },
                    }
                );
                logout();
            }
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (searchQuery.length > 0) {
                try {
                    const response = await axios.get('http://localhost:8000/api/suggestions/', {
                        params: { q: searchQuery },
                    });
                    setSuggestions(response.data.suggestions);
                } catch (error) {
                    console.error('Error fetching suggestions:', error);
                }
            } else {
                setSuggestions([]);
            }
        };

        const delayDebounceFn = setTimeout(() => {
            fetchSuggestions();
        }, 300); // Debounce delay

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const handleSearch = (event) => {
        event.preventDefault();
        if (searchQuery) {
            navigate(`searchResults?q=${searchQuery}`);
        }
        setSearchQuery('')
    };

        // Function to get CSRF token from cookies
const getCsrfToken = () => {
    const match = document.cookie.match(/csrftoken=([^;]+)/);
    return match ? match[1] : '';
};

    const handleSuggestionClick = async (suggestion) => {
        try {
            const response = await axios.get(`http://localhost:8000/api/${encodeURIComponent(suggestion)}/movie-details/`);
            const movie = response.data;
            navigate('/title-info/movieTrailer', {
                state: {
                    id:movie.id,
                    title: movie.title,
                    description: movie.description,
                    releaseDate: movie.release_date,
                    popularity: movie.popularity,
                    genre: movie.genre,
                    imageUrl: movie.image_url,
                    trailerId: await fetchTrailerId(movie.title),
                }
            });
            setSearchQuery('');
            setSuggestions([])
            if (isLoggedIn) {
                await axios.post('http://localhost:8000/api/search-history/', {
                    logged_id: user.user_id,
                    logged_name: user.username,
                    movie: movie.id,
                    movie_name: movie.title,
                    watched_at: new Date().toISOString()
                }, {
                    withCredentials: true,
                    headers: {
                        'X-CSRFToken': getCsrfToken()
                    }
                });
            }
        } catch (error) {
            console.error('Error fetching movie details:', error);
        }
    };

    const fetchTrailerId = async (title) => {
        try {
            const apiKey = 'AIzaSyCcJMZ0JBvFDb6dSKKVrTbOlqE_3pjIKzE';
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

    
    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark header">
            <div className="container-fluid">
                <NavLink
                    className="navbar-brand"
                    to="/home"
                    style={{ fontWeight: 'bold', fontSize: '50px', color: ' goldenrod' }}
                >
                    movFlix
                </NavLink>
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                    aria-controls="navbarNav"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse justify-content-between" id="navbarNav">
                    <ul className="navbar-nav me-auto">
                        <li className="nav-item position-relative">
                            <form className="d-flex" onSubmit={handleSearch}>
                                <div className="search-container">
                                    <input
                                        className="form-control search-input"
                                        type="search"
                                        placeholder="Search"
                                        aria-label="Search"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    <FaSearch className="search-icon" />
                                </div>
                                {suggestions.length > 0 && (
                                    <ul className="suggestions-list" style={{
                                        position: 'absolute',
                                        top: '100%',
                                        left: '3%',
                                        width: '75%',
                                        maxHeight: '200px',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px',
                                        zIndex: '1000',
                                        borderColor:'#333',
                                        color:'goldenrod',
                                        listStyle: 'none',
                                        backgroundColor: 'rgba(40, 37, 37, 0.9)',
                                        overflow:'hidden',
                                        padding:'2px',
                                        overflowY:'hidden',
                                    }}>
                                        {suggestions.map((suggestion, index) => (
                                            <li
                                                key={index}
                                                className="suggestion-item"
                                                style={{
                                                    padding: '8px 12px',
                                                    cursor: 'pointer'
                                                }}
                                                onClick={() => handleSuggestionClick(suggestion)}
                                            >
                                                {suggestion}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </form>
                        </li>
                    </ul>
                    <ul className="navbar-nav">
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/sequels">
                            <TbMovie style={{scale:'2', margin:'10px',marginLeft:'15px'}}/>
                            <br/>
                            Sequels
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/movies">
                            <MdMovie  style={{scale:'2', margin:'10px', marginLeft:'15px'}}/>
                            <br/>
                            Movies
                            </NavLink>
                        </li>
                        <li className="nav-item dropdown">
                        <div style={{textAlign:'center',justifyContent:'center'}}>
                            <a
                                className="nav-link dropdown-toggle"
                                href="#"
                                role="button"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                            >
                                <CgProfile style={{scale:'2',margin:'10px',marginLeft:'15px'}} />
                                <br/>
                                {username}
                            </a>
                            <ul className="dropdown-menu dropdown-menu-end">
                                {!isLoggedIn ? (
                                    <li>
                                        <NavLink className="dropdown-item" to="/login">
                                            Login
                                        </NavLink>
                                    </li>
                                ) : (
                                    <>
                                        <li>
                                            <NavLink className="dropdown-item" to="/profile">
                                                Profile Details
                                            </NavLink>
                                        </li>
                                        <li>
                                            <NavLink className="dropdown-item" to="/searchHistory">
                                                Search History
                                            </NavLink>
                                        </li>
                                        <li>
                                            <NavLink className="dropdown-item" to="/watchHistory">
                                                Watch History
                                            </NavLink>
                                        </li>
                                        <li>
                                            <a
                                                className="dropdown-item"
                                                href="#!"
                                                onClick={handleLogout}
                                            >
                                                Logout
                                            </a>
                                        </li>
                                    </>
                                )}
                            </ul>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
