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

    const minAgeFrom = parseInt(req.query.min_age_from, 10);
    const minAgeTo = parseInt(req.query.min_age_to, 10);
    if (!isNaN(minAgeFrom) && !isNaN(minAgeTo)) {
      conditions.push('min_age BETWEEN ? AND ?');
      params.push(minAgeFrom, minAgeTo);
    }

    const durationFrom = parseInt(req.query.duration_from, 10);
    const durationTo = parseInt(req.query.duration_to, 10);
    if (!isNaN(durationFrom) && !isNaN(durationTo)) {
      conditions.push('duration BETWEEN ? AND ?');
      params.push(durationFrom, durationTo);
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

// GET /api/activities/index — id + updated_at for every activity (SSG params + sitemap)
// Must be declared before GET /:id so the param route doesn't swallow it.
router.get('/index', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, updated_at FROM Activity ORDER BY id DESC');
    res.json({ activities: rows.map((r) => ({ id: r.id, updatedAt: r.updated_at })) });
  } catch (err) {
    console.error('Activities index fetch error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/activities/:id — single activity with tags
router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  // Strict: reject "1abc", "1.5", "01", negatives (parseInt would accept "1abc").
  if (!Number.isInteger(id) || id < 1 || String(id) !== req.params.id) {
    return res.status(400).json({ error: 'Invalid activity ID' });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM Activity WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Activity not found' });

    const activity = rows[0];
    const [tagRows] = await pool.query(
      'SELECT at.activity_id, t.id, t.name FROM ActivityTag at JOIN Tag t ON t.id = at.tag_id WHERE at.activity_id = ?',
      [id]
    );
    activity.tags = tagRows.map(({ id: tid, name }) => ({ id: tid, name }));

    res.json({ activity });
  } catch (err) {
    console.error('Activity fetch error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
