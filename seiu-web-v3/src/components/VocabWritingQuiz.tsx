import React, { useState, useEffect, useRef } from 'react';
import { VocabItem, getStoredVocabList } from '../services/vocabService';
import { 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  ArrowRight, 
  RotateCcw, 
  Volume2, 
  Award, 
  Edit3, 
  Keyboard, 
  HelpCircle,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  getStudentIdentity,
  saveStudentIdentity,
  StudentIdentity,
  submitExamResult,
} from '../services/examResultService';

interface VocabWritingQuizProps {
  onClose: () => void;
  onOpenHomeworkZone: () => void;
}

export const VocabWritingQuiz: React.FC<VocabWritingQuizProps> = ({
  onClose,
  onOpenHomeworkZone,
}) => {
  const [questions, setQuestions] = useState<VocabItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [showVirtualKeyboard, setShowVirtualKeyboard] = useState(false);
  const [historyAnswers, setHistoryAnswers] = useState<{
    vocab: VocabItem;
    userAns: string;
    isRight: boolean;
  }[]>([]);

  // AI Advice
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [student, setStudent] = useState<StudentIdentity | null>(getStudentIdentity());
  const [studentName, setStudentName] = useState(() => getStudentIdentity()?.name || '');
  const [studentPhone, setStudentPhone] = useState(() => getStudentIdentity()?.phone || '');
  const [resultReportState, setResultReportState] = useState<'idle' | 'sending' | 'saved' | 'pending'>('idle');
  const quizStartedAtRef = useRef(Date.now());
  const resultSubmittedRef = useRef(false);

  useEffect(() => {
    // Shuffle vocab list for quiz
    const all = getStoredVocabList();
    const shuffled = [...all].sort(() => 0.5 - Math.random()).slice(0, 10);
    setQuestions(shuffled);
  }, []);

  const currentVocab = questions[currentIndex];

  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  const checkAnswer = () => {
    if (!currentVocab) return;
    const cleanUser = userAnswer.trim().replace(/\s+/g, '');
    const cleanTarget = currentVocab.korean.trim().replace(/\s+/g, '');
    const correct = cleanUser === cleanTarget;

    setIsCorrect(correct);
    setIsAnswerChecked(true);

    if (correct) {
      setScore(prev => prev + 1);
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 }
      });
    }

    setHistoryAnswers(prev => [
      ...prev,
      {
        vocab: currentVocab,
        userAns: userAnswer,
        isRight: correct
      }
    ]);
  };

  const nextQuestion = () => {
    setUserAnswer('');
    setIsAnswerChecked(false);
    setShowHint(false);
    setAiAdvice(null);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setQuizFinished(true);
      if (student && !resultSubmittedRef.current) {
        resultSubmittedRef.current = true;
        setResultReportState('sending');
        void submitExamResult(student, {
          testId: 'vocabulary-writing-quiz',
          testTitle: 'Kiểm tra viết từ vựng tiếng Hàn',
          testKind: 'vocabulary-writing',
          correct: score,
          total: questions.length,
          score,
          maxScore: questions.length,
          durationSec: Math.max(1, Math.round((Date.now() - quizStartedAtRef.current) / 1000)),
        }).then(saved => setResultReportState(saved ? 'saved' : 'pending'));
      }
      confetti({
        particleCount: 100,
        spread: 90,
        origin: { y: 0.5 }
      });
    }
  };

  const restartQuiz = () => {
    const all = getStoredVocabList();
    const shuffled = [...all].sort(() => 0.5 - Math.random()).slice(0, 10);
    setQuestions(shuffled);
    setCurrentIndex(0);
    setUserAnswer('');
    setIsAnswerChecked(false);
    setScore(0);
    setShowHint(false);
    setQuizFinished(false);
    setHistoryAnswers([]);
    setAiAdvice(null);
    setResultReportState('idle');
    resultSubmittedRef.current = false;
    quizStartedAtRef.current = Date.now();
  };

  const handleStudentGate = (event: React.FormEvent) => {
    event.preventDefault();
    const name = studentName.trim();
    const phone = studentPhone.replace(/[^0-9+]/g, '');
    if (name.length < 2 || phone.replace(/\D/g, '').length < 8) return;
    const identity = { name, phone, goal: 'hoc-tieng-han' };
    saveStudentIdentity(identity);
    setStudent(identity);
    quizStartedAtRef.current = Date.now();
  };

  const appendChar = (char: string) => {
    setUserAnswer(prev => prev + char);
  };

  const handleBackspace = () => {
    setUserAnswer(prev => prev.slice(0, -1));
  };

  // Virtual Korean Keys
  const consonants = ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ', 'ㄲ', 'ㄸ', 'ㅃ', 'ㅆ', 'ㅉ'];
  const vowels = ['ㅏ', 'ㅑ', 'ㅓ', 'ㅕ', 'ㅗ', 'ㅛ', 'ㅜ', 'ㅠ', 'ㅡ', 'ㅣ', 'ㅐ', 'ㅒ', 'ㅔ', 'ㅖ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅢ'];

  const getAiTeacherFeedback = async () => {
    setLoadingAi(true);
    try {
      const response = await fetch('/api/openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'gradeHomework', payload: {
          assignmentTitle: `Kiểm tra viết từ vựng: ${currentVocab.vietnamese}`,
          question: `Hãy viết từ vựng tiếng Hàn có nghĩa là "${currentVocab.vietnamese}" (Đáp án đúng: ${currentVocab.korean})`,
          studentSubmission: userAnswer || '(Bỏ trống)',
          studentName: 'Học viên SEIU',
          targetLevel: currentVocab.level,
        } }),
      });

      if (response.ok) {
        const data = await response.json();
        setAiAdvice(data.overallFeedback || data.teacherAdvice || 'Bạn đã làm rất tốt!');
      } else {
        setAiAdvice(`Từ "${currentVocab.vietnamese}" trong tiếng Hàn là "${currentVocab.korean}". Hãy chú ý cách ghép phụ âm và nguyên âm chuẩn để nhớ lâu hơn!`);
      }
    } catch {
      setAiAdvice(`Từ "${currentVocab.vietnamese}" trong tiếng Hàn là "${currentVocab.korean}". Hãy luyện phát âm và viết lại 3 lần nhé!`);
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-red-600 to-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center font-bold">
              <Edit3 className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base font-black uppercase tracking-wide">
                Kiểm Tra Viết Từ Vựng Tiếng Hàn
              </h3>
              <p className="text-xs text-red-100">
                Gõ tiếng Hàn theo nghĩa tiếng Việt & nhận xét AI
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {!student ? (
          <form onSubmit={handleStudentGate} className="space-y-5 p-6 sm:p-8">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-red-600">Thông tin người làm bài</p>
              <h4 className="mt-1 text-xl font-black text-stone-900">Nhập thông tin để lưu kết quả</h4>
              <p className="mt-1 text-xs text-stone-500">Sau khi làm xong, điểm sẽ tự động xuất hiện trong bảng thành tích quản trị.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-xs font-bold text-stone-700">Họ và tên
                <input value={studentName} onChange={event => setStudentName(event.target.value)} required minLength={2} className="mt-1 w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-3 outline-none focus:border-red-500" placeholder="Nguyễn Văn A" />
              </label>
              <label className="text-xs font-bold text-stone-700">Số điện thoại
                <input value={studentPhone} onChange={event => setStudentPhone(event.target.value)} required minLength={8} inputMode="tel" className="mt-1 w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-3 outline-none focus:border-red-500" placeholder="09xx xxx xxx" />
              </label>
            </div>
            <button type="submit" className="w-full rounded-xl bg-red-600 py-3.5 text-sm font-black text-white hover:bg-red-700">Bắt đầu kiểm tra</button>
          </form>
        ) : !quizFinished && currentVocab ? (
          <div className="p-6 sm:p-8 space-y-6">
            {/* Progress bar */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-stone-500 mb-2">
                <span>Câu hỏi {currentIndex + 1} / {questions.length}</span>
                <span>Điểm hiện tại: <strong className="text-red-600">{score}</strong> / {questions.length}</span>
              </div>
              <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-red-600 transition-all duration-300 rounded-full"
                  style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Question Box */}
            <div className="p-6 bg-stone-50 rounded-2xl border border-stone-200 text-center space-y-3">
              <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                {currentVocab.level}
              </span>

              <div className="text-xs text-stone-500 font-semibold uppercase tracking-wider">
                Hãy viết từ tiếng Hàn cho nghĩa sau:
              </div>

              <div className="text-3xl sm:text-4xl font-black text-stone-900">
                "{currentVocab.vietnamese}"
              </div>

              {currentVocab.hanViet && (
                <div className="text-xs text-amber-700 font-medium">
                  💡 Gợi ý âm Hán Việt: <strong>{currentVocab.hanViet}</strong>
                </div>
              )}

              {showHint && (
                <div className="text-xs text-stone-500 bg-white p-2.5 rounded-xl border border-stone-200 font-mono">
                  Phiên âm Romaja: [{currentVocab.romaja}] | Bắt đầu bằng chữ: <strong>{currentVocab.korean[0]}...</strong>
                </div>
              )}
            </div>

            {/* Input Form */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-700">
                  Nhập từ vựng tiếng Hàn:
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowHint(!showHint)}
                    className="text-xs text-stone-500 hover:text-red-600 flex items-center gap-1"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>{showHint ? 'Ẩn gợi ý' : 'Xem gợi ý'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowVirtualKeyboard(!showVirtualKeyboard)}
                    className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1"
                  >
                    <Keyboard className="w-3.5 h-3.5" />
                    <span>{showVirtualKeyboard ? 'Đóng bàn phím ảo' : 'Mở bàn phím ảo Hangul'}</span>
                  </button>
                </div>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={userAnswer}
                  disabled={isAnswerChecked}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !isAnswerChecked && userAnswer.trim()) {
                      checkAnswer();
                    }
                  }}
                  placeholder="Ví dụ: 안녕하세요..."
                  className={`w-full px-4 py-3 text-lg font-bold text-center rounded-2xl border-2 outline-hidden transition-all ${
                    isAnswerChecked
                      ? isCorrect
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                        : 'border-red-500 bg-red-50 text-red-900'
                      : 'border-stone-300 focus:border-red-600 bg-white'
                  }`}
                  autoFocus
                />
              </div>

              {/* Virtual Keyboard Hangul Helper */}
              {showVirtualKeyboard && !isAnswerChecked && (
                <div className="p-3 bg-stone-100 rounded-2xl border border-stone-200 space-y-2">
                  <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                    Bàn phím ký tự tiếng Hàn (Bấm để chèn ký tự):
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {consonants.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => appendChar(c)}
                        className="w-8 h-8 bg-white hover:bg-red-50 text-stone-800 hover:text-red-700 font-bold rounded-lg border border-stone-200 text-xs shadow-2xs"
                      >
                        {c}
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {vowels.map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => appendChar(v)}
                        className="w-8 h-8 bg-white hover:bg-amber-50 text-stone-800 hover:text-amber-700 font-bold rounded-lg border border-stone-200 text-xs shadow-2xs"
                      >
                        {v}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={handleBackspace}
                      className="px-3 h-8 bg-stone-300 hover:bg-stone-400 text-stone-800 font-bold rounded-lg text-xs"
                    >
                      ⌫ Xóa
                    </button>
                    <button
                      type="button"
                      onClick={() => appendChar(' ')}
                      className="px-4 h-8 bg-stone-300 hover:bg-stone-400 text-stone-800 font-bold rounded-lg text-xs"
                    >
                      Dấu cách
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Answer Result & AI Feedback */}
            {isAnswerChecked && (
              <div className={`p-4 rounded-2xl border ${isCorrect ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'} space-y-2`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    {isCorrect ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        <span className="text-emerald-800">Chính xác tuyệt đối! (+1 điểm)</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 text-red-600" />
                        <span className="text-red-800">Chưa chính xác!</span>
                      </>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSpeak(currentVocab.korean)}
                    className="p-1.5 bg-white text-stone-700 rounded-lg shadow-2xs flex items-center gap-1 text-xs font-bold"
                  >
                    <Volume2 className="w-4 h-4 text-red-600" />
                    <span>Nghe</span>
                  </button>
                </div>

                <div className="text-xs text-stone-800">
                  Đáp án chuẩn: <strong className="text-lg text-stone-900 font-black ml-1">{currentVocab.korean}</strong> ({currentVocab.romaja})
                </div>

                <div className="text-xs text-stone-600">
                  Ví dụ câu: <em>{currentVocab.exampleKr}</em> ({currentVocab.exampleVi})
                </div>

                {/* AI Advice Box */}
                {aiAdvice ? (
                  <div className="mt-3 p-3 bg-white rounded-xl border border-stone-200 text-xs text-stone-700 space-y-1">
                    <div className="font-bold text-red-600 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Nhận xét từ Thầy Bửu AI:</span>
                    </div>
                    <p>{aiAdvice}</p>
                  </div>
                ) : (
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={getAiTeacherFeedback}
                      disabled={loadingAi}
                      className="text-xs text-red-700 font-bold hover:underline flex items-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{loadingAi ? 'Đang phân tích cùng AI...' : 'Hỏi Thầy Bửu AI mẹo ghi nhớ từ này'}</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-stone-500 hover:text-stone-700 text-xs font-semibold"
              >
                Tạm dừng kiểm tra
              </button>

              {!isAnswerChecked ? (
                <button
                  type="button"
                  onClick={checkAnswer}
                  disabled={!userAnswer.trim()}
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-md transition-all"
                >
                  Kiểm Tra Đáp Án
                </button>
              ) : (
                <button
                  type="button"
                  onClick={nextQuestion}
                  className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  <span>{currentIndex + 1 === questions.length ? 'Xem Kết Quả Tổng Kết' : 'Câu Tiếp Theo'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Quiz Finished Summary View */
          <div className="p-8 text-center space-y-6">
            <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-md">
              <Award className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h4 className="text-2xl font-black text-stone-900">
                Chúc Mừng Bạn Đã Hoàn Thành Bài Kiểm Tra!
              </h4>
              <p className="text-xs text-stone-500">
                Kết quả kiểm tra viết từ vựng tiếng Hàn
              </p>
            </div>

            <div className="p-6 bg-stone-50 rounded-2xl border border-stone-200 max-w-sm mx-auto">
              <div className="text-xs text-stone-500 font-semibold uppercase">Điểm số đạt được</div>
              <div className="text-5xl font-black text-red-600 my-2">
                {score} <span className="text-lg text-stone-400 font-normal">/ {questions.length}</span>
              </div>
              <p className="text-xs text-stone-600 font-medium">
                {score >= 8 
                  ? '🌟 Xuất sắc! Vốn từ vựng và chính tả Hangul của bạn rất vững chắc.'
                  : score >= 5 
                  ? '👍 Khá tốt! Cần luyện thêm cách ghép vần và các nguyên âm đôi.' 
                  : '💪 Hãy ôn lại Flashcard ở Khu vực học từ vựng và thử lại nhé!'}
              </p>
            </div>

            {resultReportState !== 'idle' && (
              <div className={`mx-auto max-w-sm rounded-xl border px-4 py-3 text-xs font-bold ${resultReportState === 'saved' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>
                {resultReportState === 'sending' && 'Đang gửi kết quả về bảng thành tích…'}
                {resultReportState === 'saved' && 'Kết quả đã được lưu vào bảng thành tích.'}
                {resultReportState === 'pending' && 'Kết quả đã lưu trên thiết bị và sẽ tự gửi lại khi có mạng.'}
              </div>
            )}

            {/* Answer Review */}
            <div className="text-left max-h-48 overflow-y-auto space-y-2 p-2 bg-stone-50 rounded-xl border border-stone-200 text-xs">
              <div className="font-bold text-stone-700 px-2 py-1">Chi tiết câu trả lời:</div>
              {historyAnswers.map((h, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-white rounded-lg border border-stone-100">
                  <div>
                    <span className="font-bold">{i + 1}. {h.vocab.vietnamese}</span>
                    <span className="text-stone-400 ml-2 font-mono">({h.vocab.korean})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={h.isRight ? 'text-emerald-700 font-bold' : 'text-red-700 font-bold'}>
                      Bạn viết: "{h.userAns || 'Trống'}"
                    </span>
                    {h.isRight ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-red-600" />}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              <button
                type="button"
                onClick={restartQuiz}
                className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl transition-all flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Làm Lại Đề Khác</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenHomeworkZone();
                }}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Sang Mục Giao & Chấm Bài AI</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
