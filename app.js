const express = require('express');
const { Client } = require('pg');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(helmet()); // Adds security headers

// Database client setup
const client = new Client({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});

// Connect to the database
client.connect(err => {
    if (err) {
        console.error('Connection error', err.stack);
        process.exit(1); // Exit the process if unable to connect
    } else {
        console.log('Connected to the database');
    }
});

// GET all Users
app.get('/api/users', async (req, res) => {
    try {
        const result = await client.query('SELECT id, username, email FROM users');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error fetching user data');
    }
});

// GET a User by ID
app.get('/api/users/:id', async (req, res) => {
    const userId = req.params.id;
    try {
        const result = await client.query('SELECT id, username, email FROM users WHERE id = $1', [userId]);
        if (result.rows.length === 0) {
            res.status(404).send('The user with the given ID was not found.');
        } else {
            res.json(result.rows[0]);
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error fetching user data');
    }
});

// POST Users
app.post('/api/users', async (req, res) => {
    const data = req.body;

    // Log incoming request for debugging
    console.log('Received data:', data);

    // Validate data (simple validation)
    if (!Array.isArray(data) || data.some(user => 
        typeof user.id !== 'number' ||
        typeof user.username !== 'string' ||
        typeof user.email !== 'string'
    )) {
        return res.status(400).send('Invalid data format');
    }

    try {
        await client.query('BEGIN'); // Start transaction

        // Execute queries
        const queries = data.map(item => {
            const { id, username, email } = item;
            return client.query('INSERT INTO users(id, username, email) VALUES ($1, $2, $3)', [id, username, email]);
        });

        await Promise.all(queries);
        await client.query('COMMIT'); // Commit transaction

        res.send("Users added successfully");
    } catch (error) {
        await client.query('ROLLBACK'); // Rollback transaction on error

        // Log detailed error information
        console.error('Error adding users:', error);

        res.status(500).send(`Error adding users: ${error.message}`);
    }
});


// PUT (update) an existing User
app.put('/api/users/:id', async (req, res) => {
    const id = req.params.id;
    const { username, email } = req.body;

    if (!username || !email) {
        return res.status(400).send('Invalid data format');
    }

    const update = "UPDATE users SET username = $2, email = $3 WHERE id = $1 RETURNING *";
    
    try {
        const result = await client.query(update, [id, username, email]);
        if (result.rows.length === 0) {
            res.status(404).send('The user with the given ID was not found.');
        } else {
            res.json(result.rows[0]);
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error updating user data');
    }
});

// DELETE a User
app.delete('/api/users/:id', async (req, res) => {
    const userId = req.params.id;
    try {
        const result = await client.query('DELETE FROM users WHERE id = $1 RETURNING *', [userId]);
        if (result.rows.length === 0) {
            res.status(404).send('The user with the given ID was not found.');
        } else {
            res.json(result.rows[0]);
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error deleting user data');
    }
});

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

