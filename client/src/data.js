const iso = (date) => date.toISOString().slice(0, 10);
const afterDays = (days) => { const d = new Date(); d.setDate(d.getDate() + days); return iso(d); };

export const SPORTS = {
  running: { label: 'Bieganie', short: 'Bieg', icon: 'run', color: 'lime' },
  basketball: { label: 'Koszykówka', short: 'Kosz', icon: 'basketball', color: 'orange' },
  swimming: { label: 'Pływanie', short: 'Basen', icon: 'swim', color: 'blue' },
};

export const demoUser = { id: 'demo', name: 'Maja', email: 'demo@planyourfit.pl', defaultLocation: 'Warszawa', defaultPostalCode: '00-001', preferredRadiusKm: 10, theme: 'light', demo: true };

export const demoActivities = [
  { id: 'd1', activityType: 'running', title: 'Poranny bieg', activityDate: afterDays(1), startTime: '07:30', endTime: '08:15', locationAddress: 'Park Saski, Warszawa', postalCode: '00-102', note: 'Spokojne tempo, druga strefa', details: { targetDistanceKm: 7, actualDistanceKm: 6.92, paceMinPerKm: 6, estimatedDurationMinutes: 42 } },
  { id: 'd2', activityType: 'basketball', title: 'Koszykówka ze znajomymi', activityDate: afterDays(3), startTime: '18:00', endTime: '19:30', locationAddress: 'Hala Sportowa Arena', postalCode: '00-001', note: 'Rezerwacja potwierdzona', details: { courtType: 'indoor', selectedPlaceId: 'demo-hall-1' } },
  { id: 'd3', activityType: 'swimming', title: 'Regeneracja na basenie', activityDate: afterDays(5), startTime: '10:00', endTime: '11:00', locationAddress: 'Pływalnia Fala', postalCode: '00-001', note: 'Technika kraula', details: { selectedPlaceId: 'demo-pool-1' } },
  { id: 'd4', activityType: 'running', title: 'Luźne 5 km', activityDate: afterDays(-2), startTime: '17:00', endTime: '17:35', locationAddress: 'Bulwary Wiślane', postalCode: '00-001', note: '', details: { targetDistanceKm: 5, actualDistanceKm: 5.1, paceMinPerKm: 6.5 } },
];

export const demoWeather = { available: true, temperature: 18, precipitation: 0, windSpeed: 8, thunderstorm: false, source: 'Open-Meteo' };

export const demoPlaces = {
  hall: [
    { id: 'demo-hall-1', name: 'Hala Sportowa Arena', address: 'ul. Sportowa 12', openingHours: '06:00–23:00', distanceKm: 1.2, rating: 4.8 },
    { id: 'demo-hall-2', name: 'Centrum Aktywności', address: 'al. Zwycięstwa 8', openingHours: '07:00–22:00', distanceKm: 2.9, rating: 4.6 },
  ],
  pool: [
    { id: 'demo-pool-1', name: 'Pływalnia Fala', address: 'ul. Wodna 7', openingHours: '06:00–22:00', distanceKm: 1.7, rating: 4.7 },
    { id: 'demo-pool-2', name: 'Basen Olimpijski', address: 'ul. Rekreacyjna 21', openingHours: '06:30–21:30', distanceKm: 3.4, rating: 4.5 },
  ],
};

export const formatDate = (dateString, options = {}) => new Intl.DateTimeFormat('pl-PL', { day: 'numeric', month: 'long', ...options }).format(new Date(`${dateString}T12:00:00`));
export const durationMinutes = (activity) => {
  const [sh, sm] = activity.startTime.split(':').map(Number); const [eh, em] = activity.endTime.split(':').map(Number);
  return eh * 60 + em - sh * 60 - sm;
};
