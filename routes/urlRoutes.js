// const express = require('express');
// const router = express.Router();
// const jwt = require('jsonwebtoken');
// const pool = require('../db');
// const crypto = require('crypto');

// // const JWT_SECRET = process.env.JWT_SECRET;
// // if (!JWT_SECRET) {
// //     throw new Error('JWT_SECRET is not defined');
// // }

// // const authenticateToken = (req, res, next) => {
// //     const authHeader = req.headers['authorization'];
// //     const token = authHeader && authHeader.split(' ')[1];
// //     if (!token) {
// //         return res.status(401).json({ error: 'No token provided' });
// //     }

// //     jwt.verify(token, JWT_SECRET, (err, user) => {
// //         if (err) {
// //             console.error('JWT Verification Error:', err.message);
// //             return res.status(403).json({ error: 'Invalid token', details: err.message });
// //         }
// //         req.user = user;
      
// //         next();
// //     });
// // };



// const JWT_SECRET = process.env.JWT_SECRET;
// if (!JWT_SECRET) {
//     throw new Error('JWT_SECRET is not defined');
// }

// const authenticateToken = (req, res, next) => {
//     const authHeader = req.headers['authorization'];

//     // Check if the authorization header is present and starts with "Bearer "
//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//         return res.status(401).json({ error: 'Authorization header must start with "Bearer "' });
//     }

//     // Extract the token after "Bearer "
//     const token = authHeader.split(' ')[1];

//     // Verify the token
//     jwt.verify(token, JWT_SECRET, (err, user) => {
//         if (err) {
//             console.error('JWT Verification Error:', err.message);
//             return res.status(403).json({ error: 'Invalid token', details: err.message });
//         }

//         // Store user information in the request object for further use
//         req.user = user;
        
//         // Proceed to the next middleware
//         next();
//     });
// };

// module.exports = authenticateToken;


// const generateShortUrl = () => crypto.randomBytes(4).toString('hex');


// router.get('/linked',authenticateToken, async (req, res) => {
//     console.log("ehlo")
//     try {
//         const userId = req.user.id;
//         console.log(userId,"===userid")
     
//         const result = await pool.query(
//             'SELECT original_url, short_url FROM shortened_urls WHERE user_id = $1',
//             [userId]
//         );

//         if (result.rows.length > 0) {
//             const listOfConvertedLinks = {};
//             result.rows.forEach((row) => {
//                 listOfConvertedLinks[row.original_url] = row.short_url;
//             });

//             res.status(200).json({
//                 code: 200,
//                 list_of_converted_links: listOfConvertedLinks
//             });
//         } else {
//             res.status(404).json({
//                 response: 404,
//                 error: 'No converted links found for this user'
//             });
//         }
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ response: 500, error: 'Server error' });
//     }
// });

// // Convert long URL to short URL
// router.post('/convert', authenticateToken, async (req, res) => {
//     const { link } = req.body;
//     try {
//         if (!link) {
//             return res.status(400).json({ error: 'No link provided' });
//         }

//         const user = req.user;
//         const expiresAt = new Date(Date.now() + 120 * 60000); // 2 hours
//         const shortUrl = generateShortUrl();

//         const result = await pool.query(
//             'INSERT INTO shortened_urls (user_id, original_url, short_url, expires_at) VALUES ($1, $2, $3, $4) RETURNING *',
//             [user.id, link, shortUrl, expiresAt]
//         );

//         const shortenedLink = `https://link-shorten-two.vercel.app/api/short/${shortUrl}`;
//         res.status(200).json({ shortened_link: shortenedLink });
//     } catch (error) {
//         console.error('Error during POST /convert:', error);
//         res.status(500).json({ error: 'Something went wrong', details: error.message });
//     }
// });
// router.get('/:shortUrl', authenticateToken, async (req, res) => {
//     try {
//         const { shortUrl } = req.params;
//         const userId = req.user.id; 

//         const result = await pool.query(
//             'SELECT original_url FROM shortened_urls WHERE short_url = $1 AND user_id = $2',
//             [shortUrl, userId]
//         );

