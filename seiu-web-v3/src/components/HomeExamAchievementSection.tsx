import React, { useCallback, useEffect, useState } from 'react';
import {
  ArrowUpRight,
  Award,
  BookOpenCheck,
  GraduationCap,
  Medal,
  RefreshCw,
  Trophy,
  Users,
} from 'lucide-react';
import {
  PublicLeaderboard,
  refreshPublicLeaderboard,
} from '../services/examResultService';

interface Props {
  onOpenStudyAbroad: () => void;
  onOpenTopikMaster: () => void;
}

const EMPTY: PublicLeaderboard = {
  totalAttempts: 0,
  uniqueStudents: 0,
  topScore: 0,
  updatedAt: '',
  entries: [],
};

const medalClass = (rank: number): string => {
  if (rank === 1) return 'bg-amber-400 text-slate-950';
  if (rank === 2) return 'bg-slate-300 text-slate-800';
  if (rank === 3) return 'bg-orange-200 text-orange-900';
  return 'bg-slate-100 text-slate-600';
};

export const HomeExamAchievementSection: React.FC<Props> = ({
  onOpenStudyAbroad,
  onOpenTopikMaster,
}) => {
  const [leaderboard, setLeaderboard] = useState<PublicLeaderboard>(EMPTY);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setLeaderboard(await refreshPublicLeaderboard());
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
    const handleUpdate = () => void load();
    window.addEventListener('seiu_exam_results_updated', handleUpdate);
    return () => window.removeEventListener('seiu_exam_results_updated', handleUpdate);
  }, [load]);

  return (
    <section id="exam-achievement" className="border-b border-slate-200 bg-white py-14 sm:py-18">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 xl:grid-cols-[0.7fr_1.3fr] xl:items-end">
          <div>
            <div className="k2-label"><Trophy className="h-4 w-4" /><span>TOPIK Practice Ranking</span></div>
            <h2 className="k1-display mt-4 text-3xl font-black leading-tight text-[#14213d] sm:text-4xl">
              Bảng thành tích thi thử TOPIK tại SEIU
            </h2>
            <p className="mt-4 max-w-xl text-sm font-medium leading-7 text-slate-600">
              Xếp hạng theo kết quả tốt nhất của mỗi học viên. Điểm mới được cập nhật tự động sau khi nộp bài.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:p-5">
              <Award className="h-5 w-5 text-[#e23b43]" />
              <strong className="mt-3 block text-2xl font-black text-[#14213d] sm:text-3xl">{leaderboard.totalAttempts}</strong>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 sm:text-xs">Lượt thi</span>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:p-5">
              <Users className="h-5 w-5 text-[#153a70]" />
              <strong className="mt-3 block text-2xl font-black text-[#14213d] sm:text-3xl">{leaderboard.uniqueStudents}</strong>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 sm:text-xs">Học viên</span>
            </div>
            <div className="rounded-2xl bg-[#153a70] p-3 text-white sm:p-5">
              <Medal className="h-5 w-5 text-amber-300" />
              <strong className="mt-3 block text-2xl font-black text-amber-300 sm:text-3xl">{leaderboard.topScore || 0}%</strong>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-100 sm:text-xs">Điểm cao nhất</span>
            </div>
          </div>
        </div>

        <div className="mt-8 overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_24px_60px_-45px_rgba(15,39,75,.45)]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-[#f4f8ff] px-5 py-4">
            <div className="flex items-center gap-2 text-sm font-black text-[#153a70]">
              <Trophy className="h-5 w-5 text-[#e23b43]" /> TOP 15 HỌC VIÊN
            </div>
            <button
              type="button"
              onClick={() => void load()}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-600 hover:border-[#153a70] hover:text-[#153a70] disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Cập nhật
            </button>
          </div>

          {leaderboard.entries.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <p className="text-sm font-bold text-slate-600">Chưa có kết quả thi để xếp hạng.</p>
              <button onClick={onOpenTopikMaster} className="mt-4 rounded-full bg-[#e23b43] px-5 py-2.5 text-xs font-black text-white hover:bg-[#c52833]">
                Làm bài thi thử đầu tiên
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead className="bg-white text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                  <tr>
                    <th className="w-20 px-5 py-3 text-center">Hạng</th>
                    <th className="px-4 py-3 text-left">Học viên</th>
                    <th className="px-4 py-3 text-left">Bài thi tốt nhất</th>
                    <th className="px-4 py-3 text-center">Điểm</th>
                    <th className="px-5 py-3 text-right">Ngày thi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {leaderboard.entries.map((entry) => (
                    <tr key={entry.id} className={entry.rank <= 3 ? 'bg-amber-50/45' : 'hover:bg-slate-50'}>
                      <td className="px-5 py-3 text-center">
                        <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-black ${medalClass(entry.rank)}`}>{entry.rank}</span>
                      </td>
                      <td className="px-4 py-3 font-black text-[#14213d]">{entry.studentName}</td>
                      <td className="max-w-[360px] px-4 py-3 text-xs font-medium text-slate-600">{entry.testTitle}</td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <strong className="text-base text-[#e23b43]">{entry.percent}%</strong>
                        <span className="ml-1.5 text-[11px] text-slate-400">{entry.score}/{entry.maxScore}</span>
                      </td>
                      <td className="px-5 py-3 text-right text-xs text-slate-500 whitespace-nowrap">
                        {entry.createdAt ? new Date(entry.createdAt).toLocaleDateString('vi-VN') : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-7 grid gap-4 md:grid-cols-2">
          <button
            type="button"
            onClick={onOpenStudyAbroad}
            data-motion-card
            className="group flex min-h-[190px] items-end justify-between overflow-hidden rounded-[26px] bg-[#153a70] p-6 text-left text-white sm:p-8"
          >
            <span>
              <GraduationCap className="h-8 w-8 text-blue-200" />
              <span className="mt-7 block text-[10px] font-black uppercase tracking-[0.18em] text-blue-200">Study in Korea</span>
              <strong className="mt-2 block text-2xl font-black">Đăng ký du học SEIU</strong>
              <span className="mt-2 block text-sm text-blue-100">Chọn khu vực, trường và xem dự toán chi phí.</span>
            </span>
            <ArrowUpRight className="h-7 w-7 shrink-0 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
          </button>

          <button
            type="button"
            onClick={onOpenTopikMaster}
            data-motion-card
            className="group flex min-h-[190px] items-end justify-between overflow-hidden rounded-[26px] bg-[#e23b43] p-6 text-left text-white sm:p-8"
          >
            <span>
              <BookOpenCheck className="h-8 w-8 text-red-100" />
              <span className="mt-7 block text-[10px] font-black uppercase tracking-[0.18em] text-red-100">TOPIK Master</span>
              <strong className="mt-2 block text-2xl font-black">Ôn thi TOPIK miễn phí</strong>
              <span className="mt-2 block text-sm text-red-50">Làm đề Nghe – Đọc, chấm điểm và lưu thành tích.</span>
            </span>
            <ArrowUpRight className="h-7 w-7 shrink-0 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </section>
  );
};

