const { googlePlacesKey } = require('../config');
const pool = require('../database/pool');

const demoPlaces = {
  hall: [
    { id: 'demo-hall-1', name: 'Hala Sportowa Arena', address: 'ul. Sportowa 12', phone: '+48 22 410 20 30', website: '', openingHours: '06:00–23:00', rating: 4.8 },
    { id: 'demo-hall-2', name: 'Centrum Aktywności', address: 'al. Zwycięstwa 8', phone: '+48 22 555 14 90', website: '', openingHours: '07:00–22:00', rating: 4.6 },
  ],
  pool: [
    { id: 'demo-pool-1', name: 'Pływalnia Fala', address: 'ul. Wodna 7', phone: '+48 22 330 44 10', website: '', openingHours: '06:00–22:00', rating: 4.7 },
    { id: 'demo-pool-2', name: 'Basen Olimpijski', address: 'ul. Rekreacyjna 21', phone: '+48 22 771 02 11', website: '', openingHours: '06:30–21:30', rating: 4.5 },
  ],
};

function haversine(lat1, lng1, lat2, lng2) {
  const toRad = (value) => value * Math.PI / 180;
  const dLat = toRad(lat2 - lat1); const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function searchPlaces({ type, lat, lng, radiusKm }) {
  try {
    const [cached] = await pool.execute(
      `SELECT external_place_id AS id, name, address, phone, website, opening_hours_json AS openingHours,
       rating, lat, lng FROM places_cache WHERE place_type = ? AND cached_at > NOW() - INTERVAL 24 HOUR
       AND ST_Distance_Sphere(POINT(lng, lat), POINT(?, ?)) <= ? LIMIT 20`,
      [type, lng, lat, radiusKm * 1000]
    );
    if (cached.length) return cached.map((p) => ({ ...p, distanceKm: haversine(lat, lng, p.lat, p.lng) }));
  } catch (error) {
    if (process.env.NODE_ENV === 'production') throw error;
  }

  if (!googlePlacesKey) {
    return demoPlaces[type].map((place, index) => ({
      ...place, lat: Number(lat) + (index + 1) * 0.008, lng: Number(lng) + (index + 1) * 0.006,
      distanceKm: Number((1.2 + index * 1.7).toFixed(1)), demo: true,
    }));
  }

  const keyword = type === 'hall' ? 'sports hall basketball' : 'swimming pool';
  const params = new URLSearchParams({ location: `${lat},${lng}`, radius: String(radiusKm * 1000), keyword, key: googlePlacesKey });
  const response = await fetch(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?${params}`);
  if (!response.ok) throw Object.assign(new Error('Nie udało się wyszukać obiektów.'), { status: 502 });
  const data = await response.json();
  return (data.results || []).map((place) => ({
    id: place.place_id, name: place.name, address: place.vicinity, rating: place.rating,
    lat: place.geometry.location.lat, lng: place.geometry.location.lng,
    distanceKm: haversine(lat, lng, place.geometry.location.lat, place.geometry.location.lng),
  }));
}

module.exports = { searchPlaces };
