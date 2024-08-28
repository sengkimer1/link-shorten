// const express = require('express');
// const { Client } = require('pg');
// const cors = require('cors');
// const morgan = require('morgan');
// // const helmet = require('helmet');
// require('dotenv').config();
// const crypto = require('crypto');

// const app = express();

// // Middleware
// app.use(cors());
// app.use(express.json());
// app.use(morgan('dev'));
// // app.use(helmet());

// // Database client setup
// const client = new Client({
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     port: process.env.DB_PORT,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_DATABASE
// });

// // Connect to the database
// client.connect(err => {
//     if (err) {
//         console.error('Connection error', err.stack);
//         process.exit(1); // Exit the process if unable to connect
//     } else {
//         console.log('Connected to the database');
//     }
// });
// app.post('/api/shorten', async (req, res) => {
//     const { link } = req.body;
    
//     if (!link) {
//       return res.status(400).json({
//         code: 400,
//         error: 'Link is required'
//       });
//     }
  
//     try {
//       // Generate a unique short URL
//       const shortUrl = crypto.randomBytes(4).toString('hex');
//       const expiresAt = new Date(Date.now() + 60 * 60000); // 60 minutes from now
  
//       await pool.query(
//         'INSERT INTO shortened_urls (original_url, short_url, expires_at) VALUES ($1, $2, $3)',
//         [link, shortUrl, expiresAt]
//       );
  
//       res.status(200).json({
//         code: 200,
//         shortened_link: `https://your-domain.com/${shortUrl}`,
//         lifespan: 60
//       });
//     } catch (error) {
//       res.status(500).json({
//         code: 500,
//         error: 'Internal Server Error'
//       });
//     }
//   });
  
//   app.get('/:shortUrl', async (req, res) => {
//     const { shortUrl } = req.params;
  
//     try {
//       const result = await pool.query(
//         'SELECT original_url FROM shortened_urls WHERE short_url = $1 AND expires_at > NOW()',
//         [shortUrl]
//       );
  
//       if (result.rows.length > 0) {
//         res.redirect(result.rows[0].original_url);
//       } else {
//         res.status(404).json({
//           code: 404,
//           error: 'URL not found or expired'
//         });
//       }
//     } catch (error) {
//       res.status(500).json({
//         code: 500,
//         error: 'Internal Server Error'
//       });
//     }
//   });




// // // GET all Users
// // app.get('/api/users', async (req, res) => {
// //     try {
// //         const result = await client.query('SELECT id, username, email FROM users');
// //         res.json(result.rows);
// //     } catch (err) {
// //         console.error(err.message);
// //         res.status(500).send('Error fetching user data');
// //     }
// // });

// // // GET a User by ID
// // app.get('/api/users/:id', async (req, res) => {
// //     const userId = req.params.id;
// //     try {
// //         const result = await client.query('SELECT id, username, email FROM users WHERE id = $1', [userId]);
// //         if (result.rows.length === 0) {
// //             res.status(404).send('The user with the given ID was not found.');
// //         } else {
// //             res.json(result.rows[0]);
// //         }
// //     } catch (err) {
// //         console.error(err.message);
// //         res.status(500).send('Error fetching user data');
// //     }
// // });

// // // POST Users
// // app.post('/api/users', async (req, res) => {
// //     const data = req.body;

// //     // Log incoming request for debugging
// //     console.log('Received data:', data);

// //     // Validate data (simple validation)
// //     if (!Array.isArray(data) || data.some(user => 
// //         typeof user.id !== 'number' ||
// //         typeof user.username !== 'string' ||
// //         typeof user.email !== 'string'
// //     )) {
// //         return res.status(400).send('Invalid data format');
// //     }

// //     try {
// //         await client.query('BEGIN'); // Start transaction

// //         // Execute queries
// //         const queries = data.map(item => {
// //             const { id, username, email } = item;
// //             return client.query('INSERT INTO users(id, username, email) VALUES ($1, $2, $3)', [id, username, email]);
// //         });

// //         await Promise.all(queries);
// //         await client.query('COMMIT'); // Commit transaction

// //         res.send("Users added successfully");
// //     } catch (error) {
// //         await client.query('ROLLBACK'); // Rollback transaction on error

// //         // Log detailed error information
// //         console.error('Error adding users:', error);

// //         res.status(500).send(`Error adding users: ${error.message}`);
// //     }
// // });


// // // PUT (update) an existing User
// // app.put('/api/users/:id', async (req, res) => {
// //     const id = req.params.id;
// //     const { username, email } = req.body;

// //     if (!username || !email) {
// //         return res.status(400).send('Invalid data format');
// //     }

// //     const update = "UPDATE users SET username = $2, email = $3 WHERE id = $1 RETURNING *";
    
// //     try {
// //         const result = await client.query(update, [id, username, email]);
// //         if (result.rows.length === 0) {
// //             res.status(404).send('The user with the given ID was not found.');
// //         } else {
// //             res.json(result.rows[0]);
// //         }
// //     } catch (err) {
// //         console.error(err.message);
// //         res.status(500).send('Error updating user data');
// //     }
// // });

// // // DELETE a User
// // app.delete('/api/users/:id', async (req, res) => {
// //     const userId = req.params.id;
// //     try {
// //         const result = await client.query('DELETE FROM users WHERE id = $1 RETURNING *', [userId]);
// //         if (result.rows.length === 0) {
// //             res.status(404).send('The user with the given ID was not found.');
// //         } else {
// //             res.json(result.rows[0]);
// //         }
// //     } catch (err) {
// //         console.error(err.message);
// //         res.status(500).send('Error deleting user data');
// //     }
// // });

// // Start the server
// const PORT = process.env.PORT || 4000;
// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });


const express = require('express');
const crypto = require('crypto');
const app = express();
require('dotenv').config();
const { Pool } = require('pg');
const cors = require('cors');

app.use(cors());
app.use(express.json());

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

app.post('/api/shorten', async (req, res) => {
    const { link } = req.body;
  
    if (!link) {
        return res.status(400).json({
            code: 400,
            error: 'Link is required'
        });
    }
  
    try {
        const shortUrl = crypto.randomBytes(4).toString('hex');
        const expiresAt = new Date(Date.now() + 60 * 60000); // 1 hour from now
  
        await pool.query(
            'INSERT INTO shortened_urls (original_url, short_url, expires_at) VALUES ($1, $2, $3)',
            [link, shortUrl, expiresAt]
        );
  
        res.status(200).json({
            code: 200,
            shortened_link: `https://your-domain.com/${shortUrl}`,
            lifespan: 60
        });
    } catch (error) {
        console.error("Error during POST /api/shorten:", error.stack);
        res.status(500).json({
            code: 500,
            error: 'Internal Server Error'
        });
    }
});

app.get('/api/shortUrl/:shortUrl', async (req, res) => {
    const { shortUrl } = req.params;
    console.log("Received shortUrl:", shortUrl);
    
    try {
        const result = await pool.query(
            'SELECT original_url FROM shortened_urls WHERE short_url = $1 AND expires_at > NOW()',
            [shortUrl]
        );
  
        if (result.rows.length > 0) {
            res.redirect(result.rows[0].original_url);
        } else {
            res.status(404).json({
                code: 404,
                error: 'URL not found or expired'
            });
        }
    } catch (error) {
        console.error("Error during GET /api/shortUrl:", error.stack);
        res.status(500).json({
            code: 500,
            error: 'Internal Server Error'
        });
    }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

