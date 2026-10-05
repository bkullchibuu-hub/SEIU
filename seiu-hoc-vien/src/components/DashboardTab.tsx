import { formatDate, formatMoney } from '../types';
import type { AdminData, Perms } from './AdminApp';
import { todayDay } from './Timetable';
import { Badge, Empty } from './ui';

type GoTo = (tab: 'students' | 'classes' | 'timetable') => void;

const todayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const DashboardTab = ({ data, goTo, perms }: { data: AdminData; goTo: GoTo; perms: Perms }) => {
  const today = todayIso();
  const month = today.slice(0, 7);
  const active = data.students.filter(s => s.status === 'dang_hoc');
  const openClasses = data.classes.filter(c => c.status === 'dang_mo');
  const teacherName = (id: string) => data.teachers.find(t => t.id === id)?.fullName ?? 'Chưa phân công';
  const className = (id: string) => data.classes.find(c => c.id === id)?.code ?? '';

  const payments = data.students.flatMap(s => (s.payments ?? []).map(p => ({ ...p, student: s })));
  const paidThisMonth = payments.filter(p => p.date.startsWith(month)).reduce((sum, p) => sum + p.amount, 0);
  const owedOf = (s: AdminData['students'][number]) => s.stats.owed ?? 0;
  const owing = data.students.filter(s => owedOf(s) > 0).sort((a, b) => owedOf(b) - owedOf(a));
  const totalOwed = owing.reduce((sum, s) => sum + owedOf(s), 0);
  const absentees = active.filter(s => s.stats.absent >= 3).sort((a, b) => b.stats.absent - a.stats.absent);
  const recentPayments = payments.filter(p => p.date).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8);

  const todayClasses = openClasses
    .filter(c => c.days?.includes(todayDay()))
    .sort((a, b) => (a.startTime || '99').localeCompare(b.startTime || '99'));

  const goalCounts = Object.entries(active.reduce<Record<string, number>>((acc, s) => {
    const key = s.goal || 'Chưa ghi';
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {})).sort((a, b) => b[1] - a[1]);
  const maxGoal = Math.max(1, ...goalCounts.map(([, n]) => n));

  return (
    <div className="dash">
      <div className="kpis">
        <button type="button" className="kpi" onClick={() => goTo('students')}>
          <span className="kpi-label">Học viên đang học</span>
          <span className="kpi-value">{active.length}</span>
          <span className="kpi-sub">trên tổng {data.students.length} hồ sơ</span>
        </button>
        <button type="button" className="kpi" onClick={() => goTo('classes')}>
          <span className="kpi-label">Lớp đang mở</span>
          <span className="kpi-value">{openClasses.length}</span>
          <span className="kpi-sub">{todayClasses.length} lớp có lịch hôm nay</span>
        </button>
        {perms.fees && <div className="kpi">
          <span className="kpi-label">Đã thu tháng {Number(month.slice(5))}</span>
          <span className="kpi-value">{formatMoney(paidThisMonth)}</span>
          <span className="kpi-sub">{payments.filter(p => p.date.startsWith(month)).length} lần đóng tiền</span>
        </div>}
        {perms.fees && <button type="button" className="kpi" onClick={() => goTo('students')}>
          <span className="kpi-label">Còn nợ học phí</span>
          <span className={`kpi-value ${totalOwed ? 'text-red' : ''}`}>{formatMoney(totalOwed)}</span>
          <span className="kpi-sub">{owing.length} học viên</span>
        </button>}
      </div>

      <div className="dash-grid">
        <section className="panel">
          <div className="panel-head">
            <h2>Lịch học hôm nay</h2>
            <button type="button" className="btn btn-sm" onClick={() => goTo('timetable')}>Thời khóa biểu</button>
          </div>
          {todayClasses.length === 0 ? (
            <p className="muted">Hôm nay không có lớp nào theo lịch.</p>
          ) : (
            <ul className="dash-list">
              {todayClasses.map(c => (
                <li key={c.id}>
                  <span className="mono dash-time">{c.startTime ? `${c.startTime}–${c.endTime}` : '—'}</span>
                  <span><b>{c.code}</b> · {teacherName(c.teacherId)}{c.room ? ` · P.${c.room}` : ''}</span>
                  {c.lastSessionDate === today
                    ? <Badge tone="green">Đã điểm danh</Badge>
                    : <Badge tone="amber">Chưa điểm danh</Badge>}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="panel">
          <div className="panel-head"><h2>Học viên đang học theo mục tiêu</h2></div>
          {goalCounts.length === 0 ? <p className="muted">Chưa có dữ liệu.</p> : (
            <div className="hbars" role="table" aria-label="Học viên đang học theo mục tiêu">
              {goalCounts.map(([goal, n]) => (
                <div key={goal} className="hbar" role="row" title={`${goal}: ${n} học viên`}>
                  <span className="hbar-label" role="cell">{goal}</span>
                  <span className="hbar-track" role="cell">
                    <span className="hbar-fill" style={{ width: `${(n / maxGoal) * 100}%` }} />
                  </span>
                  <span className="hbar-value" role="cell">{n}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="panel dash-wide">
          <div className="panel-head">
            <h2>Tiến độ các lớp đang mở</h2>
            <button type="button" className="btn btn-sm" onClick={() => goTo('classes')}>Xem lớp học</button>
          </div>
          {openClasses.length === 0 ? <Empty>Chưa có lớp nào đang mở.</Empty> : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Lớp</th><th>Giáo viên</th><th>Lớp trưởng</th><th className="num">Sĩ số</th><th>Tiến độ</th><th>Buổi gần nhất</th></tr>
                </thead>
                <tbody>
                  {openClasses.map(c => {
                    const total = c.sessionCount || 55;
                    return (
                      <tr key={c.id}>
                        <td><b>{c.code}</b><div className="muted small">{c.schedule}</div></td>
                        <td>{teacherName(c.teacherId)}</td>
                        <td>{c.monitor}</td>
                        <td className="num">{c.studentCount}</td>
                        <td className="progress-cell">
                          <span className="progress" aria-hidden="true"><span style={{ width: `${Math.min(100, (c.sessionsDone / total) * 100)}%` }} /></span>
                          <span className="small">{c.sessionsDone}/{total} buổi</span>
                        </td>
                        <td className="small">
                          {c.lastSessionDate ? <><b>{formatDate(c.lastSessionDate)}</b> {c.lastContent}</> : <span className="muted">Chưa điểm danh</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="panel">
          <div className="panel-head"><h2>Vắng từ 3 buổi trở lên</h2></div>
          {absentees.length === 0 ? <p className="muted">Không có học viên nào vắng nhiều.</p> : (
            <ul className="dash-list">
              {absentees.slice(0, 10).map(s => (
                <li key={s.id}>
                  <span><b>{s.fullName}</b> <span className="muted small">{className(s.classId)}</span></span>
                  <Badge tone="red">Vắng {s.stats.absent}</Badge>
                </li>
              ))}
            </ul>
          )}
        </section>

        {perms.fees && (
          <>
        <section className="panel">
          <div className="panel-head"><h2>Còn nợ học phí nhiều nhất</h2></div>
          {owing.length === 0 ? <p className="muted">Không có học viên nào còn nợ.</p> : (
            <ul className="dash-list">
              {owing.slice(0, 10).map(s => (
                <li key={s.id}>
                  <span><b>{s.fullName}</b> <span className="muted small">{className(s.classId)}</span></span>
                  <span className="text-red nowrap"><b>{formatMoney(owedOf(s))}</b></span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="panel">
          <div className="panel-head"><h2>Đóng tiền gần đây</h2></div>
          {recentPayments.length === 0 ? <p className="muted">Chưa có lần đóng tiền nào.</p> : (
            <ul className="dash-list">
              {recentPayments.map((p, i) => (
                <li key={p.id ?? i}>
                  <span className="mono dash-time">{formatDate(p.date).slice(0, 5)}</span>
                  <span><b>{p.student.fullName}</b>{p.note ? <span className="muted small"> · {p.note}</span> : null}</span>
                  <span className="nowrap"><b>{formatMoney(p.amount)}</b></span>
                </li>
              ))}
            </ul>
          )}
        </section>
          </>
        )}
      </div>
    </div>
  );
};
