import { useCallback, useEffect, useState } from 'react';
import { api } from '../api';
import type { ClassRow, StudentRow, Teacher } from '../types';
import { ClassesTab } from './ClassesTab';
import { DashboardTab } from './DashboardTab';
import { StudentsTab } from './StudentsTab';
import { TeachersTab } from './TeachersTab';
import { Timetable } from './Timetable';
import { ErrorBox } from './ui';

export interface AdminData {
  students: StudentRow[];
  classes: ClassRow[];
  teachers: Teacher[];
}

export interface AdminTabProps {
  data: AdminData;
  reload: () => Promise<void>;
}

const TABS = [
  { id: 'dashboard', label: 'Tổng quan' },
  { id: 'students', label: 'Học viên' },
  { id: 'classes', label: 'Lớp học' },
  { id: 'timetable', label: 'Thời khóa biểu' },
  { id: 'teachers', label: 'Giáo viên' },
] as const;
type TabId = (typeof TABS)[number]['id'];

export const AdminApp = () => {
  const [tab, setTab] = useState<TabId>('dashboard');
  const [data, setData] = useState<AdminData | null>(null);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    try {
      setData(await api<AdminData>('GET', 'overview'));
      setError('');
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const counts: Partial<Record<TabId, number>> = {
    students: data?.students.filter(s => s.status === 'dang_hoc').length,
    classes: data?.classes.filter(c => c.status === 'dang_mo').length,
    teachers: data?.teachers.filter(t => t.active).length,
  };

  return (
    <>
      <nav className="tabs" role="tablist">
        {TABS.map(t => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={`tab ${tab === t.id ? 'tab-active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
            {counts[t.id] !== undefined && <span className="tab-count">{counts[t.id]}</span>}
          </button>
        ))}
      </nav>
      <ErrorBox message={error} />
      {!data ? (
        <div className="muted center-pad">Đang tải dữ liệu…</div>
      ) : tab === 'dashboard' ? (
        <DashboardTab data={data} goTo={setTab} />
      ) : tab === 'students' ? (
        <StudentsTab data={data} reload={reload} />
      ) : tab === 'classes' ? (
        <ClassesTab data={data} reload={reload} />
      ) : tab === 'timetable' ? (
        <Timetable classes={data.classes.filter(c => c.status === 'dang_mo')} teachers={data.teachers} />
      ) : (
        <TeachersTab data={data} reload={reload} />
      )}
    </>
  );
};
