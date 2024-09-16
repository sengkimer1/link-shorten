const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const pool = require('../db'); 
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
};

// Controller logic: Get Admin Report
const getAdminReport = async (start_date, end_date, user_id) => {
  try {
    const query = `
      SELECT
        COUNT(*) AS total_conversions,
        COUNT(DISTINCT created_by) AS active_users
      FROM
        shortened_urls
      WHERE
        expires_at BETWEEN $1 AND $2
        ${user_id ? 'AND created_by = $3' : ''};
    `;
    
    const params = [start_date, end_date];
    if (user_id) params.push(user_id);

    const result = await pool.query(query, params);
    const { total_conversions, active_users } = result.rows[0];

    // Top links based on clicks
    const topLinksQuery = `
      SELECT
        original_url,
        short_url,
        SUM(clicks) AS total_clicks
      FROM
        url_clicks
      JOIN shortened_urls ON url_clicks.shortened_url_id = shortened_urls.id
      WHERE click_date BETWEEN $1 AND $2
      GROUP BY original_url, short_url
      ORDER BY total_clicks DESC
      LIMIT 10;
    `;

    const topLinksResult = await pool.query(topLinksQuery, [start_date, end_date]);

    // User activity (conversions and clicks per user)
    const userActivityQuery = `
      SELECT
        created_by AS user_id,
        COUNT(*) AS conversions,
        SUM(clicks) AS total_clicks
      FROM
        shortened_urls
      JOIN url_clicks ON shortened_urls.id = url_clicks.shortened_url_id
      WHERE shortened_urls.expires_at BETWEEN $1 AND $2
      GROUP BY created_by;
    `;

    const userActivityResult = await pool.query(userActivityQuery, [start_date, end_date]);

    // Daily stats (conversions and clicks per day)
    const dailyStatsQuery = `
      SELECT
        date_trunc('day', click_date) AS date,
        COUNT(shortened_urls.id) AS conversions,
        SUM(clicks) AS total_clicks
      FROM
        url_clicks
      JOIN shortened_urls ON shortened_urls.id = url_clicks.shortened_url_id
      WHERE click_date BETWEEN $1 AND $2
      GROUP BY date
      ORDER BY date ASC;
    `;

    const dailyStatsResult = await pool.query(dailyStatsQuery, [start_date, end_date]);

    return {
      total_conversions,
      active_users,
      top_links: topLinksResult.rows,
      user_activity: userActivityResult.rows,
      daily_stats: dailyStatsResult.rows
    };
  } catch (error) {
    throw { code: 500, message: 'Error retrieving report data' };
  }
};

const getSpecificLinkReport = async (shortened_link) => {
  try {
    const linkReportQuery = `
      SELECT
        original_url,
        short_url,
        created_by,
        expires_at,
        COALESCE(SUM(clicks), 0) AS total_clicks
      FROM
        shortened_urls
      LEFT JOIN url_clicks ON shortened_urls.id = url_clicks.shortened_url_id
      WHERE short_url = $1
      GROUP BY original_url, short_url, created_by, expires_at;
    `;

    const dailyClicksQuery = `
      SELECT
        date_trunc('day', click_date) AS date,
        COALESCE(SUM(clicks), 0) AS clicks
      FROM
        url_clicks
      JOIN shortened_urls ON shortened_urls.id = url_clicks.shortened_url_id
      WHERE short_url = $1
      GROUP BY date
      ORDER BY date ASC;
    `;

    const linkReportResult = await pool.query(linkReportQuery, [shortened_link]);
    const dailyClicksResult = await pool.query(dailyClicksQuery, [shortened_link]);

    const linkReport = linkReportResult.rows[0];
    if (!linkReport) {
      console.log('Link not found:', shortened_link);
      return { code: 404, message: 'Link not found' }; // Returning a 404 message instead of throwing an error
    }

    // Successful response
    return {
      code: 200, // Success status code
      data: {
        ...linkReport,
        daily_clicks: dailyClicksResult.rows
      }
    };
  } catch (error) {
    console.error('Error in getSpecificLinkReport:', error);
    // Returning a 500 message with error details
    return { code: 500, message: 'Error retrieving link report data' };
  }
};


// Admin Report Route
router.post('/report', authenticateToken, async (req, res) => {
  try {
    const { start_date, end_date, user_id } = req.body;

    const report = await getAdminReport(start_date, end_date, user_id);
    res.status(200).json({
      code: 200,
      report
    });
  } catch (error) {
    res.status(error.code || 500).json({
      response: error.code || 500,
      error: error.message
    });
  }
});

// Specific Link Report Route
router.post('/link-report', authenticateToken, async (req, res) => {
  try {
    const { shortened_link } = req.body;

    const linkReport = await getSpecificLinkReport(shortened_link);
    res.status(200).json({
      code: 200,
      link_report: linkReport
    });
  } catch (error) {
    res.status(error.code || 500).json({
      response: error.code || 500,
      error: error.message
    });
  }
});

module.exports = router;