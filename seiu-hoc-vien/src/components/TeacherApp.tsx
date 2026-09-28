import { useEffect, useMemo, useState } from 'react';
import { api } from '../api';
import { formatDate, formatPhone, type TeacherClass } from '../types';
import { AttendanceBoard } from './AttendanceBoard';
import { StudentCountBadge } from './ClassesTab';
import { StudentStatusBadge } from './StudentsTab';
import { Empty, ErrorBox } from './ui';

export const TeacherApp = () => {
  const [classes, setClasses] = useState<TeacherClass[] | null>(null);
  const [selectedId, setSelectedId] = useState('');
  const [query, setQuery] = useState('');
  const [view, setView] = useState<'attendance' | 'list'>('attendance');
  const [error, setError] = useState('');

  useEffect(() => {
    api<{ classes: TeacherClass[] }>('GET', 'my-classes')
      .then(data => {
        setClasses(data.classes);
        // Ưu tiên lớp đang học (đã khai giảng), rồi đến lớp sắp mở.
        const today = new Date().toISOString().slice(0, 10);
        const firstOpen = data.classes.find(c => c.status === 'dang_mo' && (!c.startDate || c.startDate <= today))
          ?? data.classes.find(c => c.status === 'dang_mo')
          ?? data.classes[0];
        setSelectedId(firstOpen?.id ?? '');
      })
      .catch(err => setError((err as Error).message));
  }, []);

  const selected = classes?.find(c => c.id === selectedId);
  const students = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (selected?.students ?? []).filter(s => !q || `${s.code} ${s.fullName} ${s.phone}`.toLowerCase().includes(q));
  }, [selected, query]);

  if (error) return <ErrorBox message={error} />;
  if (!classes) return <div className="muted center-pad">Đang tải…</div>;
  if (classes.length === 0) {
    return <Empty>Bạn chưa được phân công lớp nào. Vui lòng liên hệ quản trị viên.</Empty>;
  }

  return (
    <>
      <h1 className="page-title">Lớp của tôi</h1>
      <div className="class-cards">
        {classes.map(c => (
          <button
            key={c.id}
            type="button"
            className={`class-card ${c.id === selectedId ? 'class-card-active' : ''} ${c.status !== 'dang_mo' ? 'class-card-ended' : ''}`}
            onClick={() => setSelectedId(c.id)}
          >
            <span className="class-card-code">{c.code}</span>
            <span>{c.level}</span>
            {c.schedule && <span className="muted small">{c.schedule}</span>}
            <StudentCountBadge c={c} />
          </button>
        ))}
      </div>

      {selected && (
        <section className="panel">
          <h2 className="panel-title">
            Lớp {selected.code}
            {selected.status !== 'dang_mo' && <span className="muted small"> (đã kết thúc)</span>}
          </h2>
          <nav className="tabs" role="tablist">
            <button type="button" role="tab" aria-selected={view === 'attendance'} className={`tab ${view === 'attendance' ? 'tab-active' : ''}`} onClick={() => setView('attendance')}>
              Điểm danh &amp; nội dung học
            </button>
            <button type="button" role="tab" aria-selected={view === 'list'} className={`tab ${view === 'list' ? 'tab-active' : ''}`} onClick={() => setView('list')}>
              Danh sách học viên <span className="tab-count">{selected.students.length}</span>
            </button>
          </nav>
          {view === 'attendance' ? <AttendanceBoard classId={selected.id} /> : (
          <>
          <div className="toolbar">
            <span className="spacer" />
            <input className="search search-sm no-print" type="search" placeholder="Tìm học viên…" value={query} onChange={e => setQuery(e.target.value)} />
            {!__DEMO__ && (
              <button type="button" className="btn btn-sm no-print" onClick={() => window.print()}>In danh sách</button>
            )}
          </div>
          <div className="detail-meta">
            {selected.schedule && <span><b>Lịch:</b> {selected.schedule}</span>}
            {selected.room && <span><b>Phòng:</b> {selected.room}</span>}
            {selected.startDate && <span><b>Khai giảng:</b> {formatDate(selected.startDate)}</span>}
          </div>
          {students.length === 0 ? (
            <Empty>{selected.students.length ? 'Không tìm thấy học viên.' : 'Lớp chưa có học viên.'}</Empty>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>#</th><th>Mã HV</th><th>Họ tên</th><th>Ngày sinh</th><th>Điện thoại</th><th>Trạng thái</th><th>Ghi chú</th></tr>
                </thead>
                <tbody>
                  {students.map((s, i) => (
                    <tr key={s.id}>
                      <td className="muted">{i + 1}</td>
                      <td className="mono">{s.code}</td>
                      <td><b>{s.fullName}</b></td>
                      <td className="nowrap">{formatDate(s.dateOfBirth)}</td>
                      <td className="nowrap"><a href={`tel:${s.phone}`}>{formatPhone(s.phone)}</a></td>
                      <td><StudentStatusBadge status={s.status} /></td>
                      <td className="note-cell">{s.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          </>
          )}
        </section>
      )}
    </>
  );
};
