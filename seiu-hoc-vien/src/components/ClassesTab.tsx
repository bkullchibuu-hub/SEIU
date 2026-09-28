import { useState, type FormEvent } from 'react';
import { api } from '../api';
import {
  CLASS_STATUS_LABELS, formatDate, formatPhone, LEVELS,
  type ClassRoom, type ClassStatus, type Student,
} from '../types';
import type { AdminTabProps } from './AdminApp';
import { StudentForm, StudentStatusBadge } from './StudentsTab';
import { Badge, Empty, ErrorBox, Field, Modal } from './ui';

export const StudentCountBadge = ({ c }: { c: ClassRoom }) => (
  <Badge tone={c.studentCount >= c.capacity ? 'red' : 'gray'}>{c.studentCount}/{c.capacity}</Badge>
);

export const ClassesTab = ({ data, reload }: AdminTabProps) => {
  const [editing, setEditing] = useState<ClassRoom | 'new' | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [showEnded, setShowEnded] = useState(false);

  const teacherName = (id: string) => data.teachers.find(t => t.id === id)?.fullName;
  const rows = data.classes.filter(c => showEnded || c.status === 'dang_mo');
  const viewing = data.classes.find(c => c.id === viewingId);

  const remove = async (c: ClassRoom) => {
    if (!confirm(`Xóa lớp ${c.code}?`)) return;
    try {
      await api('DELETE', `classes/${c.id}`);
      await reload();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  return (
    <section>
      <div className="toolbar">
        <label className="check">
          <input type="checkbox" checked={showEnded} onChange={e => setShowEnded(e.target.checked)} />
          Hiện cả lớp đã kết thúc
        </label>
        <span className="spacer" />
        <button type="button" className="btn btn-primary" onClick={() => setEditing('new')}>+ Tạo lớp</button>
      </div>

      {data.teachers.length === 0 && (
        <div className="alert alert-info">Mẹo: hãy nhập giáo viên ở tab “Giáo viên” trước để có thể chọn giáo viên phụ trách khi tạo lớp.</div>
      )}

      {rows.length === 0 ? (
        <Empty>Chưa có lớp nào. Bấm “+ Tạo lớp” để tạo lớp đầu tiên.</Empty>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Mã lớp</th><th>Trình độ</th><th>Lịch học</th><th>Giáo viên</th><th>Sĩ số</th><th>Khai giảng</th><th>Trạng thái</th><th />
              </tr>
            </thead>
            <tbody>
              {rows.map(c => (
                <tr key={c.id}>
                  <td>
                    <button type="button" className="link mono" onClick={() => setViewingId(c.id)}>{c.code}</button>
                    {c.name && <div className="muted small">{c.name}</div>}
                  </td>
                  <td>{c.level}</td>
                  <td>{c.schedule}{c.room && <div className="muted small">Phòng {c.room}{c.branch && ` · ${c.branch}`}</div>}</td>
                  <td>{teacherName(c.teacherId) ?? <span className="muted">Chưa phân công</span>}</td>
                  <td><StudentCountBadge c={c} /></td>
                  <td className="nowrap">{formatDate(c.startDate)}</td>
                  <td><Badge tone={c.status === 'dang_mo' ? 'green' : 'gray'}>{CLASS_STATUS_LABELS[c.status]}</Badge></td>
                  <td className="actions">
                    <button type="button" className="btn btn-sm" onClick={() => setViewingId(c.id)}>Học viên</button>
                    <button type="button" className="btn btn-sm" onClick={() => setEditing(c)}>Sửa</button>
                    <button type="button" className="btn btn-sm btn-danger-ghost" onClick={() => remove(c)}>Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <ClassForm klass={editing === 'new' ? null : editing} data={data} onClose={() => setEditing(null)} onSaved={reload} />
      )}
      {viewing && (
        <ClassDetail klass={viewing} data={data} teacherName={teacherName(viewing.teacherId)} onClose={() => setViewingId(null)} reload={reload} />
      )}
    </section>
  );
};

const ClassDetail = ({ klass, data, teacherName, onClose, reload }: AdminTabProps & {
  klass: ClassRoom;
  teacherName?: string;
  onClose: () => void;
}) => {
  const [editing, setEditing] = useState<Student | 'new' | null>(null);
  const students = data.students
    .filter(s => s.classId === klass.id)
    .sort((a, b) => a.fullName.localeCompare(b.fullName, 'vi'));

  return (
    <Modal title={`Lớp ${klass.code}`} onClose={onClose} wide>
      <div className="detail-meta">
        <span><b>Trình độ:</b> {klass.level}</span>
        <span><b>Giáo viên:</b> {teacherName ?? 'Chưa phân công'}</span>
        {klass.schedule && <span><b>Lịch:</b> {klass.schedule}</span>}
        <span><b>Sĩ số:</b> {klass.studentCount}/{klass.capacity}</span>
      </div>
      <div className="toolbar">
        <span className="spacer" />
        <button type="button" className="btn btn-primary btn-sm" onClick={() => setEditing('new')}>+ Thêm học viên vào lớp</button>
      </div>
      {students.length === 0 ? (
        <Empty>Lớp chưa có học viên.</Empty>
      ) : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>#</th><th>Mã HV</th><th>Họ tên</th><th>Điện thoại</th><th>Vào lớp</th><th>Trạng thái</th></tr></thead>
            <tbody>
              {students.map((s, i) => (
                <tr key={s.id}>
                  <td className="muted">{i + 1}</td>
                  <td className="mono">{s.code}</td>
                  <td><button type="button" className="link" onClick={() => setEditing(s)}>{s.fullName}</button></td>
                  <td className="nowrap">{formatPhone(s.phone)}</td>
                  <td className="nowrap">{formatDate(s.enrolledAt)}</td>
                  <td><StudentStatusBadge status={s.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {editing && (
        <StudentForm
          student={editing === 'new' ? null : editing}
          classes={data.classes}
          presetClassId={klass.id}
          onClose={() => setEditing(null)}
          onSaved={reload}
        />
      )}
    </Modal>
  );
};

const ClassForm = ({ klass, data, onClose, onSaved }: {
  klass: ClassRoom | null;
  data: AdminTabProps['data'];
  onClose: () => void;
  onSaved: () => Promise<void>;
}) => {
  const [form, setForm] = useState({
    code: '', name: '', level: '', branch: '', schedule: '', room: '', startDate: '', endDate: '',
    capacity: 15 as number | string, teacherId: '', status: 'dang_mo' as ClassStatus, note: '',
    ...klass,
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => setForm(f => ({ ...f, [key]: value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (klass) await api('PUT', `classes/${klass.id}`, form);
      else await api('POST', 'classes', form);
      await onSaved();
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const teachers = data.teachers.filter(t => t.active || t.id === form.teacherId);

  return (
    <Modal title={klass ? `Sửa lớp ${klass.code}` : 'Tạo lớp mới'} onClose={onClose} wide>
      <form onSubmit={submit}>
        <ErrorBox message={error} />
        <div className="grid">
          <Field label="Mã lớp" required hint="VD: SC1-K05">
            <input value={form.code} onChange={e => set('code', e.target.value)} required autoFocus />
          </Field>
          <Field label="Tên lớp">
            <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="VD: Sơ cấp 1 – tối 246" />
          </Field>
          <Field label="Trình độ" required>
            <select value={form.level} onChange={e => set('level', e.target.value)} required>
              <option value="">— Chọn —</option>
              {[...new Set([...LEVELS, form.level].filter(Boolean))].map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </Field>
          <Field label="Giáo viên phụ trách">
            <select value={form.teacherId} onChange={e => set('teacherId', e.target.value)}>
              <option value="">— Chưa phân công —</option>
              {teachers.map(t => <option key={t.id} value={t.id}>{t.fullName}{t.active ? '' : ' (đã khóa)'}</option>)}
            </select>
          </Field>
          <Field label="Lịch học" hint="VD: T2-T4-T6, 18:00–20:00">
            <input value={form.schedule} onChange={e => set('schedule', e.target.value)} />
          </Field>
          <Field label="Sĩ số tối đa" required>
            <input type="number" min={1} max={200} value={form.capacity} onChange={e => set('capacity', e.target.value)} required />
          </Field>
          <Field label="Ngày khai giảng">
            <input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} />
          </Field>
          <Field label="Ngày kết thúc">
            <input type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} />
          </Field>
          <Field label="Phòng học">
            <input value={form.room} onChange={e => set('room', e.target.value)} />
          </Field>
          <Field label="Chi nhánh">
            <input value={form.branch} onChange={e => set('branch', e.target.value)} />
          </Field>
          <Field label="Trạng thái">
            <select value={form.status} onChange={e => set('status', e.target.value as ClassStatus)}>
              {Object.entries(CLASS_STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </Field>
          <Field label="Ghi chú" full>
            <textarea rows={2} value={form.note} onChange={e => set('note', e.target.value)} />
          </Field>
        </div>
        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Hủy</button>
          <button className="btn btn-primary" disabled={busy}>{busy ? 'Đang lưu…' : 'Lưu'}</button>
        </div>
      </form>
    </Modal>
  );
};
