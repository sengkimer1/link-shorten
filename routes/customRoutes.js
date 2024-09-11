const express = require('express');
const router = express.Router();
const pool = require('../db'); // PostgreSQL connection pool
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
}

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.error('JWT Verification Error:', err.message);
            return res.status(403).json({ error: 'Invalid token', details: err.message });
        }
        req.user = user;
        next();
    });
};

module.exports = { authenticateToken };

// POST endpoint for creating a custom alias
router.post('/custom', authenticateToken, async (req, res) => {
  const { original_link, custom_link } = req.body;
  const userId = req.user.id; 
  
  try {
    const existingLink = await pool.query('SELECT * FROM shortened_urls WHERE short_url = $1', [custom_link]);
    if (existingLink.rows.length > 0) {
      return res.status(400).json({
        response: 400,
        error: 'Custom link already exists'
      });
    }

    // Insert the custom link into the database
    await pool.query(
      'INSERT INTO shortened_urls (user_id, original_url, short_url) VALUES ($1, $2, $3)',
      [userId, original_link, custom_link]
    );

    res.status(200).json({
      code: 200,
      data: {
        original_link,
        converted_custom_link: `https://link-shortened.vercel.app/api/${custom_link}`
      }
    });
  } catch (error) {
    console.error('Error creating custom link:', error);
    res.status(500).json({
      response: 500,
      error: 'Internal server error'
    });
  }
});

// GET endpoint to fetch all custom links for the authenticated user
router.get('/aliases',async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await pool.query('SELECT original_url, short_url FROM shortened_urls WHERE user_id = $1', [userId]);

    const converted_custom_links = result.rows.reduce((acc, link, index) => {
      acc[index + 1] = {
        original_link: link.original_url,
        converted_custom_link: `https://link-shortened.vercel.app/api/${link.short_url}`
      };
      return acc;
    }, {});

    res.status(200).json({
      code: 200,
      converted_custom_links
    });
  } catch (error) {
    console.error('Error fetching custom links:', error);
    res.status(500).json({
      response: 500,
      error: 'Internal server error'
    });
  }
});

module.exports = router;
