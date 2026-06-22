import React, { useEffect, useMemo, useState } from 'react';
import Calendar from '../components/Calendar';
import Icon from '../components/Icon';
import { durationMinutes, SPORTS } from '../data';

function StatCard({ icon, tone, label, value, suffix, trend }) {
  return <article className="stat-card"><span className={`stat-icon ${tone}`}><Icon name={icon}/></span><div><small>{label}</small><strong>{value}<em>{suffix}</em></strong></div>{trend && <span className={`trend ${trend.type}`}>{trend.icon} {trend.label}</span>}</article>;
}

function Upcoming({ activities, onSelect, currentDate }) {
  const upcoming = activities.filter((a) => (a.status || 'planned') === 'planned' && a.activityDate >= currentDate).sort((a, b) => `${a.activityDate}${a.startTime}`.localeCompare(`${b.activityDate}${b.startTime}`)).slice(0, 4);
  return <section className="card upcoming-card"><div className="section-heading"><div><span className="eyebrow">NA HORYZONCIE</span><h2>Najbliższe aktywności</h2></div><button>Wszystkie <Icon name="arrow" size={16}/></button></div>
    <div className="upcoming-list">{upcoming.length ? upcoming.map((activity) => { const sport = SPORTS[activity.activityType]; return <button className="upcoming-item" key={activity.id} onClick={() => onSelect(activity)}><span className={`date-tile ${sport.color}`}><b>{new Date(`${activity.activityDate}T12:00:00`).getDate()}</b><small>{new Intl.DateTimeFormat('pl-PL',{month:'short'}).format(new Date(`${activity.activityDate}T12:00:00`)).replace('.','')}</small></span><span className="upcoming-info"><b>{activity.title}</b><small><Icon name="clock" size={14}/>{activity.startTime}–{activity.endTime}<i/> <Icon name="pin" size={14}/>{activity.postalCode ? `${activity.postalCode} · ` : ''}{activity.locationAddress}</small></span><span className={`sport-mini ${sport.color}`}><Icon name={sport.icon}/></span><Icon name="chevronRight" size={18}/></button>; }) : <div className="empty-state"><span><Icon name="calendar"/></span><b>Spokojny kalendarz</b><p>Dodaj pierwszą aktywność i zacznij planować.</p></div>}</div>
  </section>;
}

function WeeklyChart({ activities, today }) {
  const toIsoLocal = (date) => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
  const monday = new Date(today); monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(monday); d.setDate(monday.getDate() + i); return d; });
  const values = days.map((d) => activities.filter((a) => a.status === 'completed' && a.activityDate === toIsoLocal(d)).reduce((sum, a) => sum + durationMinutes(a), 0));
  const max = Math.max(90, ...values);
  return <section className="card weekly-card"><div className="section-heading"><div><span className="eyebrow">TEN TYDZIEŃ</span><h2>Twój rytm aktywności</h2></div><span className="chart-total">{Math.round(values.reduce((a,b)=>a+b,0)/60*10)/10}<small> godz.</small></span></div><div className="bar-chart">{values.map((value, index) => <div className="bar-column" key={days[index].toISOString()}><div className="bar-track"><span className={index === ((today.getDay()+6)%7) ? 'today' : ''} style={{ height: `${Math.max(value ? 14 : 3, value / max * 100)}%` }}>{value > 0 && <i>{value} min</i>}</span></div><small>{['Pn','Wt','Śr','Cz','Pt','So','Nd'][index]}</small></div>)}</div><div className="weekly-legend"><span><i className="lime-dot"/> Ukończone</span><span><Icon name="spark" size={14}/> Regularność buduje formę</span></div></section>;
}

export default function Dashboard({ user, activities, onAdd, onSelect, search, sportFilter, calendarContext }) {
  const today = useMemo(() => new Date(`${calendarContext.currentDate}T${calendarContext.currentTime || '12:00'}:00`), [calendarContext.currentDate, calendarContext.currentTime]);
  const [date, setDate] = useState(today); const [view, setView] = useState('month');
  useEffect(() => setDate(new Date(`${calendarContext.currentDate}T12:00:00`)), [calendarContext.currentDate]);
  const filtered = useMemo(() => activities.filter((a) => (!sportFilter || a.activityType === sportFilter) && (!search || a.title.toLocaleLowerCase('pl-PL').includes(search.toLocaleLowerCase('pl-PL')))), [activities, search, sportFilter]);
  const now = today;
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const thisMonth = activities.filter((a) => { const d = new Date(`${a.activityDate}T12:00:00`); return d >= monthStart && d < nextMonthStart; });
  const previousMonth = activities.filter((a) => { const d = new Date(`${a.activityDate}T12:00:00`); return d >= previousMonthStart && d < monthStart; });
  const completedThisMonth = thisMonth.filter((a) => a.status === 'completed');
  const completedPreviousMonth = previousMonth.filter((a) => a.status === 'completed');
  const monthDifference = completedThisMonth.length - completedPreviousMonth.length;
  const monthTrend = monthDifference > 0
    ? { type: 'up', icon: '↗', label: `+${monthDifference} vs poprzedni miesiąc` }
    : monthDifference < 0
      ? { type: 'down', icon: '↘', label: `${monthDifference} vs poprzedni miesiąc` }
      : { type: 'same', icon: '→', label: '0 · bez zmian' };
  const minutes = completedThisMonth.reduce((sum, a) => sum + durationMinutes(a), 0);
  const distance = completedThisMonth.filter((a) => a.activityType === 'running').reduce((sum, a) => sum + Number(a.details?.actualDistanceKm || a.details?.targetDistanceKm || 0), 0);
  const mostFrequentType = Object.keys(SPORTS).reduce((best, type) => {
    const count = completedThisMonth.filter((a) => a.activityType === type).length;
    return count > best.count ? { type, count } : best;
  }, { type: null, count: 0 });
  const greeting = now.getHours() < 12 ? 'Dzień dobry' : now.getHours() < 18 ? 'Miłego popołudnia' : 'Dobry wieczór';
  return <div className="dashboard-content"><header className="page-intro"><div><span className="eyebrow">{new Intl.DateTimeFormat('pl-PL',{weekday:'long',day:'numeric',month:'long'}).format(today).toUpperCase()}</span><h1>{greeting}, {user.name}! <span>👋</span></h1><p>Twój tydzień wygląda dobrze. Każdy ruch się liczy.</p></div><button className="primary-button add-main" onClick={() => onAdd(calendarContext.currentDate)}><Icon name="plus"/> Dodaj aktywność</button></header>
    <section className="stats-grid"><StatCard icon="calendar" tone="lime" label="Ukończone w tym miesiącu" value={completedThisMonth.length} trend={monthTrend}/><StatCard icon="clock" tone="purple" label="Łączny czas" value={Math.floor(minutes/60)} suffix={` h ${minutes%60} min`}/><StatCard icon="route" tone="orange" label="Przebiegnięty dystans" value={distance.toFixed(1)} suffix=" km"/><StatCard icon="spark" tone="blue" label="Najczęstsza aktywność" value={mostFrequentType.type ? SPORTS[mostFrequentType.type].short : '—'}/></section>
    <Calendar {...{ date, today, setDate, view, setView }} activities={filtered} onSelect={onSelect} onDayClick={(day) => onAdd(day)}/>
    <div className="dashboard-lower"><Upcoming activities={filtered} onSelect={onSelect} currentDate={calendarContext.currentDate}/><WeeklyChart activities={activities} today={today}/></div>
  </div>;
}
