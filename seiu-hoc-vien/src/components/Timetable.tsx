import { DAYS, type ClassRoom, type Teacher } from '../types';
import { Empty } from './ui';

const toMinutes = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};
// Thứ trong tuần theo quy ước của app: 1 = Thứ 2 … 7 = Chủ nhật.
export const todayDay = () => ((new Date().getDay() + 6) % 7) + 1;

const HOUR_PX = 56;

// Thời khóa biểu tuần: mỗi cột là một thứ, mỗi khối là một lớp theo giờ học.
export const Timetable = ({ classes, teachers = [] }: { classes: ClassRoom[]; teachers?: Teacher[] }) => {
  const teacherName = (id: string) => teachers.find(t => t.id === id)?.fullName ?? '';
  const timed = classes.filter(c => c.days?.length && c.startTime && c.endTime);
  const untimed = classes.filter(c => !timed.includes(c));
  const today = todayDay();

  if (!classes.length) return <Empty>Chưa có lớp nào đang mở.</Empty>;

  const startHour = timed.length ? Math.min(7, ...timed.map(c => Math.floor(toMinutes(c.startTime) / 60))) : 7;
  const endHour = timed.length ? Math.max(21, ...timed.map(c => Math.ceil(toMinutes(c.endTime) / 60))) : 21;
  const hours = Array.from({ length: endHour - startHour }, (_, i) => startHour + i);
  const byDay = (day: number) => timed
    .filter(c => c.days.includes(day))
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const block = (c: ClassRoom) => (
    <>
      <b>{c.code}</b>
      <span>{c.startTime}–{c.endTime}</span>
      {teacherName(c.teacherId) && <span>{teacherName(c.teacherId)}</span>}
      {c.room && <span>Phòng {c.room}</span>}
    </>
  );

  return (
    <div className="timetable">
      {timed.length === 0 ? (
        <Empty>Các lớp chưa có thứ và giờ học. Vào tab <b>Lớp học</b> → Sửa lớp để chọn thứ học và giờ học.</Empty>
      ) : (
        <>
          {/* Máy tính: lưới tuần */}
          <div className="tt-grid" style={{ gridTemplateRows: `auto ${hours.length * HOUR_PX}px` }}>
            <div className="tt-corner" />
            {DAYS.map(d => (
              <div key={d.value} className={`tt-dayhead ${d.value === today ? 'tt-today' : ''}`}>
                {d.label}{d.value === today && <small> · hôm nay</small>}
              </div>
            ))}
            <div className="tt-hours">
              {hours.map(h => <div key={h} style={{ height: HOUR_PX }}>{String(h).padStart(2, '0')}:00</div>)}
            </div>
            {DAYS.map(d => (
              <div key={d.value} className={`tt-col ${d.value === today ? 'tt-today' : ''}`}>
                {hours.map(h => <div key={h} className="tt-line" style={{ top: (h - startHour) * HOUR_PX }} />)}
                {byDay(d.value).map(c => {
                  const top = ((toMinutes(c.startTime) - startHour * 60) / 60) * HOUR_PX;
                  const height = Math.max(28, ((toMinutes(c.endTime) - toMinutes(c.startTime)) / 60) * HOUR_PX - 2);
                  return (
                    <div key={c.id} className="tt-block" style={{ top, height }} title={`${c.code} · ${c.schedule}`}>
                      {block(c)}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Điện thoại: danh sách theo ngày */}
          <div className="tt-list">
            {DAYS.map(d => {
              const list = byDay(d.value);
              if (!list.length) return null;
              return (
                <div key={d.value} className={`tt-listday ${d.value === today ? 'tt-today' : ''}`}>
                  <h3>{d.label}{d.value === today && <small> · hôm nay</small>}</h3>
                  {list.map(c => <div key={c.id} className="tt-block tt-block-static">{block(c)}</div>)}
                </div>
              );
            })}
          </div>
        </>
      )}

      {untimed.length > 0 && timed.length > 0 && (
        <p className="muted small tt-untimed">
          Chưa có giờ học: {untimed.map(c => c.code).join(', ')}. Vào tab Lớp học để bổ sung.
        </p>
      )}
    </div>
  );
};
