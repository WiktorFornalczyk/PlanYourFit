import React, { useEffect, useMemo, useState } from 'react';
import { api } from './api';
import ActivityDetails from './components/ActivityDetails';
import ActivityModal from './components/ActivityModal';
import Icon from './components/Icon';
import Toast from './components/Toast';
import { demoActivities, demoUser, SPORTS } from './data';
import Analytics from './pages/Analytics';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Landing from './pages/Landing';
import Settings from './pages/Settings';

function AppShell({ user, onLogout, children, page, setPage, theme, setTheme, search, setSearch, sportFilter, setSportFilter, onAdd }) {
  const [mobileMenu, setMobileMenu] = useState(false);
  const nav = [['dashboard','home','Pulpit'],['calendar','calendar','Kalendarz'],['analytics','chart','Statystyki'],['settings','settings','Ustawienia']];
  const sidebarNav = nav.filter(([key]) => key !== 'calendar');
  return <div className="app-shell"><aside className={`sidebar ${mobileMenu?'open':''}`}><div className="sidebar-top"><a className="brand" href="#dashboard" onClick={()=>setPage('dashboard')}><span className="brand-mark"><Icon name="spark"/></span><b>PlanYour<span>Fit</span></b></a><button className="icon-button sidebar-close" onClick={()=>setMobileMenu(false)}><Icon name="close"/></button></div><nav>{sidebarNav.map(([key,icon,label])=><button className={page===key?'active':''} key={key} onClick={()=>{setPage(key);setMobileMenu(false)}}><Icon name={icon}/><span>{label}</span></button>)}</nav><div className="sidebar-promo"><span><Icon name="spark"/></span><b>Dobry plan to pół sukcesu.</b><p>Reszta to pierwszy krok.</p></div><button className="logout-button" onClick={onLogout}><Icon name="logout"/> Wyloguj się</button></aside>{mobileMenu&&<div className="sidebar-overlay" onClick={()=>setMobileMenu(false)}/>}<div className="app-main"><header className="topbar"><button className="icon-button menu-button" onClick={()=>setMobileMenu(true)}><Icon name="menu"/></button><div className="topbar-search"><Icon name="search"/><input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Szukaj aktywności…"/><select value={sportFilter} onChange={(e)=>setSportFilter(e.target.value)} aria-label="Filtruj sport"><option value="">Wszystkie</option>{Object.entries(SPORTS).map(([key,s])=><option value={key} key={key}>{s.label}</option>)}</select></div><div className="topbar-actions"><button className="icon-button" onClick={()=>setTheme(theme==='dark'?'light':'dark')} title="Zmień motyw"><Icon name={theme==='dark'?'sun':'moon'}/></button><button className="icon-button notification"><Icon name="bell"/><i/></button><button className="profile-button" onClick={()=>setPage('settings')}><span>{user.name.slice(0,2).toUpperCase()}</span><div><b>{user.name}</b><small>{user.demo?'Tryb demo':'Moje konto'}</small></div><Icon name="chevronRight" size={15}/></button></div></header><main>{children}</main><nav className="mobile-nav">{nav.slice(0,4).map(([key,icon,label])=><button className={page===key?'active':''} key={key} onClick={()=>setPage(key)}><Icon name={icon}/><small>{label}</small></button>)}<button className="mobile-add" onClick={()=>onAdd()}><Icon name="plus"/></button></nav></div></div>;
}

