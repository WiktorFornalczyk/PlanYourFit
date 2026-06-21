const pool = require('../database/pool');

function weatherCodeIsThunderstorm(code) {
  return [95, 96, 99].includes(Number(code));
}

async function getWeather({ lat, lng, date, from }) {
  const hour = Number(String(from || '12:00').split(':')[0]);
  try {
    const [rows] = await pool.execute(
      `SELECT raw_json FROM weather_cache
       WHERE ROUND(lat, 2) = ROUND(?, 2) AND ROUND(lng, 2) = ROUND(?, 2)
       AND forecast_date = ? AND forecast_hour = ? AND cached_at > NOW() - INTERVAL 30 MINUTE
       LIMIT 1`, [lat, lng, date, hour]
    );
    if (rows.length) return typeof rows[0].raw_json === 'string' ? JSON.parse(rows[0].raw_json) : rows[0].raw_json;
  } catch (error) {
    if (process.env.NODE_ENV === 'production') throw error;
  }

  const params = new URLSearchParams({
    latitude: lat, longitude: lng,
    hourly: 'temperature_2m,precipitation,wind_speed_10m,weather_code',
    timezone: 'auto', start_date: date, end_date: date,
  });
  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  if (!response.ok) throw Object.assign(new Error('Nie udało się pobrać pogody.'), { status: 502 });
  const data = await response.json();
  const index = Math.max(0, Math.min(hour, (data.hourly?.time?.length || 1) - 1));
  const result = {
    available: true,
    temperature: data.hourly?.temperature_2m?.[index],
    precipitation: data.hourly?.precipitation?.[index] || 0,
    windSpeed: data.hourly?.wind_speed_10m?.[index] || 0,
    thunderstorm: weatherCodeIsThunderstorm(data.hourly?.weather_code?.[index]),
    weatherCode: data.hourly?.weather_code?.[index],
    source: 'Open-Meteo',
  };
  try {
    await pool.execute(
      'INSERT INTO weather_cache (lat, lng, forecast_date, forecast_hour, raw_json) VALUES (?, ?, ?, ?, ?)',
      [lat, lng, date, hour, JSON.stringify(result)]
    );
  } catch (error) {
    if (process.env.NODE_ENV === 'production') throw error;
  }
  return result;
}

module.exports = { getWeather };
