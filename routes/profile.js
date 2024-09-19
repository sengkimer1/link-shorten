
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
};// Profile Page - Get user details (username and email)
router.get('/profile', authenticateToken, async (req, res) => {
    const userId = req.user.id;

    try {
        const query = 'SELECT username, email FROM users WHERE id = $1';
        const values = [userId];

        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { username, email } = result.rows[0];
        res.status(200).json({ username, email });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
