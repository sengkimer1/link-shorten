const express = require('express');
const router = express.Router();
const pool = require('../db');
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

// Admin: Get all links
router.get('/links', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id AS user_id, u.username, l.original_url, l.short_url
       FROM users u
       JOIN shortened_urls l ON u.id = l.user_id`
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

    res.status(200).json({
      code: 200,
      users
    });
  } catch (error) {
    console.error('Admin links error:', error.message);
    res.status(500).json({ response: 500, error: 'Something went wrong' });
  }
});

// Delete a specific link (admin only)
router.delete('/links/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Check if the link exists
    const linkCheck = await pool.query('SELECT * FROM shortened_urls WHERE id = $1', [id]);
    if (linkCheck.rows.length === 0) {
      return res.status(404).json({ code: 404, error: 'Link not found' });
    }

    // Proceed to delete the link
    await pool.query('DELETE FROM shortened_urls WHERE id = $1', [id]);

    res.status(200).json({ code: 200, message: 'Link deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 500, error: 'Something went wrong' });
  }
});

// Update a specific link (admin only)
router.put('/links/:id', async (req, res) => {
  const { id } = req.params;
  const { original_url, short_url } = req.body;

  try {
    // Check if the link exists
    const linkCheck = await pool.query('SELECT * FROM shortened_urls WHERE id = $1', [id]);
    if (linkCheck.rows.length === 0) {
      return res.status(404).json({ code: 404, error: 'Link not found' });
    }

    // Update the link in the database
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

module.exports = router;
