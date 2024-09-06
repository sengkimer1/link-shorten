const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const pool = require('../db');
const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET;

// Middleware to authenticate token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.error('JWT Verification Error:', err);  // Log the verification error
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// Function to generate short URL
const generateShortUrl = () => {
    return crypto.randomBytes(4).toString('hex');
};

// POST /convert route for shortening URL
router.post('/convert', authenticateToken, async (req, res) => {
    const { link } = req.body;
    try {
        const user = req.user;  // Get authenticated user from token
        if (!link) {
            return res.status(400).json({ response: 400, error: 'No link provided' });
        }

        const shortUrl = generateShortUrl();
        const shortened_link = `https://link-shortener-express.vercel.app/api/shorten/${shortUrl}`;

        // Insert the shortened URL into the database
        const result = await pool.query(
            'INSERT INTO shortened_urls (user_id, original_url, short_url, expires_at) VALUES ($1, $2, $3, $4) RETURNING *',
            [user.id, link, shortened_link, null]
        );

        console.log('Shortened URL inserted:', result.rows[0]);

        res.status(200).json({ code: 200, shortened_link });
    } catch (error) {
        console.error('Detailed error:', error);  // Log the full error for debugging
        res.status(500).json({ response: 500, error: 'Something went wrong', details: error.message });
    }
});

// GET /:shortUrl route for redirection
router.get('/:shortUrl',authenticateToken, async (req, res) => {
    const { shortUrl } = req.params;  // Correct param name
    try {
        // Fetch original URL from the database using the short URL
        const result = await pool.query('SELECT id, original_url, short_url, (expires_at > NOW()) AS is_active FROM shortened_urls WHERE short_url = $1', [shortUrl]);
        
        console.log("Database query result:", result.rows); 

        if (result.rows.length > 0 && result.rows[0].is_active) {
            res.redirect(result.rows[0].original_url);
        } else {
            res.status(404).json({ code: 404, error: 'URL not found or expired' });
        }
    } catch (error) {
        console.error("Error during GET /:shortUrl:", error.stack);
        res.status(500).json({ code: 500, error: 'Internal Server Error' });
    }
});

// GET /links route for retrieving user-specific URLs
router.get('/links', authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        // Fetch all links created by the authenticated user
        const result = await pool.query(
            'SELECT original_url, short_url FROM shortened_urls WHERE user_id = $1',
            [user.id]
        );
        
        const list_of_converted_links = {};
        result.rows.forEach(row => {
            list_of_converted_links[row.original_url] = row.short_url;
        });

        res.status(200).json({ code: 200, list_of_converted_links });
    } catch (error) {
        console.error('Detailed error:', error);
        res.status(500).json({ response: 500, error: 'Something went wrong' });
    }
});

module.exports = router;
