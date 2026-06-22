import React from 'react';
import Icon from './Icon';
import RouteMap from './RouteMap';
import { formatDate, SPORTS } from '../data';

export default function ActivityDetails({ activity, onClose, onEdit, onDelete }) {
  const sport = SPORTS[activity.activityType];
  const weather = activity.details?.weather || { temperature: 18, windSpeed: 8, precipitation: 0 };
  const recommendation = activity.details?.recommendation || { status: 'good', message: 'Dobra pora na aktywność — warunki są korzystne.' };
  return <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
    <div className="modal details-modal" role="dialog" aria-modal="true">
      <div className={`details-hero ${sport.color}`}><button className="icon-button details-close" onClick={onClose}><Icon name="close"/></button><span className="big-sport-icon"><Icon name={sport.icon} size={35}/></span><span className="eyebrow">{sport.label}</span><h2>{activity.title}</h2><p><Icon name="calendar"/>{formatDate(activity.activityDate, { weekday: 'long' })}<i/> <Icon name="clock"/>{activity.startTime}–{activity.endTime}</p></div>
      <div className="details-body">
        <div className={`recommendation ${recommendation.status || 'good'}`}><span><Icon name={recommendation.status === 'bad' ? 'close' : 'check'}/></span><div><b>{recommendation.status === 'warning' ? 'Ostrożnie' : recommendation.status === 'bad' ? 'Niezalecane' : 'Warunki sprzyjają'}</b><p>{recommendation.message}</p></div></div>
        <div className="details-grid"><div className="detail-item"><span className="detail-icon"><Icon name="pin"/></span><div><small>Lokalizacja</small><b>{activity.postalCode ? `${activity.postalCode} · ` : ''}{activity.locationAddress}</b></div></div><div className="detail-item"><span className="detail-icon"><Icon name="clock"/></span><div><small>Czas trwania</small><b>{(() => { const [h,m]=activity.startTime.split(':').map(Number); const [eh,em]=activity.endTime.split(':').map(Number); return `${eh*60+em-h*60-m} min`; })()}</b></div></div>{activity.activityType === 'running' && <><div className="detail-item"><span className="detail-icon"><Icon name="route"/></span><div><small>Dystans</small><b>{activity.details?.actualDistanceKm || activity.details?.targetDistanceKm || 5} km</b></div></div><div className="detail-item"><span className="detail-icon"><Icon name="target"/></span><div><small>Tempo</small><b>{activity.details?.paceMinPerKm || 6}:00 min/km</b></div></div></>}</div>
        <RouteMap activity={activity}/>
        {activity.activityType !== 'swimming' && <div className="weather-strip"><div><Icon name="cloud"/><span><small>Pogoda</small><b>{weather.temperature ?? 18}°C</b></span></div><div><small>Wiatr</small><b>{weather.windSpeed ?? 8} km/h</b></div><div><small>Opady</small><b>{weather.precipitation ?? 0} mm</b></div></div>}
        {activity.note && <div className="note-box"><small>Twoja notatka</small><p>{activity.note}</p></div>}
      </div>
      <div className="modal-footer details-actions"><button className="danger-button" onClick={() => onDelete(activity)}><Icon name="trash"/> Usuń</button><button className="secondary-button" onClick={() => onEdit(activity)}><Icon name="edit"/> Edytuj</button><button className="primary-button" onClick={onClose}>Gotowe</button></div>
    </div>
  </div>;
}
