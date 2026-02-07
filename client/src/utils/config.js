/**
 * Normalizes the API base URL to ensure it ends with /api
 * @param {string} url - The URL to normalize
 * @returns {string} The normalized URL
 */
export const normalizeApiBaseUrl = (url) => {
    const fallback = 'http://localhost:5000/api';
    if (!url || typeof url !== 'string') return fallback;

    // Remove trailing slashes
    let normalized = url.trim().replace(/\/+$/, '');

    // Append /api if not present
    if (!normalized.endsWith('/api')) {
        normalized = `${normalized}/api`;
    }

    return normalized;
};
