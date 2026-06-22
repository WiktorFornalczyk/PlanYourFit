import React, { useState } from 'react';
import Icon from '../components/Icon';
import NumberInput from '../components/NumberInput';
import { api } from '../api';
import { durationMinutes, SPORTS } from '../data';

export default function Analytics({ activities, user, demo, notify, onUserChange, calendarContext }) {
  const now = new Date(`${calendarContext.currentDate}T12:00:00`);
  const [goal, setGoal] = useState(user.monthlyActivityGoal || 12);
  const [goalBusy, setGoalBusy] = useState(false);
  const monthItems = activities.filter((activity) => {
    const date = new Date(`${activity.activityDate}T12:00:00`);
    return activity.status === 'completed' && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  });
  const minutes = monthItems.reduce((sum, activity) => sum + durationMinutes(activity), 0);
  const distance = monthItems.filter((activity) => activity.activityType === 'running').reduce((sum, activity) => sum + Number(activity.details?.actualDistanceKm || activity.details?.targetDistanceKm || 0), 0);
  const maxCount = Math.max(1, ...Object.keys(SPORTS).map((type) => monthItems.filter((activity) => activity.activityType === type).length));
  const progress = Math.min(100, Math.round(monthItems.length / goal * 100));
  const saveGoal = async (event) => {
    event.preventDefault();
    const monthlyActivityGoal = Number(goal);
    if (!Number.isInteger(monthlyActivityGoal) || monthlyActivityGoal < 1 || monthlyActivityGoal > 100) return notify('Cel musi wynosić od 1 do 100 aktywności.', 'error');
    setGoalBusy(true);
    try {
      if (!demo) await api.updateActivityGoal({ monthlyActivityGoal });
      onUserChange({ ...user, monthlyActivityGoal });
      notify('Miesięczny cel został zapisany.', 'success');
    } catch (error) { notify(error.message, 'error'); }
    finally { setGoalBusy(false); }
  };

  return <div className="analytics-page">
    <header className="page-intro"><div><span className="eyebrow">PODSUMOWANIE MIESIĄCA</span><h1>Twój ruch w liczbach</h1><p>Małe kroki układają się w całkiem dobrą historię.</p></div></header>
    <div className="analytics-grid">
      <section className="card analytics-hero"><div><span className="eyebrow">{new Intl.DateTimeFormat('pl-PL',{month:'long'}).format(now).toUpperCase()}</span><h2>{monthItems.length} ukończonych aktywności</h2><p>Łącznie {Math.floor(minutes/60)} h {minutes%60} min potwierdzonego ruchu.</p><form className="goal-editor" onSubmit={saveGoal}><label><span>Miesięczny cel</span><NumberInput min="1" max="100" value={goal} onChange={setGoal}/><small>aktywności</small></label><button disabled={goalBusy}>{goalBusy?'Zapisuję…':'Ustaw cel'}</button></form></div><div className="progress-ring" style={{'--progress':`${progress}%`}}><span><b>{progress}%</b><small>{monthItems.length} z {goal}</small></span></div></section>
      <section className="card sport-breakdown"><div className="section-heading"><div><span className="eyebrow">AKTYWNOŚCI</span><h2>Ulubione dyscypliny</h2></div></div>{Object.entries(SPORTS).map(([type,sport])=>{const count=monthItems.filter((activity)=>activity.activityType===type).length;return <div className="sport-bar" key={type}><span className={`sport-icon ${sport.color}`}><Icon name={sport.icon}/></span><div><p><b>{sport.label}</b><small>{count} treningi</small></p><i><em className={sport.color} style={{width:`${count/maxCount*100}%`}}/></i></div></div>})}</section>
      <section className="card milestone-card"><span className="milestone-icon"><Icon name="route" size={30}/></span><div><span className="eyebrow">DYSTANS BIEGOWY</span><h2>{distance.toFixed(1)} km</h2><p>To mniej więcej {Math.round(distance/42.195*100)}% maratonu.</p></div></section>
      <section className="card insight-card"><Icon name="spark"/><div><span className="eyebrow">WSKAZÓWKA</span><h3>Regularność wygrywa z intensywnością.</h3><p>Zaplanuj kolejną aktywność już dziś, nawet krótką.</p></div></section>
    </div>
  </div>;
}
