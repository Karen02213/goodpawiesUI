/**
 * Normalizes the API base URL to ensure it ends with /api
 * @param {string} url - The URL to normalize
 * @returns {string} The normalized URL
 */
export const normalizeApiBaseUrl = (url) => {
    const fallback = 'https://api.goodpawies.dev/api';
    if (!url || typeof url !== 'string') return fallback;

    // Remove trailing slashes
    let normalized = url.trim().replace(/\/+$/, '');

    // Append /api if not present
    if (!normalized.endsWith('/api')) {
        normalized = `${normalized}/api`;
    }

    return normalized;
};

/**
 * Gets the base URL for static assets (removes /api from the end if present)
 * @param {string} url - The API URL
 * @returns {string} The base URL for static assets
 */
export const getBaseUrl = (url) => {
    const apiUrl = normalizeApiBaseUrl(url);
    return apiUrl.replace(/\/api$/, '');
};
