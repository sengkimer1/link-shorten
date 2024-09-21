const express = require('express');
const router = express.Router();
const pool = require('../db');
const authenticateToken = require('../models/token');

// Admin: Get all links
router.get('/links', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id AS user_id, u.username, l.original_url, l.short_url
       FROM users u
       JOIN shortened_urls l ON u.id = l.created_by`
    );

    const users = {};

    result.rows.forEach(row => {
      if (!users[`user_${row.user_id}`]) {
        users[`user_${row.user_id}`] = {
          username: row.username,
          list_of_converted_links: {}
        };
      }
      users[`user_${row.user_id}`].list_of_converted_links[row.original_url] = row.short_url;
    });

    res.status(200).json({ code: 200, users });
  } catch (error) {
    console.error('Admin links error:', error.message);
    res.status(500).json({ response: 500, error: 'Something went wrong' });
  }
});

// Delete a specific link (admin only)
router.delete('/links/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const linkCheck = await pool.query('SELECT * FROM shortened_urls WHERE id = $1', [id]);
    if (linkCheck.rows.length === 0) {
      return res.status(404).json({ code: 404, error: 'Link not found' });
    }

    await pool.query('DELETE FROM shortened_urls WHERE id = $1', [id]);
    res.status(200).json({ code: 200, message: 'Link deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 500, error: 'Something went wrong' });
  }
});

// Update a specific link (admin only)
router.put('/links/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { original_url, short_url } = req.body;

  try {
    const linkCheck = await pool.query('SELECT * FROM shortened_urls WHERE id = $1', [id]);
    if (linkCheck.rows.length === 0) {
      return res.status(404).json({ code: 404, error: 'Link not found' });
    }

    await pool.query(
      'UPDATE shortened_urls SET original_url = $1, short_url = $2 WHERE id = $3',
      [original_url, short_url, id]
    );

    res.status(200).json({ code: 200, message: 'Link updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 500, error: 'Something went wrong' });
  }
});

router.get('/links/view/:shortUrl', authenticateToken, async (req, res) => {
  const { shortUrl } = req.params;

  try {
    // Fetch the short URL details
    const result = await pool.query(
      'SELECT id, original_url, short_url, created_by, expires_at, click_count FROM shortened_urls WHERE short_url = $1',
      [shortUrl]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Short URL not found' });
    }

    const urlData = result.rows[0];

    // Increment the click count
    await pool.query('UPDATE shortened_urls SET click_count = click_count + 1 WHERE short_url = $1', [shortUrl]);

    return res.json({
      id: urlData.id,
      shortUrl: urlData.short_url,
      originalUrl: urlData.original_url,
      startDate: urlData.created_by,  // Corrected field name for creation date
      expiryDate: urlData.expires_at,
      clickCount: urlData.click_count + 1  // Incremented click count in response
    });
  } catch (error) {
    console.error('Error fetching URL information:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
