import React, { useState } from 'react';
import Icon from '../components/Icon';
import { api } from '../api';

export default function Settings({ user, theme, setTheme, demo, notify, onUserChange }) {
  const [form, setForm] = useState({ name: user.name, email: user.email, defaultLocation: user.defaultLocation || '', defaultPostalCode: user.defaultPostalCode || '', defaultLocationLat: user.defaultLocationLat ?? null, defaultLocationLng: user.defaultLocationLng ?? null, preferredRadiusKm: user.preferredRadiusKm || 10, theme });
  const [password, setPassword] = useState({ currentPassword: '', newPassword: '' });
  const [busy, setBusy] = useState(false);
  const [geoBusy, setGeoBusy] = useState(false);
  const [activeSection, setActiveSection] = useState('profile');
  const set = (key, value) => setForm((current) => ({ ...current, [key]: value, ...(['defaultLocation', 'defaultPostalCode'].includes(key) ? { defaultLocationLat: null, defaultLocationLng: null } : {}) }));
  const goToSection = (section) => {
    setActiveSection(section);
    document.getElementById(`settings-${section}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const useLocation = () => {
    if (!navigator.geolocation) return notify('Twoja przeglądarka nie obsługuje geolokalizacji.', 'error');
    setGeoBusy(true);
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      try {
        const result = await api.reverseGeocode({ lat: coords.latitude, lng: coords.longitude });
        setForm((current) => ({ ...current, defaultLocation: result.location.address, defaultPostalCode: result.location.postalCode || current.defaultPostalCode, defaultLocationLat: coords.latitude, defaultLocationLng: coords.longitude }));
        notify('Domyślna lokalizacja została odczytana.', 'success');
      } catch (error) { notify(error.message, 'error'); }
      finally { setGeoBusy(false); }
    }, () => { setGeoBusy(false); notify('Nie udało się pobrać lokalizacji. Sprawdź zgodę przeglądarki.', 'error'); }, { timeout: 8000, maximumAge: 300000 });
  };
  const save = async (e) => {
    e.preventDefault(); setBusy(true);
    try {
      let payload = form;
      if (form.defaultLocation && (form.defaultLocationLat == null || form.defaultLocationLng == null)) {
        const result = await api.geocode({ address: form.defaultLocation, postalCode: form.defaultPostalCode });
        payload = { ...form, defaultLocationLat: result.location.lat, defaultLocationLng: result.location.lng };
        setForm(payload);
      }
      if (!demo) await api.updateProfile(payload);
      onUserChange({ ...user, ...payload }); setTheme(payload.theme); notify('Ustawienia zostały zapisane.', 'success');
    } catch (error) { notify(error.message, 'error'); } finally { setBusy(false); }
  };
  const changePassword = async (e) => { e.preventDefault(); if (password.newPassword.length < 8) return notify('Nowe hasło musi mieć co najmniej 8 znaków.', 'error'); setBusy(true); try { if (!demo) await api.changePassword(password); setPassword({ currentPassword:'',newPassword:'' }); notify('Hasło zostało zmienione.', 'success'); } catch (error) { notify(error.message, 'error'); } finally { setBusy(false); } };
  return <div className="settings-page"><header className="page-intro"><div><span className="eyebrow">TWOJE PREFERENCJE</span><h1>Ustawienia</h1><p>Dopasuj PlanYourFit do swojego rytmu.</p></div></header><div className="settings-layout"><nav className="settings-nav"><button type="button" className={activeSection==='profile'?'active':''} onClick={()=>goToSection('profile')}><Icon name="user"/> Profil</button><button type="button" className={activeSection==='location'?'active':''} onClick={()=>goToSection('location')}><Icon name="pin"/> Lokalizacja</button><button type="button" className={activeSection==='appearance'?'active':''} onClick={()=>goToSection('appearance')}><Icon name="moon"/> Wygląd</button><button type="button"><Icon name="bell"/> Powiadomienia</button></nav><div className="settings-main">
    <form className="card settings-card settings-anchor" id="settings-profile" onSubmit={save}><div className="settings-heading"><span className="profile-avatar">{user.name.slice(0,2).toUpperCase()}</span><div><h2>Dane profilu</h2><p>Podstawowe informacje o Twoim koncie.</p></div></div><div className="form-grid"><label className="field"><span>Imię</span><input value={form.name} onChange={(e)=>set('name',e.target.value)} required/></label><label className="field"><span>E-mail</span><input type="email" value={form.email} onChange={(e)=>set('email',e.target.value)} required/></label><div className="field span-2 settings-anchor" id="settings-location"><span>Domyślna lokalizacja</span><div className="field-with-icon"><Icon name="pin"/><input value={form.defaultLocation} onChange={(e)=>set('defaultLocation',e.target.value)} placeholder="Np. Warszawa"/></div><button type="button" className="text-button settings-location-button" onClick={useLocation} disabled={geoBusy}><Icon name="target"/>{geoBusy?'Pobieram…':'Użyj mojej lokalizacji'}</button><a className="osm-attribution" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">Adresy: © OpenStreetMap contributors</a></div><label className="field"><span>Kod pocztowy</span><input value={form.defaultPostalCode} onChange={(e)=>set('defaultPostalCode',e.target.value)} placeholder="00-000" inputMode="numeric" maxLength="6" pattern="\d{2}-\d{3}" required={Boolean(form.defaultLocation)}/></label><label className="field"><span>Domyślny promień</span><div className="input-suffix"><input type="number" min="1" max="50" value={form.preferredRadiusKm} onChange={(e)=>set('preferredRadiusKm',e.target.value)}/><b>km</b></div></label></div><div className="theme-setting settings-anchor" id="settings-appearance"><span>Motyw aplikacji</span><div className="theme-options">{[['light','Jasny','sun'],['dark','Ciemny','moon'],['system','Systemowy','settings']].map(([value,label,icon])=><button type="button" key={value} className={form.theme===value?'active':''} onClick={()=>set('theme',value)}><Icon name={icon}/><b>{label}</b>{form.theme===value&&<Icon name="check" size={15}/>}</button>)}</div></div><div className="settings-footer"><button className="primary-button" disabled={busy}>{busy?'Zapisuję…':'Zapisz ustawienia'}</button></div></form>
    <form className="card settings-card compact-card" onSubmit={changePassword}><div className="settings-heading"><span className="settings-symbol">•••</span><div><h2>Bezpieczeństwo</h2><p>Zmień hasło do swojego konta.</p></div></div><div className="form-grid"><label className="field"><span>Obecne hasło</span><input type="password" value={password.currentPassword} onChange={(e)=>setPassword({...password,currentPassword:e.target.value})}/></label><label className="field"><span>Nowe hasło</span><input type="password" minLength="8" value={password.newPassword} onChange={(e)=>setPassword({...password,newPassword:e.target.value})}/></label></div><div className="settings-footer"><button className="secondary-button" disabled={busy}>Zmień hasło</button></div></form>
  </div></div></div>;
}
