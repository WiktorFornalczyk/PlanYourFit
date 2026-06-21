const { getWeather } = require('../services/weatherService');
const { searchPlaces } = require('../services/placesService');
const { createRunningRoute } = require('../services/routeService');
const { evaluateRecommendation } = require('../services/recommendationEngine');

async function weather(req, res) {
  const { lat, lng, date, from, to } = req.query;
  if (!lat || !lng || !date) return res.status(400).json({ message: 'Lokalizacja i data są wymagane.' });
  res.json({ weather: await getWeather({ lat, lng, date, from, to }) });
}

async function places(req, res) {
  const { type, lat, lng } = req.query; const radiusKm = Number(req.query.radiusKm || 10);
  if (!['hall', 'pool'].includes(type) || !lat || !lng || radiusKm < 1 || radiusKm > 50) {
    return res.status(400).json({ message: 'Podaj poprawny typ, lokalizację i promień 1–50 km.' });
  }
  res.json({ places: await searchPlaces({ type, lat: Number(lat), lng: Number(lng), radiusKm }) });
}

async function runningRoute(req, res) {
  const { lat, lng, targetDistanceKm, paceMinPerKm } = req.body;
  if (!lat || !lng || !targetDistanceKm || targetDistanceKm <= 0 || targetDistanceKm > 100) {
    return res.status(400).json({ message: 'Podaj poprawną lokalizację i dystans do 100 km.' });
  }
  res.json(await createRunningRoute({ lat, lng, targetDistanceKm: Number(targetDistanceKm), paceMinPerKm: Number(paceMinPerKm || 6) }));
}

function recommendation(req, res) { res.json({ recommendation: evaluateRecommendation(req.body) }); }

module.exports = { weather, places, runningRoute, recommendation };
