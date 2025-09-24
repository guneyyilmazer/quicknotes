import { useEffect, useState } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { loadToken, clearToken } from './lib/auth';
import { setAuthToken } from './lib/api';

export default function App() {
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const t = loadToken();
    if (t) { setAuthToken(t); setAuthed(true); }
  }, []);

  if (!authed) return <Login onLogin={() => setAuthed(true)} />;

  return <Dashboard onLogout={() => { clearToken(); setAuthToken(null); setAuthed(false); }} />;
}
