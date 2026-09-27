import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, CheckCircle2, Headphones, Landmark, Loader2, Mic, RotateCcw, Send, Sparkles, Square, Volume2 } from 'lucide-react';
import { getStoredAiLearning, syncAiLearningFromServer } from '../services/aiLearningService';
import { gradePronunciationLocally, gradeTranslationLocally } from '../services/localAiService';
import { ConsularAiInterview } from './ConsularAiInterview';
import { useContinuousKoreanSpeechRecognition } from '../hooks/useContinuousKoreanSpeechRecognition';
import {
  getStudentIdentity,
  saveStudentIdentity,
  StudentIdentity,
  submitExamResult,
} from '../services/examResultService';

interface Props { onBackToHome: () => void; }
interface GradeResult { score: number; feedback: string; corrected?: string; recognized?: string; pronunciation?: number; clarity?: number; completeness?: number; }

export const AiLearningSubPageView: React.FC<Props> = ({ onBackToHome }) => {
  const [tab, setTab] = useState<'translate' | 'pronounce' | 'interview'>('translate');
  const [config, setConfig] = useState(getStoredAiLearning());
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState<GradeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [student, setStudent] = useState<StudentIdentity | null>(getStudentIdentity());
  const [studentName, setStudentName] = useState(() => getStudentIdentity()?.name || '');
  const [studentPhone, setStudentPhone] = useState(() => getStudentIdentity()?.phone || '');
  const [studentGoal, setStudentGoal] = useState(() => getStudentIdentity()?.goal || 'hoc-tieng-han');
  const [resultReportState, setResultReportState] = useState<'idle' | 'sending' | 'saved' | 'pending'>('idle');
  const practiceStartedAtRef = useRef(Date.now());

  useEffect(() => {
    const refresh = () => setConfig(getStoredAiLearning());
    window.addEventListener('seiu_ai_learning_updated', refresh);
    syncAiLearningFromServer();
    return () => window.removeEventListener('seiu_ai_learning_updated', refresh);
  }, []);

  const translation = config.translations[index % Math.max(config.translations.length, 1)];
  const passage = config.pronunciation[index % Math.max(config.pronunciation.length, 1)];
  const currentLength = tab === 'translate' ? config.translations.length : tab === 'pronounce' ? config.pronunciation.length : 0;
  const progress = useMemo(() => currentLength ? `${index % currentLength + 1}/${currentLength}` : '0/0', [currentLength, index]);

  const next = () => { setIndex(i => currentLength ? (i + 1) % currentLength : 0); setAnswer(''); setResult(null); setError(''); setResultReportState('idle'); practiceStartedAtRef.current = Date.now(); };
  const switchTab = (value: 'translate' | 'pronounce' | 'interview') => { setTab(value); setIndex(0); setAnswer(''); setResult(null); setError(''); setResultReportState('idle'); practiceStartedAtRef.current = Date.now(); };

  const reportPracticeResult = (graded: GradeResult, kind: 'translation' | 'pronunciation') => {
    if (!student) return;
    const numericScore = Math.max(0, Math.min(100, Number(graded.score) || 0));
    const itemId = kind === 'translation' ? translation?.id : passage?.id;
    const itemTitle = kind === 'translation' ? 'Dịch Việt → Hàn cùng AI' : `Luyện phát âm AI — ${passage?.title || 'Đoạn luyện đọc'}`;
    setResultReportState('sending');
    void submitExamResult(student, {
      testId: `ai-${kind}-${itemId || index}`,
      testTitle: itemTitle,
      testKind: `ai-${kind}`,
      correct: Math.round(numericScore),
      total: 100,
      score: numericScore,
      maxScore: 100,
      durationSec: Math.max(1, Math.round((Date.now() - practiceStartedAtRef.current) / 1000)),
    }).then(saved => setResultReportState(saved ? 'saved' : 'pending'));
  };

  const handleStudentGate = (event: React.FormEvent) => {
    event.preventDefault();
    const name = studentName.trim();
    const phone = studentPhone.replace(/[^0-9+]/g, '');
    if (name.length < 2 || phone.replace(/\D/g, '').length < 8) return;
    const identity = { name, phone, goal: studentGoal };
    saveStudentIdentity(identity);
    setStudent(identity);
    practiceStartedAtRef.current = Date.now();
  };

  const gradeTranslation = async () => {
    if (!translation || !answer.trim()) return;
    setLoading(true); setError(''); setResult(null); setResultReportState('idle');
    let graded: GradeResult;
    try {
      const response = await fetch('/api/openai', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'gradeTranslation', payload: { vietnamese: translation.vietnamese, answer, reference: translation.referenceKorean } }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Không thể chấm bài');
      graded = data;
    } catch { graded = gradeTranslationLocally(answer, translation.referenceKorean); }
    finally { setLoading(false); }
    setResult(graded);
    reportPracticeResult(graded, 'translation');
  };

  const playKorean = () => {
    if (!passage || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(passage.korean);
    utterance.lang = 'ko-KR'; utterance.rate = 0.82;
    window.speechSynthesis.speak(utterance);
  };

  const gradePronunciation = async (transcript: string, confidence: number) => {
    if (!passage) return;
    setLoading(true); setError(''); setResult(null); setResultReportState('idle');
    let graded: GradeResult;
    try {
      const response = await fetch('/api/openai', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'gradePronunciation', payload: { target: passage.korean, transcript, confidence } }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Không thể đánh giá phát âm');
      graded = data;
    } catch { graded = gradePronunciationLocally(passage.korean, transcript, confidence); }
    finally { setLoading(false); }
    setResult(graded);
    reportPracticeResult(graded, 'pronunciation');
  };

  const speech = useContinuousKoreanSpeechRecognition(gradePronunciation);

  return (
    <main className="min-h-screen bg-stone-50 pb-20">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-4">
          <button onClick={onBackToHome} className="flex items-center gap-1.5 rounded-xl border border-stone-200 px-3 py-2 text-xs font-bold text-stone-700"><ArrowLeft className="h-4 w-4" /> Trang chủ</button>
          <div className="text-right"><h1 className="flex items-center justify-end gap-2 text-xl font-black"><Sparkles className="h-5 w-5 text-red-600" /> Học cùng AI</h1><p className="text-xs text-stone-500">Dịch câu · luyện đọc · nhận phản hồi ngay</p></div>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-4 pt-8">
        {!student ? (
          <form onSubmit={handleStudentGate} className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-xs font-black uppercase tracking-wider text-red-600">Thông tin học viên</p>
            <h2 className="mt-1 text-2xl font-black text-stone-900">Nhập thông tin để lưu mọi kết quả AI</h2>
            <p className="mt-1 text-xs text-stone-500">Điểm dịch, phát âm và phỏng vấn sẽ tự động gửi về bảng thành tích của quản trị viên.</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <label className="text-xs font-bold text-stone-700">Họ và tên<input value={studentName} onChange={event => setStudentName(event.target.value)} required minLength={2} className="mt-1 w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-3 outline-none focus:border-red-500" /></label>
              <label className="text-xs font-bold text-stone-700">Số điện thoại<input value={studentPhone} onChange={event => setStudentPhone(event.target.value)} required minLength={8} inputMode="tel" className="mt-1 w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-3 outline-none focus:border-red-500" /></label>
            </div>
            <label className="mt-3 block text-xs font-bold text-stone-700">Mục tiêu<select value={studentGoal} onChange={event => setStudentGoal(event.target.value)} className="mt-1 w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-3 outline-none focus:border-red-500"><option value="hoc-tieng-han">Học tiếng Hàn</option><option value="topik">Thi TOPIK</option><option value="du-hoc">Du học Hàn Quốc</option><option value="phong-van">Phỏng vấn visa</option></select></label>
            <button type="submit" className="mt-4 w-full rounded-xl bg-red-600 py-3.5 text-sm font-black text-white hover:bg-red-700">Vào Học cùng AI</button>
          </form>
        ) : <>
        <div className="mb-5 grid grid-cols-1 gap-1 sm:grid-cols-3 rounded-2xl border border-stone-200 bg-white p-1.5 shadow-sm">
          <button onClick={() => switchTab('translate')} className={`rounded-xl px-3 py-3 text-sm font-bold ${tab === 'translate' ? 'bg-red-600 text-white' : 'text-stone-600'}`}><Send className="mr-1.5 inline h-4 w-4" /> Dịch Việt → Hàn</button>
          <button onClick={() => switchTab('pronounce')} className={`rounded-xl px-3 py-3 text-sm font-bold ${tab === 'pronounce' ? 'bg-red-600 text-white' : 'text-stone-600'}`}><Mic className="mr-1.5 inline h-4 w-4" /> Luyện phát âm</button>
          <button onClick={() => switchTab('interview')} className={`rounded-xl px-3 py-3 text-sm font-bold ${tab === 'interview' ? 'bg-red-600 text-white' : 'text-stone-600'}`}><Landmark className="mr-1.5 inline h-4 w-4" /> Phỏng vấn LSQ AI</button>
        </div>

        {tab === 'interview' ? <ConsularAiInterview /> : <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
          <div className="flex items-center justify-between bg-stone-900 px-5 py-3 text-white"><span className="text-xs font-bold uppercase tracking-wider">Bài {progress}</span><button onClick={next} className="flex items-center gap-1 text-xs font-semibold text-stone-300 hover:text-white"><RotateCcw className="h-3.5 w-3.5" /> Bài tiếp</button></div>
          <div className="p-5 sm:p-7">
            {tab === 'translate' && translation ? <>
              <p className="text-xs font-bold uppercase tracking-wider text-red-600">Dịch câu sau sang tiếng Hàn</p>
              <h2 className="mt-2 text-xl font-black leading-relaxed text-stone-900">{translation.vietnamese}</h2>
              {translation.hint && <p className="mt-2 text-xs text-stone-500">Gợi ý: {translation.hint}</p>}
              <textarea value={answer} onChange={e => setAnswer(e.target.value)} rows={4} placeholder="Nhập bản dịch tiếng Hàn của bạn…" className="mt-5 w-full rounded-2xl border border-stone-300 bg-stone-50 p-4 text-base leading-relaxed outline-none focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-100" />
              <button onClick={gradeTranslation} disabled={loading || !answer.trim()} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-3.5 text-sm font-bold text-white disabled:opacity-50">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Nộp bài để AI chấm</button>
            </> : passage ? <>
              <p className="text-xs font-bold uppercase tracking-wider text-red-600">{passage.title}</p>
              <h2 className="mt-3 text-2xl font-black leading-relaxed text-stone-900">{passage.korean}</h2>
              {passage.vietnamese && <p className="mt-2 text-sm text-stone-500">{passage.vietnamese}</p>}
              <div className="mt-6 grid gap-2 sm:grid-cols-2"><button onClick={playKorean} className="flex items-center justify-center gap-2 rounded-xl border border-stone-300 py-3 text-sm font-bold"><Volume2 className="h-4 w-4 text-red-600" /> Nghe câu mẫu</button><button onClick={speech.listening ? speech.stop : speech.start} disabled={loading} className={`flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white disabled:opacity-50 ${speech.listening ? 'bg-stone-900' : 'bg-red-600'}`}>{speech.listening ? <Square className="h-4 w-4 fill-current" /> : <Mic className="h-4 w-4" />} {speech.listening ? 'Dừng và chấm bài' : 'Bắt đầu đọc'}</button></div>
              {speech.listening && <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-stone-700"><div className="mb-1 flex items-center gap-2 text-xs font-black text-red-600"><span className="h-2 w-2 animate-pulse rounded-full bg-red-600" /> Đang nghe liên tục — chỉ dừng khi bạn bấm nút Dừng</div>{speech.liveTranscript || 'Bạn bắt đầu đọc tiếng Hàn…'}</div>}
              <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-relaxed text-stone-400"><Headphones className="mt-0.5 h-3.5 w-3.5 shrink-0" /> Kết quả dựa trên nội dung tiếng Hàn mà thiết bị nhận diện được. Hãy đọc ở nơi yên tĩnh và cho phép dùng micro.</p>
            </> : <p className="py-10 text-center text-sm text-stone-500">Admin chưa tạo nội dung cho phần này.</p>}

            {(error || speech.error) && <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error || speech.error}</div>}
            {result && <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-5"><div className="flex items-center gap-3"><div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-xl font-black text-white">{result.score}</div><div><p className="flex items-center gap-1 text-sm font-black text-emerald-900"><CheckCircle2 className="h-4 w-4" /> Kết quả</p><p className="text-sm text-emerald-800">{result.feedback}</p></div></div>{result.pronunciation !== undefined && <div className="mt-4 grid grid-cols-3 gap-2"><div className="rounded-xl bg-white p-2 text-center"><div className="text-[10px] font-bold text-stone-500">PHÁT ÂM</div><div className="font-black text-red-600">{result.pronunciation}</div></div><div className="rounded-xl bg-white p-2 text-center"><div className="text-[10px] font-bold text-stone-500">ĐỘ RÕ</div><div className="font-black text-red-600">{result.clarity}</div></div><div className="rounded-xl bg-white p-2 text-center"><div className="text-[10px] font-bold text-stone-500">ĐỌC ĐỦ</div><div className="font-black text-red-600">{result.completeness}</div></div></div>}{result.corrected && <div className="mt-4 rounded-xl bg-white p-3 text-sm"><b>Bản gợi ý:</b> {result.corrected}</div>}{result.recognized && <div className="mt-2 rounded-xl bg-white p-3 text-sm"><b>Thiết bị nghe được:</b> {result.recognized}</div>}{resultReportState !== 'idle' && <div className={`mt-3 rounded-xl border px-3 py-2 text-xs font-bold ${resultReportState === 'saved' ? 'border-emerald-300 bg-white text-emerald-800' : 'border-amber-300 bg-amber-50 text-amber-800'}`}>{resultReportState === 'sending' ? 'Đang gửi kết quả về bảng thành tích…' : resultReportState === 'saved' ? 'Kết quả đã được lưu vào bảng thành tích.' : 'Kết quả đã lưu trên thiết bị và sẽ tự gửi lại khi có mạng.'}</div>}</div>}
          </div>
        </div>}
        </>}
      </section>
    </main>
  );
};
