import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { api } from '../api';
import { ACCOUNT_ROLES, formatPhone, ROLE_INFO, type AccountRole, type Teacher } from '../types';
import type { AdminData } from './AdminApp';
import { Badge, ConfirmDelete, Empty, ErrorBox, Field, Modal } from './ui';

const ROLE_TONE: Record<AccountRole, 'blue' | 'green' | 'amber'> = { teacher: 'blue', staff: 'green', accountant: 'amber' };

export const RoleBadge = ({ role }: { role: AccountRole }) => <Badge tone={ROLE_TONE[role]}>{ROLE_INFO[role].label}</Badge>;

// Quản lý tài khoản (chỉ admin): giáo viên, nhân viên, kế toán.
export const AccountsTab = ({ data, reload }: { data: AdminData; reload: () => Promise<void> }) => {
  const [accounts, setAccounts] = useState<Teacher[] | null>(null);
  const [error, setError] = useState('');
  const [roleFilter, setRoleFilter] = useState<AccountRole | ''>('');
  const [editing, setEditing] = useState<Teacher | 'new' | null>(null);
  const [deleting, setDeleting] = useState<Teacher | null>(null);

  const load = useCallback(async () => {
    try {
      setAccounts((await api<{ items: Teacher[] }>('GET', 'teachers')).items);
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);
  const afterSave = async () => {
    await Promise.all([load(), reload()]);
  };

  const classesOf = (id: string) => data.classes.filter(c => c.teacherId === id && c.status === 'dang_mo');
  const rows = (accounts ?? []).filter(a => !roleFilter || (a.role ?? 'teacher') === roleFilter);

  return (
    <section>
      <div className="role-cards">
        {ACCOUNT_ROLES.map(r => (
          <button
            key={r}
            type="button"
            className={`role-card ${roleFilter === r ? 'role-card-on' : ''}`}
            onClick={() => setRoleFilter(roleFilter === r ? '' : r)}
            aria-pressed={roleFilter === r}
          >
            <span className="role-card-head">
              <RoleBadge role={r} />
              <b>{(accounts ?? []).filter(a => (a.role ?? 'teacher') === r).length}</b>
            </span>
            <span className="small muted">{ROLE_INFO[r].can}</span>
          </button>
        ))}
      </div>
      <div className="toolbar">
        <span className="muted small">
          {roleFilter ? `Đang lọc: ${ROLE_INFO[roleFilter].label}. Bấm lại thẻ để bỏ lọc.` : 'Mỗi người một tài khoản riêng, chỉ thấy phần việc của mình.'}
        </span>
        <span className="spacer" />
        <button type="button" className="btn btn-primary" onClick={() => setEditing('new')}>+ Thêm tài khoản</button>
      </div>
      <ErrorBox message={error} />

      {!accounts ? <div className="muted center-pad">Đang tải…</div> : rows.length === 0 ? (
        <Empty>Chưa có tài khoản nào. Bấm “+ Thêm tài khoản”.</Empty>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Họ tên</th><th>Vai trò</th><th>Tên đăng nhập</th><th>Điện thoại</th><th>Lớp đang dạy</th><th>Trạng thái</th><th /></tr>
            </thead>
            <tbody>
              {rows.map(t => (
                <tr key={t.id}>
                  <td><button type="button" className="link" onClick={() => setEditing(t)}>{t.fullName}</button></td>
                  <td><RoleBadge role={t.role ?? 'teacher'} /></td>
                  <td className="mono">{t.username}</td>
                  <td className="nowrap">{formatPhone(t.phone)}</td>
                  <td>{(t.role ?? 'teacher') === 'teacher' ? classesOf(t.id).map(c => c.code).join(', ') || <span className="muted">—</span> : ''}</td>
                  <td>{t.active ? <Badge tone="green">Hoạt động</Badge> : <Badge tone="gray">Đã khóa</Badge>}</td>
                  <td className="actions">
                    <button type="button" className="btn btn-sm" onClick={() => setEditing(t)}>Sửa</button>
                    <button type="button" className="btn btn-sm btn-danger-ghost" onClick={() => setDeleting(t)}>Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <AccountForm
          account={editing === 'new' ? null : editing}
          defaultRole={roleFilter || 'teacher'}
          onClose={() => setEditing(null)}
          onSaved={afterSave}
        />
      )}
      {deleting && (
        <ConfirmDelete
          title="Xóa tài khoản"
          message={`Xóa tài khoản ${deleting.fullName}? Nếu chỉ muốn tạm ngừng, hãy bỏ chọn “Cho phép đăng nhập” thay vì xóa.`}
          onClose={() => setDeleting(null)}
          onConfirm={async () => {
            await api('DELETE', `teachers/${deleting.id}`);
            await afterSave();
          }}
        />
      )}
    </section>
  );
};

const AccountForm = ({ account, defaultRole, onClose, onSaved }: {
  account: Teacher | null;
  defaultRole: AccountRole;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) => {
  const [form, setForm] = useState({
    fullName: '', phone: '', email: '', username: '', active: true, note: '', role: defaultRole,
    ...account, password: '',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => setForm(f => ({ ...f, [key]: value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (account) await api('PUT', `teachers/${account.id}`, form);
      else await api('POST', 'teachers', form);
      await onSaved();
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title={account ? `Sửa tài khoản ${account.fullName}` : 'Thêm tài khoản'} onClose={onClose}>
      <form onSubmit={submit}>
        <ErrorBox message={error} />
        <div className="field">
          <span className="field-label">Vai trò</span>
          <div className="role-picks" role="radiogroup" aria-label="Vai trò">
            {ACCOUNT_ROLES.map(r => (
              <label key={r} className={`role-pick ${form.role === r ? 'role-pick-on' : ''}`}>
                <input type="radio" name="role" value={r} checked={form.role === r} onChange={() => set('role', r)} />
                <span>
                  <b>{ROLE_INFO[r].label}</b>
                  <span className="small muted">{ROLE_INFO[r].can}</span>
                </span>
              </label>
            ))}
          </div>
        </div>
        <div className="grid">
          <Field label="Họ và tên" required full>
            <input value={form.fullName} onChange={e => set('fullName', e.target.value)} required autoFocus />
          </Field>
          <Field label="Số điện thoại">
            <input type="tel" inputMode="numeric" value={form.phone} onChange={e => set('phone', e.target.value)} />
          </Field>
          <Field label="Email">
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)} />
          </Field>
          <Field label="Tên đăng nhập" required hint="Chữ không dấu, số, . _ -">
            <input value={form.username} onChange={e => set('username', e.target.value.toLowerCase())} autoComplete="off" required />
          </Field>
          <Field
            label={account ? 'Mật khẩu mới' : 'Mật khẩu'}
            required={!account}
            hint={account ? 'Để trống nếu không đổi. Đổi mật khẩu sẽ đăng xuất người này khỏi mọi thiết bị.' : 'Ít nhất 6 ký tự'}
          >
            <input type="text" value={form.password} onChange={e => set('password', e.target.value)} autoComplete="new-password" required={!account} minLength={6} />
          </Field>
          <Field label="Ghi chú" full>
            <textarea rows={2} value={form.note} onChange={e => set('note', e.target.value)} />
          </Field>
          <label className="check field-full">
            <input type="checkbox" checked={form.active} onChange={e => set('active', e.target.checked)} />
            Cho phép đăng nhập (bỏ chọn để khóa tài khoản)
          </label>
        </div>
        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Hủy</button>
          <button className="btn btn-primary" disabled={busy}>{busy ? 'Đang lưu…' : 'Lưu'}</button>
        </div>
      </form>
    </Modal>
  );
};
