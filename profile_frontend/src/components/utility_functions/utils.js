// src/utils.js

/**
 * Truncates text to a specified number of words.
 * @param {string} text - The text to truncate.
 * @param {number} maxWords - The maximum number of words to retain.
 * @returns {string} The truncated text.
 */
export const truncateText = (text, maxWords) => {
    const words = text.split(' ');
    if (words.length > maxWords) {
        return words.slice(0, maxWords).join(' ') + '...';
    }
    return text;
};
