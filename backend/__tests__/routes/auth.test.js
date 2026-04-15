const express = require('express');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../../db/pool');
const authRoutes = require('../../routes/auth');

jest.mock('../../db/pool');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('../../utils/email', () => ({
  sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
}));

const { sendVerificationEmail } = require('../../utils/email');

let app;
let savedEnv;

beforeAll(() => {
  savedEnv = { JWT_SECRET: process.env.JWT_SECRET, JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN };
  process.env.JWT_SECRET = 'test-secret';
  process.env.JWT_EXPIRES_IN = '7d';
});

afterAll(() => {
  process.env.JWT_SECRET = savedEnv.JWT_SECRET;
  process.env.JWT_EXPIRES_IN = savedEnv.JWT_EXPIRES_IN;
});

beforeEach(() => {
  app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use('/api/auth', authRoutes);
  jest.clearAllMocks();
});

function request(method, path, body) {
  const http = require('http');
  const server = app.listen(0);
  const port = server.address().port;

  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : '';
    const req = http.request(
      { hostname: '127.0.0.1', port, path, method, headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } },
      (res) => {
        let rawBody = '';
        res.on('data', (chunk) => (rawBody += chunk));
        res.on('end', () => {
          server.close(() => {
            resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(rawBody) });
          });
        });
      }
    );
    req.on('error', (err) => { server.close(() => reject(err)); });
    req.write(data);
    req.end();
  });
}

function requestWithCookie(method, path, cookie, body) {
  const http = require('http');
  const server = app.listen(0);
  const port = server.address().port;

  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : '';
    const headers = { 'Cookie': cookie, 'Content-Type': 'application/json' };
    if (data) headers['Content-Length'] = Buffer.byteLength(data);
    const req = http.request(
      { hostname: '127.0.0.1', port, path, method, headers },
      (res) => {
        let rawBody = '';
        res.on('data', (chunk) => (rawBody += chunk));
        res.on('end', () => {
          server.close(() => {
            resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(rawBody) });
          });
        });
      }
    );
    req.on('error', (err) => { server.close(() => reject(err)); });
    if (data) req.write(data);
    req.end();
  });
}

