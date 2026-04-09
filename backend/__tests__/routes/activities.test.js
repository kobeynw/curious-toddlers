const express = require('express');
const pool = require('../../db/pool');
const activityRoutes = require('../../routes/activities');

jest.mock('../../db/pool');

let app;

beforeEach(() => {
  app = express();
  app.use(express.json());
  app.use('/api/activities', activityRoutes);
  jest.clearAllMocks();
});

function request(method, path) {
  const http = require('http');
  const server = app.listen(0);
  const port = server.address().port;

  return new Promise((resolve, reject) => {
    const req = http.request(
      { hostname: '127.0.0.1', port, path, method },
      (res) => {
        let rawBody = '';
        res.on('data', (chunk) => (rawBody += chunk));
        res.on('end', () => {
          server.close(() => {
            resolve({ status: res.statusCode, body: JSON.parse(rawBody) });
          });
        });
      }
    );
    req.on('error', (err) => { server.close(() => reject(err)); });
    req.end();
  });
}

function makeActivity(id, overrides = {}) {
  return {
    id,
    title: `Activity ${id}`,
    description: `Description for activity ${id}`,
    duration: 20,
    supplies: 'Some supplies',
    min_age: 12,
    created_at: '2026-03-31T00:00:00.000Z',
    updated_at: '2026-03-31T00:00:00.000Z',
    ...overrides,
  };
}

function makeActivities(count, startId = count) {
  const activities = [];
  for (let i = startId; i > startId - count; i--) {
    activities.push(makeActivity(i));
  }
  return activities;
}

