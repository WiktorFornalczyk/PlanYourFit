import React, { useMemo, useRef, useState } from 'react';
import { SPORTS } from '../data';
import Icon from './Icon';

const normalize = (value) => String(value || '').toLocaleLowerCase('pl-PL').normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export default function SearchAutocomplete({ value, onChange, activities, sportFilter, setSportFilter, onSelect }) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const blurTimer = useRef(null);
  const query = normalize(value.trim());
  const suggestions = useMemo(() => {
    if (!query) return [];
    return activities
      .filter((activity) => normalize(activity.title).includes(query) && (!sportFilter || activity.activityType === sportFilter))
      .sort((a, b) => {
        const aStarts = normalize(a.title).startsWith(query); const bStarts = normalize(b.title).startsWith(query);
        if (aStarts !== bStarts) return aStarts ? -1 : 1;
        return `${b.activityDate}${b.startTime}`.localeCompare(`${a.activityDate}${a.startTime}`);
      })
      .slice(0, 6);
  }, [activities, query, sportFilter]);

  const choose = (activity) => {
    window.clearTimeout(blurTimer.current);
    onChange(activity.title);
    setOpen(false);
    onSelect(activity);
  };
  const handleKeyDown = (event) => {
    if (!open || !suggestions.length) return;
    if (event.key === 'ArrowDown') { event.preventDefault(); setActiveIndex((index) => (index + 1) % suggestions.length); }
    if (event.key === 'ArrowUp') { event.preventDefault(); setActiveIndex((index) => (index - 1 + suggestions.length) % suggestions.length); }
    if (event.key === 'Enter') { event.preventDefault(); choose(suggestions[activeIndex]); }
    if (event.key === 'Escape') setOpen(false);
  };

  return <div className="topbar-search">
    <Icon name="search"/>
    <input
      value={value}
      onChange={(event) => { onChange(event.target.value); setActiveIndex(0); setOpen(true); }}
      onFocus={() => setOpen(true)}
      onBlur={() => { blurTimer.current = window.setTimeout(() => setOpen(false), 120); }}
      onKeyDown={handleKeyDown}
      placeholder="Szukaj po nazwie…"
      role="combobox"
      aria-controls="activity-search-suggestions"
      aria-expanded={open && Boolean(query)}
      aria-autocomplete="list"
    />
    {value && <button type="button" className="search-clear" onMouseDown={(event) => event.preventDefault()} onClick={() => { onChange(''); setOpen(false); }} aria-label="Wyczyść wyszukiwanie"><Icon name="close" size={14}/></button>}
    <select value={sportFilter} onChange={(event) => { setSportFilter(event.target.value); setOpen(true); }} aria-label="Filtruj sport"><option value="">Wszystkie</option>{Object.entries(SPORTS).map(([key,sport])=><option value={key} key={key}>{sport.label}</option>)}</select>
    {open && query && <div className="search-suggestions" id="activity-search-suggestions" role="listbox">
      {suggestions.length ? suggestions.map((activity, index) => { const sport = SPORTS[activity.activityType]; return <button type="button" role="option" aria-selected={index === activeIndex} className={index === activeIndex ? 'active' : ''} key={activity.id} onMouseDown={(event) => event.preventDefault()} onMouseEnter={() => setActiveIndex(index)} onClick={() => choose(activity)}>
        <span className={`search-result-icon ${sport.color}`}><Icon name={sport.icon} size={18}/></span>
        <span><b>{activity.title}</b><small>{sport.label} · {activity.activityDate} · {activity.startTime}</small><small><Icon name="pin" size={11}/>{activity.postalCode ? `${activity.postalCode} · ` : ''}{activity.locationAddress}</small></span>
        <Icon name="chevronRight" size={16}/>
      </button>; }) : <div className="search-no-results"><Icon name="search"/><span><b>Brak wyników</b><small>Spróbuj wpisać inną nazwę aktywności.</small></span></div>}
    </div>}
  </div>;
}
