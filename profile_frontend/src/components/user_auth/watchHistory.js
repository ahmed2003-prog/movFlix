import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../utility_functions/useContext';
import '../user_auth/css/watchHistory.css';

const WatchHistory = () => {
    const [items, setItems] = useState([]);
    const [movies, setMovies] = useState({});
    const { user } = useUser();
    const [isLoading, setLoading] = useState(true);

    const getCsrfToken = () => {
        const match = document.cookie.match(/csrftoken=([^;]+)/);
        return match ? match[1] : '';
    };

    const fetchWatchHistory = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/list-watch-history/', {
                params: { user_id: user.user_id },
                withCredentials: true,
                headers: { 'X-CSRFToken': getCsrfToken() },
            });
            setItems(response.data);
        } catch (error) {
            console.error('Error fetching watch history:', error);
            alert('Failed to fetch watch history, please try again later.');
        }
    };

    const fetchMovieNames = async () => {
        try {
            const movieIds = [...new Set(items.map(item => item.movie))];
            const movieRequests = movieIds.map(id =>
                axios.get(`http://localhost:8000/api/movie/${id}/`, {
                    withCredentials: true,
                    headers: { 'X-CSRFToken': getCsrfToken() },
                })
            );

            const responses = await Promise.all(movieRequests);
            const moviesData = responses.reduce((acc, response) => {
                const movie = response.data;
                if (movie.id && movie.name) {
                    acc[movie.id] = movie.name;
                }
                return acc;
            }, {});

            setMovies(moviesData);
        } catch (error) {
            console.error('Error fetching movie names:', error);
            alert('Failed to fetch movie names, please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchWatchHistory();
        }
    }, [user]);

    useEffect(() => {
        if (items.length > 0) {
            fetchMovieNames();
        }
    }, [items]);

    if (isLoading) {
        return <div className="loading">Loading...</div>;
    }

    if (items.length === 0) {
        return <div className="no-history">No watch history available.</div>;
    }

    return (
        <div className="watch-history">
            <ul style={{listStyleType: 'none'}}>
                {items.map((item) => (
                    <li key={item.id} className="history-item">
                        <h3>{movies[item.movie] || 'Loading movie name...'}</h3>
                        <p>Watched on: {new Date(item.watched_at).toLocaleDateString()}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default WatchHistory;
