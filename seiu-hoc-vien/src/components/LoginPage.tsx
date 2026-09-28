import { useEffect, useState, type FormEvent } from 'react';
import { login } from '../api';
import type { User } from '../types';
import logoUrl from '../logo.svg';
import { ErrorBox, Field } from './ui';

const DEMO = __DEMO__;

export const LoginPage = ({ onLogin }: { onLogin: (user: User) => void }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const signIn = async (user: string, pass: string) => {
    setBusy(true);
    setError('');
    try {
      onLogin(await login(user, pass));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    signIn(username, password);
  };

  const [demoAccounts, setDemoAccounts] = useState<{ label: string; username: string; password: string }[]>([]);
  useEffect(() => {
    if (DEMO) import('../demo').then(m => setDemoAccounts(m.DEMO_ACCOUNTS));
  }, []);

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={submit}>
        <img src={logoUrl} alt="" className="login-logo" />
        <h1>SEIU</h1>
        <p className="muted">Phần mềm quản lý học viên</p>
        <ErrorBox message={error} />
        <Field label="Tên đăng nhập">
          <input value={username} onChange={e => setUsername(e.target.value)} autoComplete="username" autoFocus required />
        </Field>
        <Field label="Mật khẩu">
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" required />
        </Field>
        <button className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Đang đăng nhập…' : 'Đăng nhập'}</button>
        {demoAccounts.length > 0 && (
          <div className="demo-accounts">
            <span className="muted">Bản demo – bấm để đăng nhập nhanh:</span>
            <div className="demo-accounts-row">
              {demoAccounts.map(a => (
                <button key={a.username} type="button" className="btn btn-sm" disabled={busy} onClick={() => signIn(a.username, a.password)}>
                  {a.label}
                </button>
              ))}
            </div>
            <span className="muted small">Mật khẩu: admin123 (admin) · 123456 (giáo viên)</span>
          </div>
        )}
      </form>
    </div>
  );
};
