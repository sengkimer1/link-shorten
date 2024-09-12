const express = require('express');
const router = express.Router();
const pool = require('../db');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
}

// Token authentication middleware
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

// POST route to create a custom alias
router.post('/custom-aliases', authenticateToken, async (req, res) => {
    const { original_link, custom_link } = req.body;
    const userId = req.user.id;

    // Check for missing fields
    if (!original_link || !custom_link) {
        return res.status(400).json({ error: 'Original link and custom link are required' });
    }

    try {
        // Check if the custom link already exists for the user
        const result = await pool.query(
            'SELECT * FROM custom_links WHERE custom_link = $1 AND user_id = $2',
            [custom_link, userId]
        );

        if (result.rows.length > 0) {
            return res.status(400).json({ error: 'Custom link already exists' });
        }

        // Insert new custom link
        await pool.query(
            'INSERT INTO public.custom_links(user_id, original_link, custom_link) VALUES ($1, $2, $3)',
            [userId, original_link, custom_link]
        );

        res.status(200).json({
            code: 200,
            data: {
                original_link,
                converted_custom_link: `https://link-shorten-two.vercel.app/api/short/${custom_link}`
            }
        });
    } catch (error) {
        console.error('Error during custom alias creation:', error);
        res.status(500).json({ response: 500, error: 'Internal Server Error' });
    }
});
// GET route to retrieve all custom aliases for the logged-in user
router.get('/custom-aliases', authenticateToken, async (req, res) => {
    const userId = req.user.id;

    try {
        // Retrieve all custom links for the user
        const result = await pool.query(
            'SELECT * FROM custom_links WHERE user_id = $1',
            [userId]
        );

        const converted_custom_links = result.rows.map((row) => ({
            original_link: row.original_link,
            converted_custom_link: `https://link-shorten-two.vercel.app/api/short/${row.custom_link}`
        }));

        res.status(200).json({
            code: 200,
            converted_custom_links
        });
    } catch (error) {
        console.error('Error fetching custom aliases:', error);
        res.status(500).json({ response: 500, error: 'Internal Server Error' });
    }
});

module.exports = router;
