import { useState, type FormEvent } from 'react';
import { api } from '../api';
import { formatPhone, type Teacher } from '../types';
import type { AdminTabProps } from './AdminApp';
import { Badge, Empty, ErrorBox, Field, Modal } from './ui';

export const TeachersTab = ({ data, reload }: AdminTabProps) => {
  const [editing, setEditing] = useState<Teacher | 'new' | null>(null);

  const classesOf = (id: string) => data.classes.filter(c => c.teacherId === id && c.status === 'dang_mo');

  const remove = async (t: Teacher) => {
    if (!confirm(`Xóa giáo viên ${t.fullName}?`)) return;
    try {
      await api('DELETE', `teachers/${t.id}`);
      await reload();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  return (
    <section>
      <div className="toolbar">
        <span className="muted small">Mỗi giáo viên có một tài khoản riêng để đăng nhập và xem lớp mình phụ trách.</span>
        <span className="spacer" />
        <button type="button" className="btn btn-primary" onClick={() => setEditing('new')}>+ Thêm giáo viên</button>
      </div>

      {data.teachers.length === 0 ? (
        <Empty>Chưa có giáo viên nào.</Empty>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Họ tên</th><th>Tên đăng nhập</th><th>Điện thoại</th><th>Lớp đang dạy</th><th>Tài khoản</th><th /></tr>
            </thead>
            <tbody>
              {data.teachers.map(t => (
                <tr key={t.id}>
                  <td><button type="button" className="link" onClick={() => setEditing(t)}>{t.fullName}</button></td>
                  <td className="mono">{t.username}</td>
                  <td className="nowrap">{formatPhone(t.phone)}</td>
                  <td>{classesOf(t.id).map(c => c.code).join(', ') || <span className="muted">—</span>}</td>
                  <td>{t.active ? <Badge tone="green">Hoạt động</Badge> : <Badge tone="gray">Đã khóa</Badge>}</td>
                  <td className="actions">
                    <button type="button" className="btn btn-sm" onClick={() => setEditing(t)}>Sửa</button>
                    <button type="button" className="btn btn-sm btn-danger-ghost" onClick={() => remove(t)}>Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <TeacherForm teacher={editing === 'new' ? null : editing} onClose={() => setEditing(null)} onSaved={reload} />
      )}
    </section>
  );
};

const TeacherForm = ({ teacher, onClose, onSaved }: {
  teacher: Teacher | null;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) => {
  const [form, setForm] = useState({
    fullName: '', phone: '', email: '', username: '', active: true, note: '', ...teacher, password: '',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => setForm(f => ({ ...f, [key]: value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (teacher) await api('PUT', `teachers/${teacher.id}`, form);
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
    <Modal title={teacher ? `Sửa giáo viên ${teacher.fullName}` : 'Thêm giáo viên'} onClose={onClose}>
      <form onSubmit={submit}>
        <ErrorBox message={error} />
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
            label={teacher ? 'Mật khẩu mới' : 'Mật khẩu'}
            required={!teacher}
            hint={teacher ? 'Để trống nếu không đổi. Đổi mật khẩu sẽ đăng xuất giáo viên khỏi mọi thiết bị.' : 'Ít nhất 6 ký tự'}
          >
            <input type="text" value={form.password} onChange={e => set('password', e.target.value)} autoComplete="new-password" required={!teacher} minLength={6} />
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
