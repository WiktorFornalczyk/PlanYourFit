const pool = require('../database/pool');

async function stats(req, res) {
  const period = req.params.period === 'month' ? 'month' : 'week';
  const startExpression = period === 'month'
    ? 'DATE_FORMAT(CURRENT_DATE, \'%Y-%m-01\')'
    : 'DATE_SUB(CURRENT_DATE, INTERVAL WEEKDAY(CURRENT_DATE) DAY)';
  const endExpression = period === 'month'
    ? 'LAST_DAY(CURRENT_DATE)'
    : 'DATE_ADD(DATE_SUB(CURRENT_DATE, INTERVAL WEEKDAY(CURRENT_DATE) DAY), INTERVAL 6 DAY)';
  const [summary] = await pool.execute(`SELECT COUNT(*) AS activityCount,
    COALESCE(SUM(TIMESTAMPDIFF(MINUTE, start_time, end_time)), 0) AS totalMinutes,
    COALESCE(SUM(rd.actual_distance_km), 0) AS runningDistanceKm
    FROM activities a LEFT JOIN running_details rd ON rd.activity_id=a.id
    WHERE a.user_id=? AND a.status='completed' AND a.activity_date BETWEEN ${startExpression} AND ${endExpression}`, [req.user.id]);
  const [byType] = await pool.execute(`SELECT activity_type AS type, COUNT(*) AS count FROM activities
    WHERE user_id=? AND status='completed' AND activity_date BETWEEN ${startExpression} AND ${endExpression}
    GROUP BY activity_type`, [req.user.id]);
  res.json({ period, ...summary[0], byType });
}

module.exports = { stats };
