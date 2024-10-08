const express = require('express');
const router = express.Router();
const pool = require('../db');
const authenticateToken = require('../models/token')


// POST route to create a custom alias
router.post('/custom-aliases', authenticateToken, async (req, res) => {
    const { original_link, custom_link } = req.body;
    const userId = req.user.id;
    if (!original_link || !custom_link) {
        return res.status(400).json({ error: 'Original link and custom link are required' });
    }
    try {
        const result = await pool.query(
            'SELECT * FROM custom_links WHERE custom_link = $1 AND user_id = $2',
            [custom_link, userId]
        );

        if (result.rows.length > 0) {
            return res.status(400).json({ error: 'Custom link already exists' });
        }
        await pool.query(
            'INSERT INTO public.custom_links(user_id, original_link, custom_link) VALUES ($1, $2, $3)',
            [userId, original_link, custom_link]
        );

        res.status(200).json({
            code: 200,
            data: {
                original_link,
                converted_custom_link: `https://link-shorten-two.vercel.app/api/custom/${custom_link}`
            }
        });
    } catch (error) {
        res.status(500).json({ response: 500, error: 'Internal Server Error' });
    }
});

// GET route to retrieve all custom aliases for the logged-in user
router.get('/custom-aliases', authenticateToken, async (req, res) => {
    const userId = req.user.id;

    try {
        const result = await pool.query(
            'SELECT * FROM custom_links WHERE user_id = $1',
            [userId]
        );

        const converted_custom_links = result.rows.map((row) => ({
            original_link: row.original_link,
            converted_custom_link: `https://link-shorten-two.vercel.app/api/custom/${row.custom_link}`
        }));

        res.status(200).json({
            code: 200,
            converted_custom_links
        });
    } catch (error) {
        res.status(500).json({ response: 500, error: 'Internal Server Error' });
    }
});

// NEW: GET route to redirect custom links to the original URL
router.get('/:customLink', async (req, res) => {
    const { customLink } = req.params;

    try {
        const result = await pool.query(
            'SELECT original_link FROM custom_links WHERE custom_link = $1',
            [customLink]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Custom link not found' });
        }

        const originalLink = result.rows[0].original_link;
        res.redirect(originalLink);
    } catch (error) {
        res.status(500).json({ response: 500, error: 'Internal Server Error' });
    }
});

module.exports = router;
