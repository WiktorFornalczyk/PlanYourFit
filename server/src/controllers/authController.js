const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../database/pool');
const { jwtSecret, jwtExpiresIn, nodeEnv } = require('../config');

const cookieOptions = { httpOnly: true, sameSite: 'lax', secure: nodeEnv === 'production', maxAge: 7 * 24 * 60 * 60 * 1000 };
const publicUser = (user) => ({ id: user.id, name: user.name, email: user.email, defaultLocation: user.default_location, defaultPostalCode: user.default_postal_code, preferredRadiusKm: user.preferred_radius_km, theme: user.theme });

async function register(req, res) {
  const { name, email, password } = req.body;
  const normalizedEmail = email.toLowerCase();
  const [existing] = await pool.execute('SELECT id FROM users WHERE email = ? LIMIT 1', [normalizedEmail]);
  if (existing.length) return res.status(409).json({ message: 'Konto z tym adresem e-mail już istnieje.' });
  const passwordHash = await bcrypt.hash(password, 12);
  const [result] = await pool.execute('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)', [name, normalizedEmail, passwordHash]);
  const user = { id: result.insertId, name, email: normalizedEmail };
  const token = jwt.sign({ id: user.id, email: user.email }, jwtSecret, { expiresIn: jwtExpiresIn });
  res.cookie('token', token, cookieOptions).status(201).json({ user });
}

async function login(req, res) {
  const [rows] = await pool.execute('SELECT * FROM users WHERE email = ? LIMIT 1', [req.body.email.toLowerCase()]);
  const user = rows[0];
  if (!user || !(await bcrypt.compare(req.body.password, user.password_hash))) {
    return res.status(401).json({ message: 'Niepoprawny e-mail lub hasło.' });
  }
  const token = jwt.sign({ id: user.id, email: user.email }, jwtSecret, { expiresIn: jwtExpiresIn });
  res.cookie('token', token, cookieOptions).json({ user: publicUser(user) });
}

async function me(req, res) {
  const [rows] = await pool.execute('SELECT * FROM users WHERE id = ? LIMIT 1', [req.user.id]);
  if (!rows.length) return res.status(404).json({ message: 'Nie znaleziono konta.' });
  res.json({ user: publicUser(rows[0]) });
}

function logout(req, res) { res.clearCookie('token', cookieOptions).status(204).end(); }

module.exports = { register, login, me, logout };
