const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const pool = require('../db');
const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
}

// Middleware to authenticate token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.error('JWT Verification Error:', err);
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// Function to generate short URL
const generateShortUrl = () => crypto.randomBytes(4).toString('hex');

// POST /convert route for shortening URL
router.post('/convert', authenticateToken, async (req, res) => {
    const { link } = req.body;
    try {
        if (!link) {
            return res.status(400).json({ error: 'No link provided' });
        }

        const user = req.user;
        const expiresAt = new Date(Date.now() + 60 * 60000);

        const shortUrl = generateShortUrl();
        const shortened_link = `${shortUrl}`;

        const result = await pool.query(
            'INSERT INTO shortened_urls (user_id, original_url, short_url, expires_at) VALUES ($1, $2, $3, $4) RETURNING *',
            [user.id, link, shortened_link, expiresAt]
        );

        console.log('Shortened URL inserted:', result.rows[0]);
        res.status(200).json({ shortened_link });
    } catch (error) {
        console.error('Error during POST /convert:', error);
        res.status(500).json({ error: 'Something went wrong', details: error.message });
    }
});
router.get('/:shortUrl', authenticateToken, async (req, res) => {
    const { shortUrl } = req.params;
    console.log('Requested shortUrl:', shortUrl); // Log the shortUrl
    try {

        const result = await pool.query(
            `SELECT id,original_url,short_url,expires_at > NOW() AS is_active FROM shortened_urls WHERE short_url = $1`, [shortUrl]);
        console.log('Query result:', result.rows);

        if (result.rows.length > 0) {
            const { original_url, is_active, expires_at, current_time } = result.rows[0];


            console.log(`URL Expires At: ${expires_at}, Current Time: ${current_time}`);

            if (is_active) {
                res.redirect(original_url); // URL is active, so redirect
            } else {
                res.status(404).json({ code: 404, error: 'URL has expired' });
            }
        } else {
            res.status(404).json({ code: 404, error: 'URL not found' });
        }
    } catch (error) {
        console.error('Error during GET /:shortUrl:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// GET /links route for retrieving user-specific URLs
router.get('/links', authenticateToken, async (req, res) => {
    try {
        const user = req.user;
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
        console.error('Error during GET /links:', error);
        res.status(500).json({ error: 'Something went wrong' });
    }
});


module.exports = router;
