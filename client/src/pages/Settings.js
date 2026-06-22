import React, { useState } from 'react';
import Icon from '../components/Icon';
import NumberInput from '../components/NumberInput';
import { api } from '../api';

export default function Settings({ user, theme, setTheme, demo, notify, onUserChange, notifications, onNotificationSelect, onActivityStatus }) {
  const [form, setForm] = useState({ name:user.name, email:user.email, defaultLocation:user.defaultLocation || '', defaultPostalCode:user.defaultPostalCode || '', defaultLocationLat:user.defaultLocationLat ?? null, defaultLocationLng:user.defaultLocationLng ?? null, preferredRadiusKm:user.preferredRadiusKm || 10, theme });
  const [password, setPassword] = useState({ currentPassword:'', newPassword:'' });
  const [busy, setBusy] = useState(false);
  const [geoBusy, setGeoBusy] = useState(false);
  const [activeSection, setActiveSection] = useState('profile');
  const set = (key, value) => setForm((current) => ({ ...current, [key]:value, ...(['defaultLocation','defaultPostalCode'].includes(key) ? { defaultLocationLat:null, defaultLocationLng:null } : {}) }));
  const goToSection = (section) => { setActiveSection(section); document.getElementById(`settings-${section}`)?.scrollIntoView({ behavior:'smooth', block:'start' }); };
  const useLocation = () => {
    if (!navigator.geolocation) return notify('Twoja przeglądarka nie obsługuje geolokalizacji.', 'error');
    setGeoBusy(true);
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      try {
        const result = await api.reverseGeocode({ lat:coords.latitude, lng:coords.longitude });
        setForm((current) => ({ ...current, defaultLocation:result.location.address, defaultPostalCode:result.location.postalCode || current.defaultPostalCode, defaultLocationLat:coords.latitude, defaultLocationLng:coords.longitude }));
        notify('Domyślna lokalizacja została odczytana.', 'success');
      } catch (error) { notify(error.message, 'error'); }
      finally { setGeoBusy(false); }
    }, () => { setGeoBusy(false); notify('Nie udało się pobrać lokalizacji. Sprawdź zgodę przeglądarki.', 'error'); }, { timeout:8000, maximumAge:300000 });
  };
  const save = async (event) => {
    event.preventDefault(); setBusy(true);
    try {
      let payload = form;
      if (form.defaultLocation && (form.defaultLocationLat == null || form.defaultLocationLng == null)) {
        const result = await api.geocode({ address:form.defaultLocation, postalCode:form.defaultPostalCode });
        payload = { ...form, defaultLocationLat:result.location.lat, defaultLocationLng:result.location.lng }; setForm(payload);
      }
      if (!demo) await api.updateProfile(payload);
      onUserChange({ ...user, ...payload }); setTheme(payload.theme); notify('Ustawienia zostały zapisane.', 'success');
    } catch (error) { notify(error.message, 'error'); }
    finally { setBusy(false); }
  };
  const changePassword = async (event) => {
    event.preventDefault();
    if (password.newPassword.length < 8) return notify('Nowe hasło musi mieć co najmniej 8 znaków.', 'error');
    setBusy(true);
    try { if (!demo) await api.changePassword(password); setPassword({ currentPassword:'', newPassword:'' }); notify('Hasło zostało zmienione.', 'success'); }
    catch (error) { notify(error.message, 'error'); }
    finally { setBusy(false); }
  };
  return <div className="settings-page">
    <header className="page-intro"><div><span className="eyebrow">TWOJE PREFERENCJE</span><h1>Ustawienia</h1><p>Dopasuj PlanYourFit do swojego rytmu.</p></div></header>
    <div className="settings-layout">
      <nav className="settings-nav"><button type="button" className={activeSection==='profile'?'active':''} onClick={()=>goToSection('profile')}><Icon name="user"/> Profil</button><button type="button" className={activeSection==='location'?'active':''} onClick={()=>goToSection('location')}><Icon name="pin"/> Lokalizacja</button><button type="button" className={activeSection==='appearance'?'active':''} onClick={()=>goToSection('appearance')}><Icon name="moon"/> Wygląd</button><button type="button" className={activeSection==='notifications'?'active':''} onClick={()=>goToSection('notifications')}><Icon name="bell"/> Powiadomienia</button></nav>
      <div className="settings-main">
        <form className="card settings-card settings-anchor" id="settings-profile" onSubmit={save}>
          <div className="settings-heading"><span className="profile-avatar">{user.name.slice(0,2).toUpperCase()}</span><div><h2>Dane profilu</h2><p>Podstawowe informacje o Twoim koncie.</p></div></div>
          <div className="form-grid">
            <label className="field"><span>Imię</span><input value={form.name} onChange={(event)=>set('name',event.target.value)} required/></label>
            <label className="field"><span>E-mail</span><input type="email" value={form.email} onChange={(event)=>set('email',event.target.value)} required/></label>
            <div className="field span-2 settings-anchor" id="settings-location"><span>Domyślna lokalizacja</span><div className="field-with-icon"><Icon name="pin"/><input value={form.defaultLocation} onChange={(event)=>set('defaultLocation',event.target.value)} placeholder="Np. Warszawa"/></div><button type="button" className="text-button settings-location-button" onClick={useLocation} disabled={geoBusy}><Icon name="target"/>{geoBusy?'Pobieram…':'Użyj mojej lokalizacji'}</button><a className="osm-attribution" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">Adresy: © OpenStreetMap contributors</a></div>
            <label className="field"><span>Kod pocztowy</span><input value={form.defaultPostalCode} onChange={(event)=>set('defaultPostalCode',event.target.value)} placeholder="00-000" inputMode="numeric" maxLength="6" pattern="\d{2}-\d{3}" required={Boolean(form.defaultLocation)}/></label>
            <label className="field"><span>Domyślny promień</span><div className="input-suffix"><NumberInput min="1" max="50" value={form.preferredRadiusKm} onChange={(value)=>set('preferredRadiusKm',value)}/><b>km</b></div></label>
          </div>
          <div className="theme-setting settings-anchor" id="settings-appearance"><span>Motyw aplikacji</span><div className="theme-options">{[['light','Jasny','sun'],['dark','Ciemny','moon'],['system','Systemowy','settings']].map(([value,label,icon])=><button type="button" key={value} className={form.theme===value?'active':''} onClick={()=>set('theme',value)}><Icon name={icon}/><b>{label}</b>{form.theme===value&&<Icon name="check" size={15}/>}</button>)}</div></div>
          <div className="settings-footer"><button className="primary-button" disabled={busy}>{busy?'Zapisuję…':'Zapisz ustawienia'}</button></div>
        </form>
        <section className="card settings-card settings-anchor settings-notifications" id="settings-notifications">
          <div className="settings-heading"><span className="settings-symbol"><Icon name="bell"/></span><div><h2>Powiadomienia</h2><p>Przypomnienia o zapisanych treningach i realizacji miesięcznego celu.</p></div></div>
          <div className="settings-notification-list">
            {notifications.length === 0 && <div className="notification-empty"><Icon name="check"/><b>Wszystko gotowe</b><span>Nie masz teraz nadchodzących przypomnień.</span></div>}
            {notifications.map((item) => item.type === 'confirmation' ? <article className="notification-item notification-confirmation" key={item.id}>
              <span className="notification-symbol confirmation"><Icon name="clock" size={18}/></span>
              <span><b>{item.title}</b><small>{item.body}</small><span className="notification-confirm-actions"><button type="button" className="confirm-yes" onClick={()=>onActivityStatus(item.activity,'completed')}><Icon name="check" size={14}/> Tak</button><button type="button" onClick={()=>onActivityStatus(item.activity,'cancelled')}><Icon name="close" size={14}/> Nie</button></span></span>
            </article> : <button type="button" className="notification-item" key={item.id} onClick={()=>onNotificationSelect(item)}>
              <span className={`notification-symbol ${item.type}`}><Icon name={item.type === 'goal' ? 'target' : 'calendar'} size={18}/></span>
              <span><b>{item.title}</b><small>{item.body}</small></span>
              <Icon name="chevronRight" size={16}/>
            </button>)}
          </div>
        </section>
        <form className="card settings-card compact-card" onSubmit={changePassword}><div className="settings-heading"><span className="settings-symbol">•••</span><div><h2>Bezpieczeństwo</h2><p>Zmień hasło do swojego konta.</p></div></div><div className="form-grid"><label className="field"><span>Obecne hasło</span><input type="password" value={password.currentPassword} onChange={(event)=>setPassword({...password,currentPassword:event.target.value})}/></label><label className="field"><span>Nowe hasło</span><input type="password" minLength="8" value={password.newPassword} onChange={(event)=>setPassword({...password,newPassword:event.target.value})}/></label></div><div className="settings-footer"><button className="secondary-button" disabled={busy}>Zmień hasło</button></div></form>
      </div>
    </div>
  </div>;
}