export default function App() {
  const [screen, setScreen] = useState('landing'); const [authMode, setAuthMode] = useState('login');
  const [user, setUser] = useState(null); const [activities, setActivities] = useState([]); const [demo, setDemo] = useState(false);
  const [page, setPage] = useState('dashboard'); const [theme, setThemeState] = useState(localStorage.getItem('pyf-theme') || 'light');
  const [search, setSearch] = useState(''); const [sportFilter, setSportFilter] = useState('');
  const [modal, setModal] = useState(null); const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState(null); const [authBusy, setAuthBusy] = useState(false); const [authError, setAuthError] = useState('');

  const notify = (message, type='success') => { setToast({message,type}); window.clearTimeout(window.__pyfToast); window.__pyfToast=window.setTimeout(()=>setToast(null),4200); };
  const setTheme = (value) => { const resolved=value==='system'?(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):value; setThemeState(resolved); localStorage.setItem('pyf-theme',resolved); };

  useEffect(()=>{ document.documentElement.dataset.theme=theme; },[theme]);
  useEffect(()=>{
    const restore = async () => { try { const result=await api.me(); setUser(result.user); setScreen('app'); setTheme(result.user.theme||theme); const list=await api.activities(); setActivities(list.activities); } catch { /* Brak aktywnej sesji jest normalny. */ } };
    restore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  const enterDemo = () => { setDemo(true); setUser(demoUser); setActivities(demoActivities); setScreen('app'); setPage('dashboard'); notify('Witaj w wersji demonstracyjnej!', 'success'); };
  const openAuth = (mode) => { setAuthMode(mode); setAuthError(''); setScreen('auth'); };
  const handleAuth = async (form) => { setAuthError(''); if (authMode==='register'&&form.password!==form.confirmPassword) return setAuthError('Hasła nie są takie same.'); setAuthBusy(true); try { const result=authMode==='login'?await api.login({email:form.email,password:form.password}):await api.register(form); setUser(result.user); setDemo(false); setScreen('app'); const list=await api.activities(); setActivities(list.activities); notify(authMode==='login'?'Miło Cię znów widzieć!':'Konto jest gotowe. Zaczynamy!', 'success'); } catch(error) { setAuthError(error.message); } finally { setAuthBusy(false); } };
  const logout = async () => { try { if(!demo) await api.logout(); } catch{} setUser(null);setActivities([]);setDemo(false);setScreen('landing');setPage('dashboard'); };
  const saveActivity = (payload,id) => { if(id) setActivities((list)=>list.map((item)=>item.id===id?{...item,...payload,id}:item)); else { const count=payload.repeatWeekly?payload.repeatCount:1; const created=Array.from({length:count},(_,i)=>{const d=new Date(`${payload.activityDate}T12:00:00`);d.setDate(d.getDate()+i*7);return {...payload,id:`local-${Date.now()}-${i}`,activityDate:d.toISOString().slice(0,10)};}); setActivities((list)=>[...list,...created]); } setModal(null); };
  const deleteActivity = async (activity) => { if(!window.confirm(`Usunąć „${activity.title}”?`)) return; try { if(!demo) await api.deleteActivity(activity.id); setActivities((list)=>list.filter((a)=>a.id!==activity.id));setSelected(null);notify('Aktywność została usunięta.','success'); } catch(error){notify(error.message,'error');} };
  const visibleActivities = useMemo(()=>activities,[activities]);
  if(screen==='landing') return <><Landing onAuth={openAuth} onDemo={enterDemo}/><Toast toast={toast} onClose={()=>setToast(null)}/></>;
  if(screen==='auth') return <><Auth mode={authMode} onMode={setAuthMode} onSubmit={handleAuth} onBack={()=>setScreen('landing')} busy={authBusy} error={authError}/><Toast toast={toast} onClose={()=>setToast(null)}/></>;
  return <><AppShell {...{user,page,setPage,theme,setTheme,search,setSearch,sportFilter,setSportFilter}} onLogout={logout} onAdd={(date)=>setModal({date})}>
    {(page==='dashboard'||page==='calendar')&&<Dashboard user={user} activities={visibleActivities} onAdd={(date)=>setModal({date})} onSelect={setSelected} search={search} sportFilter={sportFilter}/>} 
    {page==='analytics'&&<Analytics activities={visibleActivities}/>} 
    {page==='settings'&&<Settings user={user} theme={theme} setTheme={setTheme} demo={demo} notify={notify} onUserChange={setUser}/>} 
  </AppShell>{modal&&<ActivityModal initialDate={modal.date} activity={modal.activity} user={user} demo={demo} existingActivities={activities} onClose={()=>setModal(null)} onSaved={saveActivity} notify={notify}/>} {selected&&<ActivityDetails activity={selected} onClose={()=>setSelected(null)} onEdit={(activity)=>{setSelected(null);setModal({activity});}} onDelete={deleteActivity}/>}<Toast toast={toast} onClose={()=>setToast(null)}/></>;
}
