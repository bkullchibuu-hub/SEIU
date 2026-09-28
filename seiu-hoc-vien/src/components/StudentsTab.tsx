import { useMemo, useState, type FormEvent } from 'react';
import { api, ApiError } from '../api';
import {
  formatDate, formatPhone, LEVELS, STUDENT_STATUS_LABELS,
  type ClassRoom, type Student, type StudentStatus,
} from '../types';
import type { AdminTabProps } from './AdminApp';
import { Badge, Empty, ErrorBox, Field, Modal } from './ui';

const STATUS_TONE: Record<StudentStatus, 'green' | 'amber' | 'blue' | 'gray'> = {
  dang_hoc: 'green', bao_luu: 'amber', hoan_thanh: 'blue', da_nghi: 'gray',
};

export const StudentStatusBadge = ({ status }: { status: StudentStatus }) => (
  <Badge tone={STATUS_TONE[status]}>{STUDENT_STATUS_LABELS[status]}</Badge>
);

const normalize = (value: string) => value.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd').toLowerCase();

export const classOptionLabel = (c: ClassRoom) =>
  `${c.code}${c.level ? ` – ${c.level}` : ''} (${c.studentCount}/${c.capacity})`;

export const StudentsTab = ({ data, reload }: AdminTabProps) => {
  const [query, setQuery] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<StudentStatus | ''>('dang_hoc');
  const [editing, setEditing] = useState<Student | 'new' | null>(null);

  const classById = useMemo(() => new Map(data.classes.map(c => [c.id, c])), [data.classes]);

  const rows = useMemo(() => {
    const q = normalize(query.trim());
    const qDigits = q.replace(/\D/g, '');
    return data.students.filter(s =>
      (!statusFilter || s.status === statusFilter)
      && (!classFilter || (classFilter === 'none' ? !s.classId : s.classId === classFilter))
      && (!q
        || normalize(`${s.code} ${s.fullName} ${s.email}`).includes(q)
        || (qDigits.length >= 3 && s.phone.includes(qDigits))));
  }, [data.students, query, classFilter, statusFilter]);

  const remove = async (s: Student) => {
    if (!confirm(`Xóa hồ sơ học viên ${s.code} – ${s.fullName}? Thao tác này không thể hoàn tác.`)) return;
    try {
      await api('DELETE', `students/${s.id}`);
      await reload();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  return (
    <section>
      <div className="toolbar">
        <input
          className="search"
          type="search"
          placeholder="Tìm theo tên, mã HV, số điện thoại…"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <select value={classFilter} onChange={e => setClassFilter(e.target.value)} aria-label="Lọc theo lớp">
          <option value="">Tất cả lớp</option>
          <option value="none">Chưa xếp lớp</option>
          {data.classes.map(c => <option key={c.id} value={c.id}>{c.code}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as StudentStatus | '')} aria-label="Lọc theo trạng thái">
          <option value="">Mọi trạng thái</option>
          {Object.entries(STUDENT_STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <button type="button" className="btn btn-primary" onClick={() => setEditing('new')}>+ Thêm học viên</button>
      </div>

      <p className="muted small">Hiển thị {rows.length} / {data.students.length} học viên</p>

      {rows.length === 0 ? (
        <Empty>{data.students.length ? 'Không có học viên phù hợp bộ lọc.' : 'Chưa có học viên nào. Bấm “+ Thêm học viên” để bắt đầu nhập.'}</Empty>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Mã HV</th><th>Họ tên</th><th>Điện thoại</th><th>Lớp</th><th>Trình độ</th><th>Trạng thái</th><th />
              </tr>
            </thead>
            <tbody>
              {rows.map(s => {
                const c = classById.get(s.classId);
                return (
                  <tr key={s.id}>
                    <td className="mono">{s.code}</td>
                    <td>
                      <button type="button" className="link" onClick={() => setEditing(s)}>{s.fullName}</button>
                      {s.dateOfBirth && <div className="muted small">{formatDate(s.dateOfBirth)}</div>}
                    </td>
                    <td className="nowrap">{formatPhone(s.phone)}</td>
                    <td>{c ? c.code : <span className="muted">Chưa xếp</span>}</td>
                    <td>{s.level}</td>
                    <td><StudentStatusBadge status={s.status} /></td>
                    <td className="actions">
                      <button type="button" className="btn btn-sm" onClick={() => setEditing(s)}>Sửa</button>
                      <button type="button" className="btn btn-sm btn-danger-ghost" onClick={() => remove(s)}>Xóa</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <StudentForm
          key={editing === 'new' ? 'new' : editing.id}
          student={editing === 'new' ? null : editing}
          classes={data.classes}
          onClose={() => setEditing(null)}
          onSaved={reload}
          onOpenExisting={id => {
            const found = data.students.find(s => s.id === id);
            if (found) setEditing(found);
          }}
        />
      )}
    </section>
  );
};

const today = () => new Date().toISOString().slice(0, 10);

const emptyForm = (classId = '', level = '') => ({
  fullName: '', phone: '', email: '', dateOfBirth: '', gender: '' as Student['gender'], address: '',
  level, classId, enrolledAt: today(), status: 'dang_hoc' as StudentStatus, note: '',
});

export const StudentForm = ({ student, classes, onClose, onSaved, onOpenExisting, presetClassId = '' }: {
  student: Student | null;
  classes: ClassRoom[];
  onClose: () => void;
  onSaved: () => Promise<void>;
  onOpenExisting?: (id: string) => void;
  presetClassId?: string;
}) => {
  const levelOf = (classId: string) => classes.find(c => c.id === classId)?.level ?? '';
  const [form, setForm] = useState(() => (
    student ? { ...emptyForm(), ...student } : emptyForm(presetClassId, levelOf(presetClassId))
  ));
  const [error, setError] = useState('');
  const [duplicate, setDuplicate] = useState<{ id: string; code: string } | null>(null);
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => setForm(f => ({ ...f, [key]: value }));

  const selectableClasses = classes.filter(c => c.status === 'dang_mo' || c.id === form.classId);
  const classChanged = student && student.classId !== form.classId;

  const chooseClass = (classId: string) => {
    setForm(f => ({
      ...f,
      classId,
      level: levelOf(classId) || f.level,
      enrolledAt: student?.classId === classId ? student.enrolledAt : today(),
    }));
  };

  const submit = async (e: FormEvent, keepOpen = false) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    setDuplicate(null);
    setNotice('');
    try {
      const saved = student
        ? await api<{ item: Student }>('PUT', `students/${student.id}`, form)
        : await api<{ item: Student }>('POST', 'students', form);
      await onSaved();
      if (keepOpen) {
        setForm(emptyForm(form.classId, form.level));
        setNotice(`Đã lưu ${saved.item.code} – ${saved.item.fullName}. Tiếp tục nhập học viên mới.`);
        document.querySelector<HTMLInputElement>('#hv-fullName')?.focus();
      } else {
        onClose();
      }
    } catch (err) {
      setError((err as Error).message);
      if (err instanceof ApiError && err.data.duplicate) setDuplicate(err.data.duplicate as { id: string; code: string });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title={student ? `Sửa học viên ${student.code}` : 'Thêm học viên mới'} onClose={onClose} wide>
      <form onSubmit={e => submit(e)}>
        {notice && <div className="alert alert-success">{notice}</div>}
        <ErrorBox message={error}>
          {duplicate && onOpenExisting && (
            <button type="button" className="btn btn-sm alert-action" onClick={() => onOpenExisting(duplicate.id)}>
              Mở hồ sơ {duplicate.code}
            </button>
          )}
        </ErrorBox>

        <h3 className="form-section">Thông tin cá nhân</h3>
        <div className="grid">
          <Field label="Họ và tên" required>
            <input id="hv-fullName" value={form.fullName} onChange={e => set('fullName', e.target.value)} required autoFocus />
          </Field>
          <Field label="Số điện thoại" required>
            <input type="tel" inputMode="numeric" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="0901234567" required />
          </Field>
          <Field label="Ngày sinh">
            <input type="date" value={form.dateOfBirth} onChange={e => set('dateOfBirth', e.target.value)} />
          </Field>
          <Field label="Giới tính">
            <select value={form.gender} onChange={e => set('gender', e.target.value as Student['gender'])}>
              <option value="">—</option>
              <option value="nam">Nam</option>
              <option value="nu">Nữ</option>
            </select>
          </Field>
          <Field label="Email">
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)} />
          </Field>
          <Field label="Địa chỉ">
            <input value={form.address} onChange={e => set('address', e.target.value)} />
          </Field>
        </div>

        <h3 className="form-section">Xếp lớp</h3>
        <div className="grid">
          <Field label="Lớp" hint={classChanged ? 'Học viên sẽ được chuyển lớp; lớp cũ được lưu vào lịch sử.' : undefined}>
            <select value={form.classId} onChange={e => chooseClass(e.target.value)}>
              <option value="">— Chưa xếp lớp —</option>
              {selectableClasses.map(c => {
                const full = c.studentCount >= c.capacity && c.id !== student?.classId;
                return (
                  <option key={c.id} value={c.id} disabled={full}>
                    {classOptionLabel(c)}{full ? ' – đã đủ' : ''}
                  </option>
                );
              })}
            </select>
          </Field>
          <Field label="Trình độ">
            <select value={form.level} onChange={e => set('level', e.target.value)}>
              <option value="">—</option>
              {[...new Set([...LEVELS, form.level].filter(Boolean))].map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </Field>
          <Field label="Ngày vào lớp">
            <input type="date" value={form.enrolledAt} onChange={e => set('enrolledAt', e.target.value)} />
          </Field>
          <Field label="Trạng thái">
            <select value={form.status} onChange={e => set('status', e.target.value as StudentStatus)}>
              {Object.entries(STUDENT_STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </Field>
          <Field label="Ghi chú" full>
            <textarea rows={3} value={form.note} onChange={e => set('note', e.target.value)} placeholder="Mục tiêu học, lịch rảnh, thông tin phụ huynh…" />
          </Field>
        </div>

        {student && student.classHistory.length > 0 && (
          <div className="history">
            <b>Lịch sử lớp:</b>{' '}
            {student.classHistory.map((h, i) => {
              const c = classes.find(x => x.id === h.classId);
              return (
                <span key={i} className="history-item">
                  {c?.code ?? 'Lớp đã xóa'} ({formatDate(h.from) || '?'} → {formatDate(h.to)})
                </span>
              );
            })}
          </div>
        )}

        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Hủy</button>
          {!student && (
            <button type="button" className="btn" disabled={busy} onClick={e => submit(e, true)}>Lưu và nhập tiếp</button>
          )}
          <button className="btn btn-primary" disabled={busy}>{busy ? 'Đang lưu…' : 'Lưu'}</button>
        </div>
      </form>
    </Modal>
  );
};
