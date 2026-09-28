import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { api } from '../api';
import {
  formatDate, MARKS,
  type AttendanceMark, type AttendanceStudent, type ClassRoom, type ClassSession,
} from '../types';
import { ConfirmDelete, Empty, ErrorBox, Field, Modal } from './ui';

interface BoardData {
  class: ClassRoom;
  students: AttendanceStudent[];
  sessions: ClassSession[];
}

const markInfo = (mark?: AttendanceMark) => MARKS.find(m => m.value === mark);

const today = () => new Date().toISOString().slice(0, 10);

// Sổ điểm danh của một lớp: mỗi dòng là một học viên, mỗi cột là một buổi học.
export const AttendanceBoard = ({ classId }: { classId: string }) => {
  const [data, setData] = useState<BoardData | null>(null);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      setData(await api<BoardData>('GET', `classes/${classId}/sessions`));
      setError('');
    } catch (err) {
      setError((err as Error).message);
    }
  }, [classId]);

  useEffect(() => {
    setData(null);
    load();
  }, [load]);

  const sessionByNumber = useMemo(
    () => new Map((data?.sessions ?? []).map(s => [s.number, s])),
    [data?.sessions],
  );

  if (error) return <ErrorBox message={error} />;
  if (!data) return <div className="muted center-pad">Đang tải sổ điểm danh…</div>;

  const total = Math.max(data.class.sessionCount ?? 55, ...data.sessions.map(s => s.number));
  const numbers = Array.from({ length: total }, (_, i) => i + 1);
  const nextNumber = numbers.find(n => !sessionByNumber.has(n));
  const done = data.sessions.length;

  const summary = (studentId: string) => {
    let present = 0;
    let absent = 0;
    for (const s of data.sessions) {
      const m = s.marks[studentId];
      if (m === 'co_mat' || m === 'muon') present += 1;
      else if (m === 'co_phep' || m === 'khong_phep') absent += 1;
    }
    return { present, absent };
  };

  return (
    <div className="attendance">
      <div className="toolbar">
        <div className="att-progress">
          <b>Đã dạy {done}/{total} buổi</b>
          <span className="att-progress-bar" aria-hidden="true">
            <span style={{ width: `${Math.min(100, (done / total) * 100)}%` }} />
          </span>
        </div>
        <span className="spacer" />
        <div className="att-legend">
          {MARKS.map(m => (
            <span key={m.value}><span className={`mark mark-${m.value}`}>{m.short}</span> {m.label}</span>
          ))}
        </div>
        {nextNumber && (
          <button type="button" className="btn btn-primary" onClick={() => setEditing(nextNumber)}>
            Điểm danh buổi {nextNumber}
          </button>
        )}
      </div>

      {data.students.length === 0 ? (
        <Empty>Lớp chưa có học viên.</Empty>
      ) : (
        <div className="table-wrap att-wrap">
          <table className="att-table">
            <thead>
              <tr>
                <th className="att-name">Học viên</th>
                <th className="att-sum" title="Số buổi có mặt / vắng">Có mặt / Vắng</th>
                {numbers.map(n => {
                  const s = sessionByNumber.get(n);
                  return (
                    <th key={n} className={`att-col ${s ? 'att-col-done' : ''}`}>
                      <button type="button" onClick={() => setEditing(n)} title={s?.content || `Buổi ${n}`}>
                        <span>{n}</span>
                        <small>{s ? formatDate(s.date).slice(0, 5) : ''}</small>
                      </button>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {data.students.map((st, i) => {
                const { present, absent } = summary(st.id);
                return (
                  <tr key={st.id} className={st.inClass ? '' : 'att-left'}>
                    <td className="att-name">
                      <span className="muted">{i + 1}.</span> <b>{st.fullName}</b>
                      {!st.inClass && <span className="muted small"> (đã chuyển lớp)</span>}
                    </td>
                    <td className="att-sum">
                      <span className="att-present">{present}</span> / <span className={absent ? 'att-absent' : ''}>{absent}</span>
                    </td>
                    {numbers.map(n => {
                      const m = markInfo(sessionByNumber.get(n)?.marks[st.id]);
                      return (
                        <td key={n} className="att-cell">
                          <button type="button" onClick={() => setEditing(n)} aria-label={`Buổi ${n}: ${m?.label ?? 'chưa điểm danh'}`}>
                            {m && <span className={`mark mark-${m.value}`}>{m.short}</span>}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <h3 className="att-log-title">Nội dung các buổi học</h3>
      {data.sessions.length === 0 ? (
        <Empty>Chưa có buổi học nào được ghi. Bấm “Điểm danh buổi 1” để bắt đầu.</Empty>
      ) : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Buổi</th><th>Ngày</th><th>Nội dung bài học</th><th>Bài tập về nhà</th><th>Vắng</th><th /></tr></thead>
            <tbody>
              {[...data.sessions].reverse().map(s => {
                const absentNames = data.students
                  .filter(st => s.marks[st.id] === 'co_phep' || s.marks[st.id] === 'khong_phep')
                  .map(st => st.fullName);
                return (
                  <tr key={s.number}>
                    <td className="mono">{s.number}</td>
                    <td className="nowrap">{formatDate(s.date)}</td>
                    <td className="pre">{s.content || <span className="muted">—</span>}</td>
                    <td className="pre">{s.homework}</td>
                    <td className="small">{absentNames.join(', ') || <span className="muted">—</span>}</td>
                    <td className="actions">
                      <button type="button" className="btn btn-sm" onClick={() => setEditing(s.number)}>Sửa</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {editing !== null && (
        <SessionEditor
          key={editing}
          classId={classId}
          number={editing}
          session={sessionByNumber.get(editing)}
          students={data.students}
          onClose={() => setEditing(null)}
          onSaved={load}
        />
      )}
    </div>
  );
};

const SessionEditor = ({ classId, number, session, students, onClose, onSaved }: {
  classId: string;
  number: number;
  session?: ClassSession;
  students: AttendanceStudent[];
  onClose: () => void;
  onSaved: () => Promise<void>;
}) => {
  // Học viên đã chuyển lớp chỉ hiện nếu đã có điểm danh ở buổi này.
  const rows = students.filter(s => s.inClass || session?.marks[s.id]);
  const [form, setForm] = useState({
    date: session?.date ?? today(),
    content: session?.content ?? '',
    homework: session?.homework ?? '',
    note: session?.note ?? '',
  });
  const [marks, setMarks] = useState<Record<string, AttendanceMark>>(() => (
    session ? { ...session.marks } : Object.fromEntries(rows.filter(s => s.status === 'dang_hoc').map(s => [s.id, 'co_mat' as const]))
  ));
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const setMark = (studentId: string, mark: AttendanceMark) =>
    setMarks(m => {
      const next = { ...m };
      if (next[studentId] === mark) delete next[studentId];
      else next[studentId] = mark;
      return next;
    });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api('PUT', `classes/${classId}/sessions/${number}`, { ...form, marks });
      await onSaved();
      onClose();
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  };

  const counts = MARKS.map(m => ({ ...m, n: Object.values(marks).filter(v => v === m.value).length }));

  return (
    <Modal title={`Buổi ${number}${session ? '' : ' – điểm danh mới'}`} onClose={onClose} wide>
      <form onSubmit={submit}>
        <ErrorBox message={error} />
        <div className="grid">
          <Field label="Ngày học" required>
            <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
          </Field>
          <div className="att-counts">
            {counts.map(c => (
              <span key={c.value}><span className={`mark mark-${c.value}`}>{c.short}</span> {c.n}</span>
            ))}
          </div>
          <Field label="Nội dung bài học" full>
            <textarea
              rows={3}
              value={form.content}
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              placeholder="VD: Bài 3 – Giới thiệu bản thân. Ngữ pháp 이에요/예요, từ vựng nghề nghiệp."
              autoFocus
            />
          </Field>
          <Field label="Bài tập về nhà">
            <textarea rows={2} value={form.homework} onChange={e => setForm(f => ({ ...f, homework: e.target.value }))} />
          </Field>
          <Field label="Ghi chú buổi học">
            <textarea rows={2} value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} />
          </Field>
        </div>

        <div className="toolbar att-editor-head">
          <h3 className="form-section">Điểm danh ({rows.length} học viên)</h3>
          <span className="spacer" />
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => setMarks(Object.fromEntries(rows.map(s => [s.id, 'co_mat' as const])))}
          >
            Tất cả có mặt
          </button>
        </div>
        <div className="att-list">
          {rows.map((s, i) => (
            <div key={s.id} className="att-row">
              <span className="att-row-name">
                <span className="muted">{i + 1}.</span> {s.fullName}
                {s.status !== 'dang_hoc' && <span className="muted small"> (không còn học)</span>}
              </span>
              <div className="seg" role="group" aria-label={`Điểm danh ${s.fullName}`}>
                {MARKS.map(m => (
                  <button
                    key={m.value}
                    type="button"
                    className={`seg-btn ${marks[s.id] === m.value ? `seg-on seg-${m.value}` : ''}`}
                    aria-pressed={marks[s.id] === m.value}
                    onClick={() => setMark(s.id, m.value)}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {session && (
          <p className="muted small">Cập nhật lần cuối bởi {session.updatedBy} lúc {new Date(session.updatedAt).toLocaleString('vi-VN')}</p>
        )}
        <div className="form-actions">
          {session && (
            <button type="button" className="btn btn-danger-ghost" onClick={() => setConfirmClear(true)}>Xóa buổi này</button>
          )}
          <span className="spacer" />
          <button type="button" className="btn btn-ghost" onClick={onClose}>Hủy</button>
          <button className="btn btn-primary" disabled={busy}>{busy ? 'Đang lưu…' : 'Lưu buổi học'}</button>
        </div>
      </form>
      {confirmClear && (
        <ConfirmDelete
          title={`Xóa buổi ${number}`}
          message={`Xóa toàn bộ điểm danh và nội dung của buổi ${number}?`}
          onClose={() => setConfirmClear(false)}
          onConfirm={async () => {
            await api('DELETE', `classes/${classId}/sessions/${number}`);
            await onSaved();
            onClose();
          }}
        />
      )}
    </Modal>
  );
};
