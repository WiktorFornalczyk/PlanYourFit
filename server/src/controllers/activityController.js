const pool = require('../database/pool');

const SELECT_ACTIVITY = `SELECT a.*, bd.court_type, bd.selected_place_id AS basketball_place_id,
 rd.target_distance_km, rd.actual_distance_km, rd.pace_min_per_km, rd.estimated_duration_minutes, rd.route_geojson,
 sd.selected_place_id AS swimming_place_id
 FROM activities a
 LEFT JOIN basketball_details bd ON bd.activity_id = a.id
 LEFT JOIN running_details rd ON rd.activity_id = a.id
 LEFT JOIN swimming_details sd ON sd.activity_id = a.id`;

function mapActivity(row) {
  return {
    id: row.id, activityType: row.activity_type, title: row.title,
    activityDate: row.activity_date instanceof Date ? row.activity_date.toISOString().slice(0, 10) : row.activity_date,
    startTime: String(row.start_time).slice(0, 5), endTime: String(row.end_time).slice(0, 5),
    locationLat: row.location_lat, locationLng: row.location_lng, locationAddress: row.location_address,
    note: row.note, status: row.status, searchRadiusKm: row.search_radius_km,
    details: {
      courtType: row.court_type, selectedPlaceId: row.basketball_place_id || row.swimming_place_id,
      targetDistanceKm: row.target_distance_km, actualDistanceKm: row.actual_distance_km,
      paceMinPerKm: row.pace_min_per_km, estimatedDurationMinutes: row.estimated_duration_minutes,
      routeGeojson: typeof row.route_geojson === 'string' ? JSON.parse(row.route_geojson) : row.route_geojson,
    },
  };
}

async function list(req, res) {
  const { from, to, type, search } = req.query;
  const conditions = ['a.user_id = ?']; const params = [req.user.id];
  if (from) { conditions.push('a.activity_date >= ?'); params.push(from); }
  if (to) { conditions.push('a.activity_date <= ?'); params.push(to); }
  if (type) { conditions.push('a.activity_type = ?'); params.push(type); }
  if (search) { conditions.push('(a.title LIKE ? OR a.location_address LIKE ? OR a.note LIKE ?)'); params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
  const [rows] = await pool.execute(`${SELECT_ACTIVITY} WHERE ${conditions.join(' AND ')} ORDER BY a.activity_date, a.start_time`, params);
  res.json({ activities: rows.map(mapActivity) });
}

async function getOne(req, res) {
  const [rows] = await pool.execute(`${SELECT_ACTIVITY} WHERE a.id = ? AND a.user_id = ? LIMIT 1`, [req.params.id, req.user.id]);
  if (!rows.length) return res.status(404).json({ message: 'Nie znaleziono aktywności.' });
  res.json({ activity: mapActivity(rows[0]) });
}

async function assertNoOverlap(connection, userId, data, excludeId = null) {
  const params = [userId, data.activityDate, data.endTime, data.startTime];
  let query = `SELECT id, title FROM activities WHERE user_id = ? AND activity_date = ?
    AND start_time < ? AND end_time > ?`;
  if (excludeId) { query += ' AND id <> ?'; params.push(excludeId); }
  const [rows] = await connection.execute(query, params);
  return rows;
}

async function insertDetails(connection, activityId, data) {
  const d = data.details || {};
  if (data.activityType === 'basketball') {
    await connection.execute(`INSERT INTO basketball_details
      (activity_id, court_type, selected_place_id, weather_summary_json, recommendation_status, recommendation_reason)
      VALUES (?, ?, ?, ?, ?, ?)`, [activityId, d.courtType || 'outdoor', d.selectedPlaceId || null, JSON.stringify(d.weather || null), d.recommendation?.status || 'unknown', d.recommendation?.message || null]);
  }
  if (data.activityType === 'running') {
    await connection.execute(`INSERT INTO running_details
      (activity_id, target_distance_km, actual_distance_km, pace_min_per_km, estimated_duration_minutes, route_geojson, weather_summary_json, recommendation_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [activityId, d.targetDistanceKm, d.actualDistanceKm || null, d.paceMinPerKm || null, d.estimatedDurationMinutes || null, JSON.stringify(d.routeGeojson || null), JSON.stringify(d.weather || null), d.recommendation?.status || 'unknown']);
  }
  if (data.activityType === 'swimming') {
    await connection.execute('INSERT INTO swimming_details (activity_id, selected_place_id) VALUES (?, ?)', [activityId, d.selectedPlaceId || null]);
  }
}

function addDays(dateString, days) {
  const date = new Date(`${dateString}T12:00:00Z`); date.setUTCDate(date.getUTCDate() + days); return date.toISOString().slice(0, 10);
}

async function create(req, res) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const overlaps = await assertNoOverlap(connection, req.user.id, req.body);
    if (overlaps.length && req.query.allowOverlap !== 'true') {
      await connection.rollback();
      return res.status(409).json({ message: `Termin nachodzi na: ${overlaps[0].title}.`, overlaps });
    }
    const count = req.body.repeatWeekly ? req.body.repeatCount : 1; const ids = [];
    for (let i = 0; i < count; i += 1) {
      const date = addDays(req.body.activityDate, i * 7);
      const [result] = await connection.execute(`INSERT INTO activities
        (user_id, activity_type, title, activity_date, start_time, end_time, location_lat, location_lng, location_address, note, search_radius_km)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [req.user.id, req.body.activityType, req.body.title, date, req.body.startTime, req.body.endTime, req.body.locationLat ?? null, req.body.locationLng ?? null, req.body.locationAddress, req.body.note, req.body.searchRadiusKm]);
      await insertDetails(connection, result.insertId, req.body); ids.push(result.insertId);
    }
    await connection.commit();
    res.status(201).json({ message: count > 1 ? `Dodano ${count} powtarzających się aktywności.` : 'Aktywność została dodana.', ids });
  } catch (error) { await connection.rollback(); throw error; } finally { connection.release(); }
}

