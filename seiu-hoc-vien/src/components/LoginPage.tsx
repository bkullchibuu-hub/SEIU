import { useState, type FormEvent } from 'react';
import { login } from '../api';
import type { User } from '../types';
import { ErrorBox, Field } from './ui';

export const LoginPage = ({ onLogin }: { onLogin: (user: User) => void }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      onLogin(await login(username, password));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={submit}>
        <img src="/favicon.svg" alt="" className="login-logo" />
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
      </form>
    </div>
  );
};
