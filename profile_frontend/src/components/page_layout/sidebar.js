import React, { useState, useEffect } from 'react';
import { FaFilter } from "react-icons/fa";
import './css/sidebar.css';

const Sidebar = ({ onFilterChange }) => {
    const [filters, setFilters] = useState({
        genres: [],
        rating: '',
        year: '',
        user_rating: '',
        sort: ''
    });

    useEffect(() => {
        console.log("Current Filters:", filters);
    }, [filters]);

    const allGenres = [
        'Action', 'Drama', 'Comedy', 'Crime', 'Documentary', 'Family',
        'Horror', 'Mystery', 'Thriller', 'Musical', 'News', 'Romance',
        'Sci-Fi', 'Sport', 'Show', 'TV Special', 'War'
    ];

    const handleGenreChange = (e) => {
        const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value);
        const updatedGenres = Array.from(new Set([...filters.genres, ...selectedOptions]));
        const newFilters = { ...filters, genres: updatedGenres };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        const newFilters = { ...filters, [name]: value };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const removeGenre = (genre) => {
        const updatedGenres = filters.genres.filter((g) => g !== genre);
        const newFilters = { ...filters, genres: updatedGenres };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    return (
        <div className="sidebar">
            <h3 style={{ color: 'pink' }}>
                <FaFilter style={{ color: 'violet', marginRight: '10px' }} />
                Filter Movies
            </h3>

            <div className="filter-group">
                <label htmlFor="genres" style={{ color: 'lightpink' }}>
                    Genres
                </label>
                <div className="selected-genres">
                    {filters.genres.map((genre) => (
                        <span key={genre} className="selected-genre">
                            {genre}
                            <button
                                onClick={() => removeGenre(genre)}
                                className="remove-genre"
                            >
                                &times;
                            </button>
                        </span>
                    ))}
                </div>
                <select
                    className="dropdown-genre"
                    name="genres"
                    id="genres"
                    multiple
                    value={filters.genres}
                    onChange={handleGenreChange}
                >
                    {allGenres.map((genre) => (
                        <option key={genre} value={genre}>
                            {genre}
                        </option>
                    ))}
                </select>
            </div>

            <div className="filter-group">
                <label htmlFor="rating" style={{ color: 'lightpink' }}>
                    TMDB Rating
                </label>
                <select
                    name="rating"
                    id="rating"
                    value={filters.rating}
                    onChange={handleInputChange}
                >
                    <option value="">All</option>
                    <option value="1-3">1-3</option>
                    <option value="4-6">4-6</option>
                    <option value="7-10">7-10</option>
                </select>
            </div>

            <div className="filter-group">
                <label htmlFor="user_rating" style={{ color: 'lightpink' }}>
                    User Rating
                </label>
                <select
                    name="user_rating"
                    id="user_rating"
                    value={filters.user_rating}
                    onChange={handleInputChange}
                >
                    <option value="">All</option>
                    <option value="1-2">1-2</option>
                    <option value="2-3">2-3</option>
                    <option value="3-4">3-4</option>
                    <option value="4-5">4-5</option>
                </select>
            </div>

            <div className="filter-group">
                <label htmlFor="year" style={{ color: 'lightpink' }}>
                    Release Year
                </label>
                <input
                    type="text"
                    name="year"
                    id="year"
                    value={filters.year}
                    onChange={handleInputChange}
                    placeholder="e.g., 2020"
                />
            </div>

            <div className="filter-group">
                <label htmlFor="sort" style={{ color: 'lightpink' }}>
                    Sort By
                </label>
                <select
                    name="sort"
                    id="sort"
                    value={filters.sort}
                    onChange={handleInputChange}
                >
                    <option value="">None</option>
                    <option value="release_date">Release Date</option>
                    <option value="alphabetical">Alphabetical</option>
                </select>
            </div>

            <button
                onClick={() => onFilterChange(filters)}
                style={{ color: 'lightpink' }}
            >
                Apply Filters
            </button>
        </div>
    );
};

export default Sidebar;
