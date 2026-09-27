import React, { useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, Headphones, Loader2, Mic, RotateCcw, Sparkles, Square, Volume2 } from 'lucide-react';
import { CONSULAR_INTERVIEW_TOPICS, ConsularInterviewTopic } from '../data/consularInterviewTopics';
import { gradeInterviewLocally } from '../services/localAiService';
import { useContinuousKoreanSpeechRecognition } from '../hooks/useContinuousKoreanSpeechRecognition';
import { getStudentIdentity, submitExamResult } from '../services/examResultService';

interface InterviewIssue { original: string; corrected: string; reason: string; }
interface InterviewResult {
  pronunciation: number;
  grammar: number;
  clarity: number;
  naturalness: number;
  total: number;
  feedback: string;
  recognized: string;
  correctedAnswer: string;
  issues: InterviewIssue[];
}

const ScoreBox: React.FC<{ icon: string; label: string; value: number }> = ({ icon, label, value }) => <div className="rounded-xl border border-stone-200 bg-white p-3 text-center"><div className="text-lg">{icon}</div><div className="mt-1 text-[10px] font-bold uppercase text-stone-500">{label}</div><div className={`text-xl font-black ${value >= 90 ? 'text-emerald-600' : value >= 70 ? 'text-amber-600' : 'text-red-600'}`}>{value}</div></div>;

