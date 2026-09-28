import { useCallback, useEffect, useState } from 'react';
import { api } from '../api';
import type { ClassRoom, Student, Teacher } from '../types';
import { ClassesTab } from './ClassesTab';
import { StudentsTab } from './StudentsTab';
import { TeachersTab } from './TeachersTab';
import { ErrorBox } from './ui';

export interface AdminData {
  students: Student[];
  classes: ClassRoom[];
  teachers: Teacher[];
}

export interface AdminTabProps {
  data: AdminData;
  reload: () => Promise<void>;
}

const TABS = [
  { id: 'students', label: 'Học viên' },
  { id: 'classes', label: 'Lớp học' },
  { id: 'teachers', label: 'Giáo viên' },
] as const;
type TabId = (typeof TABS)[number]['id'];

export const AdminApp = () => {
  const [tab, setTab] = useState<TabId>('students');
  const [data, setData] = useState<AdminData | null>(null);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    try {
      const [students, classes, teachers] = await Promise.all([
        api<{ items: Student[] }>('GET', 'students'),
        api<{ items: ClassRoom[] }>('GET', 'classes'),
        api<{ items: Teacher[] }>('GET', 'teachers'),
      ]);
      setData({ students: students.items, classes: classes.items, teachers: teachers.items });
      setError('');
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const counts: Record<TabId, number | undefined> = {
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
      ) : tab === 'students' ? (
        <StudentsTab data={data} reload={reload} />
      ) : tab === 'classes' ? (
        <ClassesTab data={data} reload={reload} />
      ) : (
        <TeachersTab data={data} reload={reload} />
      )}
    </>
  );
};
