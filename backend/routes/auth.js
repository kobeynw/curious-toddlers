const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db/pool');
const authenticate = require('../middleware/auth');
const { sendVerificationEmail } = require('../utils/email');

const router = express.Router();

const SALT_ROUNDS = 12;
const VERIFICATION_TOKEN_HOURS = 24;

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password) {
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
  if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
  return null;
}

function buildCookieOptions() {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  };
}

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }
    if (name.trim().length > 255) {
      return res.status(400).json({ error: 'Name must be 255 characters or fewer' });
    }

    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({ error: 'Email is required' });
    }
    const normalizedEmail = email.trim().toLowerCase();
    if (!validateEmail(normalizedEmail)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (!password || typeof password !== 'string') {
      return res.status(400).json({ error: 'Password is required' });
    }
    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.status(400).json({ error: passwordError });
    }

    const [existing] = await pool.query('SELECT id FROM User WHERE email = ?', [normalizedEmail]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const [result] = await pool.query(
      'INSERT INTO User (name, email, password_hash) VALUES (?, ?, ?)',
      [name.trim(), normalizedEmail, passwordHash]
    );

    const user = { id: result.insertId, name: name.trim(), email: normalizedEmail, isVerified: false };

    // Generate verification token
    const plainToken = generateToken();
    const tokenHash = hashToken(plainToken);
    const expiresAt = new Date(Date.now() + VERIFICATION_TOKEN_HOURS * 60 * 60 * 1000);

    await pool.query(
      'INSERT INTO email_token (user_id, token_hash, type, expires_at) VALUES (?, ?, ?, ?)',
      [user.id, tokenHash, 'verification', expiresAt]
    );

    // Send verification email (don't block registration on email failure)
    sendVerificationEmail(normalizedEmail, name.trim(), plainToken).catch((err) => {
      console.error('Failed to send verification email:', err);
    });

    const jwtToken = signToken(user);
    res.cookie('token', jwtToken, buildCookieOptions());
    res.status(201).json({ user });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({ error: 'Email is required' });
    }
    if (!password || typeof password !== 'string') {
      return res.status(400).json({ error: 'Password is required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const [rows] = await pool.query(
      'SELECT id, name, email, password_hash, is_verified FROM User WHERE email = ?',
      [normalizedEmail]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const dbUser = rows[0];
    const match = await bcrypt.compare(password, dbUser.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = { id: dbUser.id, name: dbUser.name, email: dbUser.email, isVerified: !!dbUser.is_verified };
    const token = signToken(user);

    res.cookie('token', token, buildCookieOptions());
    res.json({ user });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  const opts = buildCookieOptions();
  delete opts.maxAge;
  res.clearCookie('token', opts);
  res.json({ message: 'Logged out' });
});

// GET /api/auth/me
router.get('/me', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, is_verified FROM User WHERE id = ?',
      [req.user.id]
    );
    if (rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }
    const dbUser = rows[0];
    res.json({
      user: { id: dbUser.id, name: dbUser.name, email: dbUser.email, isVerified: !!dbUser.is_verified },
    });
  } catch (err) {
    console.error('Me error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/verify-email
router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({ error: 'Token is required' });
    }

    const tokenHash = hashToken(token);
    const [rows] = await pool.query(
      'SELECT id, user_id FROM email_token WHERE token_hash = ? AND type = ? AND expires_at > NOW()',
      [tokenHash, 'verification']
    );

    if (rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired verification link' });
    }

    const { id: tokenId, user_id: userId } = rows[0];

    await pool.query('UPDATE User SET is_verified = TRUE WHERE id = ?', [userId]);
    await pool.query('DELETE FROM email_token WHERE id = ?', [tokenId]);

    res.json({ message: 'Email verified successfully' });
  } catch (err) {
    console.error('Verify email error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/resend-verification
router.post('/resend-verification', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    const [userRows] = await pool.query(
      'SELECT name, email, is_verified FROM User WHERE id = ?',
      [userId]
    );
    if (userRows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    const dbUser = userRows[0];
    if (dbUser.is_verified) {
      return res.status(400).json({ error: 'Email is already verified' });
    }

    // Rate limit: check if a verification token was created in the last 60 seconds
    const [recentTokens] = await pool.query(
      'SELECT id FROM email_token WHERE user_id = ? AND type = ? AND created_at > DATE_SUB(NOW(), INTERVAL 60 SECOND)',
      [userId, 'verification']
    );
    if (recentTokens.length > 0) {
      return res.status(429).json({ error: 'Please wait before requesting another email' });
    }

    // Delete existing verification tokens
    await pool.query('DELETE FROM email_token WHERE user_id = ? AND type = ?', [userId, 'verification']);

    // Generate and store new token
    const plainToken = generateToken();
    const tokenHash = hashToken(plainToken);
    const expiresAt = new Date(Date.now() + VERIFICATION_TOKEN_HOURS * 60 * 60 * 1000);

    await pool.query(
      'INSERT INTO email_token (user_id, token_hash, type, expires_at) VALUES (?, ?, ?, ?)',
      [userId, tokenHash, 'verification', expiresAt]
    );

    await sendVerificationEmail(dbUser.email, dbUser.name, plainToken);

    res.json({ message: 'Verification email sent' });
  } catch (err) {
    console.error('Resend verification error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
