require('dotenv').config();

const bcrypt = require('bcryptjs');
const cors = require('cors');
const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const port = Number(process.env.PORT || 8090);
const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret || jwtSecret.length < 32) {
  throw new Error('JWT_SECRET must be set to a random value of at least 32 characters');
}

const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT || 5432),
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  max: 10,
  idleTimeoutMillis: 30000
});

const app = express();
app.disable('x-powered-by');
if (process.env.CORS_ORIGIN) {
  app.use(cors({ origin: process.env.CORS_ORIGIN }));
}
app.use(helmet());
app.use(express.json({ limit: '10kb' }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many attempts. Please try again later.' }
});

function publicUser(row) {
  return { id: row.id, name: row.name, email: row.email };
}

function issueToken(user) {
  return jwt.sign({ sub: String(user.id), email: user.email }, jwtSecret, {
    expiresIn: '8h',
    issuer: 'relay-auth'
  });
}

function requireAuth(req, res, next) {
  const [scheme, token] = (req.get('authorization') || '').split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Sign in to continue.' });
  }

  try {
    req.auth = jwt.verify(token, jwtSecret, { issuer: 'relay-auth' });
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Your session has expired. Sign in again.' });
  }
}

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok' });
  } catch (error) {
    res.status(503).json({ status: 'unavailable' });
  }
});

app.post('/api/auth/signup', authLimiter, async (req, res) => {
  const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body.password === 'string' ? req.body.password : '';

  if (name.length < 2 || name.length > 80) {
    return res.status(400).json({ message: 'Enter a name between 2 and 80 characters.' });
  }
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: 'Enter a valid email address.' });
  }
  if (password.length < 8 || Buffer.byteLength(password, 'utf8') > 72) {
    return res.status(400).json({ message: 'Password must be 8-72 bytes long.' });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      'INSERT INTO auth_users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name, email, passwordHash]
    );
    const user = publicUser(result.rows[0]);
    res.status(201).json({ user, token: issueToken(user) });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ message: 'An account already exists for that email.' });
    }
    console.error('Signup failed:', error.message);
    res.status(500).json({ message: 'Could not create the account.' });
  }
});

app.post('/api/auth/login', authLimiter, async (req, res) => {
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body.password === 'string' ? req.body.password : '';

  if (!email || !password) {
    return res.status(400).json({ message: 'Enter your email and password.' });
  }

  try {
    const result = await pool.query(
      'SELECT id, name, email, password_hash FROM auth_users WHERE email = $1',
      [email]
    );
    const row = result.rows[0];
    if (!row || !(await bcrypt.compare(password, row.password_hash))) {
      return res.status(401).json({ message: 'Email or password is incorrect.' });
    }
    const user = publicUser(row);
    res.json({ user, token: issueToken(user) });
  } catch (error) {
    console.error('Login failed:', error.message);
    res.status(500).json({ message: 'Could not sign in right now.' });
  }
});

app.get('/api/auth/me', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email FROM auth_users WHERE id = $1',
      [req.auth.sub]
    );
    if (!result.rowCount) return res.status(401).json({ message: 'Account no longer exists.' });
    res.json({ user: publicUser(result.rows[0]) });
  } catch (error) {
    console.error('Session lookup failed:', error.message);
    res.status(500).json({ message: 'Could not validate the session.' });
  }
});

async function start() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS auth_users (
      id BIGSERIAL PRIMARY KEY,
      name VARCHAR(80) NOT NULL,
      email VARCHAR(254) NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  app.listen(port, '0.0.0.0', () => console.log(`Auth service listening on ${port}`));
}

start().catch((error) => {
  console.error('Auth service startup failed:', error.message);
  process.exit(1);
});
