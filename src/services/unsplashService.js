const axios = require('axios');
const path = require('path');

const config = require(path.resolve(__dirname, '../../config/config.json'));
const env = process.env.NODE_ENV || 'development';
const UNSPLASH_ACCESS_KEY = config[env]?.UNSPLASH?.ACCESS_KEY;

const queries = require('./categoryImageQueries');

function buildQuery(categoryName) {
  const base = queries[categoryName] || categoryName;
  return `${base} product minimal studio -face`;
}

async function getCategoryImageUrl(categoryName) {
  if (!UNSPLASH_ACCESS_KEY) {
    console.warn('Brak UNSPLASH_ACCESS_KEY w config.json');
    return null;
  }

  try {
    const resp = await axios.get('https://api.unsplash.com/search/photos', {
      params: {
        query: buildQuery(categoryName),
        per_page: 1,
        orientation: 'squarish',
        content_filter: 'high',
        order_by: 'relevant'
      },
      headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` },
      timeout: 6000
    });

    const photo = resp?.data?.results?.[0];
    return photo?.urls?.regular || photo?.urls?.small || null;
  } catch (err) {
    console.error('Unsplash error:', err.message);
    return null;
  }
}

module.exports = { getCategoryImageUrl };
