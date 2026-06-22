import React, { useEffect, useRef, useState } from 'react';
import Icon from './Icon';

export default function NotificationBell({ notifications, onSelect, onActivityStatus }) {
  const [open, setOpen] = useState(false);
  const [readIds, setReadIds] = useState([]);
  const wrapperRef = useRef(null);
  const unreadCount = notifications.filter((item) => !readIds.includes(item.id)).length;

  useEffect(() => {
    if (!open) return undefined;
    const closeOutside = (event) => {
      if (!wrapperRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', closeOutside);
    return () => document.removeEventListener('pointerdown', closeOutside);
  }, [open]);

  const toggle = () => {
    setOpen((current) => {
      if (!current) setReadIds((ids) => [...new Set([...ids, ...notifications.map((item) => item.id)])]);
      return !current;
    });
  };

  return <div className="notification-wrap" ref={wrapperRef}>
    <button className={`icon-button notification ${open ? 'active' : ''}`} onClick={toggle} title="Powiadomienia" aria-label="Powiadomienia" aria-expanded={open}>
      <Icon name="bell"/>
      {unreadCount > 0 && <i/>}
    </button>
    {open && <section className="notification-panel" aria-label="Powiadomienia">
      <header>
        <div><span className="eyebrow">POWIADOMIENIA</span><h3>Twój plan</h3></div>
        <button className="icon-button" onClick={() => setOpen(false)} aria-label="Zamknij powiadomienia"><Icon name="close" size={17}/></button>
      </header>
      <div className="notification-list">
        {notifications.length === 0 && <div className="notification-empty"><Icon name="check"/><b>Wszystko gotowe</b><span>Nie masz teraz nadchodzących przypomnień.</span></div>}
        {notifications.map((item) => item.type === 'confirmation' ? <article className="notification-item notification-confirmation" key={item.id}>
          <span className="notification-symbol confirmation"><Icon name="clock" size={18}/></span>
          <span><b>{item.title}</b><small>{item.body}</small><span className="notification-confirm-actions"><button type="button" className="confirm-yes" onClick={() => onActivityStatus(item.activity, 'completed')}><Icon name="check" size={14}/> Tak</button><button type="button" onClick={() => onActivityStatus(item.activity, 'cancelled')}><Icon name="close" size={14}/> Nie</button></span></span>
        </article> : <button className="notification-item" key={item.id} onClick={() => { onSelect(item); setOpen(false); }}>
          <span className={`notification-symbol ${item.type}`}><Icon name={item.type === 'goal' ? 'target' : 'calendar'} size={18}/></span>
          <span><b>{item.title}</b><small>{item.body}</small></span>
          <Icon name="chevronRight" size={16}/>
        </button>)}
      </div>
    </section>}
  </div>;
}
