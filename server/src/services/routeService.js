const { openRouteServiceKey } = require('../config');

function makeDemoLoop(lat, lng, targetDistanceKm) {
  const radius = Math.max(0.004, targetDistanceKm / 440);
  const points = [];
  for (let i = 0; i <= 32; i += 1) {
    const angle = (i / 32) * Math.PI * 2;
    points.push([Number(lng) + Math.cos(angle) * radius, Number(lat) + Math.sin(angle) * radius]);
  }
  return {
    type: 'Feature', properties: { demo: true },
    geometry: { type: 'LineString', coordinates: points },
  };
}

async function createRunningRoute({ lat, lng, targetDistanceKm, paceMinPerKm = 6 }) {
  if (!openRouteServiceKey) {
    const actualDistanceKm = Number((targetDistanceKm * 0.98).toFixed(2));
    return {
      route: makeDemoLoop(lat, lng, targetDistanceKm), actualDistanceKm,
      estimatedDurationMinutes: Math.round(actualDistanceKm * paceMinPerKm),
      alternatives: [actualDistanceKm, Number((targetDistanceKm * 1.04).toFixed(2))], demo: true,
    };
  }

  const directions = [[Number(lng), Number(lat)], [Number(lng) + targetDistanceKm / 220, Number(lat) + targetDistanceKm / 300], [Number(lng), Number(lat)]];
  const response = await fetch('https://api.openrouteservice.org/v2/directions/foot-walking/geojson', {
    method: 'POST', headers: { Authorization: openRouteServiceKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ coordinates: directions }),
  });
  if (!response.ok) throw Object.assign(new Error('Nie udało się wyznaczyć trasy.'), { status: 502 });
  const data = await response.json();
  const feature = data.features[0];
  const actualDistanceKm = feature.properties.summary.distance / 1000;
  return {
    route: feature, actualDistanceKm: Number(actualDistanceKm.toFixed(2)),
    estimatedDurationMinutes: Math.round(actualDistanceKm * paceMinPerKm), alternatives: [Number(actualDistanceKm.toFixed(2))],
  };
}

module.exports = { createRunningRoute };
