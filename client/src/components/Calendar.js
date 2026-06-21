import React, { useMemo } from 'react';
import Icon from './Icon';
import { SPORTS } from '../data';

const WEEKDAYS = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Ndz'];
const sameDay = (a, b) => a.toISOString().slice(0, 10) === b.toISOString().slice(0, 10);
const toIsoLocal = (date) => {
  const y = date.getFullYear(); const m = String(date.getMonth() + 1).padStart(2, '0'); const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

function MonthView({ date, activities, onSelect, onDayClick }) {
  const days = useMemo(() => {
    const first = new Date(date.getFullYear(), date.getMonth(), 1);
    const offset = (first.getDay() + 6) % 7;
    const start = new Date(first); start.setDate(first.getDate() - offset);
    return Array.from({ length: 42 }, (_, i) => { const item = new Date(start); item.setDate(start.getDate() + i); return item; });
  }, [date]);
  const today = new Date();

  return <div className="month-grid">
    {WEEKDAYS.map((day) => <div className="weekday" key={day}>{day}</div>)}
    {days.map((day) => {
      const iso = toIsoLocal(day); const events = activities.filter((a) => a.activityDate === iso);
      return <div className={`calendar-day ${day.getMonth() !== date.getMonth() ? 'outside' : ''} ${sameDay(day, today) ? 'today' : ''}`} key={iso} onDoubleClick={() => onDayClick(iso)}>
        <button className="day-number" onClick={() => onDayClick(iso)} aria-label={`Dodaj aktywność ${iso}`}>{day.getDate()}</button>
        <div className="day-events">
          {events.slice(0, 3).map((event) => <button className={`event-pill ${SPORTS[event.activityType].color}`} key={event.id} onClick={(e) => { e.stopPropagation(); onSelect(event); }}>
            <span className="event-dot"/><span className="event-time">{event.startTime}</span><span className="event-name">{event.title}</span>
          </button>)}
          {events.length > 3 && <span className="more-events">+{events.length - 3} więcej</span>}
        </div>
      </div>;
    })}
  </div>;
}

function WeekView({ date, activities, onSelect, onDayClick, singleDay = false }) {
  const start = new Date(date);
  if (!singleDay) start.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  const days = Array.from({ length: singleDay ? 1 : 7 }, (_, i) => { const d = new Date(start); d.setDate(start.getDate() + i); return d; });
  const hours = Array.from({ length: 15 }, (_, i) => i + 6);
  return <div className={`schedule ${singleDay ? 'single-day' : ''}`}>
    <div className="schedule-head"><div/><div className="schedule-days" style={{ '--days': days.length }}>
      {days.map((day, i) => <button key={toIsoLocal(day)} className={sameDay(day, new Date()) ? 'active' : ''} onClick={() => onDayClick(toIsoLocal(day))}>
        <span>{WEEKDAYS[(day.getDay() + 6) % 7]}</span><strong>{day.getDate()}</strong>
      </button>)}
    </div></div>
    <div className="schedule-body"><div className="hour-labels">{hours.map((h) => <span key={h}>{String(h).padStart(2, '0')}:00</span>)}</div>
      <div className="schedule-columns" style={{ '--days': days.length }}>
        {days.map((day) => <div className="schedule-column" key={toIsoLocal(day)}>
          {hours.map((h) => <div className="hour-line" key={h}/>)}
          {activities.filter((a) => a.activityDate === toIsoLocal(day)).map((event) => {
            const [h, m] = event.startTime.split(':').map(Number); const [eh, em] = event.endTime.split(':').map(Number);
            const top = ((h - 6) * 60 + m) / (15 * 60) * 100; const height = Math.max(5, ((eh * 60 + em - h * 60 - m) / (15 * 60)) * 100);
            return <button key={event.id} className={`schedule-event ${SPORTS[event.activityType].color}`} style={{ top: `${top}%`, height: `${height}%` }} onClick={() => onSelect(event)}><b>{event.startTime}</b>{event.title}</button>;
          })}
        </div>)}
      </div>
    </div>
  </div>;
}

export default function Calendar({ date, setDate, view, setView, activities, onSelect, onDayClick }) {
  const move = (direction) => {
    const next = new Date(date);
    if (view === 'month') next.setMonth(date.getMonth() + direction);
    else next.setDate(date.getDate() + direction * (view === 'week' ? 7 : 1));
    setDate(next);
  };
  const title = view === 'month'
    ? new Intl.DateTimeFormat('pl-PL', { month: 'long', year: 'numeric' }).format(date)
    : new Intl.DateTimeFormat('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
  return <section className="card calendar-card">
    <div className="calendar-toolbar">
      <div className="calendar-title"><button className="icon-button" onClick={() => move(-1)}><Icon name="chevronLeft"/></button><h2>{title}</h2><button className="icon-button" onClick={() => move(1)}><Icon name="chevronRight"/></button><button className="today-button" onClick={() => setDate(new Date())}>Dziś</button></div>
      <div className="segmented">{[['month','Miesiąc'], ['week','Tydzień'], ['day','Dzień']].map(([key, label]) => <button className={view === key ? 'active' : ''} onClick={() => setView(key)} key={key}>{label}</button>)}</div>
    </div>
    {view === 'month' ? <MonthView {...{ date, activities, onSelect, onDayClick }}/> : <WeekView {...{ date, activities, onSelect, onDayClick }} singleDay={view === 'day'}/>} 
  </section>;
}
