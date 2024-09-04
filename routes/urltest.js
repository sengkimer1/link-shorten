const express = require('express');
const pool = require('../db'); // Import the pool object from db.js
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Authentication Middleware
const authenticateUser = async (req, res, next) => {
    const token = req.body.user_token;
    if (!token) {
        return res.status(401).json({ response: 401, error: "Unauthorized access, token missing" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ response: 401, error: "Invalid or expired token" });
    }
};

// Generate short URL
const generateShortUrl = () => crypto.randomBytes(4).toString('hex');

// Save URL in the database
const saveUrl = async (userId, originalUrl, shortUrl, lifespan) => {
    const expiryDate = lifespan > 0 ? `NOW() + INTERVAL '${lifespan} second'` : null;
    const query = `
        INSERT INTO urls (user_id, original_url, short_url, expiry_date)
        VALUES ($1, $2, $3, ${expiryDate ? expiryDate : 'NULL'})
    `;
    await pool.query(query, [userId, originalUrl, shortUrl]);
};

// Get all converted links for a user
const getAllConvertedLinks = async (userId) => {
    const result = await pool.query(`
        SELECT original_url, short_url FROM urls WHERE user_id = $1 AND (expiry_date IS NULL OR expiry_date > NOW())
    `, [userId]);
    return result.rows;
};

// Get original URL by short URL
const getOriginalUrl = async (shortUrl) => {
    const result = await pool.query(`
        SELECT original_url FROM urls WHERE short_url = $1 AND (expiry_date IS NULL OR expiry_date > NOW())
    `, [shortUrl]);
    return result.rows.length ? result.rows[0].original_url : null;
};

// Convert URL endpoint
router.post('/convert', authenticateUser, async (req, res) => {
    const { link, lifespan = 0 } = req.body;
    const { id: userId } = req.user;

    if (!link) {
        return res.status(400).json({ response: 400, error: "Link is required" });
    }

    const shortUrl = generateShortUrl();

    try {
        await saveUrl(userId, link, shortUrl, lifespan);
        return res.status(201).json({ response: 201, short_url: shortUrl });
    } catch (error) {
        return res.status(500).json({ response: 500, error: "Internal Server Error" });
    }
});

// Get all converted links endpoint
router.get('/links', authenticateUser, async (req, res) => {
    const { id: userId } = req.user;

    try {
        const links = await getAllConvertedLinks(userId);
        if (!links || links.length === 0) {
            return res.status(404).json({ response: 404, error: "No converted links found" });
        }

        const list_of_converted_links = links.reduce((acc, link) => {
            acc[link.original_url] = link.short_url;
            return acc;
        }, {});

        return res.status(200).json({ code: 200, list_of_converted_links });
    } catch (error) {
        return res.status(500).json({ response: 500, error: "Internal Server Error" });
    }
});

// Redirection endpoint
router.get('/shortUrl/:shortUrl', async (req, res) => {
    const { shortUrl } = req.params;

    try {
        const originalUrl = await getOriginalUrl(shortUrl);
        if (!originalUrl) {
            return res.status(404).json({ response: 404, error: "Short URL not found" });
        }

        return res.redirect(originalUrl);
    } catch (error) {
        return res.status(500).json({ response: 500, error: "Internal Server Error" });
    }
});

// Get expiration date of a short URL
router.get('/:shortUrl/expires', async (req, res) => {
    const { shortUrl } = req.params;
    try {
        const result = await pool.query(
            'SELECT expiry_date FROM urls WHERE short_url = $1',
            [shortUrl]
        );
        if (result.rows.length > 0) {
            res.status(200).json({
                code: 200,
                shortUrl,
                expires_at: result.rows[0].expiry_date
            });
        } else {
            res.status(404).json({ code: 404, error: 'URL not found' });
        }
    } catch (error) {
        console.error("Error during GET /:shortUrl/expires:", error.stack);
        res.status(500).json({ code: 500, error: 'Internal Server Error' });
    }
});

// Export the router to use in your main app file
module.exports = router;