export const ConsularAiInterview: React.FC = () => {
  const [topic, setTopic] = useState<ConsularInterviewTopic | null>(null);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0.8);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<InterviewResult | null>(null);
  const [attempt, setAttempt] = useState(1);
  const [bestScore, setBestScore] = useState(0);
  const [error, setError] = useState('');
  const [resultReportState, setResultReportState] = useState<'idle' | 'sending' | 'saved' | 'pending'>('idle');
  const attemptStartedAtRef = useRef(Date.now());

  const chooseTopic = (next: ConsularInterviewTopic) => { setTopic(next); setTranscript(''); setResult(null); setAttempt(1); setBestScore(0); setError(''); setResultReportState('idle'); attemptStartedAtRef.current = Date.now(); };

  const reportInterviewResult = (graded: InterviewResult) => {
    const student = getStudentIdentity();
    if (!student || !topic) return;
    const numericScore = Math.max(0, Math.min(100, Number(graded.total) || 0));
    setResultReportState('sending');
    void submitExamResult(student, {
      testId: `consular-interview-${topic.id}`,
      testTitle: `Phỏng vấn LSQ AI — ${topic.vietnamese}`,
      testKind: 'ai-consular-interview',
      correct: Math.round(numericScore),
      total: 100,
      score: numericScore,
      maxScore: 100,
      durationSec: Math.max(1, Math.round((Date.now() - attemptStartedAtRef.current) / 1000)),
    }).then(saved => setResultReportState(saved ? 'saved' : 'pending'));
  };

  const speakQuestion = () => {
    if (!topic || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(topic.question);
    utterance.lang = 'ko-KR'; utterance.rate = 0.82;
    window.speechSynthesis.speak(utterance);
  };

  const grade = async (answer: string, speechConfidence = confidence) => {
    if (!topic || !answer.trim()) return;
    setLoading(true); setError(''); setResultReportState('idle');
    try {
      const response = await fetch('/api/openai', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'gradeInterview', payload: { topic: topic.korean, question: topic.question, answer, sampleAnswer: topic.sampleAnswer, confidence: speechConfidence } }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Không thể chấm câu trả lời');
      setResult(data); setBestScore(previous => Math.max(previous, Number(data.total) || 0)); reportInterviewResult(data);
    } catch {
      const localResult = gradeInterviewLocally(answer, topic.sampleAnswer, speechConfidence);
      setResult(localResult);
      setBestScore(previous => Math.max(previous, localResult.total));
      reportInterviewResult(localResult);
    }
    finally { setLoading(false); }
  };

  const speech = useContinuousKoreanSpeechRecognition((answer, nextConfidence) => {
    setTranscript(answer);
    setConfidence(nextConfidence);
    return grade(answer, nextConfidence);
  });

  const retry = () => { setAttempt(value => value + 1); setTranscript(''); setResult(null); setError(''); setResultReportState('idle'); attemptStartedAtRef.current = Date.now(); setTimeout(speakQuestion, 100); };

  return <div className="space-y-5">
    <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="mb-4"><p className="text-xs font-black uppercase tracking-wider text-red-600">Bước 1 · Chọn chủ đề</p><h2 className="mt-1 text-xl font-black text-stone-900">Phỏng vấn Lãnh sự quán AI</h2><p className="mt-1 text-xs text-stone-500">Chọn một chủ đề, nghe câu hỏi tiếng Hàn và trả lời trực tiếp bằng điện thoại.</p></div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{CONSULAR_INTERVIEW_TOPICS.map(item => <button key={item.id} onClick={() => chooseTopic(item)} className={`rounded-xl border p-3 text-left transition-all ${topic?.id === item.id ? 'border-red-600 bg-red-50 ring-2 ring-red-100' : 'border-stone-200 hover:border-red-300'}`}><div className="font-black text-stone-900">{item.korean}</div><div className="text-xs text-stone-500">{item.vietnamese}</div></button>)}</div>
    </section>

    {topic && <section className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 bg-stone-900 px-5 py-3 text-white"><span className="text-xs font-bold uppercase">Lần luyện {attempt} · Điểm cao nhất {bestScore}</span><span className="text-xs text-stone-300">Mục tiêu: 90+</span></div>
      <div className="p-5 sm:p-7">
        <p className="text-xs font-black uppercase tracking-wider text-red-600">Bước 2 · AI hỏi bằng tiếng Hàn</p>
        <div className="mt-2 rounded-2xl bg-stone-50 p-4"><h3 className="text-xl font-black leading-relaxed text-stone-900">{topic.question}</h3><p className="mt-1 text-xs text-stone-500">{topic.questionVi}</p><button onClick={speakQuestion} className="mt-3 flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-bold"><Volume2 className="h-4 w-4 text-red-600" /> Nghe AI đọc câu hỏi</button></div>

        <p className="mt-6 text-xs font-black uppercase tracking-wider text-red-600">Bước 3 · Học viên nói vào điện thoại</p>
        <button onClick={speech.listening ? speech.stop : speech.start} disabled={loading} className={`mt-2 flex w-full items-center justify-center gap-2 rounded-xl py-4 text-sm font-black text-white disabled:opacity-50 ${speech.listening ? 'bg-stone-900' : 'bg-red-600'}`}>{speech.listening ? <Square className="h-5 w-5 fill-current" /> : <Mic className="h-5 w-5" />} {speech.listening ? 'Dừng ghi âm và chấm điểm' : 'Bấm và bắt đầu trả lời'}</button>
        {speech.listening && <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-stone-700"><div className="mb-1 flex items-center gap-2 text-xs font-black text-red-600"><span className="h-2 w-2 animate-pulse rounded-full bg-red-600" /> Đang ghi liên tục — hệ thống không tự tắt</div>{speech.liveTranscript || 'Bạn bắt đầu trả lời bằng tiếng Hàn…'}</div>}
        <div className="mt-3"><label className="text-[11px] font-bold text-stone-500">Nội dung điện thoại nhận diện được — có thể sửa trước khi chấm lại:</label><textarea value={transcript} onChange={event => setTranscript(event.target.value)} rows={3} placeholder="Câu trả lời tiếng Hàn sẽ hiện tại đây…" className="mt-1 w-full rounded-xl border border-stone-300 bg-stone-50 p-3 text-sm" />{transcript && <button onClick={() => grade(transcript)} disabled={loading} className="mt-2 flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700">{loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />} Chấm lại nội dung này</button>}</div>
        {(error || speech.error) && <div className="mt-3 flex gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{error || speech.error}</div>}

        {result && <div className="mt-7 space-y-5 border-t border-stone-200 pt-6">
          <div><p className="text-xs font-black uppercase tracking-wider text-red-600">Bước 4 · Kết quả AI</p><div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-5"><ScoreBox icon="🗣" label="Phát âm" value={result.pronunciation} /><ScoreBox icon="📖" label="Ngữ pháp" value={result.grammar} /><ScoreBox icon="🎧" label="Độ rõ" value={result.clarity} /><ScoreBox icon="🇰🇷" label="Tự nhiên" value={result.naturalness} /><ScoreBox icon="⭐" label="Tổng" value={result.total} /></div><p className="mt-3 rounded-xl bg-stone-50 p-3 text-sm text-stone-700">{result.feedback}</p>{resultReportState !== 'idle' && <div className={`mt-3 rounded-xl border px-3 py-2 text-xs font-bold ${resultReportState === 'saved' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>{resultReportState === 'sending' ? 'Đang gửi kết quả về bảng thành tích…' : resultReportState === 'saved' ? 'Kết quả đã được lưu vào bảng thành tích.' : 'Kết quả đã lưu trên thiết bị và sẽ tự gửi lại khi có mạng.'}</div>}</div>

          <div><p className="text-xs font-black uppercase tracking-wider text-red-600">Bước 5 · Câu cần sửa chính xác</p><div className="mt-2 space-y-2">{result.issues?.length ? result.issues.map((issue, index) => <div key={index} className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm"><p><b className="text-red-700">Câu đã nói:</b> {issue.original}</p><p className="mt-1"><b className="text-emerald-700">Nên sửa:</b> {issue.corrected}</p><p className="mt-1 text-xs text-stone-600">{issue.reason}</p></div>) : <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">Không phát hiện lỗi lớn.</div>}</div><div className="mt-2 rounded-xl border border-stone-200 p-3 text-sm"><b>Câu trả lời gợi ý:</b><p className="mt-1 leading-relaxed text-stone-700">{result.correctedAnswer}</p><button onClick={() => { const utterance = new SpeechSynthesisUtterance(result.correctedAnswer); utterance.lang = 'ko-KR'; utterance.rate = 0.8; window.speechSynthesis.cancel(); window.speechSynthesis.speak(utterance); }} className="mt-2 flex items-center gap-1 text-xs font-bold text-red-600"><Headphones className="h-4 w-4" /> Nghe câu đã sửa</button></div></div>

          <div className={`rounded-2xl border p-4 ${result.total >= 90 ? 'border-emerald-300 bg-emerald-50' : 'border-red-200 bg-red-50'}`}><p className="flex items-center gap-2 text-sm font-black">{result.total >= 90 ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : <RotateCcw className="h-5 w-5 text-red-600" />} Bước 6 · {result.total >= 90 ? 'Đã đạt mục tiêu 90+' : 'Đọc lại đến khi đạt 90+'}</p><button onClick={retry} className={`mt-3 w-full rounded-xl py-3 text-sm font-black text-white ${result.total >= 90 ? 'bg-emerald-600' : 'bg-red-600'}`}>{result.total >= 90 ? 'Luyện thêm một lần' : 'Sửa lỗi và trả lời lại'}</button></div>
        </div>}
      </div>
    </section>}
  </div>;
};
