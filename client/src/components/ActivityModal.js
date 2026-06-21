import React, { useEffect, useMemo, useState } from 'react';
import Icon from './Icon';
import { api } from '../api';
import { demoPlaces, demoWeather, SPORTS } from '../data';

const emptyForm = (date) => ({
  activityType: 'running', title: 'Poranny bieg', activityDate: date || new Date().toISOString().slice(0, 10),
  startTime: '07:30', endTime: '08:15', locationAddress: '', locationLat: null, locationLng: null,
  note: '', searchRadiusKm: 10, repeatWeekly: false, repeatCount: 4,
  details: { targetDistanceKm: 5, paceMinPerKm: 6, courtType: 'outdoor', selectedPlaceId: null },
});

const titles = { running: 'Poranny bieg', basketball: 'Koszykówka', swimming: 'Trening pływacki' };

export default function ActivityModal({ initialDate, activity, demo, existingActivities, onClose, onSaved, notify }) {
  const [form, setForm] = useState(() => activity ? {
    ...emptyForm(activity.activityDate), ...activity, repeatWeekly: false, repeatCount: 4,
    details: { ...emptyForm().details, ...activity.details },
  } : emptyForm(initialDate));
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [geoBusy, setGeoBusy] = useState(false);
  const [places, setPlaces] = useState([]);
  const [placesBusy, setPlacesBusy] = useState(false);
  const [showPlaces, setShowPlaces] = useState(false);

  useEffect(() => {
    const handleEscape = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handleEscape); return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const set = (name, value) => setForm((current) => ({ ...current, [name]: value }));
  const setDetail = (name, value) => setForm((current) => ({ ...current, details: { ...current.details, [name]: value } }));

  const overlap = useMemo(() => existingActivities.find((item) => item.id !== activity?.id && item.activityDate === form.activityDate && item.startTime < form.endTime && item.endTime > form.startTime), [existingActivities, activity, form.activityDate, form.startTime, form.endTime]);

  const selectSport = (type) => setForm((current) => ({
    ...current, activityType: type, title: current.title === titles[current.activityType] || !current.title ? titles[type] : current.title,
    details: { ...current.details, selectedPlaceId: null },
  }));

  const useLocation = () => {
    if (!navigator.geolocation) return notify('Twoja przeglądarka nie obsługuje geolokalizacji.', 'error');
    setGeoBusy(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => { setForm((current) => ({ ...current, locationLat: coords.latitude, locationLng: coords.longitude, locationAddress: 'Moja bieżąca lokalizacja' })); setGeoBusy(false); notify('Lokalizacja została pobrana.', 'success'); },
      () => { setGeoBusy(false); notify('Nie udało się pobrać lokalizacji. Wpisz adres ręcznie.', 'error'); },
      { timeout: 8000, maximumAge: 300000 }
    );
  };

  const findPlaces = async () => {
    const type = form.activityType === 'swimming' ? 'pool' : 'hall';
    setPlacesBusy(true); setShowPlaces(true);
    try {
      const result = demo || !form.locationLat ? { places: demoPlaces[type] } : await api.places({ type, lat: form.locationLat, lng: form.locationLng, radiusKm: form.searchRadiusKm });
      setPlaces(result.places);
    } catch (error) { notify(error.message, 'error'); setPlaces(demoPlaces[type]); }
    finally { setPlacesBusy(false); }
  };

  const validate = () => {
    const next = {};
    if (!form.title.trim()) next.title = 'Podaj nazwę aktywności.';
    if (!form.activityDate) next.activityDate = 'Wybierz datę.';
    if (!form.locationAddress.trim()) next.locationAddress = 'Podaj lokalizację.';
    if (form.endTime <= form.startTime) next.endTime = 'Zakończenie musi być później niż start.';
    if (form.searchRadiusKm < 1 || form.searchRadiusKm > 50) next.searchRadiusKm = 'Dozwolony zakres to 1–50 km.';
    if (form.activityType === 'running' && (!form.details.targetDistanceKm || form.details.targetDistanceKm <= 0)) next.targetDistanceKm = 'Podaj dystans.';
    setErrors(next); return !Object.keys(next).length;
  };

  const submit = async (event) => {
    event.preventDefault(); if (!validate()) return;
    setBusy(true);
    try {
      let payload = { ...form, searchRadiusKm: Number(form.searchRadiusKm), repeatCount: Number(form.repeatCount), details: { ...form.details, targetDistanceKm: Number(form.details.targetDistanceKm || 0), paceMinPerKm: Number(form.details.paceMinPerKm || 0) } };
      if (form.activityType === 'running' && form.locationLat && !demo) {
        const route = await api.route({ lat: form.locationLat, lng: form.locationLng, targetDistanceKm: payload.details.targetDistanceKm, paceMinPerKm: payload.details.paceMinPerKm });
        payload.details = { ...payload.details, actualDistanceKm: route.actualDistanceKm, estimatedDurationMinutes: route.estimatedDurationMinutes, routeGeojson: route.route };
      }
      const weather = demo ? demoWeather : form.locationLat ? (await api.weather({ lat: form.locationLat, lng: form.locationLng, date: form.activityDate, from: form.startTime, to: form.endTime })).weather : null;
      if (weather) {
        const recommendation = demo
          ? { status: 'good', message: 'Dobra pora na aktywność — warunki są korzystne.' }
          : (await api.recommendation({ activityType: form.activityType, courtType: form.details.courtType, selectedPlace: form.details.selectedPlaceId, weather })).recommendation;
        payload.details = { ...payload.details, weather, recommendation };
      }
      if (!demo) {
        if (activity) await api.updateActivity(activity.id, payload, Boolean(overlap));
        else await api.createActivity(payload, Boolean(overlap));
      }
      onSaved(payload, activity?.id);
      notify(activity ? 'Aktywność została zaktualizowana.' : 'Aktywność jest już w kalendarzu!', 'success');
    } catch (error) { notify(error.message, 'error'); setBusy(false); }
  };

  return <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
    <div className="modal activity-modal" role="dialog" aria-modal="true" aria-labelledby="activity-modal-title">
      <div className="modal-header"><div><span className="eyebrow">{activity ? 'EDYCJA PLANU' : 'NOWA AKTYWNOŚĆ'}</span><h2 id="activity-modal-title">{activity ? 'Zmień szczegóły' : 'Zaplanuj ruch'}</h2></div><button className="icon-button" onClick={onClose}><Icon name="close"/></button></div>
      <form onSubmit={submit}>
        <div className="modal-scroll">
          <div className="sport-picker">
            {Object.entries(SPORTS).map(([key, sport]) => <button type="button" key={key} className={`sport-option ${form.activityType === key ? 'active' : ''}`} onClick={() => selectSport(key)}><span className={`sport-icon ${sport.color}`}><Icon name={sport.icon}/></span><b>{sport.label}</b>{form.activityType === key && <span className="selected-check"><Icon name="check" size={13}/></span>}</button>)}
          </div>

          <div className="form-grid">
            <label className="field span-2"><span>Nazwa aktywności</span><input value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Np. Bieg w parku"/>{errors.title && <small>{errors.title}</small>}</label>
            <label className="field"><span>Data</span><input type="date" value={form.activityDate} onChange={(e) => set('activityDate', e.target.value)}/>{errors.activityDate && <small>{errors.activityDate}</small>}</label>
            <div className="time-fields"><label className="field"><span>Od</span><input type="time" value={form.startTime} onChange={(e) => set('startTime', e.target.value)}/></label><label className="field"><span>Do</span><input type="time" value={form.endTime} onChange={(e) => set('endTime', e.target.value)}/>{errors.endTime && <small>{errors.endTime}</small>}</label></div>
          </div>

          {overlap && <div className="inline-alert warning"><Icon name="clock"/><div><b>Ten termin nachodzi na „{overlap.title}”</b><span>Możesz zapisać mimo to, ale warto sprawdzić godziny.</span></div></div>}

          {form.activityType === 'basketball' && <div className="dynamic-section"><div className="section-label">Rodzaj boiska</div><div className="choice-row"><button type="button" className={form.details.courtType === 'outdoor' ? 'active' : ''} onClick={() => setDetail('courtType', 'outdoor')}>Na zewnątrz</button><button type="button" className={form.details.courtType === 'indoor' ? 'active' : ''} onClick={() => setDetail('courtType', 'indoor')}>Na hali</button></div></div>}
          {form.activityType === 'running' && <div className="dynamic-section running-fields"><label className="field"><span>Dystans</span><div className="input-suffix"><input type="number" min="0.5" max="100" step="0.5" value={form.details.targetDistanceKm} onChange={(e) => setDetail('targetDistanceKm', e.target.value)}/><b>km</b></div>{errors.targetDistanceKm && <small>{errors.targetDistanceKm}</small>}</label><label className="field"><span>Tempo (opcjonalnie)</span><div className="input-suffix"><input type="number" min="2" max="20" step="0.1" value={form.details.paceMinPerKm} onChange={(e) => setDetail('paceMinPerKm', e.target.value)}/><b>min/km</b></div></label></div>}

          <div className="location-block">
            <div className="location-heading"><div><span className="section-label">Lokalizacja</span><p>Podaj adres lub użyj swojej pozycji</p></div><button type="button" className="text-button" onClick={useLocation} disabled={geoBusy}><Icon name="target"/>{geoBusy ? 'Pobieram…' : 'Użyj mojej lokalizacji'}</button></div>
            <label className="field location-input"><Icon name="pin"/><input value={form.locationAddress} onChange={(e) => set('locationAddress', e.target.value)} placeholder="Wpisz adres lub nazwę miejsca"/></label>{errors.locationAddress && <small className="field-error">{errors.locationAddress}</small>}
            <div className="range-row"><label>Promień wyszukiwania <b>{form.searchRadiusKm} km</b></label><input type="range" min="1" max="50" value={form.searchRadiusKm} onChange={(e) => set('searchRadiusKm', e.target.value)}/></div>
            {((form.activityType === 'swimming') || (form.activityType === 'basketball' && form.details.courtType === 'indoor')) && <button type="button" className="secondary-button full" onClick={findPlaces}><Icon name="search"/> Znajdź {form.activityType === 'swimming' ? 'baseny' : 'hale'} w pobliżu</button>}
            {showPlaces && <div className="places-list">{placesBusy ? <div className="loading-row"><span className="spinner"/>Szukam najlepszych miejsc…</div> : places.map((place) => <button type="button" key={place.id} className={form.details.selectedPlaceId === place.id ? 'selected' : ''} onClick={() => { setDetail('selectedPlaceId', place.id); set('locationAddress', place.address); }}><span className="place-icon"><Icon name={form.activityType === 'swimming' ? 'swim' : 'basketball'}/></span><span><b>{place.name}</b><small>{place.address} · {place.distanceKm} km</small></span><em>{place.rating} ★</em></button>)}</div>}
          </div>

          <label className="field"><span>Notatka <em>opcjonalnie</em></span><textarea rows="3" value={form.note} onChange={(e) => set('note', e.target.value)} placeholder="Co chcesz zapamiętać?"/></label>
          {!activity && <div className="repeat-row"><label className="switch"><input type="checkbox" checked={form.repeatWeekly} onChange={(e) => set('repeatWeekly', e.target.checked)}/><span/></label><div><b>Powtarzaj co tydzień</b><small>Dodaj serię do kalendarza</small></div>{form.repeatWeekly && <select value={form.repeatCount} onChange={(e) => set('repeatCount', e.target.value)}><option value="4">4 tygodnie</option><option value="8">8 tygodni</option><option value="12">12 tygodni</option></select>}</div>}
        </div>
        <div className="modal-footer"><button type="button" className="ghost-button" onClick={onClose}>Anuluj</button><button className="primary-button" disabled={busy}>{busy ? <><span className="spinner light"/>Zapisuję…</> : <><Icon name="check"/> {activity ? 'Zapisz zmiany' : 'Dodaj do kalendarza'}</>}</button></div>
      </form>
    </div>
  </div>;
}
