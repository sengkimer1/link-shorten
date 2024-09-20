const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const pool = require('../db'); 
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined');
}

// Middleware to authenticate token
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token', details: err.message });
    req.user = user;
    next();
  });
};

// Function to execute queries
const executeQuery = async (query, params) => {
  try {
    const result = await pool.query(query, params);
    return result.rows;
  } catch (error) {
    throw new Error('Database query error');
  }
};

const getAdminReport = async (start_date, end_date, user_id) => {
  try {
    console.log('Querying report data for:', { start_date, end_date, user_id });

    const baseQuery = `
      SELECT COUNT(*) AS total_conversions, COUNT(DISTINCT created_by) AS active_users
      FROM shortened_urls
      WHERE expires_at BETWEEN $1 AND $2 ${user_id ? 'AND created_by = $3' : ''};
    `;
    
    const params = user_id ? [start_date, end_date, user_id] : [start_date, end_date];
    console.log('Executing query:', baseQuery, 'with params:', params);

    const [summary] = await executeQuery(baseQuery, params);

    if (!summary) {
      console.log('No summary data found');
      return {
        total_conversions: 0,
        active_users: 0,
        top_links: []
      };
    }

    const topLinks = await executeQuery(`
      SELECT original_url, short_url, SUM(clicks) AS total_clicks
      FROM url_clicks
      JOIN shortened_urls ON url_clicks.shortened_url_id = shortened_urls.id
      WHERE click_date BETWEEN $1 AND $2
      GROUP BY original_url, short_url
      ORDER BY total_clicks DESC
      LIMIT 10;
    `, [start_date, end_date]);

    return {
      total_conversions: summary.total_conversions,
      active_users: summary.active_users,
      top_links: topLinks,
    };
  } catch (error) {
    console.error('Error in getAdminReport:', error);
    throw new Error('Error retrieving report data');
  }
};


// Specific Link Report
const getSpecificLinkReport = async (shortened_link) => {
  const linkReport = await executeQuery(`
    SELECT original_url, short_url, created_by, expires_at, COALESCE(SUM(clicks), 0) AS total_clicks
    FROM shortened_urls
    LEFT JOIN url_clicks ON shortened_urls.id = url_clicks.shortened_url_id
    WHERE short_url = $1
    GROUP BY original_url, short_url, created_by, expires_at;
  `, [shortened_link]);

  if (!linkReport.length) return { code: 404, message: 'Link not found' };

  const dailyClicks = await executeQuery(`
    SELECT date_trunc('day', click_date) AS date, COALESCE(SUM(clicks), 0) AS clicks
    FROM url_clicks
    JOIN shortened_urls ON shortened_urls.id = url_clicks.shortened_url_id
    WHERE short_url = $1
    GROUP BY date
    ORDER BY date ASC;
  `, [shortened_link]);

  return {
    code: 200,
    data: { ...linkReport[0], daily_clicks: dailyClicks },
  };
};

// Routes
router.post('/report', authenticateToken, async (req, res) => {
  try {
    const { start_date, end_date, user_id } = req.body;
    const report = await getAdminReport(start_date, end_date, user_id);
    res.status(200).json({ code: 200, report });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/link-report', authenticateToken, async (req, res) => {
  try {
    const { shortened_link } = req.body;
    const linkReport = await getSpecificLinkReport(shortened_link);
    res.status(linkReport.code || 200).json(linkReport);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/total-conversions', authenticateToken, async (req, res) => {
  try {
    const [result] = await executeQuery(`
      SELECT COUNT(*) AS total_conversions, COUNT(DISTINCT created_by) AS active_users
      FROM shortened_urls;
    `);
    res.status(200).json({ code: 200, total_conversions: result.total_conversions, active_users: result.active_users });
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving total conversions and active users' });
  }
});

module.exports = router;