async function update(req, res) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [owned] = await connection.execute('SELECT id FROM activities WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!owned.length) { await connection.rollback(); return res.status(404).json({ message: 'Nie znaleziono aktywności.' }); }
    const overlaps = await assertNoOverlap(connection, req.user.id, req.body, req.params.id);
    if (overlaps.length && req.query.allowOverlap !== 'true') { await connection.rollback(); return res.status(409).json({ message: `Termin nachodzi na: ${overlaps[0].title}.`, overlaps }); }
    await connection.execute(`UPDATE activities SET activity_type=?, title=?, activity_date=?, start_time=?, end_time=?,
      location_lat=?, location_lng=?, location_address=?, note=?, search_radius_km=? WHERE id=? AND user_id=?`,
    [req.body.activityType, req.body.title, req.body.activityDate, req.body.startTime, req.body.endTime, req.body.locationLat ?? null, req.body.locationLng ?? null, req.body.locationAddress, req.body.note, req.body.searchRadiusKm, req.params.id, req.user.id]);
    await connection.execute('DELETE FROM basketball_details WHERE activity_id=?', [req.params.id]);
    await connection.execute('DELETE FROM running_details WHERE activity_id=?', [req.params.id]);
    await connection.execute('DELETE FROM swimming_details WHERE activity_id=?', [req.params.id]);
    await insertDetails(connection, req.params.id, req.body);
    await connection.commit(); res.json({ message: 'Zmiany zostały zapisane.' });
  } catch (error) { await connection.rollback(); throw error; } finally { connection.release(); }
}

async function remove(req, res) {
  const [result] = await pool.execute('DELETE FROM activities WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
  if (!result.affectedRows) return res.status(404).json({ message: 'Nie znaleziono aktywności.' });
  res.status(204).end();
}

module.exports = { list, getOne, create, update, remove, mapActivity, SELECT_ACTIVITY };
