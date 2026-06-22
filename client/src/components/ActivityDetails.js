import React from 'react';
import Icon from './Icon';
import RouteMap from './RouteMap';
import { formatDate, SPORTS } from '../data';

function googleMapsRouteUrl(activity) {
  const coordinates = activity.details?.routeGeojson?.geometry?.coordinates || [];
  if (coordinates.length < 2) return null;
  const format = ([lng, lat]) => `${Number(lat).toFixed(6)},${Number(lng).toFixed(6)}`;
  const start = coordinates[0];
  const waypointCount = Math.min(5, coordinates.length - 2);
  const waypoints = Array.from({ length: waypointCount }, (_, index) => {
    const coordinateIndex = Math.round((index + 1) * (coordinates.length - 1) / (waypointCount + 1));
    return format(coordinates[coordinateIndex]);
  });
  const params = new URLSearchParams({ api:'1', origin:format(start), destination:format(start), travelmode:'walking' });
  if (waypoints.length) params.set('waypoints', waypoints.join('|'));
  return `https://www.google.com/maps/dir/?${params}`;
}

export default function ActivityDetails({ activity, onClose, onEdit, onDelete }) {
  const sport = SPORTS[activity.activityType];
  const weather = activity.details?.weather || { temperature: 18, windSpeed: 8, precipitation: 0 };
  const recommendation = activity.details?.recommendation || { status: 'good', message: 'Dobra pora na aktywność — warunki są korzystne.' };
  const googleMapsUrl = googleMapsRouteUrl(activity);
  return <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
    <div className="modal details-modal" role="dialog" aria-modal="true">
      <div className={`details-hero ${sport.color}`}><button className="icon-button details-close" onClick={onClose}><Icon name="close"/></button><span className="big-sport-icon"><Icon name={sport.icon} size={35}/></span><span className="eyebrow">{sport.label}</span><h2>{activity.title}</h2><p><Icon name="calendar"/>{formatDate(activity.activityDate, { weekday: 'long' })}<i/> <Icon name="clock"/>{activity.startTime}–{activity.endTime}</p></div>
      <div className="details-body">
        <div className={`recommendation ${recommendation.status || 'good'}`}><span><Icon name={recommendation.status === 'bad' ? 'close' : 'check'}/></span><div><b>{recommendation.status === 'warning' ? 'Ostrożnie' : recommendation.status === 'bad' ? 'Niezalecane' : 'Warunki sprzyjają'}</b><p>{recommendation.message}</p></div></div>
        <div className="details-grid"><div className="detail-item"><span className="detail-icon"><Icon name="pin"/></span><div><small>Lokalizacja</small><b>{activity.postalCode ? `${activity.postalCode} · ` : ''}{activity.locationAddress}</b></div></div><div className="detail-item"><span className="detail-icon"><Icon name="clock"/></span><div><small>Czas trwania</small><b>{(() => { const [h,m]=activity.startTime.split(':').map(Number); const [eh,em]=activity.endTime.split(':').map(Number); return `${eh*60+em-h*60-m} min`; })()}</b></div></div>{activity.activityType === 'running' && <><div className="detail-item"><span className="detail-icon"><Icon name="route"/></span><div><small>Dystans</small><b>{activity.details?.actualDistanceKm || activity.details?.targetDistanceKm || 5} km</b></div></div><div className="detail-item"><span className="detail-icon"><Icon name="target"/></span><div><small>Tempo</small><b>{activity.details?.paceMinPerKm || 6}:00 min/km</b></div></div></>}</div>
        <RouteMap activity={activity}/>
        {googleMapsUrl && <div className="route-external-actions"><a className="secondary-button" href={googleMapsUrl} target="_blank" rel="noreferrer"><Icon name="route"/> Otwórz trasę w Google Maps</a><small>Google Maps może nieznacznie przeliczyć przebieg trasy pieszej.</small></div>}
        {activity.activityType !== 'swimming' && <div className="weather-strip"><div><Icon name="cloud"/><span><small>Pogoda</small><b>{weather.temperature ?? 18}°C</b></span></div><div><small>Wiatr</small><b>{weather.windSpeed ?? 8} km/h</b></div><div><small>Opady</small><b>{weather.precipitation ?? 0} mm</b></div></div>}
        {activity.note && <div className="note-box"><small>Twoja notatka</small><p>{activity.note}</p></div>}
      </div>
      <div className="modal-footer details-actions"><button className="danger-button" onClick={() => onDelete(activity)}><Icon name="trash"/> Usuń</button><button className="secondary-button" onClick={() => onEdit(activity)}><Icon name="edit"/> Edytuj</button><button className="primary-button" onClick={onClose}>Gotowe</button></div>
    </div>
  </div>;
}
