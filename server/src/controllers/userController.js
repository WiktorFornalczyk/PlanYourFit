const bcrypt = require('bcryptjs');
const pool = require('../database/pool');

async function updateProfile(req, res) {
  const [emailOwner] = await pool.execute('SELECT id FROM users WHERE email=? AND id<>? LIMIT 1', [req.body.email.toLowerCase(), req.user.id]);
  if (emailOwner.length) return res.status(409).json({ message: 'Ten adres e-mail jest już używany.' });
  await pool.execute(`UPDATE users SET name=?, email=?, default_location=?, default_postal_code=?, default_location_lat=?, default_location_lng=?, preferred_radius_km=?, theme=? WHERE id=?`,
    [req.body.name, req.body.email.toLowerCase(), req.body.defaultLocation, req.body.defaultPostalCode, req.body.defaultLocationLat ?? null, req.body.defaultLocationLng ?? null, req.body.preferredRadiusKm, req.body.theme, req.user.id]);
  res.json({ message: 'Ustawienia konta zostały zapisane.' });
}

async function changePassword(req, res) {
  const [rows] = await pool.execute('SELECT password_hash FROM users WHERE id=?', [req.user.id]);
  if (!rows.length || !(await bcrypt.compare(req.body.currentPassword, rows[0].password_hash))) {
    return res.status(400).json({ message: 'Obecne hasło jest niepoprawne.' });
  }
  const hash = await bcrypt.hash(req.body.newPassword, 12);
  await pool.execute('UPDATE users SET password_hash=? WHERE id=?', [hash, req.user.id]);
  res.json({ message: 'Hasło zostało zmienione.' });
}

async function updateActivityGoal(req, res) {
  await pool.execute('UPDATE users SET monthly_activity_goal=? WHERE id=?', [req.body.monthlyActivityGoal, req.user.id]);
  res.json({ message:'Miesięczny cel został zapisany.', monthlyActivityGoal:req.body.monthlyActivityGoal });
}

module.exports = { updateProfile, changePassword, updateActivityGoal };
