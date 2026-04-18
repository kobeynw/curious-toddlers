const express = require('express');
const pool = require('../../db/pool');

jest.mock('../../db/pool');

// Bypass auth middlewares — they have their own dedicated tests.
jest.mock('../../middleware/auth', () => (req, res, next) => {
  req.user = { id: 1, email: 'admin@example.com', name: 'Admin', role: 'admin' };
  next();
});
jest.mock('../../middleware/authorizeAdmin', () => (req, res, next) => next());

const adminRoutes = require('../../routes/admin');

let app;
let mockConnection;

beforeEach(() => {
  app = express();
  app.use(express.json());
  app.use('/api/admin/activities', adminRoutes);

  mockConnection = {
    query: jest.fn(),
    beginTransaction: jest.fn().mockResolvedValue(undefined),
    commit: jest.fn().mockResolvedValue(undefined),
    rollback: jest.fn().mockResolvedValue(undefined),
    release: jest.fn(),
  };
  pool.getConnection = jest.fn().mockResolvedValue(mockConnection);
  pool.query = jest.fn();
  jest.clearAllMocks();
  pool.getConnection.mockResolvedValue(mockConnection);
});

function request(method, path, body) {
  const http = require('http');
  const server = app.listen(0);
  const port = server.address().port;

  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : '';
    const headers = { 'Content-Type': 'application/json' };
    if (data) headers['Content-Length'] = Buffer.byteLength(data);
    const req = http.request(
      { hostname: '127.0.0.1', port, path, method, headers },
      (res) => {
        let rawBody = '';
        res.on('data', (chunk) => (rawBody += chunk));
        res.on('end', () => {
          server.close(() => {
            resolve({ status: res.statusCode, body: rawBody ? JSON.parse(rawBody) : {} });
          });
        });
      }
    );
    req.on('error', (err) => { server.close(() => reject(err)); });
    if (data) req.write(data);
    req.end();
  });
}

const validBody = {
  title: 'Test Activity',
  description: 'A description',
  duration: 15,
  supplies: 'Paper',
  min_age: 12,
  tagIds: [],
};

