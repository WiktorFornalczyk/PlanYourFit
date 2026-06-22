import React, { useState } from 'react';
import Icon from '../components/Icon';

export default function Auth({ mode, onMode, onSubmit, onBack, busy, error }) {
  const register = mode === 'register';
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [visible, setVisible] = useState(false);
  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const submit = (e) => { e.preventDefault(); onSubmit(form); };
  return <main className="auth-page"><button className="auth-back" onClick={onBack}><Icon name="chevronLeft"/> Wróć</button><section className="auth-panel"><a className="brand" href="#home" onClick={onBack}><span className="brand-mark"><Icon name="spark"/></span><b>PlanYour<span>Fit</span></b></a><div className="auth-copy"><span className="eyebrow">{register ? 'DOBRZE, ŻE JESTEŚ' : 'WITAJ Z POWROTEM'}</span><h1>{register ? 'Zacznij planować swój ruch.' : 'Gotowy na dobry tydzień?'}</h1><p>{register ? 'Załóż konto i miej treningi, miejsca oraz pogodę zawsze pod ręką.' : 'Zaloguj się, aby wrócić do swojego planu aktywności.'}</p></div>{error && <div className="inline-alert error"><Icon name="close"/><span>{error}</span></div>}<form className="auth-form" onSubmit={submit}>
      {register && <label className="field"><span>Imię</span><div className="auth-input"><Icon name="user"/><input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Jak mamy się do Ciebie zwracać?" required minLength="2"/></div></label>}
      <label className="field"><span>E-mail</span><div className="auth-input"><span className="mail-icon">@</span><input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="ty@przyklad.pl" required/></div></label>
      <label className="field"><span>Hasło</span><div className="auth-input"><span className="lock-icon">⌁</span><input type={visible ? 'text' : 'password'} value={form.password} onChange={(e) => set('password', e.target.value)} placeholder="Minimum 8 znaków" required minLength="8"/><button type="button" onClick={() => setVisible(!visible)}>{visible ? 'Ukryj' : 'Pokaż'}</button></div></label>
      {register && <label className="field"><span>Powtórz hasło</span><div className="auth-input"><span className="lock-icon">⌁</span><input type={visible ? 'text' : 'password'} value={form.confirmPassword} onChange={(e) => set('confirmPassword', e.target.value)} placeholder="Wpisz hasło ponownie" required/></div></label>}
      <button className="primary-button auth-submit" disabled={busy}>{busy ? <><span className="spinner light"/>Chwileczkę…</> : <>{register ? 'Utwórz konto' : 'Zaloguj się'} <Icon name="arrow"/></>}</button>
    </form><p className="auth-switch">{register ? 'Masz już konto?' : 'Nie masz jeszcze konta?'} <button onClick={() => onMode(register ? 'login' : 'register')}>{register ? 'Zaloguj się' : 'Załóż konto'}</button></p><small className="auth-legal">Kontynuując, akceptujesz regulamin i politykę prywatności.</small></section><aside className="auth-art"><div className="art-track"><span/><span/><span/></div></aside></main>;
}
