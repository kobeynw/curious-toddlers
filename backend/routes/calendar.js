const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const authenticate = require('../middleware/auth');

router.use(authenticate);

const VALID_DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

// GET /api/calendar — Get the user's full weekly calendar
router.get('/', async (req, res) => {
  try {
    const [calendars] = await pool.query('SELECT id FROM Calendar WHERE user_id = ?', [req.user.id]);

    if (calendars.length === 0) {
      return res.json({ calendar: null, days: {} });
    }

    const calendar = calendars[0];

    const [rows] = await pool.query(
      `SELECT ce.id AS entry_id, ce.day_of_week,
              cea.id AS calendar_entry_activity_id, cea.activity_id,
              a.title, a.description, a.duration, a.supplies, a.min_age
       FROM CalendarEntry ce
       LEFT JOIN CalendarEntryActivity cea ON cea.calendar_entry_id = ce.id
       LEFT JOIN Activity a ON a.id = cea.activity_id
       WHERE ce.calendar_id = ?
       ORDER BY ce.day_of_week, cea.id ASC`,
      [calendar.id]
    );

    // Collect unique activity IDs for tag fetching
    const activityIds = [...new Set(rows.filter((r) => r.activity_id).map((r) => r.activity_id))];

    let tagMap = {};
    if (activityIds.length > 0) {
      const placeholders = activityIds.map(() => '?').join(', ');
      const [tagRows] = await pool.query(
        `SELECT at.activity_id, t.id, t.name FROM ActivityTag at JOIN Tag t ON t.id = at.tag_id WHERE at.activity_id IN (${placeholders})`,
        activityIds
      );
      for (const row of tagRows) {
        if (!tagMap[row.activity_id]) tagMap[row.activity_id] = [];
        tagMap[row.activity_id].push({ id: row.id, name: row.name });
      }
    }

    // Group by day, ensuring all 7 days exist
    const days = {};
    for (const day of VALID_DAYS) {
      days[day] = [];
    }

    for (const row of rows) {
      if (row.calendar_entry_activity_id) {
        days[row.day_of_week].push({
          calendarEntryActivityId: row.calendar_entry_activity_id,
          activityId: row.activity_id,
          title: row.title,
          description: row.description,
          duration: row.duration,
          supplies: row.supplies,
          minAge: row.min_age,
          tags: tagMap[row.activity_id] || [],
        });
      }
    }

    res.json({ calendar: { id: calendar.id }, days });
  } catch (err) {
    console.error('Calendar fetch error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/calendar/activities — Add an activity to one or more days
router.post('/activities', async (req, res) => {
  try {
    const { activityId, days } = req.body;

    if (!activityId || !Number.isInteger(activityId) || activityId <= 0) {
      return res.status(400).json({ error: 'activityId is required' });
    }

    if (!Array.isArray(days) || days.length === 0 || !days.every((d) => VALID_DAYS.includes(d))) {
      return res.status(400).json({
        error: 'days must be a non-empty array of valid days (sunday, monday, tuesday, wednesday, thursday, friday, saturday)',
      });
    }

    const [activities] = await pool.query('SELECT id FROM Activity WHERE id = ?', [activityId]);
    if (activities.length === 0) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    // Get or create calendar
    let [calendars] = await pool.query('SELECT id FROM Calendar WHERE user_id = ?', [req.user.id]);
    let calendarId;
    if (calendars.length === 0) {
      const [result] = await pool.query('INSERT INTO Calendar (user_id) VALUES (?)', [req.user.id]);
      calendarId = result.insertId;
    } else {
      calendarId = calendars[0].id;
    }

    const added = [];
    const skipped = [];

    for (const day of days) {
      // Get or create calendar entry
      let [entries] = await pool.query(
        'SELECT id FROM CalendarEntry WHERE calendar_id = ? AND day_of_week = ?',
        [calendarId, day]
      );
      let entryId;
      if (entries.length === 0) {
        const [result] = await pool.query(
          'INSERT INTO CalendarEntry (calendar_id, day_of_week) VALUES (?, ?)',
          [calendarId, day]
        );
        entryId = result.insertId;
      } else {
        entryId = entries[0].id;
      }

      // Check for duplicate
      const [existing] = await pool.query(
        'SELECT id FROM CalendarEntryActivity WHERE calendar_entry_id = ? AND activity_id = ?',
        [entryId, activityId]
      );

      if (existing.length > 0) {
        skipped.push(day);
      } else {
        const [result] = await pool.query(
          'INSERT INTO CalendarEntryActivity (calendar_entry_id, activity_id) VALUES (?, ?)',
          [entryId, activityId]
        );
        added.push({ calendarEntryActivityId: result.insertId, day });
      }
    }

    res.status(201).json({ added, skipped });
  } catch (err) {
    console.error('Calendar add activity error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/calendar/activities/:calendarEntryActivityId — Remove an activity from a day
router.delete('/activities/:calendarEntryActivityId', async (req, res) => {
  try {
    const id = parseInt(req.params.calendarEntryActivityId, 10);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    const [rows] = await pool.query(
      `SELECT cea.id FROM CalendarEntryActivity cea
       JOIN CalendarEntry ce ON ce.id = cea.calendar_entry_id
       JOIN Calendar c ON c.id = ce.calendar_id
       WHERE cea.id = ? AND c.user_id = ?`,
      [id, req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Calendar entry not found' });
    }

    await pool.query('DELETE FROM CalendarEntryActivity WHERE id = ?', [id]);
    res.json({ message: 'Activity removed from calendar' });
  } catch (err) {
    console.error('Calendar remove activity error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/calendar/activities/:calendarEntryActivityId/move — Move an activity to a different day
router.patch('/activities/:calendarEntryActivityId/move', async (req, res) => {
  try {
    const id = parseInt(req.params.calendarEntryActivityId, 10);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    const { toDay } = req.body;
    if (!toDay || !VALID_DAYS.includes(toDay)) {
      return res.status(400).json({
        error: 'toDay must be a valid day (sunday, monday, tuesday, wednesday, thursday, friday, saturday)',
      });
    }

    const [rows] = await pool.query(
      `SELECT cea.id, cea.activity_id, ce.calendar_id FROM CalendarEntryActivity cea
       JOIN CalendarEntry ce ON ce.id = cea.calendar_entry_id
       JOIN Calendar c ON c.id = ce.calendar_id
       WHERE cea.id = ? AND c.user_id = ?`,
      [id, req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Calendar entry not found' });
    }

    const { activity_id: activityId, calendar_id: calendarId } = rows[0];

    // Get or create target entry
    let [entries] = await pool.query(
      'SELECT id FROM CalendarEntry WHERE calendar_id = ? AND day_of_week = ?',
      [calendarId, toDay]
    );
    let targetEntryId;
    if (entries.length === 0) {
      const [result] = await pool.query(
        'INSERT INTO CalendarEntry (calendar_id, day_of_week) VALUES (?, ?)',
        [calendarId, toDay]
      );
      targetEntryId = result.insertId;
    } else {
      targetEntryId = entries[0].id;
    }

    // Check for duplicate on target day
    const [existing] = await pool.query(
      'SELECT id FROM CalendarEntryActivity WHERE calendar_entry_id = ? AND activity_id = ?',
      [targetEntryId, activityId]
    );

    if (existing.length > 0) {
      return res.status(409).json({ error: 'Activity already exists on that day' });
    }

    await pool.query('UPDATE CalendarEntryActivity SET calendar_entry_id = ? WHERE id = ?', [targetEntryId, id]);
    res.json({ message: 'Activity moved', calendarEntryActivityId: id, toDay });
  } catch (err) {
    console.error('Calendar move activity error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
