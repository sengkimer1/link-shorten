
// const express = require('express');
// const { Client } = require('pg');
// const app = express();

// const client = new Client({
//     host: "62.72.46.248",
//     user: "wmad_students",
//     port: 5432,
//     password: "WMAD@#students2023",
//     database: "pbls"
// });
// module.exports = client;

// app.use(express.json());

// client.connect(err => {
//     if (err) {
//         console.error('Connection error', err.stack);
//         return;
//     } else {
//         console.log('Connected to the database');
//     }
// });

// module.exports = client;

// // GET all Users
// app.get('/api/users', async (req, res) => {
//     try {
//         const result = await client.query('SELECT id, username, email FROM users');
//         res.json(result.rows);
//     } catch (err) {
//         console.error(err.message);
//         res.status(500).send('Error fetching user data');
//     }
// });

// // GET a User by ID
// app.get('/api/users/:id', async (req, res) => {
//     const userId = req.params.id;
//     try {
//         const result = await client.query('SELECT id, username, email FROM users WHERE id = $1', [userId]);
//         if (result.rows.length === 0) {
//             res.status(404).send('The user with the given ID was not found.');
//         } else {
//             res.json(result.rows[0]);
//         }
//     } catch (err) {
//         console.error(err.message);
//         res.status(500).send('Error fetching user data');
//     }
// });

// // POST Users
// app.post('/api/users', async (req, res) => {
//     const data = req.body;
//     try {
//         const queries = data.map(item => {
//             const { id, username, email } = item;
//             return client.query('INSERT INTO users(id, username, email) VALUES ($1, $2, $3)', [id, username, email]);
//         });
//         await Promise.all(queries);
//         res.send("Users added successfully");
//     } catch (error) {
//         console.error(error.message);
//         res.status(500).send(error.message);
//     }
// });

// // PUT (update) an existing User

// app.put('/api/users/:id', async (req, res) => { 
//     const id = req.params.id;
//     const { username, email } = req.body;

//     const update_query = "UPDATE users SET username = $2, email = $3 WHERE id = $1 RETURNING *";
    
//     try {
//         const result = await client.query(update_query, [id, username, email]);
//         res.json(result.rows[0]);
//     } catch (err) {
//         console.error(err.message);
//         res.status(500).send('Error updating user data');
//     }
// });


// // DELETE a User
// app.delete('/api/users/:id', async (req, res) => {
//     const userId = req.params.id;
//     try {
//         const result = await client.query('DELETE FROM users WHERE id = $1 RETURNING *', [userId]);
//         if (result.rows.length === 0) {
//             res.status(404).send('The user with the given ID was not found.');
//         } else {
//             res.json(result.rows[0]);
//         }
//     } catch (err) {
//         console.error(err.message);
//         res.status(500).send('Error deleting user data');
//     }
// });

// // Start the server
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });

const express = require('express');
const { Client } = require('pg');
require('dotenv').config(); // For environment variables
const app = express();

const client = new Client({
    host: "62.72.46.248",
    user: "wmad_students",
    port: 5432,
    password: "WMAD@#students2023",
    database: "pbls"
});

app.use(express.json());

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
    try {
        await client.query('BEGIN'); // Start transaction
        const queries = data.map(item => {
            const { id, username, email } = item;
            return client.query('INSERT INTO users(id, username, email) VALUES ($1, $2, $3)', [id, username, email]);
        });
        await Promise.all(queries);
        await client.query('COMMIT'); // Commit transaction
        res.send("Users added successfully");
    } catch (error) {
        await client.query('ROLLBACK'); // Rollback transaction on error
        console.error(error.message);
        res.status(500).send(error.message);
    }
});

// PUT (update) an existing User
app.put('/api/users/:id', async (req, res) => {
    const id = req.params.id;
    const { username, email } = req.body;

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
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