function makeActivityRow(overrides = {}) {
  return {
    id: 100,
    title: 'Test Activity',
    description: 'A description',
    duration: 15,
    supplies: 'Paper',
    min_age: 12,
    created_at: '2026-04-01T00:00:00.000Z',
    updated_at: '2026-04-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('POST /api/admin/activities', () => {
  it('returns 400 when title is missing', async () => {
    const res = await request('POST', '/api/admin/activities', { ...validBody, title: '' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Title is required');
  });

  it('returns 400 when title exceeds 255 characters', async () => {
    const res = await request('POST', '/api/admin/activities', { ...validBody, title: 'a'.repeat(256) });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/255 characters/);
  });

  it('returns 400 when description is missing', async () => {
    const res = await request('POST', '/api/admin/activities', { ...validBody, description: '' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Description is required');
  });

  it('returns 400 when duration is not a positive integer', async () => {
    const res = await request('POST', '/api/admin/activities', { ...validBody, duration: 0 });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Duration/);
  });

  it('returns 400 when duration is a decimal', async () => {
    const res = await request('POST', '/api/admin/activities', { ...validBody, duration: 1.5 });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Duration/);
  });

  it('returns 400 when min_age is negative', async () => {
    const res = await request('POST', '/api/admin/activities', { ...validBody, min_age: -1 });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Minimum age/);
  });

  it('returns 400 when min_age is above 72', async () => {
    const res = await request('POST', '/api/admin/activities', { ...validBody, min_age: 73 });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Minimum age/);
  });

  it('returns 400 when tagIds is not an array', async () => {
    const res = await request('POST', '/api/admin/activities', { ...validBody, tagIds: 'not-array' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/tagIds/);
  });

  it('returns 400 when tagIds contains non-integers', async () => {
    const res = await request('POST', '/api/admin/activities', { ...validBody, tagIds: [1, 'abc', 3] });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/tagIds/);
  });

  it('returns 201 with created activity and empty tags when tagIds is empty', async () => {
    mockConnection.query
      .mockResolvedValueOnce([{ insertId: 100 }]) // INSERT Activity
      .mockResolvedValueOnce([[makeActivityRow()]]) // SELECT activity
      .mockResolvedValueOnce([[]]); // SELECT tags (none)

    const res = await request('POST', '/api/admin/activities', validBody);
    expect(res.status).toBe(201);
    expect(res.body.activity.id).toBe(100);
    expect(res.body.activity.tags).toEqual([]);
    expect(mockConnection.beginTransaction).toHaveBeenCalled();
    expect(mockConnection.commit).toHaveBeenCalled();
    expect(mockConnection.rollback).not.toHaveBeenCalled();
    expect(mockConnection.release).toHaveBeenCalled();
  });

  it('returns 201 with created activity and tags when tagIds provided', async () => {
    mockConnection.query
      .mockResolvedValueOnce([{ insertId: 100 }]) // INSERT Activity
      .mockResolvedValueOnce([{}]) // INSERT ActivityTag
      .mockResolvedValueOnce([[makeActivityRow()]]) // SELECT activity
      .mockResolvedValueOnce([[{ id: 1, name: 'Sensory' }, { id: 5, name: 'Indoor' }]]); // SELECT tags

    const res = await request('POST', '/api/admin/activities', { ...validBody, tagIds: [1, 5] });
    expect(res.status).toBe(201);
    expect(res.body.activity.tags).toEqual([
      { id: 1, name: 'Sensory' },
      { id: 5, name: 'Indoor' },
    ]);

    // The second query should insert into ActivityTag with both tags
    const [insertSql, insertValues] = mockConnection.query.mock.calls[1];
    expect(insertSql).toContain('INSERT INTO ActivityTag');
    expect(insertValues).toEqual([100, 1, 100, 5]);
  });

  it('returns 400 and rolls back when tagIds reference nonexistent tags (FK error)', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const fkError = new Error('FK violation');
    fkError.code = 'ER_NO_REFERENCED_ROW_2';

    mockConnection.query
      .mockResolvedValueOnce([{ insertId: 100 }]) // INSERT Activity
      .mockRejectedValueOnce(fkError); // INSERT ActivityTag — FK fails

    const res = await request('POST', '/api/admin/activities', { ...validBody, tagIds: [9999] });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/tagIds do not exist/);
    expect(mockConnection.rollback).toHaveBeenCalled();
    expect(mockConnection.commit).not.toHaveBeenCalled();
    expect(mockConnection.release).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('returns 500 and rolls back on unexpected database error', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockConnection.query.mockRejectedValueOnce(new Error('Connection lost'));

    const res = await request('POST', '/api/admin/activities', validBody);
    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Internal server error');
    expect(mockConnection.rollback).toHaveBeenCalled();
    expect(mockConnection.commit).not.toHaveBeenCalled();
    expect(mockConnection.release).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('trims title, description, and supplies before insert', async () => {
    mockConnection.query
      .mockResolvedValueOnce([{ insertId: 100 }])
      .mockResolvedValueOnce([[makeActivityRow()]])
      .mockResolvedValueOnce([[]]);

    await request('POST', '/api/admin/activities', {
      title: '  Title  ',
      description: '  Desc  ',
      duration: 10,
      supplies: '  Paper  ',
      min_age: 0,
      tagIds: [],
    });

    const [, params] = mockConnection.query.mock.calls[0];
    expect(params[0]).toBe('Title');
    expect(params[1]).toBe('Desc');
    expect(params[3]).toBe('Paper');
  });

  it('stores null when supplies is omitted', async () => {
    mockConnection.query
      .mockResolvedValueOnce([{ insertId: 100 }])
      .mockResolvedValueOnce([[makeActivityRow()]])
      .mockResolvedValueOnce([[]]);

    await request('POST', '/api/admin/activities', {
      title: 'T',
      description: 'D',
      duration: 10,
      min_age: 0,
      tagIds: [],
    });

    const [, params] = mockConnection.query.mock.calls[0];
    expect(params[3]).toBeNull();
  });
});

