import React, { useState } from 'react';
import { Award, X, Sparkles, CheckCircle2, ArrowRight, Building2, HelpCircle } from 'lucide-react';

interface ScholarshipEligibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyScholarship: (info: string) => void;
}

export const ScholarshipEligibilityModal: React.FC<ScholarshipEligibilityModalProps> = ({
  isOpen,
  onClose,
  onApplyScholarship,
}) => {
  const [gpa, setGpa] = useState<number>(7.8);
  const [topik, setTopik] = useState<string>('topik3');
  const [degree, setDegree] = useState<'bachelor' | 'master' | 'language'>('bachelor');
  const [major, setMajor] = useState<string>('business');

  if (!isOpen) return null;

  // Evaluate matching scholarships
  const getScholarshipMatches = () => {
    const list = [];

    if (gpa >= 8.0 && (topik === 'topik5' || topik === 'topik6')) {
      list.push({
        title: 'Học Bổng Toàn Phần SKY (SNU / Yonsei / Korea)',
        rate: '100% Học Phí 4 Năm',
        desc: 'Hồ sơ đạt chuẩn xét tuyển danh dự Merit Scholarship của trường Đại học Top 1 Hàn Quốc.',
      });
      list.push({
        title: 'Học Bổng Chính Phủ Toàn Phần GKS Hàn Quốc',
        rate: '100% Học Phí + 1.000.000 KRW/tháng',
        desc: 'Bao gồm vé máy bay khứ hồi, bảo hiểm y tế và tiền sinh hoạt phí hàng tháng.',
      });
    } else if (gpa >= 7.5 && (topik === 'topik4' || topik === 'topik5')) {
      list.push({
        title: 'Học Bổng Đại Học Chung-Ang & Hanyang',
        rate: '50% - 70% Học Phí',
        desc: 'Áp dụng cho học viên có TOPIK 4 trở lên khi nhập học các khối ngành Kinh tế và Kỹ thuật.',
      });
      list.push({
        title: 'Học Bổng Đại Học Konkuk & Sejong Global',
        rate: '50% - 80% Học Phí',
        desc: 'Miễn giảm trực tiếp vào học phí kỳ đầu tiên, duy trì theo điểm GPA mỗi kỳ.',
      });
    } else if (gpa >= 7.0 && (topik === 'topik3' || topik === 'topik4')) {
      list.push({
        title: 'Học Bổng Đại Học Sejong / ĐH Quốc Gia Pusan',
        rate: '30% - 50% Học Phí',
        desc: 'Chính sách ưu đãi mở rộng dành cho du học sinh Việt Nam có chứng chỉ TOPIK 3.',
      });
    } else {
      list.push({
        title: 'Học Bổng Khuyến Khích Chuyên Cần & Nhập Học',
        rate: '10% - 30% Học Phí',
        desc: 'Hỗ trợ sinh viên chăm chỉ có tỷ lệ chuyên cần trên 95% sau khóa tiếng Hàn.',
      });
    }

    if (degree === 'master') {
      list.push({
        title: 'Học Bổng Giáo Sư Nghiên Cứu Lab (GSRA)',
        rate: '100% Học Phí + Lương Lab 15-25 triệu/tháng',
        desc: 'Được Giáo sư Hàn Quốc bảo lãnh tài chính và trả lương hỗ trợ đề tài nghiên cứu.',
      });
    }

    return list;
  };

  const matches = getScholarshipMatches();

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-stone-900 to-stone-950 text-white rounded-t-3xl flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold font-heading">
                Tra Cứu Học Bổng Du Học Hàn Quốc 2026
              </h3>
              <p className="text-xs text-stone-400">Đánh giá khả năng đạt học bổng 30% - 100%</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1.5 rounded-lg hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          
          {/* GPA Slider */}
          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold uppercase tracking-wider text-stone-700">
                1. Điểm Trung Bình GPA Của Bạn:
              </span>
              <span className="text-sm font-extrabold text-red-600 bg-white px-2.5 py-0.5 rounded-lg border border-stone-200 shadow-2xs">
                {gpa.toFixed(1)} / 10.0
              </span>
            </div>
            <input
              type="range"
              min="6.0"
              max="9.5"
              step="0.1"
              value={gpa}
              onChange={(e) => setGpa(parseFloat(e.target.value))}
              className="w-full accent-red-600 cursor-pointer h-2 bg-stone-200 rounded-lg appearance-none"
            />
            <div className="flex justify-between text-[10px] text-stone-400">
              <span>6.0</span>
              <span>7.0</span>
              <span>8.0 (Trường SKY)</span>
              <span>9.0+ (GKS Toàn phần)</span>
            </div>
          </div>

          {/* TOPIK Level */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
              2. Trình Độ Tiếng Hàn Hiện Tại:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'zero', label: 'Chưa học' },
                { id: 'topik2', label: 'TOPIK 1-2' },
                { id: 'topik3', label: 'TOPIK 3' },
                { id: 'topik4', label: 'TOPIK 4' },
                { id: 'topik5', label: 'TOPIK 5-6' },
                { id: 'ielts', label: 'IELTS 6.0+' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTopik(t.id)}
                  className={`text-xs py-2 px-2 rounded-xl font-bold border transition-all ${
                    topik === t.id
                      ? 'bg-red-600 text-white border-red-600 shadow-xs'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Degree Target */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
              3. Bậc Học Đăng Ký:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'language', label: 'Du học Tiếng D4-1' },
                { id: 'bachelor', label: 'Cử nhân Đại học D2-2' },
                { id: 'master', label: 'Thạc sĩ / TS D2-3' },
              ].map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDegree(d.id as any)}
                  className={`text-xs py-2.5 px-2 rounded-xl font-bold border transition-all text-center ${
                    degree === d.id
                      ? 'bg-stone-900 text-white border-stone-900'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Scholarship Results */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Gói Học Bổng Phù Hợp Với Hồ Sơ Của Bạn ({matches.length}):</span>
            </h4>

            <div className="space-y-2.5">
              {matches.map((item, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-stone-900 text-sm">{item.title}</span>
                    <span className="text-xs font-extrabold text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-full whitespace-nowrap">
                      {item.rate}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Action CTA */}
          <div className="pt-2">
            <button
              onClick={() => {
                const info = `Tra cứu học bổng: GPA ${gpa}, Trình độ: ${topik}, Bậc học: ${degree}. Kết quả phù hợp: ${matches.map(m => m.title).join(', ')}`;
                onClose();
                onApplyScholarship(info);
              }}
              className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-md shadow-red-600/30 flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <span>Đăng Ký Săn Học Bổng & Hướng Dẫn Viết Bài Luận</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
