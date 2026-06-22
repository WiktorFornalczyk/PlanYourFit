const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (response.status === 204) return null;
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || 'Nie udało się połączyć z serwerem.');
    error.status = response.status; error.details = data.details; error.data = data;
    throw error;
  }
  return data;
}

export const api = {
  me: () => request('/auth/me'),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  activities: (query = '') => request(`/activities${query}`),
  createActivity: (body, allowOverlap = false) => request(`/activities?allowOverlap=${allowOverlap}`, { method: 'POST', body: JSON.stringify(body) }),
  updateActivity: (id, body, allowOverlap = false) => request(`/activities/${id}?allowOverlap=${allowOverlap}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteActivity: (id) => request(`/activities/${id}`, { method: 'DELETE' }),
  reverseGeocode: (params) => request(`/geocoding/reverse?${new URLSearchParams(params)}`),
  geocode: (params) => request(`/geocoding/search?${new URLSearchParams(params)}`),
  localTime: (params) => request(`/timezone?${new URLSearchParams(params)}`),
  weather: (params) => request(`/weather?${new URLSearchParams(params)}`),
  places: (params) => request(`/places?${new URLSearchParams(params)}`),
  route: (body) => request('/routes/running', { method: 'POST', body: JSON.stringify(body) }),
  recommendation: (body) => request('/recommendations/evaluate', { method: 'POST', body: JSON.stringify(body) }),
  updateProfile: (body) => request('/users/me', { method: 'PUT', body: JSON.stringify(body) }),
  changePassword: (body) => request('/users/me/password', { method: 'PUT', body: JSON.stringify(body) }),
  updateActivityGoal: (body) => request('/users/me/activity-goal', { method: 'PUT', body: JSON.stringify(body) }),
};
