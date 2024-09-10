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
    const { username, email, password } = req.body;
    console.log('Received signup request:', { username, email });

    try {
        console.time('Hashing password');
        const hashedPassword = await bcrypt.hash(password, 10);
        console.timeEnd('Hashing password');

        console.time('Inserting user into database');
        const result = await pool.query(
            'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *',
            [username, email, hashedPassword]
        );
        console.timeEnd('Inserting user into database');

        res.status(201).json({ message: 'User created successfully', user: result.rows[0] });
    } catch (error) {
        console.error('Signup error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// User login route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    console.log('Received login request:', { email });

    try {
        console.time('Querying user from database');
        const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        console.timeEnd('Querying user from database');

        const user = userResult.rows[0];
        if (!user) {
            console.log('Login failed: User not found');
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        console.time('Comparing passwords');
        const isMatch = await bcrypt.compare(password, user.password);
        console.timeEnd('Comparing passwords');

        if (!isMatch) {
            console.log('Login failed: Incorrect password');
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '12h' });
        res.json({ message: 'Logged in successfully', token });
    } catch (error) {
        console.error('Login error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
