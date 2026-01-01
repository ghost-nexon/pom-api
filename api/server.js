const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Base XNXX category URLs (updated to xnxxhindi.xyz)
const categoryUrls = {
  indian: 'https://xnxxhindi.xyz/indian',
  asian: 'https://xnxxhindi.xyz/asian',
  cumshot: 'https://xnxxhindi.xyz/cumshots',
  desi: 'https://xnxxhindi.xyz/desi',
  // Add more categories as needed
};

// Helper function to scrape videos from a category
async function scrapeCategory(url) {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const results = [];

    // Check if the website structure is different
    $('.video-item').each((i, el) => {
      const title = $(el).find('h3').text().trim();
      const videoLink = $(el).find('a').attr('href');
      const duration = $(el).find('.duration').text().trim(); // Example for duration
      const thumbnail = $(el).find('img').attr('src'); // Example for thumbnail

      if (title && videoLink) {
        results.push({
          title,
          videoLink: `https://xnxxhindi.xyz${videoLink}`, // Ensure full URL
          duration,
          thumbnail,
        });
      }
    });

    return results;
  } catch (error) {
    console.error('Scraping failed:', error.message);
    throw error;
  }
}

// Category endpoint (GET)
app.get('/api/videos/:category', async (req, res) => {
  const category = req.params.category.toLowerCase();
  const url = categoryUrls[category];

  if (!url) {
    return res.status(404).json({ error: 'Category not found' });
  }

  try {
    const videos = await scrapeCategory(url);
    res.json(videos);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch category data' });
  }
});

// Search endpoint (POST)
app.post('/api/search', async (req, res) => {
  const query = req.body.q || 'all';
  const url = `https://xnxxhindi.xyz/search?search=${encodeURIComponent(query)}`;
  try {
    const videos = await scrapeCategory(url);
    res.json(videos);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch search results' });
  }
});
