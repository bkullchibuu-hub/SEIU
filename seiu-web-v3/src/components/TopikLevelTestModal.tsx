import React, { useEffect, useRef, useState } from 'react';
import { QUIZ_QUESTIONS } from '../data/mockData';
import { QuizQuestion } from '../types';
import confetti from 'canvas-confetti';
import { 
  Sparkles, 
  X, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  RotateCcw, 
  Award, 
  BookOpen, 
  GraduationCap, 
  Gift,
  HelpCircle
} from 'lucide-react';
import {
  getStudentIdentity,
  saveStudentIdentity,
  StudentIdentity,
  submitExamResult,
} from '../services/examResultService';

interface TopikLevelTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClaimVoucher: (resultSummary: string) => void;
}

export const TopikLevelTestModal: React.FC<TopikLevelTestModalProps> = ({
  isOpen,
  onClose,
  onClaimVoucher,
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [student, setStudent] = useState<StudentIdentity | null>(getStudentIdentity());
  const [studentName, setStudentName] = useState(() => getStudentIdentity()?.name || '');
  const [studentPhone, setStudentPhone] = useState(() => getStudentIdentity()?.phone || '');
  const [studentGoal, setStudentGoal] = useState(() => getStudentIdentity()?.goal || 'hoc-tieng-han');
  const [resultReportState, setResultReportState] = useState<'idle' | 'sending' | 'saved' | 'pending'>('idle');
  const quizStartedAtRef = useRef(Date.now());
  const resultSubmittedRef = useRef(false);

  useEffect(() => {
    if (!isOpen) return;
    quizStartedAtRef.current = Date.now();
    resultSubmittedRef.current = false;
    setResultReportState('idle');
  }, [isOpen]);

  if (!isOpen) return null;

  const currentQ: QuizQuestion = QUIZ_QUESTIONS[currentIdx];

  const handleSelectOption = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);

    const isCorrect = index === currentQ.correctIndex;
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentIdx < QUIZ_QUESTIONS.length - 1) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setShowResult(true);
      if (student && !resultSubmittedRef.current) {
        resultSubmittedRef.current = true;
        setResultReportState('sending');
        void submitExamResult(student, {
          testId: 'korean-level-test',
          testTitle: 'Kiểm tra trình độ tiếng Hàn Online',
          testKind: 'level-test',
          correct: score,
          total: QUIZ_QUESTIONS.length,
          score,
          maxScore: QUIZ_QUESTIONS.length,
          durationSec: Math.max(1, Math.round((Date.now() - quizStartedAtRef.current) / 1000)),
        }).then(saved => setResultReportState(saved ? 'saved' : 'pending'));
      }
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // Safe fallback
      }
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setShowResult(false);
    setResultReportState('idle');
    resultSubmittedRef.current = false;
    quizStartedAtRef.current = Date.now();
  };

  const handleStudentGate = (event: React.FormEvent) => {
    event.preventDefault();
    const name = studentName.trim();
    const phone = studentPhone.replace(/[^0-9+]/g, '');
    if (name.length < 2 || phone.replace(/\D/g, '').length < 8) return;
    const identity = { name, phone, goal: studentGoal };
    saveStudentIdentity(identity);
    setStudent(identity);
    quizStartedAtRef.current = Date.now();
  };

  // Determine Level from score
  const getLevelAssessment = (s: number) => {
    if (s <= 3) {
      return {
        level: 'Nhập môn / Sơ cấp 1 (TOPIK 1 Level 1)',
        badge: 'Cần củng cố nền tảng',
        desc: 'Bạn đã có cảm nhận ban đầu về tiếng Hàn nhưng cần hệ thống lại bảng chữ cái Hangeul, các quy tắc ghép patchim và tiểu từ cơ bản.',
        recommendedCourse: 'Khóa Tiếng Hàn Sơ Cấp 1 (Nhập Môn)',
      };
    } else if (s <= 6) {
      return {
        level: 'Sơ cấp 2 (TOPIK 1 Level 2)',
        badge: 'Nền tảng tốt',
        desc: 'Bạn nắm vững ngữ pháp đời sống, có thể giao tiếp cơ bản khi đi mua sắm, du lịch. Đủ điều kiện học lên để chuẩn bị du học Visa D4-1.',
        recommendedCourse: 'Khóa Tiếng Hàn Sơ Cấp 2 hoặc Cấp Tốc Du Học D4-1',
      };
    } else if (s <= 8) {
      return {
        level: 'Trung cấp (TOPIK II Cấp 3 - 4)',
        badge: 'Trình độ xuất sắc',
        desc: 'Khả năng ngữ pháp và vốn từ vựng của bạn rất vững! Đủ điều kiện săn học bổng 30% - 70% chuyên ngành Đại học Hàn Quốc (Visa D2).',
        recommendedCourse: 'Khóa Luyện Thi TOPIK II Chuyên Sâu (Cấp 3-4)',
      };
    } else {
      return {
        level: 'Cao cấp (TOPIK II Cấp 5 - 6)',
        badge: 'Bậc thầy tiếng Hàn',
        desc: 'Tuyệt vời! Trình độ tiếng Hàn của bạn ngang tầm biên phiên dịch viên. Hoàn toàn đủ tiêu chuẩn săn học bổng Chính phủ GKS toàn phần 100%.',
        recommendedCourse: 'Khóa Luyện Thi TOPIK Cao Cấp 5-6 & Kỹ năng Viết Luận',
      };
    }
  };

  const assessment = getLevelAssessment(score);

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[95vh] overflow-y-auto shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-stone-900 text-white rounded-t-3xl flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold font-heading">
                Kiểm Tra Trình Độ Tiếng Hàn Online
              </h3>
              <p className="text-xs text-stone-400">10 câu trắc nghiệm chuẩn form TOPIK</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1.5 rounded-lg hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!student ? (
          <form onSubmit={handleStudentGate} className="p-6 sm:p-8 space-y-5">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-red-600">Thông tin người làm bài</p>
              <h3 className="mt-1 text-xl font-black text-stone-900">Nhập thông tin để lưu kết quả</h3>
              <p className="mt-1 text-xs text-stone-500">Kết quả sẽ tự động gửi về bảng thành tích của quản trị viên sau khi hoàn thành.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-xs font-bold text-stone-700">Họ và tên
                <input value={studentName} onChange={event => setStudentName(event.target.value)} required minLength={2} className="mt-1 w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-3 font-medium outline-none focus:border-red-500" placeholder="Nguyễn Văn A" />
              </label>
              <label className="text-xs font-bold text-stone-700">Số điện thoại
                <input value={studentPhone} onChange={event => setStudentPhone(event.target.value)} required minLength={8} inputMode="tel" className="mt-1 w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-3 font-medium outline-none focus:border-red-500" placeholder="09xx xxx xxx" />
              </label>
            </div>
            <label className="block text-xs font-bold text-stone-700">Mục tiêu
              <select value={studentGoal} onChange={event => setStudentGoal(event.target.value)} className="mt-1 w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-3 font-medium outline-none focus:border-red-500">
                <option value="hoc-tieng-han">Học tiếng Hàn</option>
                <option value="topik">Thi TOPIK</option>
                <option value="du-hoc">Du học Hàn Quốc</option>
                <option value="phong-van">Phỏng vấn visa</option>
              </select>
            </label>
            <button type="submit" className="w-full rounded-xl bg-red-600 py-3.5 text-sm font-black text-white shadow-md hover:bg-red-700">Bắt đầu kiểm tra</button>
          </form>
        ) : !showResult ? (
          /* Quiz Active Content */
          <div className="p-6 space-y-6">
            
            {/* Progress & Tag */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-stone-500">
                <span>Câu hỏi {currentIdx + 1} / {QUIZ_QUESTIONS.length}</span>
                <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded font-bold">
                  {currentQ.levelTag}
                </span>
              </div>
              
              {/* Progress bar */}
              <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-red-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentIdx + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Question Box */}
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 space-y-2">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">
                {currentQ.questionVi}
              </span>
              <div className="text-xl sm:text-2xl font-bold text-stone-900 font-sans tracking-wide py-1">
                {currentQ.koreanText}
              </div>
            </div>

            {/* Options */}
            <div className="space-y-2.5">
              {currentQ.options.map((option, idx) => {
                let btnStyle = 'bg-white border-stone-200 text-stone-800 hover:border-red-300 hover:bg-red-50/30';
                
                if (isAnswered) {
                  if (idx === currentQ.correctIndex) {
                    btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold';
                  } else if (idx === selectedOption) {
                    btnStyle = 'bg-rose-50 border-rose-500 text-rose-800';
                  } else {
                    btnStyle = 'bg-stone-50 border-stone-200 text-stone-400 opacity-60';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnswered}
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full p-4 rounded-xl border text-left text-sm font-semibold transition-all flex items-center justify-between ${btnStyle}`}
                  >
                    <span>{option}</span>
                    {isAnswered && idx === currentQ.correctIndex && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    )}
                    {isAnswered && idx === selectedOption && idx !== currentQ.correctIndex && (
                      <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation box after answered */}
            {isAnswered && (
              <div className="bg-stone-100 p-4 rounded-xl border border-stone-200 text-xs text-stone-700 space-y-1 animate-in fade-in duration-150">
                <div className="font-bold flex items-center gap-1.5 text-stone-900">
                  <HelpCircle className="w-4 h-4 text-red-600" />
                  <span>Giải thích chi tiết:</span>
                </div>
                <p>{currentQ.explanation}</p>
              </div>
            )}

            {/* Next Button */}
            {isAnswered && (
              <button
                onClick={handleNextQuestion}
                className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-md shadow-red-600/30 flex items-center justify-center gap-2 transition-all active:scale-98"
              >
                <span>{currentIdx < QUIZ_QUESTIONS.length - 1 ? 'Câu Tiếp Theo' : 'Xem Kết Quả & Nhận Học Bổng'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

          </div>
        ) : (
          /* Result Assessment Content */
          <div className="p-6 sm:p-8 space-y-6 text-center">
            
            <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Award className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-red-600 bg-red-50 px-3 py-1 rounded-full">
                {assessment.badge}
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-heading mt-2">
                Điểm Số: {score} / 10
              </h3>
              <div className="text-base font-bold text-stone-800 mt-1">
                {assessment.level}
              </div>
            </div>

            <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
              {assessment.desc}
            </p>

            {resultReportState !== 'idle' && (
              <div className={`rounded-xl border px-4 py-3 text-xs font-bold ${resultReportState === 'saved' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>
                {resultReportState === 'sending' && 'Đang gửi kết quả về bảng thành tích…'}
                {resultReportState === 'saved' && 'Kết quả đã được lưu vào bảng thành tích.'}
                {resultReportState === 'pending' && 'Kết quả đã lưu trên thiết bị và sẽ tự gửi lại khi có mạng.'}
              </div>
            )}

            {/* Voucher Card */}
            <div className="bg-radial from-red-900 to-stone-900 text-white rounded-2xl p-5 text-left border border-red-800/50 shadow-lg relative overflow-hidden">
              <div className="flex items-center gap-2 text-red-400 text-xs font-bold uppercase tracking-wide mb-1">
                <Gift className="w-4 h-4" />
                <span>Quà Tặng Dành Riêng Cho Bạn</span>
              </div>
              <div className="text-lg font-bold text-white">
                Voucher Giảm 500.000đ Học Phí
              </div>
              <div className="text-xs text-stone-300 mt-0.5">
                Áp dụng cho khóa học: <strong className="text-white">{assessment.recommendedCourse}</strong>
              </div>

              <div className="mt-3 inline-block bg-white/15 border border-white/20 px-3 py-1 rounded-lg text-xs font-mono font-bold tracking-wider text-amber-300">
                MÃ: SEIU2026-TOPIK
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  const summary = `Kết quả thi thử: ${score}/10 điểm (${assessment.level}). Nhận voucher 500k cho khóa ${assessment.recommendedCourse}`;
                  onClose();
                  onClaimVoucher(summary);
                }}
                className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-md shadow-red-600/30 flex items-center justify-center gap-2 transition-all"
              >
                <span>Nhận Tư Vấn Lộ Trình & Áp Dụng Mã Giảm Giá</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleRestart}
                className="w-full py-2.5 rounded-xl text-stone-600 hover:text-stone-900 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Làm lại bài kiểm tra</span>
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
