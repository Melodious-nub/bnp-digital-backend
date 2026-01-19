require('dotenv').config();

const formatUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const baseUrl = process.env.BASE_URL || 'https://api.vote-bnp.com';
    // Ensure path starts with /
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${baseUrl}${normalizedPath}`;
};

module.exports = formatUrl;
