import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  Volume2, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Sparkles, 
  Search, 
  Copy, 
  Check, 
  Layers, 
  Grid, 
  ArrowLeft, 
  ArrowRight,
  BookOpen,
  Award,
  ListFilter
} from 'lucide-react';
import { VocabWord, TOPIK_VOCAB_SET_1 } from '../data/topikVocabSet1';
import { TOPIK_VOCAB_SET_2 } from '../data/topikVocabSet2';
import { TOPIK_VOCAB_SET_3 } from '../data/topikVocabSet3';
import { getStudentIdentity, submitExamResult } from '../services/examResultService';

interface Props {
  initialSetId?: 1 | 2 | 3;
  onBackToMaster?: () => void;
  speakText: (text: string, onEnd?: () => void) => void;
}

interface QuestionItem {
  k: string;
  v: string;
  c: string;
  opts: string[];
}

interface WrongItem {
  k: string;
  v: string;
  c: string;
  your: string | null;
}

export const TopikVocabQuizModule: React.FC<Props> = ({
  initialSetId = 1,
  onBackToMaster,
  speakText
}) => {
  const [activeSetTab, setActiveSetTab] = useState<1 | 2 | 3>(initialSetId);
  const [viewMode, setViewMode] = useState<'quiz' | 'list'>('quiz');
  
  // Active Word Pool
  const currentPool: VocabWord[] = useMemo(() => {
    if (activeSetTab === 1) return TOPIK_VOCAB_SET_1;
    if (activeSetTab === 2) return TOPIK_VOCAB_SET_2;
    return TOPIK_VOCAB_SET_3;
  }, [activeSetTab]);

  // Quiz State
  const [quizState, setQuizState] = useState<'start' | 'running' | 'result'>('start');
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [userAnswers, setUserAnswers] = useState<(string | null)[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isGridOpen, setIsGridOpen] = useState<boolean>(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [wrongList, setWrongList] = useState<WrongItem[]>([]);
  const [copiedSuccess, setCopiedSuccess] = useState<boolean>(false);
  const [resultReportState, setResultReportState] = useState<'idle' | 'sending' | 'saved' | 'pending'>('idle');
  const quizStartedAtRef = useRef(Date.now());

  // Search in Word List mode
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const categories = useMemo(() => {
    const set = new Set<string>();
    currentPool.forEach(w => {
      if (w.c) set.add(w.c);
    });
    return ['all', ...Array.from(set)];
  }, [currentPool]);

  // Helper shuffle
  const shuffleArray = useCallback(<T,>(arr: T[]): T[] => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }, []);

  // Build 6-option questions
  const buildQuestions = useCallback((pool: VocabWord[]) => {
    const shuffledPool = shuffleArray(pool);
    return shuffledPool.map(w => {
      const otherWords = pool.filter(o => o.v !== w.v);
      const shuffledOthers = shuffleArray(otherWords);
      const distractors: string[] = [];
      const seen = new Set<string>();
      seen.add(w.v);

      for (let i = 0; i < shuffledOthers.length && distractors.length < 5; i++) {
        const val = shuffledOthers[i].v;
        if (!seen.has(val)) {
          seen.add(val);
          distractors.push(val);
        }
      }

      const opts = shuffleArray([...distractors, w.v]);
      return {
        k: w.k,
        v: w.v,
        c: w.c,
        opts
      };
    });
  }, [shuffleArray]);

  // Start Quiz
  const handleStartQuiz = useCallback((poolToUse?: VocabWord[]) => {
    const pool = poolToUse || currentPool;
    const qs = buildQuestions(pool);
    setQuestions(qs);
    setUserAnswers(new Array(qs.length).fill(null));
    setCurrentIndex(0);
    setQuizState('running');
    setResultReportState('idle');
    quizStartedAtRef.current = Date.now();
    setIsGridOpen(false);
    setIsConfirmModalOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPool, buildQuestions]);

  // Switch Set Tab
  const handleSwitchSet = (setId: 1 | 2 | 3) => {
    setActiveSetTab(setId);
    setQuizState('start');
    setCurrentIndex(0);
    setSearchTerm('');
    setCategoryFilter('all');
  };

  // Keyboard Shortcuts (1-6, arrows)
  useEffect(() => {
    if (quizState !== 'running' || isConfirmModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentIndex(prev => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1));
      } else {
        const num = parseInt(e.key, 10);
        if (num >= 1 && num <= 6 && questions[currentIndex]) {
          const currentQ = questions[currentIndex];
          if (currentQ.opts[num - 1]) {
            handleChooseOption(currentQ.opts[num - 1]);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [quizState, isConfirmModalOpen, questions, currentIndex]);

  // Choose an option
  const handleChooseOption = (optValue: string) => {
    const updated = [...userAnswers];
    updated[currentIndex] = optValue;
    setUserAnswers(updated);

    // Auto advance after slight delay
    if (currentIndex < questions.length - 1) {
      setTimeout(() => {
        setCurrentIndex(prev => {
          if (prev === currentIndex && prev < questions.length - 1) {
            return prev + 1;
          }
          return prev;
        });
      }, 180);
    }
  };

  // Clear answer
  const handleClearAnswer = () => {
    const updated = [...userAnswers];
    updated[currentIndex] = null;
    setUserAnswers(updated);
  };

  // Jump to first unanswered
  const handleGotoFirstBlank = () => {
    for (let s = 1; s <= questions.length; s++) {
      const idx = (currentIndex + s) % questions.length;
      if (userAnswers[idx] === null) {
        setCurrentIndex(idx);
        return;
      }
    }
  };

  // Submit and compute results
  const handleFinishQuiz = () => {
    setIsConfirmModalOpen(false);
    let rightCount = 0;
    const wrongs: WrongItem[] = [];

    questions.forEach((q, idx) => {
      const ans = userAnswers[idx];
      if (ans === q.v) {
        rightCount++;
      } else {
        wrongs.push({
          k: q.k,
          v: q.v,
          c: q.c,
          your: ans
        });
      }
    });

    setWrongList(wrongs);
    setQuizState('result');
    const student = getStudentIdentity();
    if (student) {
      setResultReportState('sending');
      void submitExamResult(student, {
        testId: `topik-vocab-${activeSetTab}`,
        testTitle: `Kiểm tra Từ vựng TOPIK — Bộ ${activeSetTab}`,
        testKind: 'topik-vocabulary',
        correct: rightCount,
        total: questions.length,
        score: rightCount,
        maxScore: questions.length,
        durationSec: Math.max(1, Math.round((Date.now() - quizStartedAtRef.current) / 1000)),
      }).then(saved => setResultReportState(saved ? 'saved' : 'pending'));
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopyWrongWords = () => {
    if (wrongList.length === 0) return;
    const text = wrongList.map(w => `${w.k} : ${w.v}`).join('\n');
    navigator.clipboard.writeText(text).then(() => {
      setCopiedSuccess(true);
      setTimeout(() => setCopiedSuccess(false), 2500);
    });
  };

  const answeredCount = userAnswers.filter(a => a !== null).length;
  const blankCount = questions.length - answeredCount;
  const currentQ = questions[currentIndex];

  const filteredWordsList = useMemo(() => {
    return currentPool.filter(w => {
      const matchSearch = searchTerm === '' || 
        w.k.toLowerCase().includes(searchTerm.toLowerCase()) || 
        w.v.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = categoryFilter === 'all' || w.c === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [currentPool, searchTerm, categoryFilter]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Navigation & Sub-page Tabs */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 font-bold text-[10px] uppercase tracking-wider">
              Hệ Thống Trắc Nghiệm 6 Đáp Án
            </span>
            <span className="text-stone-400 text-xs">· Bộ từ vựng TOPIK Master</span>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-stone-900 tracking-tight">
            Luyện Từ Vựng Tiếng Hàn 🇰🇷 → 🇻🇳
          </h2>
        </div>

        {/* 3 Dedicated Sub-Page Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-2xl w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => handleSwitchSet(1)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeSetTab === 1
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Trang 1: Từ Vựng 1 ({TOPIK_VOCAB_SET_1.length} từ)
          </button>
          <button
            onClick={() => handleSwitchSet(2)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeSetTab === 2
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Trang 2: Từ Vựng 2 ({TOPIK_VOCAB_SET_2.length} từ)
          </button>
          <button
            onClick={() => handleSwitchSet(3)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeSetTab === 3
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Trang 3: Từ Vựng 3 ({TOPIK_VOCAB_SET_3.length} từ)
          </button>
        </div>
      </div>

      {/* View Mode Selector: Quiz vs Table */}
      <div className="flex items-center justify-between border-b border-stone-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('quiz')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'quiz'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Phòng Thi Trắc Nghiệm 6 Lựa Chọn</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'list'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Bảng Tra Cứu Toàn Bộ ({currentPool.length} từ)</span>
          </button>
        </div>

        {onBackToMaster && (
          <button
            onClick={onBackToMaster}
            className="text-xs text-stone-500 hover:text-red-600 font-bold flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Về TOPIK Master</span>
          </button>
        )}
      </div>

      {/* VIEW 1: QUIZ MODE */}
      {viewMode === 'quiz' && (
        <div>
          {/* STATE 1: START SCREEN */}
          {quizState === 'start' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 mx-auto flex items-center justify-center border border-red-200">
                <Sparkles className="w-8 h-8" />
              </div>

              <div className="max-w-md mx-auto space-y-2">
                <h3 className="text-xl sm:text-2xl font-black text-stone-900">
                  Trắc Nghiệm Từ Vựng Tiếng Hàn 🇰🇷 → 🇻🇳
                </h3>
                <p className="text-xs text-stone-500">
                  Nhìn từ tiếng Hàn hiển thị trên màn hình, chọn nghĩa tiếng Việt chính xác nhất trong 6 đáp án.
                </p>
              </div>

              {/* Stats Box */}
              <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto">
                <div className="p-3 bg-red-50/70 border border-red-200 rounded-2xl">
                  <span className="block text-xl font-black text-red-700">{currentPool.length}</span>
                  <span className="text-[11px] text-stone-500 font-semibold">Tổng số từ</span>
                </div>
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-2xl">
                  <span className="block text-xl font-black text-blue-700">6</span>
                  <span className="text-[11px] text-stone-500 font-semibold">Đáp án / câu</span>
                </div>
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl">
                  <span className="block text-xl font-black text-emerald-700">1</span>
                  <span className="text-[11px] text-stone-500 font-semibold">Lựa chọn duy nhất</span>
                </div>
              </div>

              {/* Rules */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-left max-w-lg mx-auto text-xs text-stone-600 space-y-2">
                <p className="font-bold text-stone-900">Quy cách làm bài:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Thứ tự câu hỏi và thứ tự 6 đáp án được <b>trộn ngẫu nhiên</b> mỗi lần mở.</li>
                  <li>Không báo đúng/sai ngay lập tức — <b>chỉ chấm điểm & tổng kết ở cuối bài</b>.</li>
                  <li>Có thể bấm phím tắt <b>1, 2, 3, 4, 5, 6</b> hoặc phím mũi tên <b>← / →</b> để thao tác nhanh.</li>
                  <li>Cuối bài có <b>bảng tổng kết từ sai</b> và nút <b>Ôn lại các từ sai</b>.</li>
                </ul>
              </div>

              <button
                onClick={() => handleStartQuiz()}
                className="px-8 py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-sm shadow-md hover:shadow-lg transition-all"
              >
                Bắt Đầu Làm Bài Trắc Nghiệm
              </button>
            </div>
          )}

          {/* STATE 2: RUNNING QUIZ */}
          {quizState === 'running' && currentQ && (
            <div className="bg-white rounded-3xl p-5 sm:p-7 border border-stone-200 shadow-sm space-y-5">
              {/* Topbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-100">
                <div className="text-xs font-bold text-stone-900 flex items-center gap-2">
                  <span>Câu <span className="text-red-600 font-extrabold text-sm">{currentIndex + 1}</span> / {questions.length}</span>
                  <span className="text-stone-400 font-normal">· Đã làm: {answeredCount} / {questions.length}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsGridOpen(!isGridOpen)}
                    className="px-3 py-1.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-bold flex items-center gap-1.5"
                  >
                    <Grid className="w-3.5 h-3.5" />
                    <span>Danh Sách Câu</span>
                  </button>
                  <button
                    onClick={() => setIsConfirmModalOpen(true)}
                    className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black shadow-xs"
                  >
                    Nộp Bài
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-red-600 h-full transition-all duration-200"
                  style={{ width: `${(answeredCount / questions.length) * 100}%` }}
                />
              </div>

              {/* Korean Word Box */}
              <div className="p-8 bg-gradient-to-b from-stone-50 to-red-50/30 rounded-3xl border border-stone-200 text-center space-y-2 relative group">
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                  Từ Tiếng Hàn
                </span>
                <div className="flex items-center justify-center gap-3">
                  <h3 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-wide font-sans">
                    {currentQ.k}
                  </h3>
                  <button
                    onClick={() => speakText(currentQ.k)}
                    className="p-2 rounded-full bg-white hover:bg-red-50 text-red-600 border border-stone-200 shadow-xs transition-transform active:scale-95"
                    title="Nghe phát âm chuẩn"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 6 Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {currentQ.opts.map((opt, i) => {
                  const isSelected = userAnswers[currentIndex] === opt;
                  return (
                    <button
                      key={i}
                      onClick={() => handleChooseOption(opt)}
                      className={`p-3.5 rounded-2xl text-left font-medium text-xs sm:text-sm flex items-center gap-3 transition-all border ${
                        isSelected
                          ? 'border-red-600 bg-red-50 text-red-900 shadow-xs ring-2 ring-red-500/20 font-bold'
                          : 'border-stone-200 bg-white hover:border-red-300 hover:bg-stone-50 text-stone-800'
                      }`}
                    >
                      <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                        isSelected ? 'bg-red-600 text-white' : 'bg-stone-100 text-stone-500'
                      }`}>
                        {i + 1}
                      </span>
                      <span className="flex-grow">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Unanswered Notice at end of test */}
              {currentIndex === questions.length - 1 && blankCount > 0 && (
                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-800 flex items-center justify-between">
                  <span>Bạn đang ở câu cuối nhưng còn <b>{blankCount} câu chưa làm</b>.</span>
                  <button
                    onClick={handleGotoFirstBlank}
                    className="font-bold underline text-amber-900 hover:text-amber-700"
                  >
                    Làm nốt câu chưa làm →
                  </button>
                </div>
              )}

              {/* Bottom Nav Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-stone-100">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentIndex === 0}
                    className="px-3.5 py-2 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 disabled:opacity-40 text-xs font-bold text-stone-700 flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Câu trước</span>
                  </button>
                  <button
                    onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                    disabled={currentIndex === questions.length - 1}
                    className="px-3.5 py-2 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 disabled:opacity-40 text-xs font-bold text-stone-700 flex items-center gap-1"
                  >
                    <span>Câu sau</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleGotoFirstBlank}
                    disabled={blankCount === 0}
                    className="px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 disabled:opacity-40 text-xs font-bold"
                  >
                    Câu chưa làm →
                  </button>
                </div>

                <button
                  onClick={handleClearAnswer}
                  className="text-xs text-stone-400 hover:text-red-600 font-bold px-2 py-1"
                >
                  Bỏ chọn đáp án
                </button>
              </div>

              <p className="text-[11px] text-stone-400 text-center">
                Mẹo: Bấm phím <b>1 – 6</b> để chọn đáp án, phím <b>←</b> <b>→</b> để chuyển câu.
              </p>

              {/* Grid jump box */}
              {isGridOpen && (
                <div className="pt-4 border-t border-stone-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-stone-700">Chuyển nhanh đến câu hỏi:</span>
                    <span className="text-[11px] text-stone-400">Xanh: Đã chọn · Đỏ viền: Đang làm</span>
                  </div>
                  <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-12 gap-1.5 max-h-52 overflow-y-auto p-1 bg-stone-50 rounded-2xl border border-stone-200">
                    {questions.map((_, idx) => {
                      const isDone = userAnswers[idx] !== null;
                      const isCurrent = idx === currentIndex;
                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            setCurrentIndex(idx);
                            setIsGridOpen(false);
                          }}
                          className={`py-2 rounded-lg text-xs font-bold transition-all ${
                            isCurrent
                              ? 'ring-2 ring-red-600 bg-red-600 text-white'
                              : isDone
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-white text-stone-500 border border-stone-200 hover:bg-stone-100'
                          }`}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STATE 3: RESULT SCREEN */}
          {quizState === 'result' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 bg-gradient-to-r from-red-50 to-orange-50 rounded-3xl border border-red-200">
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 rounded-full border-4 border-red-600 flex flex-col items-center justify-center bg-white shadow-sm shrink-0">
                    <span className="text-xl font-black text-red-600">
                      {Math.round(((questions.length - wrongList.length) / questions.length) * 100)}%
                    </span>
                    <span className="text-[9px] font-bold text-stone-400 uppercase">Đúng</span>
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-stone-900">Bảng Tổng Kết Điểm</h3>
                    <p className="text-xs text-stone-500">
                      Bạn đã hoàn thành bài trắc nghiệm {activeSetTab === 1 ? 'Từ Vựng 1' : activeSetTab === 2 ? 'Từ Vựng 2' : 'Từ Vựng 3'}.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 w-full sm:w-auto">
                  <div className="p-3 bg-white rounded-xl border border-stone-200 text-center min-w-20">
                    <span className="block text-lg font-black text-emerald-600">
                      {questions.length - wrongList.length}
                    </span>
                    <span className="text-[10px] text-stone-400 font-bold uppercase">Câu Đúng</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-stone-200 text-center min-w-20">
                    <span className="block text-lg font-black text-red-600">
                      {wrongList.filter(w => w.your !== null).length}
                    </span>
                    <span className="text-[10px] text-stone-400 font-bold uppercase">Câu Sai</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-stone-200 text-center min-w-20">
                    <span className="block text-lg font-black text-amber-600">
                      {wrongList.filter(w => w.your === null).length}
                    </span>
                    <span className="text-[10px] text-stone-400 font-bold uppercase">Chưa Làm</span>
                  </div>
                </div>
              </div>

              {resultReportState !== 'idle' && (
                <div className={`rounded-xl border px-4 py-3 text-xs font-bold ${resultReportState === 'saved' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>
                  {resultReportState === 'sending' && 'Đang gửi kết quả về bảng thành tích…'}
                  {resultReportState === 'saved' && 'Kết quả đã được lưu vào bảng thành tích.'}
                  {resultReportState === 'pending' && 'Kết quả đã lưu trên thiết bị và sẽ tự gửi lại khi có mạng.'}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                {wrongList.length > 0 && (
                  <button
                    onClick={() => {
                      const wrongPool: VocabWord[] = wrongList.map(w => ({
                        k: w.k,
                        v: w.v,
                        c: w.c
                      }));
                      handleStartQuiz(wrongPool);
                    }}
                    className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black shadow-xs flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Ôn Lại {wrongList.length} Từ Sai</span>
                  </button>
                )}

                <button
                  onClick={() => handleStartQuiz()}
                  className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-black shadow-xs flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Làm Lại Toàn Bộ Bài</span>
                </button>

                {wrongList.length > 0 && (
                  <button
                    onClick={handleCopyWrongWords}
                    className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold flex items-center gap-1.5"
                  >
                    {copiedSuccess ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSuccess ? 'Đã sao chép danh sách ✓' : 'Sao chép danh sách từ sai'}</span>
                  </button>
                )}
              </div>

              {/* Wrong Words Table */}
              <div className="space-y-3 pt-4 border-t border-stone-200">
                <h4 className="text-sm font-black text-stone-900 flex items-center gap-2">
                  <span>📌 Danh Sách Các Từ Cần Ôn Tập</span>
                  <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] rounded-full font-bold">
                    {wrongList.length} từ
                  </span>
                </h4>

                {wrongList.length === 0 ? (
                  <div className="p-6 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-center font-bold text-xs">
                    🎉 Xuất sắc! Bạn không làm sai bất kỳ từ vựng nào trong bài trắc nghiệm này.
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-stone-200">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-stone-50 text-stone-500 font-bold uppercase tracking-wider text-[10px] border-b border-stone-200">
                        <tr>
                          <th className="py-2.5 px-3">#</th>
                          <th className="py-2.5 px-3">Từ Tiếng Hàn</th>
                          <th className="py-2.5 px-3">Bạn Chọn</th>
                          <th className="py-2.5 px-3">Đáp Án Đúng</th>
                          <th className="py-2.5 px-3">Nhóm Chủ Đề</th>
                          <th className="py-2.5 px-3 text-center">Phát Âm</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {wrongList.map((item, idx) => (
                          <tr key={idx} className="hover:bg-stone-50">
                            <td className="py-2.5 px-3 text-stone-400 font-bold">{idx + 1}</td>
                            <td className="py-2.5 px-3 font-extrabold text-stone-900 font-sans text-sm">
                              {item.k}
                            </td>
                            <td className="py-2.5 px-3 text-red-600 font-medium line-through">
                              {item.your || '(Chưa trả lời)'}
                            </td>
                            <td className="py-2.5 px-3 text-emerald-700 font-bold">
                              {item.v}
                            </td>
                            <td className="py-2.5 px-3">
                              {item.c && (
                                <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 text-[10px]">
                                  {item.c}
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <button
                                onClick={() => speakText(item.k)}
                                className="p-1 text-stone-400 hover:text-red-600"
                                title="Nghe phát âm"
                              >
                                <Volume2 className="w-3.5 h-3.5 mx-auto" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: FULL WORD LIST TABLE MODE */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-stone-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-extrabold text-stone-900 text-sm sm:text-base flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-red-600" />
                <span>Danh Mục Từ Vựng ({filteredWordsList.length} / {currentPool.length} từ)</span>
              </h3>
              <p className="text-stone-500 text-xs mt-0.5">
                Bấm vào biểu tượng loa để nghe phát âm tiếng Hàn chuẩn Seoul.
              </p>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-grow sm:w-60">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Tìm tiếng Hàn hoặc nghĩa..."
                  className="w-full pl-8 pr-3 py-1.5 border border-stone-300 rounded-xl text-xs bg-stone-50"
                />
              </div>

              {categories.length > 2 && (
                <select
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                  className="p-1.5 border border-stone-300 rounded-xl text-xs bg-stone-50 max-w-36"
                >
                  {categories.map(c => (
                    <option key={c} value={c}>
                      {c === 'all' ? 'Tất cả nhóm' : c}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-2xl border border-stone-200 max-h-[550px] overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 font-bold uppercase tracking-wider text-[10px] sticky top-0 border-b border-stone-200">
                <tr>
                  <th className="py-3 px-4 w-12">#</th>
                  <th className="py-3 px-4">Từ Tiếng Hàn</th>
                  <th className="py-3 px-4">Nghĩa Tiếng Việt</th>
                  <th className="py-3 px-4">Chủ Đề</th>
                  <th className="py-3 px-4 text-center w-16">Nghe</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredWordsList.map((item, idx) => (
                  <tr key={idx} className="hover:bg-red-50/40 transition-colors">
                    <td className="py-2.5 px-4 text-stone-400 font-mono text-[11px]">{idx + 1}</td>
                    <td className="py-2.5 px-4 font-bold text-stone-900 font-sans text-sm">
                      {item.k}
                    </td>
                    <td className="py-2.5 px-4 font-medium text-stone-700">{item.v}</td>
                    <td className="py-2.5 px-4 text-stone-500">
                      {item.c && (
                        <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 text-[10px] font-semibold">
                          {item.c}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <button
                        onClick={() => speakText(item.k)}
                        className="p-1.5 rounded-lg bg-stone-100 hover:bg-red-600 hover:text-white text-stone-600 transition-colors"
                        title="Phát âm"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CONFIRMATION SUBMIT MODAL */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-stone-200 animate-in fade-in zoom-in-95">
            <h3 className="font-extrabold text-base text-stone-900">Xác Nhận Nộp Bài</h3>
            <p className="text-xs text-stone-600">
              {blankCount > 0
                ? `Bạn còn ${blankCount} câu chưa trả lời. Các câu chưa làm sẽ được tính là sai.`
                : `Bạn đã trả lời đầy đủ tất cả ${questions.length} câu hỏi.`}
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold"
              >
                Quay lại
              </button>
              {blankCount > 0 && (
                <button
                  onClick={() => {
                    setIsConfirmModalOpen(false);
                    handleGotoFirstBlank();
                  }}
                  className="px-3.5 py-2 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-xl text-xs font-bold"
                >
                  Làm nốt câu trống
                </button>
              )}
              <button
                onClick={handleFinishQuiz}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black shadow-xs"
              >
                Nộp Bài Ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
