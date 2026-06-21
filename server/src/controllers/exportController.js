const pool = require('../database/pool');

const icsEscape = (value = '') => String(value).replace(/\\/g, '\\\\').replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\n/g, '\\n');
const icsDate = (date, time) => `${String(date).slice(0, 10).replace(/-/g, '')}T${String(time).slice(0, 5).replace(':', '')}00`;

async function exportIcs(req, res) {
  const [rows] = await pool.execute('SELECT * FROM activities WHERE user_id=? ORDER BY activity_date, start_time', [req.user.id]);
  const events = rows.map((a) => `BEGIN:VEVENT\r\nUID:${a.id}@planyourfit.local\r\nDTSTART:${icsDate(a.activity_date, a.start_time)}\r\nDTEND:${icsDate(a.activity_date, a.end_time)}\r\nSUMMARY:${icsEscape(a.title)}\r\nLOCATION:${icsEscape(a.location_address)}\r\nDESCRIPTION:${icsEscape(a.note)}\r\nEND:VEVENT`).join('\r\n');
  const calendar = `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//PlanYourFit//PL\r\nCALSCALE:GREGORIAN\r\n${events}\r\nEND:VCALENDAR`;
  res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="planyourfit.ics"');
  res.send(calendar);
}

module.exports = { exportIcs };
