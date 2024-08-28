// const express = require('express');
// const crypto = require('crypto');
// const app = express();
// require('dotenv').config();
// const { Pool } = require('pg');
// const cors = require('cors');

// app.use(cors());
// app.use(express.json());

// const pool = new Pool({
//     connectionString: process.env.DATABASE_URL,
// });

// app.post('/api/shorten', async (req, res) => {
//     const { link } = req.body;
  
//     if (!link) {
//         return res.status(400).json({
//             code: 400,
//             error: 'Link is required'
//         });
//     }
  
//     try {
//         const shortUrl = crypto.randomBytes(4).toString('hex');
//         const expiresAt = new Date(Date.now() + 60 * 60000); 
  
//         await pool.query(
//             'INSERT INTO shortened_urls (original_url, short_url, expires_at) VALUES ($1, $2, $3)',
//             [link, shortUrl, expiresAt]
//         );
  
//         res.status(200).json({
//             code: 200,
//             shortened_link: `https://your-domain.com/${shortUrl}`,
//             lifespan: 60
//         });
//     } catch (error) {
//         console.error("Error during POST /api/shorten:", error.stack);
//         res.status(500).json({
//             code: 500,
//             error: 'Internal Server Error'
//         });
//     }
// });

// app.get('/api/shortUrl/:shortUrl', async (req, res) => {
//     const { shortUrl } = req.params;
//     console.log("Received shortUrl:", shortUrl);

//     try {
//         const result = await pool.query(
//             'SELECT id, original_url, short_url, expires_at > NOW() AS is_active FROM shortened_urls WHERE short_url = $1',
//             [shortUrl]
//         );

//         if (result.rows.length > 0 && result.rows[0].is_active) {
//             res.redirect(result.rows[0].original_url);
//         } else {
//             res.status(404).json({
//                 code: 404,
//                 error: 'URL not found or expired'
//             });
//         }
//     } catch (error) {
//         console.error("Error during GET /api/shortUrl:", error.stack);
//         res.status(500).json({
//             code: 500,
//             error: 'Internal Server Error'
//         });
//     }
// });

// module.exports = app;

const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken'); // Add this line
const app = express();
require('dotenv').config();
const { Pool } = require('pg');
const cors = require('cors');

app.use(cors());
app.use(express.json());

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Dummy user data for demonstration
const dummyUser = {
    username: 'test',
    email: 'test@gmail.com',
    password: 'test' // In a real app, passwords should be hashed
};

// Login route
app.post('/api/login', (req, res) => {
    const { username, email, password } = req.body;

    if (username === dummyUser.username && email === dummyUser.email && password === dummyUser.password) {
        // Generate a token
        const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({
            response: 200,
            token: token
        });
    } else {
        res.status(401).json({
            response: 401,
            error: 'Invalid credentials'
        });
    }
});

// Existing shorten URL route
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
        const expiresAt = new Date(Date.now() + 60 * 60000);

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

// Existing redirect route
app.get('/api/shortUrl/:shortUrl', async (req, res) => {
    const { shortUrl } = req.params;
    console.log("Received shortUrl:", shortUrl);

    try {
        const result = await pool.query(
            'SELECT id, original_url, short_url, expires_at > NOW() AS is_active FROM shortened_urls WHERE short_url = $1',
            [shortUrl]
        );

        if (result.rows.length > 0 && result.rows[0].is_active) {
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

// Start the server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