describe('POST /api/auth/register', () => {
  it('returns 400 when name is missing', async () => {
    const res = await request('POST', '/api/auth/register', { email: 'a@b.com', password: 'Pass1234' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Name is required');
  });

  it('returns 400 when email is invalid', async () => {
    const res = await request('POST', '/api/auth/register', { name: 'Test', email: 'not-email', password: 'Pass1234' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid email format');
  });

  it('returns 400 when password is too weak', async () => {
    const res = await request('POST', '/api/auth/register', { name: 'Test', email: 'a@b.com', password: 'short' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Password must/);
  });

  it('returns 409 when email already exists', async () => {
    pool.query.mockResolvedValueOnce([[{ id: 1 }]]);
    const res = await request('POST', '/api/auth/register', { name: 'Test', email: 'a@b.com', password: 'Pass1234' });
    expect(res.status).toBe(409);
    expect(res.body.error).toBe('An account with this email already exists');
  });

  it('returns 201 with unverified user on success and sets cookie', async () => {
    pool.query
      .mockResolvedValueOnce([[]]) // no existing user
      .mockResolvedValueOnce([{ insertId: 42 }]) // insert user
      .mockResolvedValueOnce([{}]); // insert email_token
    bcrypt.hash.mockResolvedValue('hashed-pw');
    jwt.sign.mockReturnValue('fake-token');

    const res = await request('POST', '/api/auth/register', { name: 'Test', email: 'A@B.com', password: 'Pass1234' });
    expect(res.status).toBe(201);
    expect(res.body.user).toEqual({ id: 42, name: 'Test', email: 'a@b.com', isVerified: false });
    expect(res.headers['set-cookie']).toBeDefined();
    expect(res.headers['set-cookie'][0]).toContain('token=fake-token');
  });

  it('sends a verification email on successful registration', async () => {
    pool.query
      .mockResolvedValueOnce([[]]) // no existing user
      .mockResolvedValueOnce([{ insertId: 42 }]) // insert user
      .mockResolvedValueOnce([{}]); // insert email_token
    bcrypt.hash.mockResolvedValue('hashed-pw');
    jwt.sign.mockReturnValue('fake-token');

    await request('POST', '/api/auth/register', { name: 'Test', email: 'a@b.com', password: 'Pass1234' });

    // Allow the fire-and-forget promise to settle
    await new Promise((r) => setTimeout(r, 50));

    expect(sendVerificationEmail).toHaveBeenCalledWith('a@b.com', 'Test', expect.any(String));
  });
});

describe('POST /api/auth/login', () => {
  it('returns 400 when email is missing', async () => {
    const res = await request('POST', '/api/auth/login', { password: 'Pass1234' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Email is required');
  });

  it('returns 401 when user not found', async () => {
    pool.query.mockResolvedValueOnce([[]]);
    const res = await request('POST', '/api/auth/login', { email: 'a@b.com', password: 'Pass1234' });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid email or password');
  });

  it('returns 401 when password is wrong', async () => {
    pool.query.mockResolvedValueOnce([[{ id: 1, name: 'Test', email: 'a@b.com', password_hash: 'hashed', is_verified: 1 }]]);
    bcrypt.compare.mockResolvedValue(false);
    const res = await request('POST', '/api/auth/login', { email: 'a@b.com', password: 'Wrong1234' });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid email or password');
  });

  it('returns 200 with user including isVerified on success', async () => {
    pool.query.mockResolvedValueOnce([[{ id: 1, name: 'Test', email: 'a@b.com', password_hash: 'hashed', is_verified: 1 }]]);
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('login-token');

    const res = await request('POST', '/api/auth/login', { email: 'a@b.com', password: 'Pass1234' });
    expect(res.status).toBe(200);
    expect(res.body.user).toEqual({ id: 1, name: 'Test', email: 'a@b.com', isVerified: true });
    expect(res.headers['set-cookie'][0]).toContain('token=login-token');
  });

  it('returns isVerified false for unverified user', async () => {
    pool.query.mockResolvedValueOnce([[{ id: 1, name: 'Test', email: 'a@b.com', password_hash: 'hashed', is_verified: 0 }]]);
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('login-token');

    const res = await request('POST', '/api/auth/login', { email: 'a@b.com', password: 'Pass1234' });
    expect(res.status).toBe(200);
    expect(res.body.user.isVerified).toBe(false);
  });
});

describe('POST /api/auth/logout', () => {
  it('clears the token cookie and returns success', async () => {
    const res = await request('POST', '/api/auth/logout');
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Logged out');
    expect(res.headers['set-cookie'][0]).toContain('token=;');
  });
});

describe('GET /api/auth/me', () => {
  it('returns 401 when no token', async () => {
    const res = await requestWithCookie('GET', '/api/auth/me', '');
    expect(res.status).toBe(401);
  });

  it('returns user with isVerified when token is valid', async () => {
    jwt.verify.mockReturnValue({ id: 1, email: 'a@b.com', name: 'Test' });
    pool.query.mockResolvedValueOnce([[{ id: 1, email: 'a@b.com', name: 'Test', is_verified: 1 }]]);

    const res = await requestWithCookie('GET', '/api/auth/me', 'token=valid-token');
    expect(res.status).toBe(200);
    expect(res.body.user).toEqual({ id: 1, email: 'a@b.com', name: 'Test', isVerified: true });
  });

  it('returns isVerified false for unverified user', async () => {
    jwt.verify.mockReturnValue({ id: 1, email: 'a@b.com', name: 'Test' });
    pool.query.mockResolvedValueOnce([[{ id: 1, email: 'a@b.com', name: 'Test', is_verified: 0 }]]);

    const res = await requestWithCookie('GET', '/api/auth/me', 'token=valid-token');
    expect(res.status).toBe(200);
    expect(res.body.user.isVerified).toBe(false);
  });
});

describe('POST /api/auth/verify-email', () => {
  it('returns 400 when token is missing', async () => {
    const res = await request('POST', '/api/auth/verify-email', {});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Token is required');
  });

  it('returns 400 when token is invalid or expired', async () => {
    pool.query.mockResolvedValueOnce([[]]); // no matching token

    const res = await request('POST', '/api/auth/verify-email', { token: 'bad-token' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid or expired verification link');
  });

  it('verifies user and deletes token on success', async () => {
    pool.query
      .mockResolvedValueOnce([[{ id: 10, user_id: 5 }]]) // found token
      .mockResolvedValueOnce([{}]) // update user is_verified
      .mockResolvedValueOnce([{}]); // delete token

    const res = await request('POST', '/api/auth/verify-email', { token: 'valid-token' });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Email verified successfully');

    // Verify correct queries were made
    expect(pool.query).toHaveBeenCalledWith(
      'UPDATE User SET is_verified = TRUE WHERE id = ?', [5]
    );
    expect(pool.query).toHaveBeenCalledWith(
      'DELETE FROM email_token WHERE id = ?', [10]
    );
  });
});

describe('POST /api/auth/resend-verification', () => {
  it('returns 401 when not authenticated', async () => {
    const res = await request('POST', '/api/auth/resend-verification');
    expect(res.status).toBe(401);
  });

  it('returns 400 when user is already verified', async () => {
    jwt.verify.mockReturnValue({ id: 1, email: 'a@b.com', name: 'Test' });
    pool.query.mockResolvedValueOnce([[{ name: 'Test', email: 'a@b.com', is_verified: 1 }]]);

    const res = await requestWithCookie('POST', '/api/auth/resend-verification', 'token=valid-token');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Email is already verified');
  });

  it('returns 429 when resend requested too quickly', async () => {
    jwt.verify.mockReturnValue({ id: 1, email: 'a@b.com', name: 'Test' });
    pool.query
      .mockResolvedValueOnce([[{ name: 'Test', email: 'a@b.com', is_verified: 0 }]]) // user lookup
      .mockResolvedValueOnce([[{ id: 99 }]]); // recent token exists

    const res = await requestWithCookie('POST', '/api/auth/resend-verification', 'token=valid-token');
    expect(res.status).toBe(429);
    expect(res.body.error).toBe('Please wait before requesting another email');
  });

  it('sends a new verification email on success', async () => {
    jwt.verify.mockReturnValue({ id: 1, email: 'a@b.com', name: 'Test' });
    pool.query
      .mockResolvedValueOnce([[{ name: 'Test', email: 'a@b.com', is_verified: 0 }]]) // user lookup
      .mockResolvedValueOnce([[]]) // no recent token
      .mockResolvedValueOnce([{}]) // delete old tokens
      .mockResolvedValueOnce([{}]); // insert new token

    const res = await requestWithCookie('POST', '/api/auth/resend-verification', 'token=valid-token');
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Verification email sent');
    expect(sendVerificationEmail).toHaveBeenCalledWith('a@b.com', 'Test', expect.any(String));
  });
});
