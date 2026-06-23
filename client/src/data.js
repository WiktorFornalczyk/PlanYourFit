const iso = (date) => date.toISOString().slice(0, 10);
const atMonthDay = (offsetMonths, day, hour = 12) => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + offsetMonths, day, hour);
};
const relativeDate = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return iso(date);
};

export const SPORTS = {
  running: { label: 'Bieganie', short: 'Bieg', icon: 'run', color: 'lime' },
  basketball: { label: 'Koszykówka', short: 'Kosz', icon: 'basketball', color: 'orange' },
  swimming: { label: 'Pływanie', short: 'Basen', icon: 'swim', color: 'blue' },
};

export const demoUser = {
  id: 'demo',
  name: 'Maja',
  email: 'demo@planyourfit.pl',
  defaultLocation: 'Warszawa',
  defaultPostalCode: '00-001',
  defaultLocationLat: 52.2297,
  defaultLocationLng: 21.0122,
  preferredRadiusKm: 25,
  monthlyActivityGoal: 8,
  theme: 'light',
  demo: true,
};

export const demoActivities = [
  {
    id: 'd1',
    status: 'planned',
    activityType: 'running',
    title: 'Poranny bieg w Parku Saskim',
    activityDate: relativeDate(1),
    startTime: '07:30',
    endTime: '08:15',
    locationAddress: 'Ogród Saski, Warszawa',
    postalCode: '00-102',
    locationLat: 52.2415,
    locationLng: 21.0084,
    searchRadiusKm: 25,
    note: 'Spokojne tempo, druga strefa. Demo może pobrać pogodę i wygenerować wariant trasy.',
    details: { targetDistanceKm: 7, actualDistanceKm: 6.92, paceMinPerKm: 6, estimatedDurationMinutes: 42 },
  },
  {
    id: 'd2',
    status: 'planned',
    activityType: 'basketball',
    title: 'Koszykówka na hali',
    activityDate: relativeDate(3),
    startTime: '18:00',
    endTime: '19:30',
    locationAddress: 'OSiR Polna, ul. Polna 7A, Warszawa',
    postalCode: '00-625',
    locationLat: 52.2188,
    locationLng: 21.0151,
    searchRadiusKm: 25,
    note: 'Wyszukiwanie hal działa przez Overpass API od tej lokalizacji.',
    details: { courtType: 'indoor', selectedPlaceId: null },
  },
  {
    id: 'd3',
    status: 'planned',
    activityType: 'swimming',
    title: 'Regeneracja na basenie',
    activityDate: relativeDate(5),
    startTime: '10:00',
    endTime: '11:00',
    locationAddress: 'Pływalnia Polna, ul. Polna 7A, Warszawa',
    postalCode: '00-625',
    locationLat: 52.2188,
    locationLng: 21.0151,
    searchRadiusKm: 25,
    note: 'Baseny w pobliżu są pobierane przez Overpass API.',
    details: { selectedPlaceId: null },
  },
  {
    id: 'd4',
    status: 'completed',
    activityType: 'running',
    title: 'Luźne 5 km nad Wisłą',
    activityDate: relativeDate(-2),
    startTime: '17:00',
    endTime: '17:35',
    locationAddress: 'Bulwary Wiślane, Warszawa',
    postalCode: '00-390',
    locationLat: 52.2394,
    locationLng: 21.0313,
    searchRadiusKm: 25,
    note: 'Ukończony trening liczony do dystansu i celu w bieżącym miesiącu.',
    details: { targetDistanceKm: 5, actualDistanceKm: 5.1, paceMinPerKm: 6.5, estimatedDurationMinutes: 35 },
  },
  {
    id: 'd5',
    status: 'completed',
    activityType: 'basketball',
    title: 'Kosz po pracy',
    activityDate: iso(atMonthDay(0, Math.max(1, new Date().getDate() - 6))),
    startTime: '18:30',
    endTime: '19:45',
    locationAddress: 'Hala sportowa Solec, ul. Solec 71, Warszawa',
    postalCode: '00-403',
    locationLat: 52.2321,
    locationLng: 21.0316,
    searchRadiusKm: 25,
    note: 'Ukończona aktywność do statystyk miesiąca.',
    details: { courtType: 'indoor', selectedPlaceId: null },
  },
  {
    id: 'd6',
    status: 'completed',
    activityType: 'swimming',
    title: 'Technika kraula',
    activityDate: iso(atMonthDay(-1, 18)),
    startTime: '09:00',
    endTime: '10:00',
    locationAddress: 'Pływalnia Polna, ul. Polna 7A, Warszawa',
    postalCode: '00-625',
    locationLat: 52.2188,
    locationLng: 21.0151,
    searchRadiusKm: 25,
    note: 'Poprzedni miesiąc do porównania aktywności.',
    details: { selectedPlaceId: null },
  },
  {
    id: 'd7',
    status: 'cancelled',
    activityType: 'running',
    title: 'Odwołany bieg wieczorny',
    activityDate: relativeDate(-4),
    startTime: '20:00',
    endTime: '20:40',
    locationAddress: 'Pole Mokotowskie, Warszawa',
    postalCode: '02-554',
    locationLat: 52.2116,
    locationLng: 21.0057,
    searchRadiusKm: 25,
    note: 'Anulowane aktywności nie liczą się do celu ani ukończonych treningów.',
    details: { targetDistanceKm: 6, paceMinPerKm: 6.2 },
  },
];

export const formatDate = (dateString, options = {}) => new Intl.DateTimeFormat('pl-PL', { day: 'numeric', month: 'long', ...options }).format(new Date(`${dateString}T12:00:00`));
export const durationMinutes = (activity) => {
  const [sh, sm] = activity.startTime.split(':').map(Number); const [eh, em] = activity.endTime.split(':').map(Number);
  return eh * 60 + em - sh * 60 - sm;
};
