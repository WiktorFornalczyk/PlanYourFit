import React, { useMemo, useState } from 'react';
import Calendar from '../components/Calendar';
import Icon from '../components/Icon';
import { durationMinutes, SPORTS } from '../data';

function StatCard({ icon, tone, label, value, suffix, trend }) {
  return <article className="stat-card"><span className={`stat-icon ${tone}`}><Icon name={icon}/></span><div><small>{label}</small><strong>{value}<em>{suffix}</em></strong></div>{trend && <span className="trend">↗ {trend}</span>}</article>;
}

function Upcoming({ activities, onSelect }) {
  const now = new Date().toISOString().slice(0, 10);
  const upcoming = activities.filter((a) => a.activityDate >= now).sort((a, b) => `${a.activityDate}${a.startTime}`.localeCompare(`${b.activityDate}${b.startTime}`)).slice(0, 4);
  return <section className="card upcoming-card"><div className="section-heading"><div><span className="eyebrow">NA HORYZONCIE</span><h2>Najbliższe aktywności</h2></div><button>Wszystkie <Icon name="arrow" size={16}/></button></div>
    <div className="upcoming-list">{upcoming.length ? upcoming.map((activity) => { const sport = SPORTS[activity.activityType]; return <button className="upcoming-item" key={activity.id} onClick={() => onSelect(activity)}><span className={`date-tile ${sport.color}`}><b>{new Date(`${activity.activityDate}T12:00:00`).getDate()}</b><small>{new Intl.DateTimeFormat('pl-PL',{month:'short'}).format(new Date(`${activity.activityDate}T12:00:00`)).replace('.','')}</small></span><span className="upcoming-info"><b>{activity.title}</b><small><Icon name="clock" size={14}/>{activity.startTime}–{activity.endTime}<i/> <Icon name="pin" size={14}/>{activity.locationAddress}</small></span><span className={`sport-mini ${sport.color}`}><Icon name={sport.icon}/></span><Icon name="chevronRight" size={18}/></button>; }) : <div className="empty-state"><span><Icon name="calendar"/></span><b>Spokojny kalendarz</b><p>Dodaj pierwszą aktywność i zacznij planować.</p></div>}</div>
  </section>;
}

function WeeklyChart({ activities }) {
  const today = new Date(); const monday = new Date(today); monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(monday); d.setDate(monday.getDate() + i); return d; });
  const values = days.map((d) => activities.filter((a) => a.activityDate === d.toISOString().slice(0, 10)).reduce((sum, a) => sum + durationMinutes(a), 0));
  const max = Math.max(90, ...values);
  return <section className="card weekly-card"><div className="section-heading"><div><span className="eyebrow">TEN TYDZIEŃ</span><h2>Twój rytm aktywności</h2></div><span className="chart-total">{Math.round(values.reduce((a,b)=>a+b,0)/60*10)/10}<small> godz.</small></span></div><div className="bar-chart">{values.map((value, index) => <div className="bar-column" key={days[index].toISOString()}><div className="bar-track"><span className={index === ((today.getDay()+6)%7) ? 'today' : ''} style={{ height: `${Math.max(value ? 14 : 3, value / max * 100)}%` }}>{value > 0 && <i>{value} min</i>}</span></div><small>{['Pn','Wt','Śr','Cz','Pt','So','Nd'][index]}</small></div>)}</div><div className="weekly-legend"><span><i className="lime-dot"/> Zaplanowane</span><span><Icon name="spark" size={14}/> Regularność buduje formę</span></div></section>;
}

export default function Dashboard({ user, activities, onAdd, onSelect, search, sportFilter }) {
  const [date, setDate] = useState(new Date()); const [view, setView] = useState('month');
  const filtered = useMemo(() => activities.filter((a) => (!sportFilter || a.activityType === sportFilter) && (!search || `${a.title} ${a.locationAddress} ${a.note}`.toLowerCase().includes(search.toLowerCase()))), [activities, search, sportFilter]);
  const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7)); weekStart.setHours(0,0,0,0);
  const weekEnd = new Date(weekStart); weekEnd.setDate(weekStart.getDate() + 7);
  const thisWeek = activities.filter((a) => { const d = new Date(`${a.activityDate}T12:00:00`); return d >= weekStart && d < weekEnd; });
  const minutes = thisWeek.reduce((sum, a) => sum + durationMinutes(a), 0);
  const distance = thisWeek.filter((a) => a.activityType === 'running').reduce((sum, a) => sum + Number(a.details?.actualDistanceKm || a.details?.targetDistanceKm || 0), 0);
  const greeting = new Date().getHours() < 12 ? 'Dzień dobry' : new Date().getHours() < 18 ? 'Miłego popołudnia' : 'Dobry wieczór';
  return <div className="dashboard-content"><header className="page-intro"><div><span className="eyebrow">{new Intl.DateTimeFormat('pl-PL',{weekday:'long',day:'numeric',month:'long'}).format(new Date()).toUpperCase()}</span><h1>{greeting}, {user.name}! <span>👋</span></h1><p>Twój tydzień wygląda dobrze. Każdy ruch się liczy.</p></div><button className="primary-button add-main" onClick={() => onAdd()}><Icon name="plus"/> Dodaj aktywność</button></header>
    <section className="stats-grid"><StatCard icon="calendar" tone="lime" label="Aktywności w tym tygodniu" value={thisWeek.length} trend={thisWeek.length ? '+1 vs poprzedni' : ''}/><StatCard icon="clock" tone="purple" label="Łączny czas" value={Math.floor(minutes/60)} suffix={` h ${minutes%60} min`}/><StatCard icon="route" tone="orange" label="Przebiegnięty dystans" value={distance.toFixed(1)} suffix=" km"/><StatCard icon="spark" tone="blue" label="Najczęstsza aktywność" value={thisWeek.length ? SPORTS[Object.keys(SPORTS).sort((a,b)=>thisWeek.filter(x=>x.activityType===b).length-thisWeek.filter(x=>x.activityType===a).length)[0]].short : '—'}/></section>
    <Calendar {...{ date, setDate, view, setView }} activities={filtered} onSelect={onSelect} onDayClick={(day) => onAdd(day)}/>
    <div className="dashboard-lower"><Upcoming activities={filtered} onSelect={onSelect}/><WeeklyChart activities={activities}/></div>
  </div>;
}
