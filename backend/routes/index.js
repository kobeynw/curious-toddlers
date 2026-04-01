const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');
const activityRoutes = require('./activities');

router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

router.get('/health/db', async (req, res) => {
  try {
    const pool = require('../db/pool');
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'error', database: err.message });
  }
});

router.use('/auth', authRoutes);
router.use('/activities', activityRoutes);

module.exports = router;