describe('PUT /api/admin/activities/:id', () => {
  it('returns 400 when id is not numeric', async () => {
    const res = await request('PUT', '/api/admin/activities/abc', validBody);
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid activity ID');
  });

  it('returns 400 when validation fails', async () => {
    const res = await request('PUT', '/api/admin/activities/5', { ...validBody, title: '' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Title is required');
  });

  it('returns 404 when activity does not exist', async () => {
    mockConnection.query.mockResolvedValueOnce([[]]); // SELECT returns no rows

    const res = await request('PUT', '/api/admin/activities/999', validBody);
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Activity not found');
    expect(mockConnection.rollback).toHaveBeenCalled();
    expect(mockConnection.commit).not.toHaveBeenCalled();
    expect(mockConnection.release).toHaveBeenCalled();
  });

  it('returns 200 with updated activity and replaced tags', async () => {
    mockConnection.query
      .mockResolvedValueOnce([[{ id: 5 }]]) // SELECT existing
      .mockResolvedValueOnce([{}]) // UPDATE
      .mockResolvedValueOnce([{}]) // DELETE old tags
      .mockResolvedValueOnce([{}]) // INSERT new tags
      .mockResolvedValueOnce([[makeActivityRow({ id: 5 })]]) // SELECT activity
      .mockResolvedValueOnce([[{ id: 2, name: 'Outdoor' }]]); // SELECT tags

    const res = await request('PUT', '/api/admin/activities/5', { ...validBody, tagIds: [2] });
    expect(res.status).toBe(200);
    expect(res.body.activity.id).toBe(5);
    expect(res.body.activity.tags).toEqual([{ id: 2, name: 'Outdoor' }]);
    expect(mockConnection.commit).toHaveBeenCalled();

    // Confirm DELETE FROM ActivityTag was called with activity id
    const deleteCall = mockConnection.query.mock.calls[2];
    expect(deleteCall[0]).toContain('DELETE FROM ActivityTag');
    expect(deleteCall[1]).toEqual([5]);
  });

  it('deletes old tags but skips insert when new tagIds is empty', async () => {
    mockConnection.query
      .mockResolvedValueOnce([[{ id: 5 }]])
      .mockResolvedValueOnce([{}]) // UPDATE
      .mockResolvedValueOnce([{}]) // DELETE
      .mockResolvedValueOnce([[makeActivityRow({ id: 5 })]])
      .mockResolvedValueOnce([[]]);

    const res = await request('PUT', '/api/admin/activities/5', { ...validBody, tagIds: [] });
    expect(res.status).toBe(200);
    // 5 queries — no INSERT ActivityTag
    expect(mockConnection.query).toHaveBeenCalledTimes(5);
  });

  it('returns 400 and rolls back when tagIds reference nonexistent tags', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const fkError = new Error('FK violation');
    fkError.code = 'ER_NO_REFERENCED_ROW_2';

    mockConnection.query
      .mockResolvedValueOnce([[{ id: 5 }]])
      .mockResolvedValueOnce([{}])
      .mockResolvedValueOnce([{}])
      .mockRejectedValueOnce(fkError);

    const res = await request('PUT', '/api/admin/activities/5', { ...validBody, tagIds: [9999] });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/tagIds do not exist/);
    expect(mockConnection.rollback).toHaveBeenCalled();
    expect(mockConnection.release).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('returns 500 and rolls back on unexpected error', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockConnection.query.mockRejectedValueOnce(new Error('DB down'));

    const res = await request('PUT', '/api/admin/activities/5', validBody);
    expect(res.status).toBe(500);
    expect(mockConnection.rollback).toHaveBeenCalled();
    expect(mockConnection.release).toHaveBeenCalled();
    spy.mockRestore();
  });
});

describe('DELETE /api/admin/activities/:id', () => {
  it('returns 400 when id is not numeric', async () => {
    const res = await request('DELETE', '/api/admin/activities/abc');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid activity ID');
  });

  it('returns 404 when activity does not exist', async () => {
    pool.query.mockResolvedValueOnce([[]]);

    const res = await request('DELETE', '/api/admin/activities/999');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Activity not found');
  });

  it('returns 200 and deletes activity on success', async () => {
    pool.query
      .mockResolvedValueOnce([[{ id: 5 }]]) // SELECT existing
      .mockResolvedValueOnce([{}]); // DELETE

    const res = await request('DELETE', '/api/admin/activities/5');
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Activity deleted');

    const [deleteSql, deleteParams] = pool.query.mock.calls[1];
    expect(deleteSql).toContain('DELETE FROM Activity');
    expect(deleteParams).toEqual([5]);
  });

  it('returns 500 on database error', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    pool.query.mockRejectedValueOnce(new Error('DB error'));

    const res = await request('DELETE', '/api/admin/activities/5');
    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Internal server error');
    spy.mockRestore();
  });
});
