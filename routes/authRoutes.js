const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
}
// User signup route
router.post('/signup', async (req, res) => {
    const { username, email, password, role = "user" } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
            [username, email, hashedPassword, role] 
        );
        const user = result.rows[0];
        // Generate JWT token
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '12h' });

        res.status(201).json({
            message: 'User created successfully',
            user: { id: user.id, username: user.username, email: user.email, role: user.role },
            token  
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// User login route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = userResult.rows[0];
        if (!user) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign({ id: user.id, email: user.email,role:user.role }, JWT_SECRET, { expiresIn: '12h' });
        res.json({ message: 'Logged in successfully', token, userId: user.id, role:user.role});    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
module.exports = router;
