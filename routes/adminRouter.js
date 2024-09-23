const express = require('express');
const router = express.Router();
const pool = require('../db');
const authenticateToken = require('../models/token');

// Admin: Get all links and user id 
router.get('/links', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.id AS user_id, u.username, l.original_url, l.short_url, l.click_count
      FROM users u
      JOIN shortened_urls l ON u.id = l.created_by
    `);
    const users = {};
    result.rows.forEach(row => {
      if (!users[`user_${row.user_id}`]) {
        users[`user_${row.user_id}`] = {
          username: row.username,
          list_of_converted_links: []
        };
      }
      users[`user_${row.user_id}`].list_of_converted_links.push({
        original_url: row.original_url,
        short_url: row.short_url,
        click_count: row.click_count
      });
    });

    res.status(200).json({ code: 200, users });
  } catch (error) {
    res.status(500).json({ response: 500, error: 'Something went wrong' });
  }
});
//Admin: Get link all 
router.get('/link_all', authenticateToken, async (req, res) => {
  try {
    const result= await pool.query(
      `SELECT l.short_url, l.click_count
       FROM shortened_urls l
       order by l.id DESC`
    );
    const links = result.rows.map(row => ({
      short_url: row.short_url,
      click_count: row.click_count
    }));
    res.status(200).json({ code: 200, links });
  } catch (error) {
    res.status(500).json({ response: 500, error: 'Something went wrong' });
  }
});
//Admin: Get all link by id
router.get('/link_all/:id', authenticateToken, async (req, res) => {
  const { id } = req.params; 
  try {
    const result = await pool.query(
      `SELECT l.short_url, l.click_count
       FROM shortened_urls l
       WHERE l.id = $1`, 
      [id] 
    );

    const links = result.rows.map(row => ({
      short_url: row.short_url,
      click_count: row.click_count
    }));

    res.status(200).json({ code: 200, links });
  } catch (error) {
    res.status(500).json({ response: 500, error: 'Something went wrong' });
  }
});
// Admin: Delete a specific link (admin only)
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
    res.status(500).json({ code: 500, error: 'Something went wrong' });
  }
});

//Admin: Update a specific link (admin only)
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
    res.status(500).json({ code: 500, error: 'Something went wrong' });
  }
});
//Admin: view information by short url 
router.get('/links/view/:shortUrl', authenticateToken, async (req, res) => {
  const { shortUrl } = req.params;

  try {
    const result = await pool.query(
      'SELECT id, original_url, short_url, created_by, expires_at, click_count FROM shortened_urls WHERE short_url = $1',
      [shortUrl]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Short URL not found' });
    }

    const urlData = result.rows[0];
    return res.json({
      id: urlData.id,
      shortUrl: urlData.short_url,
      originalUrl: urlData.original_url,
      startDate: urlData.created_by,  
      expiryDate: urlData.expires_at,
      clickCoun:urlData.click_count
    });
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
});
//Admin: Post for count click 
router.post("/count/:shortUrl", authenticateToken, async (req, res) => {
  const { shortUrl } = req.params; 

  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    await pool.query(
      'UPDATE shortened_urls SET click_count = click_count + 1 WHERE short_url = $1',
      [shortUrl]
    );
    const result = await pool.query(
      'SELECT click_count FROM shortened_urls WHERE short_url = $1',
      [shortUrl]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'URL not found' });
    }
    return res.json({
      message: 'Click count updated',
      clickCount: result.rows[0].click_count
    });

  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
