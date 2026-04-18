const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const authenticate = require('../middleware/auth');
const authorizeAdmin = require('../middleware/authorizeAdmin');

router.use(authenticate, authorizeAdmin);

function validateActivityBody(body) {
  const { title, description, duration, min_age, tagIds = [] } = body;

  if (!title || typeof title !== 'string' || !title.trim()) {
    return 'Title is required';
  }
  if (title.trim().length > 255) {
    return 'Title must be 255 characters or fewer';
  }
  if (!description || typeof description !== 'string' || !description.trim()) {
    return 'Description is required';
  }
  if (!Number.isInteger(duration) || duration <= 0) {
    return 'Duration must be a positive integer';
  }
  if (!Number.isInteger(min_age) || min_age < 0 || min_age > 72) {
    return 'Minimum age must be an integer between 0 and 72';
  }
  if (!Array.isArray(tagIds) || !tagIds.every((id) => Number.isInteger(id))) {
    return 'tagIds must be an array of integers';
  }
  return null;
}

// POST /api/admin/activities — Create activity
router.post('/', async (req, res) => {
  const validationError = validateActivityBody(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const { title, description, duration, supplies, min_age, tagIds = [] } = req.body;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [result] = await connection.query(
      'INSERT INTO Activity (title, description, duration, supplies, min_age) VALUES (?, ?, ?, ?, ?)',
      [title.trim(), description.trim(), duration, supplies ? supplies.trim() : null, min_age]
    );

    const activityId = result.insertId;

    if (tagIds.length > 0) {
      const placeholders = tagIds.map(() => '(?, ?)').join(', ');
      const values = tagIds.flatMap((tagId) => [activityId, tagId]);
      try {
        await connection.query(
          `INSERT INTO ActivityTag (activity_id, tag_id) VALUES ${placeholders}`,
          values
        );
      } catch (err) {
        if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.code === 'ER_NO_REFERENCED_ROW') {
          await connection.rollback();
          return res.status(400).json({ error: 'One or more tagIds do not exist' });
        }
        throw err;
      }
    }

    const [rows] = await connection.query('SELECT * FROM Activity WHERE id = ?', [activityId]);
    const activity = rows[0];

    const [tagRows] = await connection.query(
      'SELECT t.id, t.name FROM ActivityTag at JOIN Tag t ON t.id = at.tag_id WHERE at.activity_id = ?',
      [activityId]
    );
    activity.tags = tagRows;

    await connection.commit();
    res.status(201).json({ activity });
  } catch (err) {
    await connection.rollback();
    console.error('Admin create activity error:', err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    connection.release();
  }
});

// PUT /api/admin/activities/:id — Update activity
router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid activity ID' });
  }

  const validationError = validateActivityBody(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const { title, description, duration, supplies, min_age, tagIds = [] } = req.body;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [existing] = await connection.query('SELECT id FROM Activity WHERE id = ?', [id]);
    if (existing.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Activity not found' });
    }

    await connection.query(
      'UPDATE Activity SET title = ?, description = ?, duration = ?, supplies = ?, min_age = ? WHERE id = ?',
      [title.trim(), description.trim(), duration, supplies ? supplies.trim() : null, min_age, id]
    );

    await connection.query('DELETE FROM ActivityTag WHERE activity_id = ?', [id]);

    if (tagIds.length > 0) {
      const placeholders = tagIds.map(() => '(?, ?)').join(', ');
      const values = tagIds.flatMap((tagId) => [id, tagId]);
      try {
        await connection.query(
          `INSERT INTO ActivityTag (activity_id, tag_id) VALUES ${placeholders}`,
          values
        );
      } catch (err) {
        if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.code === 'ER_NO_REFERENCED_ROW') {
          await connection.rollback();
          return res.status(400).json({ error: 'One or more tagIds do not exist' });
        }
        throw err;
      }
    }

    const [rows] = await connection.query('SELECT * FROM Activity WHERE id = ?', [id]);
    const activity = rows[0];

    const [tagRows] = await connection.query(
      'SELECT t.id, t.name FROM ActivityTag at JOIN Tag t ON t.id = at.tag_id WHERE at.activity_id = ?',
      [id]
    );
    activity.tags = tagRows;

    await connection.commit();
    res.json({ activity });
  } catch (err) {
    await connection.rollback();
    console.error('Admin update activity error:', err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    connection.release();
  }
});

// DELETE /api/admin/activities/:id — Delete activity
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid activity ID' });
    }

    const [existing] = await pool.query('SELECT id FROM Activity WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    await pool.query('DELETE FROM Activity WHERE id = ?', [id]);

    res.json({ message: 'Activity deleted' });
  } catch (err) {
    console.error('Admin delete activity error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
