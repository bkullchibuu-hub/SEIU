import { useMemo, useState, type FormEvent } from 'react';
import { api, ApiError } from '../api';
import {
  birthLabel, formatDate, formatMoney, formatPhone, GOALS, LEVELS, STUDENT_STATUS_LABELS,
  type ClassRoom, type Payment, type Student, type StudentRow, type StudentStatus,
} from '../types';
import type { AdminTabProps } from './AdminApp';
import { ImportDialog } from './ImportDialog';
import { Badge, ConfirmDelete, Empty, ErrorBox, Field, Modal } from './ui';

const STATUS_TONE: Record<StudentStatus, 'green' | 'amber' | 'blue' | 'gray'> = {
  dang_hoc: 'green', bao_luu: 'amber', hoan_thanh: 'blue', da_nghi: 'gray',
};

export const StudentStatusBadge = ({ status }: { status: StudentStatus }) => (
  <Badge tone={STATUS_TONE[status]}>{STUDENT_STATUS_LABELS[status]}</Badge>
);

export const normalize = (value: string) =>
  value.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd').toLowerCase();

export const classOptionLabel = (c: ClassRoom) =>
  `${c.code}${c.level ? ` – ${c.level}` : ''} (${c.studentCount}/${c.capacity})`;

// Xuất bảng ra file CSV mở được bằng Excel (có BOM để giữ tiếng Việt).
const exportCsv = (rows: StudentRow[], className: (id: string) => string) => {
  const header = ['STT', 'Số báo danh', 'Họ và tên', 'SĐT', 'Năm sinh', 'Giới tính', 'Địa chỉ', 'Mục tiêu', 'Lớp học',
    'Trạng thái', 'Số buổi đã học', 'Vắng', 'Học phí', 'Giảm/miễn trừ', 'Đã đóng', 'Còn nợ', 'Ngày thu gần nhất',
    'Thi TOPIK', 'Tiền xe', 'Ghi chú'];
  const cell = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const lines = rows.map((s, i) => [
    i + 1, s.code, s.fullName, s.phone, birthLabel(s), s.gender === 'nu' ? 'Nữ' : s.gender === 'nam' ? 'Nam' : '',
    s.address, s.goal, className(s.classId), STUDENT_STATUS_LABELS[s.status], s.stats.attended, s.stats.absent,
    s.tuitionFee ?? 0, s.discount ?? 0, s.stats.paid, s.stats.owed, formatDate(s.stats.lastPaymentDate),
    s.topikExam, s.busFee ?? 0, s.note,
  ].map(cell).join(','));
  const blob = new Blob([`﻿${[header.map(cell).join(','), ...lines].join('\r\n')}`], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `hoc-vien-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
};

export const StudentsTab = ({ data, reload }: AdminTabProps) => {
  const [query, setQuery] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<StudentStatus | ''>('dang_hoc');
  const [goalFilter, setGoalFilter] = useState('');
  const [owingOnly, setOwingOnly] = useState(false);
  const [editing, setEditing] = useState<Student | 'new' | null>(null);
  const [deleting, setDeleting] = useState<Student | null>(null);
  const [importing, setImporting] = useState(false);

  const classById = useMemo(() => new Map(data.classes.map(c => [c.id, c])), [data.classes]);
  const className = (id: string) => classById.get(id)?.code ?? '';
  const goals = useMemo(
    () => [...new Set([...GOALS, ...data.students.map(s => s.goal).filter(Boolean)])],
    [data.students],
  );

  const rows = useMemo(() => {
    const q = normalize(query.trim());
    const qDigits = q.replace(/\D/g, '');
    return data.students.filter(s =>
      (!statusFilter || s.status === statusFilter)
      && (!classFilter || (classFilter === 'none' ? !s.classId : s.classId === classFilter))
      && (!goalFilter || s.goal === goalFilter)
      && (!owingOnly || s.stats.owed > 0)
      && (!q
        || normalize(`${s.code} ${s.fullName} ${s.email} ${s.address}`).includes(q)
        || (qDigits.length >= 3 && s.phone.includes(qDigits))));
  }, [data.students, query, classFilter, statusFilter, goalFilter, owingOnly]);

  const totals = rows.reduce((t, s) => ({
    fee: t.fee + (s.tuitionFee ?? 0) - (s.discount ?? 0),
    paid: t.paid + s.stats.paid,
    owed: t.owed + Math.max(0, s.stats.owed),
  }), { fee: 0, paid: 0, owed: 0 });

  return (
    <section>
      <div className="toolbar">
        <input
          className="search"
          type="search"
          placeholder="Tìm theo tên, số báo danh, SĐT, địa chỉ…"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <button type="button" className="btn" onClick={() => setImporting(true)}>Nhập từ Excel</button>
        <button type="button" className="btn" onClick={() => exportCsv(rows, className)} disabled={!rows.length}>Xuất Excel</button>
        <button type="button" className="btn btn-primary" onClick={() => setEditing('new')}>+ Thêm học viên</button>
      </div>
      <div className="toolbar">
        <select value={classFilter} onChange={e => setClassFilter(e.target.value)} aria-label="Lọc theo lớp">
          <option value="">Tất cả lớp</option>
          <option value="none">Chưa xếp lớp</option>
          {data.classes.map(c => <option key={c.id} value={c.id}>{c.code}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as StudentStatus | '')} aria-label="Lọc theo trạng thái">
          <option value="">Mọi trạng thái</option>
          {Object.entries(STUDENT_STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select value={goalFilter} onChange={e => setGoalFilter(e.target.value)} aria-label="Lọc theo mục tiêu">
          <option value="">Mọi mục tiêu</option>
          {goals.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
        <label className="check">
          <input type="checkbox" checked={owingOnly} onChange={e => setOwingOnly(e.target.checked)} />
          Chỉ học viên còn nợ
        </label>
      </div>

      <p className="muted small">
        {rows.length} / {data.students.length} học viên · Đã đóng <b>{formatMoney(totals.paid)}</b>
        {' '}· Còn nợ <b className={totals.owed ? 'text-red' : ''}>{formatMoney(totals.owed)}</b>
      </p>

      {rows.length === 0 ? (
        <Empty>
          {data.students.length
            ? 'Không có học viên phù hợp bộ lọc.'
            : 'Chưa có học viên nào. Bấm “Nhập từ Excel” để chuyển danh sách cũ, hoặc “+ Thêm học viên”.'}
        </Empty>
      ) : (
        <div className="table-wrap master-wrap">
          <table className="master-table">
            <thead>
              <tr>
                <th>STT</th><th>SBD</th><th className="sticky-col">Họ và tên</th><th>SĐT</th><th>Năm sinh</th>
                <th>GT</th><th>Địa chỉ</th><th>Mục tiêu</th><th>Lớp</th><th>Trạng thái</th>
                <th className="num">Đã học</th><th className="num">Vắng</th>
                <th className="num">Học phí</th><th className="num">Đã đóng</th><th className="num">Còn nợ</th>
                <th>Thu gần nhất</th><th>Thi TOPIK</th><th className="num">Tiền xe</th><th>Ghi chú</th><th />
              </tr>
            </thead>
            <tbody>
              {rows.map((s, i) => (
                <tr key={s.id}>
                  <td className="muted">{i + 1}</td>
                  <td className="mono">{s.code}</td>
                  <td className="sticky-col">
                    <button type="button" className="link" onClick={() => setEditing(s)}>{s.fullName}</button>
                  </td>
                  <td className="nowrap">{formatPhone(s.phone)}</td>
                  <td className="nowrap">{birthLabel(s)}</td>
                  <td>{s.gender === 'nu' ? 'Nữ' : s.gender === 'nam' ? 'Nam' : ''}</td>
                  <td className="cell-clip" title={s.address}>{s.address}</td>
                  <td className="nowrap">{s.goal}</td>
                  <td className="nowrap">{className(s.classId) || <span className="muted">—</span>}</td>
                  <td><StudentStatusBadge status={s.status} /></td>
                  <td className="num">{s.stats.attended}</td>
                  <td className={`num ${s.stats.absent >= 3 ? 'text-red' : ''}`}>{s.stats.absent}</td>
                  <td className="num">{s.tuitionFee ? formatMoney((s.tuitionFee ?? 0) - (s.discount ?? 0)) : ''}</td>
                  <td className="num">{s.stats.paid ? formatMoney(s.stats.paid) : ''}</td>
                  <td className="num">
                    {s.stats.owed > 0 ? <Badge tone="red">{formatMoney(s.stats.owed)}</Badge> : s.tuitionFee ? <span className="muted">Đủ</span> : ''}
                  </td>
                  <td className="nowrap">{formatDate(s.stats.lastPaymentDate)}</td>
                  <td className="cell-clip" title={s.topikExam}>{s.topikExam}</td>
                  <td className="num">{s.busFee ? formatMoney(s.busFee) : ''}</td>
                  <td className="cell-clip" title={s.note}>{s.note}</td>
                  <td className="actions">
                    <button type="button" className="btn btn-sm" onClick={() => setEditing(s)}>Sửa</button>
                    <button type="button" className="btn btn-sm btn-danger-ghost" onClick={() => setDeleting(s)}>Xóa</button>
                  </td>
                </tr>
              ))}
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
      {deleting && (
        <ConfirmDelete
          title={`Xóa học viên ${deleting.code}`}
          message={`Xóa hồ sơ học viên ${deleting.code} – ${deleting.fullName}, kể cả lịch sử đóng tiền? Thao tác này không thể hoàn tác.`}
          onClose={() => setDeleting(null)}
          onConfirm={async () => {
            await api('DELETE', `students/${deleting.id}`);
            await reload();
          }}
        />
      )}
      {importing && <ImportDialog onClose={() => setImporting(false)} onImported={reload} />}
    </section>
  );
};

const today = () => new Date().toISOString().slice(0, 10);

const emptyForm = (classId = '', level = '') => ({
  code: '', fullName: '', phone: '', email: '', dateOfBirth: '', birthYear: '' as number | '', gender: '' as Student['gender'],
  address: '', goal: '', level, classId, enrolledAt: today(), status: 'dang_hoc' as StudentStatus, note: '',
  tuitionFee: 0, discount: 0, payments: [] as Payment[], busFee: 0, topikExam: '',
});

const MoneyInput = ({ value, onChange, id }: { value: number; onChange: (v: number) => void; id?: string }) => (
  <input
    id={id}
    inputMode="numeric"
    value={value ? value.toLocaleString('vi-VN') : ''}
    onChange={e => onChange(Number(e.target.value.replace(/\D/g, '')) || 0)}
    placeholder="0"
  />
);

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
    student
      ? { ...emptyForm(), ...student, payments: [...(student.payments ?? [])] }
      : emptyForm(presetClassId, levelOf(presetClassId))
  ));
  const [error, setError] = useState('');
  const [duplicate, setDuplicate] = useState<{ id: string; code: string } | null>(null);
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => setForm(f => ({ ...f, [key]: value }));
  const setPayment = (i: number, patch: Partial<Payment>) =>
    setForm(f => ({ ...f, payments: f.payments.map((p, j) => (j === i ? { ...p, ...patch } : p)) }));

  const selectableClasses = classes.filter(c => c.status === 'dang_mo' || c.id === form.classId);
  const classChanged = student && student.classId !== form.classId;
  const paid = form.payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const owed = (form.tuitionFee || 0) - (form.discount || 0) - paid;

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
      const body = { ...form, payments: form.payments.filter(p => p.amount > 0) };
      const saved = student
        ? await api<{ item: Student }>('PUT', `students/${student.id}`, body)
        : await api<{ item: Student }>('POST', 'students', body);
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
          <Field label="Số báo danh" hint={student ? undefined : 'Để trống để tự tạo số tiếp theo'}>
            <input value={form.code} onChange={e => set('code', e.target.value)} />
          </Field>
          <Field label="Số điện thoại">
            <input type="tel" inputMode="numeric" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="0901234567" />
          </Field>
          <Field label="Mục tiêu học">
            <input list="goal-options" value={form.goal} onChange={e => set('goal', e.target.value)} placeholder="Du học, TOPIK 1, Giao tiếp…" />
            <datalist id="goal-options">{GOALS.map(g => <option key={g} value={g} />)}</datalist>
          </Field>
          <Field label="Ngày sinh">
            <input type="date" value={form.dateOfBirth} onChange={e => set('dateOfBirth', e.target.value)} />
          </Field>
          <Field label="Năm sinh" hint="Điền nếu không rõ ngày sinh">
            <input
              inputMode="numeric"
              value={form.birthYear}
              onChange={e => set('birthYear', e.target.value ? Number(e.target.value.replace(/\D/g, '').slice(0, 4)) : '')}
              placeholder="2008"
            />
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
          <Field label="Địa chỉ" full>
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
        </div>

        <h3 className="form-section">Học phí <span className="muted small">(chỉ quản trị xem được)</span></h3>
        <div className="grid grid-3">
          <Field label="Học phí khóa">
            <MoneyInput value={form.tuitionFee} onChange={v => set('tuitionFee', v)} />
          </Field>
          <Field label="Giảm / miễn trừ">
            <MoneyInput value={form.discount} onChange={v => set('discount', v)} />
          </Field>
          <Field label="Tiền xe">
            <MoneyInput value={form.busFee} onChange={v => set('busFee', v)} />
          </Field>
        </div>
        <div className="payments">
          <div className="payments-head">
            <b>Các lần đóng tiền</b>
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => set('payments', [...form.payments, { date: today(), amount: 0, note: `Lần ${form.payments.length + 1}` }])}
            >
              + Thêm lần đóng
            </button>
          </div>
          {form.payments.length === 0 && <p className="muted small">Chưa có lần đóng tiền nào.</p>}
          {form.payments.map((p, i) => (
            <div key={p.id ?? `new-${i}`} className="payment-row">
              <input type="date" aria-label={`Ngày đóng lần ${i + 1}`} value={p.date} onChange={e => setPayment(i, { date: e.target.value })} />
              <MoneyInput value={p.amount} onChange={v => setPayment(i, { amount: v })} />
              <input aria-label={`Ghi chú lần ${i + 1}`} value={p.note} onChange={e => setPayment(i, { note: e.target.value })} placeholder="Ghi chú" />
              <button
                type="button"
                className="btn btn-sm btn-danger-ghost"
                onClick={() => set('payments', form.payments.filter((_, j) => j !== i))}
                aria-label={`Xóa lần đóng ${i + 1}`}
              >
                ×
              </button>
            </div>
          ))}
          <div className="payment-sum">
            <span>Đã đóng: <b>{formatMoney(paid)}</b></span>
            <span>
              {owed > 0 ? <>Còn nợ: <b className="text-red">{formatMoney(owed)}</b></>
                : owed < 0 ? <>Đóng dư: <b>{formatMoney(-owed)}</b></>
                  : form.tuitionFee ? <b className="text-green">Đã đóng đủ</b> : null}
            </span>
          </div>
        </div>

        <div className="grid">
          <Field label="Thi TOPIK đăng ký">
            <input value={form.topikExam} onChange={e => set('topikExam', e.target.value)} placeholder="VD: TOPIK 104 – đã đóng phí" />
          </Field>
          <Field label="Ghi chú" full>
            <textarea rows={3} value={form.note} onChange={e => set('note', e.target.value)} placeholder="Mục tiêu, lịch rảnh, thông tin phụ huynh…" />
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
