import { useCallback, useEffect, useState } from 'react';
import { api } from '../api';
import type { ClassRow, Role, StudentRow, Teacher } from '../types';
import { ClassesTab } from './ClassesTab';
import { DashboardTab } from './DashboardTab';
import { StudentsTab } from './StudentsTab';
import { AccountsTab } from './TeachersTab';
import { Timetable } from './Timetable';
import { ErrorBox } from './ui';

export interface AdminData {
  students: StudentRow[];
  classes: ClassRow[];
  teachers: Teacher[];
}

// Những gì mỗi vai trò được làm trên giao diện (máy chủ cũng kiểm tra lại).
export interface Perms {
  fees: boolean;
  editStudents: boolean;
  editClasses: boolean;
  editAttendance: boolean;
  accounts: boolean;
}

export const permsFor = (role: Role): Perms => ({
  fees: role === 'admin' || role === 'accountant',
  editStudents: role === 'admin' || role === 'staff',
  editClasses: role === 'admin' || role === 'staff',
  editAttendance: role === 'admin',
  accounts: role === 'admin',
});

export interface AdminTabProps {
  data: AdminData;
  reload: () => Promise<void>;
  perms: Perms;
}

const ALL_TABS = [
  { id: 'dashboard', label: 'Tổng quan' },
  { id: 'students', label: 'Học viên' },
  { id: 'classes', label: 'Lớp học' },
  { id: 'timetable', label: 'Thời khóa biểu' },
  { id: 'accounts', label: 'Tài khoản' },
] as const;
type TabId = (typeof ALL_TABS)[number]['id'];

const TABS_BY_ROLE: Record<Exclude<Role, 'teacher'>, TabId[]> = {
  admin: ['dashboard', 'students', 'classes', 'timetable', 'accounts'],
  staff: ['dashboard', 'students', 'classes', 'timetable'],
  accountant: ['dashboard', 'students'],
};

export const AdminApp = ({ role }: { role: Exclude<Role, 'teacher'> }) => {
  const perms = permsFor(role);
  const TABS = ALL_TABS
    .filter(t => TABS_BY_ROLE[role].includes(t.id))
    .map(t => (role === 'accountant' && t.id === 'students' ? { ...t, label: 'Học phí học viên' } : t));
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
    accounts: data?.teachers.filter(t => t.active).length,
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
        <DashboardTab data={data} perms={perms} goTo={t => TABS.some(x => x.id === t) && setTab(t)} />
      ) : tab === 'students' ? (
        <StudentsTab data={data} reload={reload} perms={perms} />
      ) : tab === 'classes' ? (
        <ClassesTab data={data} reload={reload} perms={perms} />
      ) : tab === 'timetable' ? (
        <Timetable classes={data.classes.filter(c => c.status === 'dang_mo')} teachers={data.teachers} />
      ) : (
        <AccountsTab data={data} reload={reload} />
      )}
    </>
  );
};