describe('GET /api/activities', () => {
  it('returns activities with no filters', async () => {
    const rows = makeActivities(5);
    pool.query.mockResolvedValueOnce([rows]);
    pool.query.mockResolvedValueOnce([[]]); // tags query

    const res = await request('GET', '/api/activities');
    expect(res.status).toBe(200);
    expect(res.body.activities).toHaveLength(5);
    expect(res.body.nextCursor).toBeNull();
  });

  it('returns empty list when no activities exist', async () => {
    pool.query.mockResolvedValueOnce([[]]);

    const res = await request('GET', '/api/activities');
    expect(res.status).toBe(200);
    expect(res.body.activities).toEqual([]);
    expect(res.body.nextCursor).toBeNull();
  });

  it('returns nextCursor when more than 20 results', async () => {
    const rows = makeActivities(21, 30);
    pool.query.mockResolvedValueOnce([rows]);
    pool.query.mockResolvedValueOnce([[]]); // tags query

    const res = await request('GET', '/api/activities');
    expect(res.status).toBe(200);
    expect(res.body.activities).toHaveLength(20);
    expect(res.body.nextCursor).toBe(11);
  });

  it('returns null nextCursor when exactly 20 results', async () => {
    const rows = makeActivities(20);
    pool.query.mockResolvedValueOnce([rows]);
    pool.query.mockResolvedValueOnce([[]]); // tags query

    const res = await request('GET', '/api/activities');
    expect(res.status).toBe(200);
    expect(res.body.activities).toHaveLength(20);
    expect(res.body.nextCursor).toBeNull();
  });

  it('applies cursor parameter', async () => {
    pool.query.mockResolvedValueOnce([makeActivities(5)]);
    pool.query.mockResolvedValueOnce([[]]); // tags query

    const res = await request('GET', '/api/activities?cursor=15');
    expect(res.status).toBe(200);

    const [sql, params] = pool.query.mock.calls[0];
    expect(sql).toContain('id < ?');
    expect(params).toContain(15);
  });

  it('applies search parameter', async () => {
    pool.query.mockResolvedValueOnce([makeActivities(2)]);
    pool.query.mockResolvedValueOnce([[]]); // tags query

    const res = await request('GET', '/api/activities?search=sensory');
    expect(res.status).toBe(200);

    const [sql, params] = pool.query.mock.calls[0];
    expect(sql).toContain('title LIKE ?');
    expect(sql).toContain('description LIKE ?');
    expect(params).toContain('%sensory%');
  });

  it('applies min_age range filter', async () => {
    pool.query.mockResolvedValueOnce([makeActivities(3)]);
    pool.query.mockResolvedValueOnce([[]]); // tags query

    const res = await request('GET', '/api/activities?min_age_from=12&min_age_to=24');
    expect(res.status).toBe(200);

    const [sql, params] = pool.query.mock.calls[0];
    expect(sql).toContain('min_age BETWEEN ? AND ?');
    expect(params).toContain(12);
    expect(params).toContain(24);
  });

  it('applies duration range filter', async () => {
    pool.query.mockResolvedValueOnce([makeActivities(3)]);
    pool.query.mockResolvedValueOnce([[]]); // tags query

    const res = await request('GET', '/api/activities?duration_from=10&duration_to=30');
    expect(res.status).toBe(200);

    const [sql, params] = pool.query.mock.calls[0];
    expect(sql).toContain('duration BETWEEN ? AND ?');
    expect(params).toContain(10);
    expect(params).toContain(30);
  });

  it('combines multiple filters with AND logic', async () => {
    pool.query.mockResolvedValueOnce([makeActivities(2)]);
    pool.query.mockResolvedValueOnce([[]]); // tags query

    const res = await request('GET', '/api/activities?search=art&min_age_from=24&min_age_to=36&duration_from=30&duration_to=60');
    expect(res.status).toBe(200);

    const [sql, params] = pool.query.mock.calls[0];
    expect(sql).toContain('title LIKE ?');
    expect(sql).toContain('min_age BETWEEN ? AND ?');
    expect(sql).toContain('duration BETWEEN ? AND ?');
    expect(params).toEqual(['%art%', '%art%', 24, 36, 30, 60]);
  });

  it('ignores invalid cursor (non-numeric)', async () => {
    pool.query.mockResolvedValueOnce([makeActivities(3)]);
    pool.query.mockResolvedValueOnce([[]]); // tags query

    const res = await request('GET', '/api/activities?cursor=abc');
    expect(res.status).toBe(200);

    const [sql] = pool.query.mock.calls[0];
    expect(sql).not.toContain('id < ?');
  });

  it('ignores empty search parameter', async () => {
    pool.query.mockResolvedValueOnce([makeActivities(3)]);
    pool.query.mockResolvedValueOnce([[]]); // tags query

    const res = await request('GET', '/api/activities?search=');
    expect(res.status).toBe(200);

    const [sql] = pool.query.mock.calls[0];
    expect(sql).not.toContain('LIKE');
  });

  it('ignores invalid min_age range (non-numeric)', async () => {
    pool.query.mockResolvedValueOnce([makeActivities(3)]);
    pool.query.mockResolvedValueOnce([[]]); // tags query

    const res = await request('GET', '/api/activities?min_age_from=abc&min_age_to=24');
    expect(res.status).toBe(200);

    const [sql] = pool.query.mock.calls[0];
    expect(sql).not.toContain('min_age');
  });

  it('ignores invalid duration range (non-numeric)', async () => {
    pool.query.mockResolvedValueOnce([makeActivities(3)]);
    pool.query.mockResolvedValueOnce([[]]); // tags query

    const res = await request('GET', '/api/activities?duration_from=xyz&duration_to=30');
    expect(res.status).toBe(200);

    const [sql] = pool.query.mock.calls[0];
    expect(sql).not.toContain('duration');
  });

  it('orders results by id DESC', async () => {
    pool.query.mockResolvedValueOnce([makeActivities(3)]);
    pool.query.mockResolvedValueOnce([[]]); // tags query

    await request('GET', '/api/activities');

    const [sql] = pool.query.mock.calls[0];
    expect(sql).toContain('ORDER BY id DESC');
  });

  it('limits results to 21', async () => {
    pool.query.mockResolvedValueOnce([makeActivities(3)]);
    pool.query.mockResolvedValueOnce([[]]); // tags query

    await request('GET', '/api/activities');

    const [sql] = pool.query.mock.calls[0];
    expect(sql).toContain('LIMIT 21');
  });

  it('returns 500 on database error', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    pool.query.mockRejectedValueOnce(new Error('DB connection failed'));

    const res = await request('GET', '/api/activities');
    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Internal server error');
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('combines cursor with other filters', async () => {
    pool.query.mockResolvedValueOnce([makeActivities(2)]);
    pool.query.mockResolvedValueOnce([[]]); // tags query

    const res = await request('GET', '/api/activities?cursor=50&search=paint&min_age_from=12&min_age_to=18');
    expect(res.status).toBe(200);

    const [sql, params] = pool.query.mock.calls[0];
    expect(sql).toContain('id < ?');
    expect(sql).toContain('title LIKE ?');
    expect(sql).toContain('min_age BETWEEN ? AND ?');
    expect(params).toEqual([50, '%paint%', '%paint%', 12, 18]);
  });
});
