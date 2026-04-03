const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

// GET /api/activities
router.get('/', async (req, res) => {
  try {
    const conditions = [];
    const params = [];

    const cursor = parseInt(req.query.cursor, 10);
    if (!isNaN(cursor)) {
      conditions.push('id < ?');
      params.push(cursor);
    }

    const search = req.query.search;
    if (search && typeof search === 'string' && search.trim()) {
      const term = `%${search.trim()}%`;
      conditions.push('(title LIKE ? OR description LIKE ?)');
      params.push(term, term);
    }

    const minAge = parseInt(req.query.min_age, 10);
    if (!isNaN(minAge)) {
      conditions.push('min_age <= ?');
      params.push(minAge);
    }

    const maxDuration = parseInt(req.query.max_duration, 10);
    if (!isNaN(maxDuration)) {
      conditions.push('duration <= ?');
      params.push(maxDuration);
    }

    // Tag filtering (OR logic — activity matches if it has ANY of the selected tags)
    const tagsParam = req.query.tags;
    if (tagsParam && typeof tagsParam === 'string') {
      const tagIds = tagsParam.split(',').map((s) => parseInt(s, 10)).filter((n) => !isNaN(n));
      if (tagIds.length > 0) {
        const placeholders = tagIds.map(() => '?').join(', ');
        conditions.push(`id IN (SELECT activity_id FROM ActivityTag WHERE tag_id IN (${placeholders}))`);
        params.push(...tagIds);
      }
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const sql = `SELECT * FROM Activity ${where} ORDER BY id DESC LIMIT 21`;

    const [rows] = await pool.query(sql, params);

    let nextCursor = null;
    if (rows.length === 21) {
      rows.pop();
      nextCursor = rows[rows.length - 1].id;
    }

    // Attach tags to each activity
    if (rows.length > 0) {
      const activityIds = rows.map((r) => r.id);
      const tagPlaceholders = activityIds.map(() => '?').join(', ');
      const [tagRows] = await pool.query(
        `SELECT at.activity_id, t.id, t.name FROM ActivityTag at JOIN Tag t ON t.id = at.tag_id WHERE at.activity_id IN (${tagPlaceholders})`,
        activityIds
      );

      const tagMap = {};
      for (const row of tagRows) {
        if (!tagMap[row.activity_id]) tagMap[row.activity_id] = [];
        tagMap[row.activity_id].push({ id: row.id, name: row.name });
      }

      for (const activity of rows) {
        activity.tags = tagMap[activity.id] || [];
      }
    }

    res.json({ activities: rows, nextCursor });
  } catch (err) {
    console.error('Activities fetch error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
