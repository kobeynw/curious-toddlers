const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

// GET /api/tags
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name FROM Tag ORDER BY name ASC');
    res.json({ tags: rows });
  } catch (err) {
    console.error('Tags fetch error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