//         if (result.rows.length > 0) {
//             // Redirect to the original URL
//             res.redirect(result.rows[0].original_url);
//         } else {
//             // No URL found for the user
//             res.status(404).json({ error: 'Link not found for this user' });
//         }
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Server error' });
//     }
// });

// // Get expiration date of a short URL
// router.get('/:shortUrl/expires', async (req, res) => {
//     const { shortUrl } = req.params;
//     try {
//         const result = await pool.query(
//             'SELECT expires_at FROM shortened_urls WHERE short_url = $1',
//             [shortUrl]
//         );
//         if (result.rows.length > 0) {
//             res.status(200).json({
//                 code: 200,
//                 shortUrl,
//                 expires_at: result.rows[0].expires_at
//             });
//         } else {
//             res.status(404).json({ code: 404, error: 'URL not found' });
//         }
//     } catch (error) {
//         console.error("Error during GET /api/shorten/expires:", error.stack);
//         res.status(500).json({ code: 500, error: 'Internal Server Error' });
//     }
// });





// module.exports = router;


const express = require('express');
const router = express.Router();
const pool = require('../db');
const crypto = require('crypto');
const authenticateToken = require('../models/token')


const generateShortUrl = () => crypto.randomBytes(4).toString('hex');

// Convert long URL to short URL for authenticated user
router.post('/convert', authenticateToken, async (req, res) => {
    const { link } = req.body;
    try {
        if (!link) {
            return res.status(400).json({ error: 'No link provided' });
        }

        const user = req.user;
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 1 week
        const shortUrl = generateShortUrl();

        const result = await pool.query(
            'INSERT INTO shortened_urls (user_id, original_url, short_url, expires_at, created_by) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [user.id, link, shortUrl, expiresAt, user.id] // Assuming created_by is user.id
        );
        

        const shortenedLink = `https://link-shorten-two.vercel.app/api/short/${shortUrl}`;
        res.status(200).json({ shortened_link: shortenedLink });
    } catch (error) {
        console.error('Error during POST /convert:', error);
        res.status(500).json({ error: 'Something went wrong', details: error.message });
    }
});
router.get('/linked', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await pool.query(
            'SELECT original_url, short_url FROM shortened_urls WHERE user_id = $1',
            [userId]
        );

        if (result.rows.length > 0) {
            const listOfConvertedLinks = {};
            result.rows.forEach((row) => {
                listOfConvertedLinks[row.original_url] = row.short_url;
            });

            res.status(200).json({
                code: 200,
                list_of_converted_links: listOfConvertedLinks
            });
        } else {
            res.status(404).json({
                response: 404,
                error: 'No converted links found for this user'
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ response: 500, error: 'Server error' });
    }
});
// Dynamic route to handle redirection using short URL (must be at the bottom)
router.get('/:shortUrl', async (req, res) => {
    try {
        const { shortUrl } = req.params;

        const result = await pool.query(
            'SELECT original_url, expires_at FROM shortened_urls WHERE short_url = $1',
            [shortUrl]
        );
        
        if (result.rows.length > 0) {
            const { original_url, expires_at } = result.rows[0];
            const expiresAtUTC = new Date(expires_at).getTime();
            const nowUTC = Date.now(); // This is also UTC

            if (expiresAtUTC > nowUTC) {
                res.redirect(original_url);
            } else {
                res.status(404).json({ code: 404, error: 'URL has expired' });
            }
        } else {
            res.status(404).json({ code: 404, error: 'URL not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});


// Dynamic route to check expiration date of a short URL
router.get('/:shortUrl/expires', async (req, res) => {
    const { shortUrl } = req.params;
    try {
        const result = await pool.query(
            'SELECT expires_at FROM shortened_urls WHERE short_url = $1',
            [shortUrl]
        );
        if (result.rows.length > 0) {
            res.status(200).json({
                code: 200,
                shortUrl,
                expires_at: result.rows[0].expires_at
            });
        } else {
            res.status(404).json({ code: 404, error: 'URL not found' });
        }
    } catch (error) {
        console.error("Error during GET /api/shorten/expires:", error.stack);
        res.status(500).json({ code: 500, error: 'Internal Server Error' });
    }
});

module.exports = router;
