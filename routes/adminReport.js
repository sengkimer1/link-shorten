const express = require('express');
const router = express.Router();
const pool = require('../db');
const authenticateToken = require('../models/token');

// Function to execute queries
const executeQuery = async (query, params) => {
  try {
    const result = await pool.query(query, params);
    return result.rows;
  } catch (error) {
    throw new Error('Database query error');
  }
};

// Admin Report API (with user-specific data and daily stats)
const getAdminReport = async (start_date = '2021-01-01', end_date = '2025-12-31', user_id) => {
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
      return {
        total_conversions: 0,
        active_users: 0,
        top_links: [],
        user_activity: [],
        daily_stats: []
      };
    }

    const topLinks = await executeQuery(`
   SELECT 
    original_url, 
    short_url, 
    click_count
    FROM 
    shortened_urls
    WHERE 
    expires_at BETWEEN $1 AND $2
    ORDER BY 
    click_count DESC
    LIMIT 5;


    `, [start_date, end_date]);
    const userActivity = await executeQuery(`
      SELECT 
    users.id AS user_id, 
    users.username, 
    users.email, 
    COUNT(shortened_urls.id) AS conversions, 
    COALESCE(SUM(shortened_urls.click_count), 0) AS total_clicks
    FROM 
    shortened_urls
    JOIN 
    users ON shortened_urls.created_by = users.id
    WHERE 
    shortened_urls.expires_at BETWEEN $1 AND $2
    GROUP BY 
    users.id, users.username, users.email
    ORDER BY 
    total_clicks DESC;

    `, [start_date, end_date]);

    const dailyStats = await executeQuery(`
     SELECT 
    date_trunc('day', shortened_urls.expires_at) AS date, 
    COUNT(*) AS conversions, 
    COALESCE(SUM(click_count), 0) AS clicks
    FROM 
    shortened_urls
    WHERE 
    expires_at BETWEEN $1 AND $2
    GROUP BY 
    date
    ORDER BY 
    date ASC;

    `, [start_date, end_date]);

    return {
      total_conversions: summary.total_conversions,
      active_users: summary.active_users,
      top_links: topLinks,
      user_activity: userActivity,
      daily_stats: dailyStats
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

module.exports = router;
