import { useEffect, useState } from 'react';
import { api, getToken, logout, setUnauthorizedHandler } from './api';
import { AdminApp } from './components/AdminApp';
import { LoginPage } from './components/LoginPage';
import { TeacherApp } from './components/TeacherApp';
import { ROLE_INFO, type User } from './types';
import logoUrl from './logo.svg';

const DEMO = __DEMO__;

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

  const resetDemo = async () => {
    (await import('./demo')).resetDemo();
    signOut();
  };

  return (
    <div className="app">
      {DEMO && (
        <div className="demo-bar">
          <span>Bản demo: dữ liệu mẫu, chỉ lưu trên trình duyệt của bạn.</span>
          <button type="button" className="btn btn-sm" onClick={resetDemo}>Khôi phục dữ liệu mẫu</button>
        </div>
      )}
      <header className="topbar">
        <div className="brand">
          <img src={logoUrl} alt="" />
          <span>SEIU <small>Quản lý học viên</small></span>
        </div>
        <div className="topbar-user">
          <span className="muted">{ROLE_INFO[user.role]?.label ?? ''}:</span> <b>{user.fullName}</b>
          <button type="button" className="btn btn-ghost btn-sm" onClick={signOut}>Đăng xuất</button>
        </div>
      </header>
      <main className="container">
        {user.role === 'teacher' ? <TeacherApp /> : <AdminApp key={user.id} role={user.role} />}
      </main>
    </div>
  );
};
