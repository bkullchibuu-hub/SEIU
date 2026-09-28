import { useEffect, useState } from 'react';
import { api, getToken, logout, setUnauthorizedHandler } from './api';
import { AdminApp } from './components/AdminApp';
import { LoginPage } from './components/LoginPage';
import { TeacherApp } from './components/TeacherApp';
import type { User } from './types';

export const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(Boolean(getToken()));

  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null));
    if (!getToken()) return;
    api<{ user: User }>('GET', 'me')
      .then(data => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setChecking(false));
  }, []);

  if (checking) return <div className="center muted">Đang tải…</div>;
  if (!user) return <LoginPage onLogin={setUser} />;

  const signOut = () => {
    logout();
    setUser(null);
  };

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <img src="/favicon.svg" alt="" />
          <span>SEIU <small>Quản lý học viên</small></span>
        </div>
        <div className="topbar-user">
          <span className="muted">{user.role === 'admin' ? 'Quản trị' : 'Giáo viên'}:</span> <b>{user.fullName}</b>
          <button type="button" className="btn btn-ghost btn-sm" onClick={signOut}>Đăng xuất</button>
        </div>
      </header>
      <main className="container">
        {user.role === 'admin' ? <AdminApp /> : <TeacherApp />}
      </main>
    </div>
  );
};
