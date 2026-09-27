import React, { useState, useEffect, useRef } from 'react';
import { 
  Volume2, 
  Sparkles, 
  Search, 
  RotateCcw, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ArrowLeft, 
  BookOpen, 
  Play, 
  Square,
  HelpCircle,
  Award,
  Layers,
  FileText,
  Radio,
  Link2,
  Check,
  Send,
  UserCheck,
  LogOut,
  Loader2
} from 'lucide-react';
import { MASTER_DATA } from '../data/topikMasterIndex';
import {
  getStudentIdentity,
  saveStudentIdentity,
  clearStudentIdentity,
  submitExamResult,
  StudentIdentity
} from '../services/examResultService';
import { registerExamStudent } from '../services/examRegistrationService';
import { GOAL_OPTIONS } from '../services/leadService';
import { 
  MasterExam, 
  MasterTranslationItem, 
  MasterDialogItem, 
  MasterShortItem, 
  MasterTip 
} from '../types/topikMasterTypes';
import { TopikVocabQuizModule } from './TopikVocabQuizModule';
import { getTopikQuestionPoints } from '../data/topikScoreScale';
import { getTopikPictureOptions } from '../data/topikPictureOptions';

interface Props {
  onBackToHome: () => void;
  onOpenConsultation?: () => void;
  /** Id bài thi lấy từ link chia sẻ #test/<id> — mở thẳng vào bài đó */
  shareTestId?: string | null;
}

/**
 * Khóa đáp án phải dựa trên vị trí thật của block/câu trong bài thi.
 * Không dùng riêng số câu + nhãn vì các bộ luyện tổng hợp có nhiều block cùng
 * mang nhãn "Câu 31", "Câu 32"... khiến một lần bấm chọn nhầm cho nhiều câu.
 */
export const buildExamAnswerKey = (examId: string, blockIndex: number, questionIndex: number): string =>
  `${examId}|block-${blockIndex}|question-${questionIndex}`;

type KoreanVoiceRole = 'female' | 'male' | 'narrator';
type ExamSpeechLine = { tts: string; sp?: string; txt?: string };

const FEMALE_VOICE_HINTS = /female|woman|yuna|sunhi|seoyeon|sora|jiwon|heami|유나|선희|서연|여성/i;
const MALE_VOICE_HINTS = /male|man|injoon|hyunsu|junho|minsu|인준|현수|준호|민수|남성/i;

const getVoiceRole = (speaker?: string): KoreanVoiceRole => {
  const normalized = (speaker || '').trim().toLowerCase();
  if (/남|남자|남성|male|man/.test(normalized)) return 'male';
  if (/여|여자|여성|female|woman/.test(normalized)) return 'female';
  return 'narrator';
};

/** Tách cả dữ liệu cũ dạng “여: ... / 남: ...” để mỗi nhân vật dùng đúng giọng. */
const expandExamSpeechLines = (lines: ExamSpeechLine[]): ExamSpeechLine[] => lines.flatMap((line) => {
  const segments = line.tts.split(/\s*\/\s*/).map((part) => part.trim()).filter(Boolean);
  if (segments.length <= 1) return [line];
  return segments.map((segment, index) => {
    const prefixed = segment.match(/^(남자|여자|남|여)\s*[:：]\s*(.+)$/);
    return {
      ...line,
      sp: prefixed?.[1] || (index === 0 ? line.sp : undefined),
      tts: prefixed?.[2] || segment,
    };
  });
});

export const KoreanTopikMasterView: React.FC<Props> = ({ onBackToHome, onOpenConsultation, shareTestId }) => {
  const focusMode = Boolean(shareTestId);
  const [activeTab, setActiveTab] = useState<'vocab1' | 'vocab2' | 'vocab3' | 'exam' | 'translate' | 'dialog' | 'short' | 'tips'>('exam');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGroup, setFilterGroup] = useState('');
  const [playbackRate, setPlaybackRate] = useState<number>(0.85); // Natural, clear exam pace
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [femaleVoiceURI, setFemaleVoiceURI] = useState<string>('');
  const [maleVoiceURI, setMaleVoiceURI] = useState<string>('');
  const [hideKorean, setHideKorean] = useState(false);
  const [showAllAnswers, setShowAllAnswers] = useState(false);
  
  // Progress & State
  const [dialogAnswers, setDialogAnswers] = useState<Record<string, number>>({});
  const [revealedTranslates, setRevealedTranslates] = useState<Record<number, boolean>>({});
  
  // Exam Runner State
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [examAnswers, setExamAnswers] = useState<Record<string, number>>({});
  const [submittedExams, setSubmittedExams] = useState<Record<string, { time: string; right: number; total: number; score?: number; maxScore?: number }>>({});
  const [examStartTime, setExamStartTime] = useState<number>(0);
  const [examTimerStr, setExamTimerStr] = useState<string>('00:00');

  // Thông tin học viên & link chia sẻ bài thi
  const [student, setStudent] = useState<StudentIdentity | null>(getStudentIdentity());
  const [gateForTestId, setGateForTestId] = useState<string | null>(null);
  const [gateName, setGateName] = useState('');
  const [gatePhone, setGatePhone] = useState('');
  const [gateGoal, setGateGoal] = useState('du-hoc');
  const [copiedTestId, setCopiedTestId] = useState<string | null>(null);
  const [sendState, setSendState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [registrationState, setRegistrationState] = useState<'idle' | 'sending' | 'saved' | 'pending'>('idle');
  
  // Phát tuần tự chuẩn đề thi: đọc 2 lần + "다시 들으십시오" (nghỉ 2s) + 12s chuyển câu
  const [isPlayingSequence, setIsPlayingSequence] = useState<boolean>(false);
  const [currentAudioIndex, setCurrentAudioIndex] = useState<number>(-1);
  const [audioStatusText, setAudioStatusText] = useState<string>('');
  const [countdownSecs, setCountdownSecs] = useState<number>(0);

  const seqTokenRef = useRef<number>(0);
  const generatedAudioRef = useRef<HTMLAudioElement | null>(null);
  const generatedAudioFinishRef = useRef<(() => void) | null>(null);
  const generatedAudioCacheRef = useRef<Map<string, string>>(new Map());
  const audioRequestAbortRef = useRef<AbortController | null>(null);

  const cancelAllSpeech = () => {
    audioRequestAbortRef.current?.abort();
    audioRequestAbortRef.current = null;
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    const audio = generatedAudioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      generatedAudioRef.current = null;
    }
    const finish = generatedAudioFinishRef.current;
    generatedAudioFinishRef.current = null;
    finish?.();
  };

  /** Hủy cả file đang phát, yêu cầu tải âm thanh và chuỗi tự động chờ phát câu kế tiếp. */
  const stopAllExamAudio = (resetUi = true) => {
    seqTokenRef.current += 1;
    cancelAllSpeech();
    if (!resetUi) return;
    setIsPlayingSequence(false);
    setCurrentAudioIndex(-1);
    setAudioStatusText('');
    setCountdownSecs(0);
  };

  useEffect(() => {
    const stopForPageLeave = () => stopAllExamAudio(false);
    window.addEventListener('pagehide', stopForPageLeave);

    return () => {
      window.removeEventListener('pagehide', stopForPageLeave);
      stopAllExamAudio(false);
      generatedAudioCacheRef.current.forEach(url => URL.revokeObjectURL(url));
      generatedAudioCacheRef.current.clear();
    };
  }, []);

  // Load from LocalStorage
  useEffect(() => {
    try {
      const savedAnswers = localStorage.getItem('seiu-answers');
      if (savedAnswers) setDialogAnswers(JSON.parse(savedAnswers));

      const savedExams = localStorage.getItem('seiu-exam');
      if (savedExams) setExamAnswers(JSON.parse(savedExams));

      const savedSubmissions = localStorage.getItem('seiu-exam-sub');
      if (savedSubmissions) setSubmittedExams(JSON.parse(savedSubmissions));
    } catch (e) {
      console.error(e);
    }
  }, []);

  // SpeechSynthesis Voice Initialization
  useEffect(() => {
    const updateVoices = () => {
      if ('speechSynthesis' in window) {
        const allVoices = window.speechSynthesis.getVoices() || [];
        const ko = allVoices.filter(v => v.lang && v.lang.toLowerCase().replace('_', '-').startsWith('ko'));
        ko.sort((a, b) => {
          const isGoodA = /natural|neural|online|premium|enhanced|google|siri/i.test(a.name) ? 1 : 0;
          const isGoodB = /natural|neural|online|premium|enhanced|google|siri/i.test(b.name) ? 1 : 0;
          return isGoodB - isGoodA || a.name.localeCompare(b.name);
        });
        setVoices(ko);
        if (ko.length > 0) {
          const savedLegacy = localStorage.getItem('seiu-ko-voice');
          const savedFemale = localStorage.getItem('seiu-ko-female-voice') || savedLegacy;
          const savedMale = localStorage.getItem('seiu-ko-male-voice');
          const female = ko.find(v => v.voiceURI === savedFemale)
            || ko.find(v => FEMALE_VOICE_HINTS.test(v.name))
            || ko[0];
          const male = ko.find(v => v.voiceURI === savedMale)
            || ko.find(v => MALE_VOICE_HINTS.test(v.name))
            || ko.find(v => v.voiceURI !== female.voiceURI)
            || female;
          setFemaleVoiceURI(female.voiceURI);
          setMaleVoiceURI(male.voiceURI);
        }
      }
    };

    updateVoices();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  // Timer for exam runner
  useEffect(() => {
    let interval: any;
    if (selectedExamId && !submittedExams[selectedExamId]) {
      if (!examStartTime) setExamStartTime(Date.now());
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - (examStartTime || Date.now())) / 1000);
        const mins = String(Math.floor(elapsed / 60)).padStart(2, '0');
        const secs = String(elapsed % 60).padStart(2, '0');
        setExamTimerStr(`${mins}:${secs}`);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [selectedExamId, submittedExams, examStartTime]);

  // Audio helper
  const speakText = (text: string, onEnd?: () => void, speaker?: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Trình duyệt của bạn không hỗ trợ tính năng phát âm thanh.');
      return;
    }
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/<[^>]*>/g, '').trim();
    if (!cleanText) {
      if (onEnd) onEnd();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const role = getVoiceRole(speaker);
    utterance.lang = 'ko-KR';
    utterance.rate = playbackRate;
    utterance.pitch = role === 'male' ? 0.94 : role === 'female' ? 1.03 : 1;

    if (voices.length > 0) {
      const requestedURI = role === 'male' ? maleVoiceURI : femaleVoiceURI;
      const voice = voices.find(v => v.voiceURI === requestedURI)
        || voices.find(v => role === 'male' ? MALE_VOICE_HINTS.test(v.name) : FEMALE_VOICE_HINTS.test(v.name))
        || voices[0];
      if (voice) utterance.voice = voice;
    }

    utterance.onend = () => {
      if (onEnd) onEnd();
    };
    utterance.onerror = () => {
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
  };

  /**
   * Phần đề thi ưu tiên MP3 AI đã được lưu trên máy chủ/Netlify Blobs.
   * Nếu chưa cấu hình dịch vụ TTS hoặc mạng lỗi, tự quay về Web Speech của thiết bị.
   */
  const playExamSpeechLine = async (text: string, speaker?: string, token?: number): Promise<void> => {
    const cleanText = text.replace(/<[^>]*>/g, '').trim();
    if (!cleanText) return;
    if (token !== undefined && token !== seqTokenRef.current) return;
    const role = getVoiceRole(speaker) === 'male' ? 'male' : 'female';
    const cacheKey = `${role}|${cleanText}`;

    try {
      let objectUrl = generatedAudioCacheRef.current.get(cacheKey);
      if (!objectUrl) {
        const controller = new AbortController();
        audioRequestAbortRef.current?.abort();
        audioRequestAbortRef.current = controller;
        const response = await fetch('/api/topik-audio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: cleanText, role }),
          signal: controller.signal,
        });
        const contentType = response.headers.get('content-type') || '';
        if (!response.ok || !contentType.startsWith('audio/')) throw new Error('AI audio unavailable');
        objectUrl = URL.createObjectURL(await response.blob());
        if (controller.signal.aborted || (token !== undefined && token !== seqTokenRef.current)) {
          URL.revokeObjectURL(objectUrl);
          return;
        }
        generatedAudioCacheRef.current.set(cacheKey, objectUrl);
        if (audioRequestAbortRef.current === controller) audioRequestAbortRef.current = null;
      }

      if (token !== undefined && token !== seqTokenRef.current) return;
      cancelAllSpeech();
      if (token !== undefined && token !== seqTokenRef.current) return;
      await new Promise<void>((resolve, reject) => {
        const audio = new Audio(objectUrl);
        generatedAudioRef.current = audio;
        generatedAudioFinishRef.current = resolve;
        audio.playbackRate = Math.max(0.75, Math.min(1.25, playbackRate / 0.85));
        audio.onended = () => {
          if (generatedAudioRef.current === audio) generatedAudioRef.current = null;
          generatedAudioFinishRef.current = null;
          resolve();
        };
        audio.onerror = () => {
          if (generatedAudioRef.current === audio) generatedAudioRef.current = null;
          generatedAudioFinishRef.current = null;
          reject(new Error('Cannot play generated audio'));
        };
        audio.play().catch(error => {
          if (generatedAudioRef.current === audio) generatedAudioRef.current = null;
          generatedAudioFinishRef.current = null;
          reject(error);
        });
      });
      return;
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      if (token !== undefined && token !== seqTokenRef.current) return;
      await new Promise<void>(resolve => speakText(cleanText, resolve, speaker));
    }
  };

  const handleTestAudio = () => {
    const token = ++seqTokenRef.current;
    void (async () => {
      await playExamSpeechLine('안녕하세요. 지금부터 듣기 시험을 시작하겠습니다.', '여자', token);
      if (token !== seqTokenRef.current) return;
      await new Promise(resolve => window.setTimeout(resolve, 350));
      if (token !== seqTokenRef.current) return;
      await playExamSpeechLine('네, 잘 들었습니다. 준비되었습니다.', '남자', token);
    })();
  };

  // Dialog / Short answer pick
  const handleSelectQuizOption = (key: string, optionNumber: number) => {
    setDialogAnswers(prev => {
      const updated = { ...prev, [key]: optionNumber };
      try {
        localStorage.setItem('seiu-answers', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleSelectExamOption = (key: string, optionNumber: number) => {
    setExamAnswers(prev => {
      const updated = { ...prev, [key]: optionNumber };
      try {
        localStorage.setItem('seiu-exam', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const resetAllAnswers = () => {
    if (confirm('Bạn có chắc chắn muốn đặt lại kết quả các câu đã làm không?')) {
      const prefix = `${activeTab}|`;
      const updated = { ...dialogAnswers };
      Object.keys(updated).forEach(k => {
        if (k.startsWith(prefix)) delete updated[k];
      });
      setDialogAnswers(updated);
      localStorage.setItem('seiu-answers', JSON.stringify(updated));
    }
  };

  // Filter items
  const getFilteredTranslations = (): MasterTranslationItem[] => {
    return MASTER_DATA.translate.filter(item => {
      const matchSearch = searchTerm === '' || 
        item.g.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.vi.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.ko.toLowerCase().includes(searchTerm.toLowerCase());
      const matchFilter = filterGroup === '' || item.g === filterGroup;
      return matchSearch && matchFilter;
    });
  };

  const getFilteredDialogs = (): MasterDialogItem[] => {
    return MASTER_DATA.dialog.filter(item => {
      const textMatch = searchTerm === '' || 
        item.lines.some(l => l.txt.toLowerCase().includes(searchTerm.toLowerCase())) ||
        item.qs.some(q => q.q.toLowerCase().includes(searchTerm.toLowerCase()));
      const groupMatch = filterGroup === '' || item.grp === filterGroup;
      return textMatch && groupMatch;
    });
  };

  const getFilteredShorts = (): MasterShortItem[] => {
    return MASTER_DATA.short.filter(item => {
      const textMatch = searchTerm === '' || 
        item.lines.some(l => l.txt.toLowerCase().includes(searchTerm.toLowerCase())) ||
        item.qs.some(q => q.opts.some(o => o.toLowerCase().includes(searchTerm.toLowerCase())));
      const groupMatch = filterGroup === '' || item.grp === filterGroup;
      return textMatch && groupMatch;
    });
  };

  // All tests aggregator (including full 70-question mocks and reading full)
  const allTests: MasterExam[] = [
    ...MASTER_DATA.mocks,
    ...MASTER_DATA.exams,
    ...MASTER_DATA.groups,
    ...MASTER_DATA.reads
  ];

  const currentExam = allTests.find(e => e.id === selectedExamId);

  // ---------- Link chia sẻ bài thi & cổng nhập thông tin học viên ----------

  /** Địa chỉ gửi cho học viên: https://tienghanseiu.com/#test/mock1 */
  const buildTestLink = (testId: string): string =>
    `${window.location.origin}${window.location.pathname}#test/${testId}`;

  const handleCopyTestLink = (e: React.MouseEvent, testId: string) => {
    e.stopPropagation();
    const link = buildTestLink(testId);
    const done = () => {
      setCopiedTestId(testId);
      setTimeout(() => setCopiedTestId(null), 2200);
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(link).then(done, () => window.prompt('Sao chép link này:', link));
    } else {
      window.prompt('Sao chép link này:', link);
    }
  };

  /** Mở bài thi — bắt buộc có thông tin học viên trước khi làm bài */
  const openTest = (testId: string) => {
    stopAllExamAudio();
    window.open(buildTestLink(testId), '_blank', 'noopener,noreferrer');
  };

  const handleGateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = gateName.trim();
    const phone = gatePhone.replace(/[^0-9+]/g, '');
    const target = gateForTestId;
    const targetTest = allTests.find(test => test.id === target);
    if (name.length < 2 || phone.replace(/\D/g, '').length < 8 || !target || !targetTest) return;

    setRegistrationState('sending');
    const registration = await registerExamStudent({
      studentName: name,
      studentPhone: phone,
      goal: gateGoal,
      testId: targetTest.id,
      testTitle: targetTest.title,
      testKind: targetTest.kind,
    });
    const identity: StudentIdentity = {
      name,
      phone,
      goal: gateGoal,
      registrationId: registration.id,
    };
    saveStudentIdentity(identity);
    setStudent(identity);
    setRegistrationState(registration.syncStatus === 'synced' ? 'saved' : 'pending');

    stopAllExamAudio();
    setGateForTestId(null);
    setSelectedExamId(target);
    if (!submittedExams[target]) setExamStartTime(Date.now());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleChangeStudent = () => {
    stopAllExamAudio();
    clearStudentIdentity();
    setStudent(null);
    setSelectedExamId(null);
    setRegistrationState('idle');
  };

  /** Mở thẳng bài thi khi học viên bấm vào link được chia sẻ */
  useEffect(() => {
    if (!shareTestId) return;
    if (!allTests.some(t => t.id === shareTestId)) return;
    stopAllExamAudio();
    setActiveTab('exam');
    const savedStudent = getStudentIdentity();
    if (savedStudent) {
      setGateName(savedStudent.name);
      setGatePhone(savedStudent.phone);
      setGateGoal(savedStudent.goal);
    }
    setSelectedExamId(null);
    setGateForTestId(shareTestId);
    setRegistrationState('idle');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shareTestId]);

  /** Nút sao chép link dùng chung cho mọi thẻ bài thi */
  const ShareLinkButton: React.FC<{ testId: string; tone?: string; compactOnMobile?: boolean }> = ({
    testId,
    tone = 'text-stone-500',
    compactOnMobile = false,
  }) => (
    <button
      type="button"
      onClick={e => handleCopyTestLink(e, testId)}
      title="Sao chép link gửi cho học viên vào thi"
      className={`inline-flex shrink-0 items-center justify-center gap-1 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 hover:border-stone-300 text-[11px] font-bold transition-colors ${compactOnMobile ? 'h-9 w-9 p-0 sm:h-auto sm:w-auto sm:px-2 sm:py-1' : 'px-2 py-1'} ${
        copiedTestId === testId ? 'text-emerald-600 border-emerald-300' : tone
      }`}
    >
      {copiedTestId === testId ? <Check className="w-3.5 h-3.5" /> : <Link2 className="w-3.5 h-3.5" />}
      <span className={compactOnMobile ? 'sr-only sm:not-sr-only' : ''}>
        {copiedTestId === testId ? 'Đã chép link' : 'Chia sẻ'}
      </span>
    </button>
  );

  // Submit Exam
  const handleSubmitExam = () => {
    if (!currentExam) return;
    let right = 0;
    let answered = 0;
    let score = 0;
    let maxScore = 0;
    currentExam.blocks.forEach((b, bIdx) => {
      b.qs.forEach((q, qIdx) => {
        const questionPoints = getTopikQuestionPoints(Number(q.no));
        maxScore += questionPoints;
        const key = buildExamAnswerKey(currentExam.id, bIdx, qIdx);
        const picked = examAnswers[key];
        if (picked !== undefined) {
          answered++;
          if (picked === Number(q.ans)) {
            right++;
            score += questionPoints;
          }
        }
      });
    });

    const total = currentExam.blocks.reduce((sum, block) => sum + block.qs.length, 0);
    if (answered < total) {
      if (!confirm(`Bạn còn ${total - answered} câu chưa làm. Bạn có muốn nộp bài luôn không?`)) {
        return;
      }
    }

    stopAllExamAudio();

    const subData = {
      time: examTimerStr,
      right,
      total,
      score,
      maxScore,
    };

    const newSubs = { ...submittedExams, [currentExam.id]: subData };
    setSubmittedExams(newSubs);
    localStorage.setItem('seiu-exam-sub', JSON.stringify(newSubs));
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Gửi kết quả + thông tin học viên về trung tâm
    if (student) {
      setSendState('sending');
      const durationSec = examStartTime ? Math.round((Date.now() - examStartTime) / 1000) : 0;
      submitExamResult(student, {
        testId: currentExam.id,
        testTitle: currentExam.title,
        testKind: currentExam.kind,
        correct: right,
        total,
        score,
        maxScore,
        durationSec
      }).then(ok => setSendState(ok ? 'sent' : 'error'));
    }
  };

  const handleRetakeExam = (examId: string) => {
    stopAllExamAudio();
    const newExams = { ...examAnswers };
    const prefix = `${examId}|`;
    Object.keys(newExams).forEach(k => {
      if (k.startsWith(prefix)) delete newExams[k];
    });
    setExamAnswers(newExams);
    localStorage.setItem('seiu-exam', JSON.stringify(newExams));

    const newSubs = { ...submittedExams };
    delete newSubs[examId];
    setSubmittedExams(newSubs);
    localStorage.setItem('seiu-exam-sub', JSON.stringify(newSubs));

    setExamStartTime(Date.now());
    setExamTimerStr('00:00');
    setSendState('idle');
  };

  // Helper wait with token cancellation check
  const waitAsync = (ms: number, token: number): Promise<boolean> => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(token === seqTokenRef.current);
      }, ms);
    });
  };

  const playSpeechLinesOnce = async (
    sourceLines: ExamSpeechLine[],
    token: number,
    gapMs = 420,
  ): Promise<boolean> => {
    const lines = expandExamSpeechLines(sourceLines);
    for (const line of lines) {
      if (token !== seqTokenRef.current) return false;
      await playExamSpeechLine(line.tts, line.sp, token);
      const stillActive = await waitAsync(gapMs, token);
      if (!stillActive) return false;
    }
    return token === seqTokenRef.current;
  };

  // Play a single block twice with exam standard rules:
  // (1) Đọc lần 1 -> (2) nghỉ 2s -> (3) "다시 들으십시오" -> (4) nghỉ 2s -> (5) đọc lần 2
  const playBlockStandardTwice = async (
    lines: { tts: string; sp?: string; txt?: string }[], 
    token: number,
    onProgress?: (status: string) => void
  ): Promise<boolean> => {
    if (token !== seqTokenRef.current || lines.length === 0) return false;

    // Lần 1 — tự đổi giọng theo 남/여 ở từng lượt thoại.
    onProgress?.('Đang đọc lần 1...');
    const firstPassOk = await playSpeechLinesOnce(lines, token);
    if (!firstPassOk) return false;

    if (token !== seqTokenRef.current) return false;

    // Wait 3 seconds
    onProgress?.('Nghỉ 2s trước khi nhắc lại...');
    const wait1 = await waitAsync(2000, token);
    if (!wait1 || token !== seqTokenRef.current) return false;

    // Say "다시 들으십시오."
    onProgress?.('🔊 다시 들으십시오 (Hãy nghe lại)');
    await playExamSpeechLine('다시 들으십시오.', '여자', token);

    // Wait 3 seconds
    onProgress?.('Nghỉ 2s trước khi đọc lần 2...');
    const wait2 = await waitAsync(2000, token);
    if (!wait2 || token !== seqTokenRef.current) return false;

    // Lần 2 — giữ nguyên thứ tự và đúng vai nam/nữ.
    onProgress?.('Đang đọc lần 2...');
    const secondPassOk = await playSpeechLinesOnce(lines, token);
    if (!secondPassOk) return false;

    return token === seqTokenRef.current;
  };

  // Play individual block (either 2 times standard or 1 time quick)
  const handlePlayBlockAudio = (block: any, twice: boolean = true) => {
    stopAllExamAudio();
    const token = ++seqTokenRef.current;

    const lines = block.lines || [];
    if (lines.length === 0) return;

    if (!twice) {
      void playSpeechLinesOnce(lines, token, 300);
      return;
    }

    playBlockStandardTwice(lines, token);
  };

  // Whole Exam Sequential Audio Player
  const handlePlayWholeExam = async () => {
    if (isPlayingSequence) {
      stopAllExamAudio();
      return;
    }

    if (!currentExam) return;
    const blocksWithAudio = currentExam.blocks
      .map((block, originalIndex) => ({ block, originalIndex }))
      .filter(item => item.block.lines && item.block.lines.length > 0);
    if (blocksWithAudio.length === 0) return;

    // Chặn một file nghe lẻ hoặc yêu cầu TTS cũ chạy chồng lên chuỗi toàn đề.
    stopAllExamAudio();
    setIsPlayingSequence(true);
    const myToken = ++seqTokenRef.current;

    for (let bIdx = 0; bIdx < blocksWithAudio.length; bIdx++) {
      if (myToken !== seqTokenRef.current) break;

      const { block, originalIndex } = blocksWithAudio[bIdx];
      setCurrentAudioIndex(originalIndex);
      const lines = block.lines || [];

      // Đọc 2 lần, chen "다시 들으십시오" giữa hai lần
      const ok = await playBlockStandardTwice(lines, myToken, status => {
        setAudioStatusText(`${block.label}: ${status}`);
      });

      if (!ok || myToken !== seqTokenRef.current) break;

      // Khoảng lặng 12 giây giữa hai câu, đúng như đề thi thật
      if (bIdx < blocksWithAudio.length - 1) {
        setAudioStatusText(`Hoàn thành ${block.label}. Khoảng nghỉ làm bài (12s)...`);
        for (let sec = 12; sec > 0; sec--) {
          if (myToken !== seqTokenRef.current) break;
          setCountdownSecs(sec);
          await waitAsync(1000, myToken);
        }
        setCountdownSecs(0);
      }
    }

    if (myToken === seqTokenRef.current) {
      setIsPlayingSequence(false);
      setCurrentAudioIndex(-1);
      setAudioStatusText('Đã hoàn thành toàn bộ phần nghe đề thi.');
    }
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-clip bg-[#F7F6F2] text-stone-900 font-sans pb-24 selection:bg-red-500 selection:text-white">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs">
        <div className={`max-w-6xl mx-auto flex items-center justify-between ${focusMode ? 'px-3 py-2 gap-2' : 'px-4 pt-3 pb-2 flex-wrap gap-3'}`}>
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            <button
              onClick={() => {
                stopAllExamAudio();
                onBackToHome();
              }}
              title="Về trang chủ"
              aria-label="Về trang chủ"
              className={`shrink-0 rounded-xl bg-stone-100 hover:bg-red-50 hover:text-red-600 text-stone-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-all border border-stone-200 ${focusMode ? 'h-9 w-9 p-0 sm:h-auto sm:w-auto sm:p-2' : 'p-2'}`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span className={focusMode ? 'sr-only sm:not-sr-only' : ''}>Về trang chủ</span>
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="flex min-w-0 items-center gap-2 font-extrabold text-base sm:text-xl text-stone-900 tracking-tight">
                <span className="min-w-0 truncate">{focusMode ? (currentExam?.title || allTests.find(t => t.id === gateForTestId)?.title || 'Bài kiểm tra TOPIK') : 'Học Tiếng Hàn — TOPIK Master'}</span>
                <span className={`shrink-0 text-xs bg-red-600 text-white font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${focusMode ? 'hidden sm:inline-flex' : ''}`}>
                  SEIU Master
                </span>
              </h1>
              <p className="text-[11px] text-stone-500 hidden sm:block">
                {focusMode ? 'Không gian làm bài tập trung · Đăng ký và kết quả được lưu tự động' : 'Đề thi Nghe & Đọc đủ 70 câu được ưu tiên · 1.556 câu thực chiến · Chấm điểm tự động'}
              </p>
            </div>
          </div>

          {!focusMode && <div className="flex items-center gap-2">
            <button
              onClick={handleTestAudio}
              className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-semibold border border-stone-300 flex items-center gap-1.5"
              title="Nghe thử MP3 AI lần lượt bằng giọng nữ và giọng nam tiếng Hàn"
            >
              <Volume2 className="w-3.5 h-3.5 text-red-600" />
              <span className="hidden sm:inline">Thử MP3 AI nữ/nam</span>
            </button>

            {onOpenConsultation && (
              <button
                onClick={onOpenConsultation}
                className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                <span>Nhận Lộ Trình 1:1</span>
              </button>
            )}
          </div>}
        </div>

        {/* Navigation Tabs (Including 3 new Vocabulary Sub-pages) */}
        {!focusMode && <div className="max-w-6xl mx-auto px-4 flex items-center gap-1 sm:gap-2 overflow-x-auto border-t border-stone-100 no-scrollbar py-1">
          {[
            { id: 'exam', label: '🏆 Đề Thi Nghe & Đọc 70 Câu', icon: Award, highlight: true },
            { id: 'vocab1', label: '📖 Từ Vựng 1', icon: BookOpen, highlight: true },
            { id: 'vocab2', label: '🎯 Từ Vựng 2 (322 từ)', icon: BookOpen, highlight: true },
            { id: 'vocab3', label: '🚀 Từ Vựng 3 (419 từ)', icon: BookOpen, highlight: true },
            { id: 'translate', label: 'Dịch Việt → Hàn', icon: FileText, highlight: false },
            { id: 'dialog', label: 'Hội thoại 15–30', icon: Layers, highlight: false },
            { id: 'short', label: 'Câu ngắn 1–14', icon: CheckCircle2, highlight: false },
            { id: 'tips', label: 'Mẹo & 31 Ngữ pháp', icon: HelpCircle, highlight: false }
          ].map(t => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => {
                  stopAllExamAudio();
                  setActiveTab(t.id as any);
                  setSelectedExamId(null);
                }}
                className={`py-2 px-2.5 sm:px-3 text-xs sm:text-sm font-bold rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-red-600 text-white shadow-xs'
                    : t.highlight
                    ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                    : 'bg-stone-50 text-stone-600 hover:bg-stone-100 hover:text-stone-900 border border-stone-200'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : t.highlight ? 'text-red-600' : 'text-stone-400'}`} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>}
      </header>

      {/* Control Bar for Audio & Filters */}
      {!focusMode && <div className="bg-white border-b border-stone-200 py-3 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Search and Filters */}
          <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
            {activeTab !== 'exam' && !activeTab.startsWith('vocab') && (
              <>
                <div className="relative flex-1 min-w-[180px]">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Tìm từ vựng, ngữ pháp, số đề..."
                    className="w-full pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>

                <select
                  value={filterGroup}
                  onChange={e => setFilterGroup(e.target.value)}
                  className="py-1.5 px-3 bg-stone-50 border border-stone-200 rounded-lg text-xs font-medium focus:outline-none"
                >
                  <option value="">Tất cả phân loại</option>
                  {activeTab === 'translate' && 
                    Array.from(new Set(MASTER_DATA.translate.map(t => t.g))).map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))
                  }
                  {(activeTab === 'dialog' || activeTab === 'short') &&
                    Array.from(new Set([...MASTER_DATA.dialog, ...MASTER_DATA.short].map(t => t.grp))).map(grp => (
                      <option key={grp} value={grp}>Nhóm {grp}</option>
                    ))
                  }
                </select>
              </>
            )}
          </div>

          {/* Speed & Toggles */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 text-[11px] text-stone-500 font-bold mr-1">
              <span>Tốc độ đọc:</span>
            </div>
            <div className="flex items-center bg-stone-100 rounded-lg p-0.5 border border-stone-200">
              {[0.75, 0.85, 0.95, 1.0].map(r => (
                <button
                  key={r}
                  onClick={() => setPlaybackRate(r)}
                  className={`px-2 py-1 rounded text-[11px] font-bold transition-colors ${
                    playbackRate === r ? 'bg-stone-900 text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                  title={r === 0.85 ? 'Tốc độ thi chuẩn, tự nhiên và rõ ràng' : undefined}
                >
                  {r}x {r === 0.85 ? '★' : ''}
                </button>
              ))}
            </div>

            {voices.length > 0 && (
              <div className="flex items-center gap-1 rounded-xl border border-stone-200 bg-stone-50 p-1">
                <span className="pl-1 text-[9px] font-bold text-stone-400">Dự phòng</span>
                <span className="pl-1 text-[10px] font-black text-rose-600">여</span>
                <select
                  aria-label="Chọn giọng nữ tiếng Hàn"
                  value={femaleVoiceURI}
                  onChange={e => {
                    setFemaleVoiceURI(e.target.value);
                    localStorage.setItem('seiu-ko-female-voice', e.target.value);
                  }}
                  className="max-w-[118px] bg-transparent py-1 text-[11px] font-semibold text-stone-700 outline-none"
                >
                  {voices.map(v => <option key={`female-${v.voiceURI}`} value={v.voiceURI}>{FEMALE_VOICE_HINTS.test(v.name) ? '★ ' : ''}{v.name}</option>)}
                </select>
                <span className="border-l border-stone-200 pl-2 text-[10px] font-black text-blue-700">남</span>
                <select
                  aria-label="Chọn giọng nam tiếng Hàn"
                  value={maleVoiceURI}
                  onChange={e => {
                    setMaleVoiceURI(e.target.value);
                    localStorage.setItem('seiu-ko-male-voice', e.target.value);
                  }}
                  className="max-w-[118px] bg-transparent py-1 text-[11px] font-semibold text-stone-700 outline-none"
                >
                  {voices.map(v => <option key={`male-${v.voiceURI}`} value={v.voiceURI}>{MALE_VOICE_HINTS.test(v.name) ? '★ ' : ''}{v.name}</option>)}
                </select>
              </div>
            )}

            {!activeTab.startsWith('vocab') && (
              <>
                <button
                  onClick={() => setShowAllAnswers(!showAllAnswers)}
                  className={`px-2.5 py-1.5 rounded-lg border font-semibold text-[11px] flex items-center gap-1 transition-colors ${
                    showAllAnswers 
                      ? 'bg-amber-50 border-amber-300 text-amber-800' 
                      : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <span>{showAllAnswers ? 'Ẩn đáp án' : 'Hiện sẵn đáp án'}</span>
                </button>

                <button
                  onClick={() => setHideKorean(!hideKorean)}
                  className={`px-2.5 py-1.5 rounded-lg border font-semibold text-[11px] flex items-center gap-1 transition-colors ${
                    hideKorean 
                      ? 'bg-red-50 border-red-300 text-red-700' 
                      : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  {hideKorean ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{hideKorean ? 'Bỏ làm mờ' : 'Làm mờ tiếng Hàn'}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>}

      {/* Main Container */}
      <main className={`${activeTab === 'exam' && selectedExamId ? 'max-w-[1280px] pt-2 sm:pt-6' : 'max-w-6xl pt-6'} mx-auto w-full min-w-0 max-w-full overflow-x-clip px-2.5 sm:px-4`}>
        {/* SUB-PAGE: VOCABULARY 1 */}
        {activeTab === 'vocab1' && (
          <TopikVocabQuizModule
            initialSetId={1}
            speakText={speakText}
            onBackToMaster={() => setActiveTab('exam')}
          />
        )}

        {/* SUB-PAGE: VOCABULARY 2 */}
        {activeTab === 'vocab2' && (
          <TopikVocabQuizModule
            initialSetId={2}
            speakText={speakText}
            onBackToMaster={() => setActiveTab('exam')}
          />
        )}

        {/* SUB-PAGE: VOCABULARY 3 */}
        {activeTab === 'vocab3' && (
          <TopikVocabQuizModule
            initialSetId={3}
            speakText={speakText}
            onBackToMaster={() => setActiveTab('exam')}
          />
        )}

        {/* TAB 2: TRANSLATE VIET -> KOREAN */}
        {activeTab === 'translate' && (
          <div className="space-y-4">
            <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between">
              <span className="font-bold text-xs text-stone-700">
                Hiển thị <strong>{getFilteredTranslations().length}</strong> câu dịch phản xạ
              </span>
              <button
                onClick={() => {
                  if (Object.keys(revealedTranslates).length > 0) {
                    setRevealedTranslates({});
                  } else {
                    const all: Record<number, boolean> = {};
                    MASTER_DATA.translate.forEach(t => { all[t.n] = true; });
                    setRevealedTranslates(all);
                  }
                }}
                className="text-xs text-red-600 hover:text-red-700 font-bold"
              >
                {Object.keys(revealedTranslates).length > 0 ? 'Ẩn tất cả đáp án' : 'Hiện tất cả đáp án'}
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {getFilteredTranslations().map(item => {
                const isRevealed = revealedTranslates[item.n];
                return (
                  <div
                    key={item.n}
                    className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-3 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-mono text-stone-400 font-bold">#{item.n}</span>
                        <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                          {item.g}
                        </span>
                      </div>
                      <p className="font-bold text-stone-900 text-sm">{item.vi}</p>
                    </div>

                    <div className="pt-2 border-t border-stone-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => setRevealedTranslates(prev => ({ ...prev, [item.n]: !prev[item.n] }))}
                          className="text-xs text-stone-500 hover:text-stone-900 font-semibold flex items-center gap-1"
                        >
                          {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          <span>{isRevealed ? 'Ẩn tiếng Hàn' : 'Xem câu tiếng Hàn'}</span>
                        </button>

                        <button
                          onClick={() => speakText(item.ko)}
                          className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                          title="Nghe câu tiếng Hàn"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>

                      {isRevealed && (
                        <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200">
                          <p className={`font-serif text-stone-800 text-sm font-bold ${hideKorean ? 'blur-sm select-none' : ''}`}>
                            {item.ko}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: DIALOGUES 15–30 */}
        {activeTab === 'dialog' && (
          <div className="space-y-4">
            <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between">
              <span className="font-bold text-xs text-stone-700">
                Luyện tập <strong>{getFilteredDialogs().length}</strong> đoạn hội thoại nghe
              </span>
              <button
                onClick={resetAllAnswers}
                className="text-xs text-stone-500 hover:text-red-600 font-bold flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Làm lại từ đầu</span>
              </button>
            </div>

            <div className="space-y-4">
              {getFilteredDialogs().map((item, idx) => (
                <div
                  key={idx}
                  className="p-5 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-4"
                >
                  <div className="flex items-center justify-between text-xs border-b border-stone-100 pb-2">
                    <span className="font-bold text-stone-900">
                      {item.de.startsWith('Bộ') ? item.de : `Đề ${item.de}`} · {item.cau}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                        Nhóm {item.grp}
                      </span>
                      <button
                        onClick={() => handlePlayBlockAudio(item, true)}
                        className="px-2.5 py-1 rounded-lg bg-red-600 text-white font-bold text-xs flex items-center gap-1 hover:bg-red-700"
                        title="Nghe 2 lần chuẩn thi (có 2s nghỉ + 다시 들으십시오)"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Nghe 2 lần (Chuẩn thi)</span>
                      </button>
                    </div>
                  </div>

                  {/* Lines dialogue */}
                  <div className="space-y-2 bg-stone-50 p-3 rounded-xl border border-stone-200/70 text-xs sm:text-sm">
                    {item.lines.map((line, lIdx) => (
                      <div key={lIdx} className="flex items-start gap-2">
                        <span className="font-bold font-mono text-red-600 shrink-0">{line.sp}:</span>
                        <button
                          onClick={() => void playExamSpeechLine(line.tts, line.sp)}
                          className="p-0.5 text-stone-400 hover:text-red-600 shrink-0"
                          title="Nghe dòng này"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                        <p className={`font-serif text-stone-800 leading-relaxed ${hideKorean ? 'blur-sm select-none' : ''}`}>
                          {line.txt}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Question and Options */}
                  {item.qs.map((q, qIdx) => {
                    const key = `dialog|${item.grp}|${item.de}|${item.cau}|${qIdx}`;
                    const picked = dialogAnswers[key];
                    const correctAns = Number(q.ans);
                    const optionImages = q.optionImages || getTopikPictureOptions(item.de, item.cau);

                    return (
                      <div key={qIdx} className="space-y-2.5 pt-2">
                        <p className="font-bold text-xs text-stone-900">{q.q}</p>
                        <div className={`grid gap-2 ${optionImages ? 'grid-cols-2' : 'sm:grid-cols-2'}`}>
                          {q.opts.map((opt, oIdx) => {
                            const optNum = oIdx + 1;
                            const isPicked = picked === optNum;
                            const isCorrect = correctAns === optNum;
                            const showStatus = showAllAnswers || picked !== undefined;

                            let btnStyle = 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100';
                            if (showStatus) {
                              if (isCorrect) btnStyle = 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold';
                              else if (isPicked) btnStyle = 'bg-red-50 border-red-400 text-red-900 line-through';
                            } else if (isPicked) {
                              btnStyle = 'bg-red-50 border-red-500 text-red-700 font-bold';
                            }

                            return (
                              <button
                                key={oIdx}
                                type="button"
                                onClick={() => handleSelectQuizOption(key, optNum)}
                                aria-pressed={isPicked}
                                aria-label={optionImages?.[oIdx] ? `Chọn tranh ${optNum}` : undefined}
                                className={`${optionImages ? 'relative overflow-hidden p-1 sm:p-2' : 'p-3 text-left flex items-start gap-2'} rounded-xl border text-xs transition-all ${btnStyle}`}
                              >
                                {optionImages?.[oIdx] ? (
                                  <>
                                    <img
                                      src={optionImages[oIdx]}
                                      alt={`Tranh lựa chọn ${optNum}`}
                                      className="block w-full h-auto rounded-lg bg-white"
                                      loading="lazy"
                                    />
                                    <span className="sr-only">{opt}</span>
                                    {showStatus && isCorrect && <CheckCircle2 className="absolute right-2 top-2 w-6 h-6 rounded-full bg-white text-emerald-600 shadow-sm" />}
                                    {showStatus && isPicked && !isCorrect && <XCircle className="absolute right-2 top-2 w-6 h-6 rounded-full bg-white text-red-600 shadow-sm" />}
                                  </>
                                ) : (
                                  <>
                                    <span className="font-bold font-mono text-stone-400">{oIdx + 1}.</span>
                                    <span className={`flex-1 ${/[가-힣]/.test(opt) && hideKorean ? 'blur-sm' : ''}`}>
                                      {opt}
                                    </span>
                                    {showStatus && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                                    {showStatus && isPicked && !isCorrect && <XCircle className="w-4 h-4 text-red-600 shrink-0" />}
                                  </>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: SHORT QUESTIONS 1–14 */}
        {activeTab === 'short' && (
          <div className="space-y-4">
            <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between">
              <span className="font-bold text-xs text-stone-700">
                Luyện tập <strong>{getFilteredShorts().length}</strong> câu ngắn (Dạng 1-4, 5-6, 7-10, 11-14)
              </span>
              <button
                onClick={resetAllAnswers}
                className="text-xs text-stone-500 hover:text-red-600 font-bold flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Làm lại từ đầu</span>
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {getFilteredShorts().map((item, idx) => {
                const key = `short|${item.grp}|${item.de}|${item.cau}|0`;
                const picked = dialogAnswers[key];
                const q = item.qs[0];
                const correctAns = Number(q?.ans);

                return (
                  <div
                    key={idx}
                    className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-3 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="font-bold text-stone-900">
                          {item.de.startsWith('Bộ') ? item.de : `Đề ${item.de}`} · Câu {item.cau}
                        </span>
                        <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                          Nhóm {item.grp}
                        </span>
                      </div>

                      {/* Audio Line */}
                      <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200/70 flex items-center gap-2 text-xs sm:text-sm">
                        <button
                          onClick={() => handlePlayBlockAudio(item, true)}
                          className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-600 hover:text-white text-red-600 flex items-center justify-center shrink-0 border border-red-200 transition-colors"
                          title="Nghe 2 lần (chuẩn thi)"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                        <p className={`font-serif text-stone-800 font-bold ${hideKorean ? 'blur-sm' : ''}`}>
                          {item.lines[0]?.txt}
                        </p>
                      </div>

                      {/* Options */}
                      <div className="space-y-1.5 mt-3">
                        {q?.opts.map((opt, oIdx) => {
                          const optNum = oIdx + 1;
                          const isPicked = picked === optNum;
                          const isCorrect = correctAns === optNum;
                          const showStatus = showAllAnswers || picked !== undefined;

                          let btnStyle = 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100';
                          if (showStatus) {
                            if (isCorrect) btnStyle = 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold';
                            else if (isPicked) btnStyle = 'bg-red-50 border-red-400 text-red-900 line-through';
                          } else if (isPicked) {
                            btnStyle = 'bg-red-50 border-red-500 text-red-700 font-bold';
                          }

                          return (
                            <button
                              key={oIdx}
                              type="button"
                              onClick={() => handleSelectQuizOption(key, optNum)}
                              aria-pressed={isPicked}
                              className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between gap-2 ${btnStyle}`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-stone-400">{oIdx + 1}.</span>
                                <span className={/[가-힣]/.test(opt) && hideKorean ? 'blur-sm' : ''}>{opt}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 5: EXAM RUNNER & 70-QUESTION TESTS */}
        {activeTab === 'exam' && gateForTestId && (
          /* CỔNG NHẬP THÔNG TIN — bắt buộc trước khi vào thi */
          <div className="max-w-lg mx-auto">
            <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-red-600 to-rose-700 px-6 py-5 text-white">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-100">
                  <UserCheck className="w-4 h-4" />
                  <span>Trung Tâm Hàn Ngữ SEIU</span>
                </div>
                <h2 className="text-xl font-black mt-1">Nhập thông tin để bắt đầu làm bài</h2>
                <p className="text-xs text-red-100 mt-1">
                  {allTests.find(t => t.id === gateForTestId)?.title || 'Bài kiểm tra'} ·{' '}
                  {allTests.find(t => t.id === gateForTestId)?.n || 0} câu
                </p>
              </div>

              <form onSubmit={handleGateSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-1">
                    Họ và tên học viên *
                  </label>
                  <input
                    type="text"
                    required
                    minLength={2}
                    value={gateName}
                    onChange={e => setGateName(e.target.value)}
                    placeholder="Ví dụ: Nguyễn Thảo Vy"
                    className="w-full text-sm px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-1">
                    Số điện thoại / Zalo *
                  </label>
                  <input
                    type="tel"
                    required
                    minLength={8}
                    value={gatePhone}
                    onChange={e => setGatePhone(e.target.value)}
                    placeholder="Ví dụ: 0972249450"
                    className="w-full text-sm px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-2">
                    Mục tiêu học tiếng Hàn *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {GOAL_OPTIONS.map(g => (
                      <button
                        key={g.value}
                        type="button"
                        onClick={() => setGateGoal(g.value)}
                        className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                          gateGoal === g.value
                            ? 'bg-red-600 border-red-600 text-white shadow-sm'
                            : 'bg-white border-stone-200 text-stone-700 hover:border-red-300'
                        }`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={registrationState === 'sending'}
                  className="w-full py-3.5 rounded-xl bg-stone-900 hover:bg-stone-800 disabled:cursor-wait disabled:opacity-70 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  {registrationState === 'sending' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  <span>{registrationState === 'sending' ? 'Đang ghi nhận đăng ký thi…' : 'Bắt đầu làm bài'}</span>
                </button>

                <p className="text-[11px] text-stone-400 text-center leading-relaxed">
                  Tên và số điện thoại được ghi vào mục Đăng ký thi ngay khi bắt đầu. Sau khi nộp, điểm sẽ tự ghép vào mục Kết quả thi và Bảng thành tích.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    stopAllExamAudio();
                    if (focusMode) onBackToHome();
                    else setGateForTestId(null);
                  }}
                  className="w-full text-[11px] text-stone-400 hover:text-stone-600 underline"
                >
                  {focusMode ? 'Về trang chủ' : 'Quay lại danh sách đề'}
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'exam' && !gateForTestId && (
          <div>
            {student && (
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-white rounded-xl border border-stone-200 text-xs">
                <span className="flex items-center gap-1.5 text-stone-700 font-semibold">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  {student.name} · {student.phone} ·{' '}
                  {GOAL_OPTIONS.find(g => g.value === student.goal)?.label || student.goal}
                  {registrationState === 'saved' && <span className="ml-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-black text-emerald-700">Đã ghi nhận đăng ký thi</span>}
                  {registrationState === 'pending' && <span className="ml-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-black text-amber-700">Đã lưu, chờ đồng bộ</span>}
                </span>
                <button
                  onClick={handleChangeStudent}
                  className="inline-flex items-center gap-1 text-stone-400 hover:text-red-600 font-bold"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Đổi người làm bài</span>
                </button>
              </div>
            )}
            {!selectedExamId ? (
              <div className="space-y-3 sm:space-y-6">
                <div className="p-5 bg-white rounded-2xl border border-stone-200 shadow-xs">
                  <h2 className="text-lg font-bold text-stone-900">Thư Viện Đề Thi Thử Toàn Phần & Đọc Trọn Vẹn Đến Câu 70</h2>
                  <p className="text-xs text-stone-500 mt-1">
                    Cơ chế nghe 2 lần chuẩn đề thi thật (Nghỉ 2s ➔ 🔊 "다시 들으십시오" ➔ Nghỉ 2s ➔ Lặp lại ➔ 12s chuyển câu). Trọn bộ 238 câu nghe và 291 câu đọc trích từ 10 đề thi thật.
                  </p>
                </div>

                {/* Categories */}
                <div className="space-y-6">
                  {/* Full Mock Exams (70 questions) */}
                  <div>
                    <h3 className="font-bold text-xs uppercase tracking-wider text-red-600 mb-3 flex items-center gap-1.5">
                      <Award className="w-4 h-4" />
                      Đề Thi Thử Toàn Diện (Nghe 1–30 & Đọc 31–70 — Đủ 70 Câu)
                    </h3>
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {MASTER_DATA.mocks.map(exam => {
                        const sub = submittedExams[exam.id];
                        return (
                          <div
                            key={exam.id}
                            onClick={() => openTest(exam.id)}
                            className="p-4 bg-white rounded-2xl border border-stone-200 hover:border-red-500 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between"
                          >
                            <div>
                              <span className="text-[10px] font-bold uppercase bg-red-50 text-red-700 px-2 py-0.5 rounded">
                                Full 70 Câu Chuẩn Đề Thật
                              </span>
                              <h4 className="font-bold text-stone-900 text-sm mt-2">{exam.title}</h4>
                              <p className="text-xs text-stone-500 mt-0.5">{exam.sub} · {exam.n || exam.blocks.length} câu</p>
                            </div>

                            <div className="mt-4 pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                              {sub ? (
                                <span className="font-bold text-emerald-600 flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Đạt {sub.score ?? sub.right}/{sub.maxScore ?? sub.total} điểm
                                </span>
                              ) : (
                                <span className="text-stone-400 font-medium">Chưa làm</span>
                              )}
                              <span className="font-bold text-red-600">Làm ngay →</span>
                            </div>

                            <div className="mt-2 flex items-center justify-end">
                              <ShareLinkButton testId={exam.id} tone="text-red-600" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Full Reading Section (31-70) */}
                  <div>
                    <h3 className="font-bold text-xs uppercase tracking-wider text-blue-700 mb-3 flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4" />
                      Luyện Đề Đọc TOPIK I (Từ Câu 31 Đến Câu 70)
                    </h3>
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {MASTER_DATA.reads.map(exam => {
                        const sub = submittedExams[exam.id];
                        return (
                          <div
                            key={exam.id}
                            onClick={() => openTest(exam.id)}
                            className="p-4 bg-white rounded-2xl border border-stone-200 hover:border-blue-500 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between"
                          >
                            <div>
                              <span className="text-[10px] font-bold uppercase bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                                Đọc Hiểu
                              </span>
                              <h4 className="font-bold text-stone-900 text-sm mt-2">{exam.title}</h4>
                              <p className="text-xs text-stone-500 mt-0.5">{exam.sub} · {exam.n || exam.blocks.length} câu</p>
                            </div>

                            <div className="mt-4 pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                              {sub ? (
                                <span className="font-bold text-emerald-600 flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  {sub.score ?? sub.right}/{sub.maxScore ?? sub.total} điểm
                                </span>
                              ) : (
                                <span className="text-stone-400">Chưa làm</span>
                              )}
                              <span className="font-bold text-blue-600">Luyện đọc →</span>
                            </div>

                            <div className="mt-2 flex items-center justify-end">
                              <ShareLinkButton testId={exam.id} tone="text-blue-600" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Listening Exam Tests (Đề 37, Đề 41) */}
                  <div>
                    <h3 className="font-bold text-xs uppercase tracking-wider text-stone-600 mb-3 flex items-center gap-1.5">
                      <Radio className="w-4 h-4 text-red-600" />
                      Đề Nghe Thi Thật Từng Kỳ (Nghe 1–30)
                    </h3>
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {MASTER_DATA.exams.map(exam => {
                        const sub = submittedExams[exam.id];
                        return (
                          <div
                            key={exam.id}
                            onClick={() => openTest(exam.id)}
                            className="p-4 bg-white rounded-2xl border border-stone-200 hover:border-red-500 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between"
                          >
                            <div>
                              <span className="text-[10px] font-bold uppercase bg-stone-100 text-stone-700 px-2 py-0.5 rounded">
                                Đề Thi Thật
                              </span>
                              <h4 className="font-bold text-stone-900 text-sm mt-2">{exam.title}</h4>
                              <p className="text-xs text-stone-500 mt-0.5">{exam.sub} · {exam.n || exam.blocks.length} câu</p>
                            </div>

                            <div className="mt-4 pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                              {sub ? (
                                <span className="font-bold text-emerald-600 flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  {sub.score ?? sub.right}/{sub.maxScore ?? sub.total} điểm
                                </span>
                              ) : (
                                <span className="text-stone-400 font-medium">Chưa làm</span>
                              )}
                              <span className="font-bold text-red-600">Làm ngay →</span>
                            </div>

                            <div className="mt-2 flex items-center justify-end">
                              <ShareLinkButton testId={exam.id} tone="text-red-600" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Group Practice */}
                  <div>
                    <h3 className="font-bold text-xs uppercase tracking-wider text-stone-600 mb-3 flex items-center gap-1.5">
                      <Layers className="w-4 h-4" />
                      Luyện Theo Dạng Cụm Câu Nghe (Gộp 10 Đề)
                    </h3>
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {MASTER_DATA.groups.map(exam => {
                        const sub = submittedExams[exam.id];
                        return (
                          <div
                            key={exam.id}
                            onClick={() => openTest(exam.id)}
                            className="p-4 bg-white rounded-2xl border border-stone-200 hover:border-stone-400 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between"
                          >
                            <div>
                              <span className="text-[10px] font-bold uppercase bg-stone-100 text-stone-700 px-2 py-0.5 rounded">
                                Luyện Dạng Câu
                              </span>
                              <h4 className="font-bold text-stone-900 text-sm mt-2">{exam.title}</h4>
                              <p className="text-xs text-stone-500 mt-0.5">{exam.sub} · {exam.n || exam.blocks.length} câu</p>
                            </div>

                            <div className="mt-4 pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                              {sub ? (
                                <span className="font-bold text-emerald-600 flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  {sub.score ?? sub.right}/{sub.maxScore ?? sub.total} điểm
                                </span>
                              ) : (
                                <span className="text-stone-400">Chưa làm</span>
                              )}
                              <span className="font-bold text-stone-700">Luyện tập →</span>
                            </div>

                            <div className="mt-2 flex items-center justify-end">
                              <ShareLinkButton testId={exam.id} tone="text-stone-600" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* ACTIVE EXAM RUNNER */
              <div className="space-y-6">
                {/* Score & Result Banner */}
                {submittedExams[selectedExamId] && (
                  <div className="p-6 bg-gradient-to-r from-stone-900 to-red-950 text-white rounded-2xl shadow-lg border border-red-500/20">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                          Kết Quả Bài Làm
                        </span>
                        <h2 className="text-2xl font-black mt-1">
                          Đạt {submittedExams[selectedExamId].score ?? submittedExams[selectedExamId].right} / {submittedExams[selectedExamId].maxScore ?? submittedExams[selectedExamId].total} điểm (
                          {Math.round(((submittedExams[selectedExamId].score ?? submittedExams[selectedExamId].right) / (submittedExams[selectedExamId].maxScore ?? submittedExams[selectedExamId].total)) * 100)}%)
                        </h2>
                        <p className="text-xs text-stone-300 mt-1">
                          Đúng {submittedExams[selectedExamId].right}/{submittedExams[selectedExamId].total} câu · Thời gian: {submittedExams[selectedExamId].time}
                        </p>
                        {student && (
                          <p className="text-[11px] mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10">
                            {sendState === 'sending' && (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Đang gửi kết quả về trung tâm…</span>
                              </>
                            )}
                            {sendState === 'sent' && (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Đã gửi kết quả của {student.name} về SEIU</span>
                              </>
                            )}
                            {sendState === 'error' && (
                              <>
                                <XCircle className="w-3.5 h-3.5 text-amber-300" />
                                <span>Đã lưu tạm trên máy — hệ thống sẽ tự gửi lại khi có kết nối</span>
                              </>
                            )}
                            {sendState === 'idle' && (
                              <>
                                <Send className="w-3.5 h-3.5" />
                                <span>Bài làm của {student.name}</span>
                              </>
                            )}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRetakeExam(selectedExamId)}
                          className="px-4 py-2 bg-white text-stone-900 hover:bg-stone-100 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Làm lại đề này</span>
                        </button>
                        <button
                          onClick={() => {
                            stopAllExamAudio();
                            setSelectedExamId(null);
                          }}
                          className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-white rounded-xl font-bold text-xs transition-all"
                        >
                          Chọn đề khác
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Exam Toolbar */}
                <div className="topik-exam-toolbar sticky top-[53px] z-30 sm:top-16">
                  <div className="topik-exam-toolbar-summary">
                    <button
                      onClick={() => {
                        stopAllExamAudio();
                        setSelectedExamId(null);
                      }}
                      title="Danh sách đề"
                      aria-label="Danh sách đề"
                      className="flex h-9 w-9 shrink-0 items-center justify-center gap-1 rounded-lg bg-stone-100 p-0 text-xs font-bold text-stone-700 hover:bg-stone-200 sm:h-auto sm:w-auto sm:p-1.5"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span className="sr-only sm:not-sr-only">Danh sách đề</span>
                    </button>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-xs font-bold text-stone-900 sm:text-sm">{currentExam?.title}</h3>
                      <p className="truncate text-[10px] text-stone-500 sm:text-[11px]">{currentExam?.sub}</p>
                    </div>
                    {currentExam && <ShareLinkButton testId={currentExam.id} compactOnMobile />}
                  </div>

                  <div className="topik-exam-toolbar-actions text-xs">
                    {!submittedExams[selectedExamId] && (
                      <div className="topik-exam-timer flex shrink-0 items-center gap-1.5 rounded-xl bg-stone-100 px-2 py-1.5 font-mono font-bold text-stone-700 sm:px-3">
                        <Clock className="w-4 h-4 text-red-600" />
                        <span>{examTimerStr}</span>
                      </div>
                    )}

                    {currentExam?.blocks.some(b => b.lines && b.lines.length > 0) && (
                      <button
                        onClick={handlePlayWholeExam}
                        className={`topik-exam-audio flex shrink-0 items-center justify-center gap-1.5 rounded-xl px-2.5 py-2 text-xs font-bold transition-all sm:px-3 sm:py-1.5 ${
                          isPlayingSequence 
                            ? 'bg-red-600 text-white animate-pulse' 
                            : 'bg-stone-900 text-white hover:bg-red-600'
                        }`}
                        title="MP3 AI tự động đổi giọng nữ/nam, đọc 2 lần + nhắc lại sau 2s + 12s chuyển câu"
                      >
                        {isPlayingSequence ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        <span className="sm:hidden">{isPlayingSequence ? 'Dừng' : 'Nghe'}</span>
                        <span className="hidden sm:inline">{isPlayingSequence ? 'Dừng phát' : 'Phát MP3 AI 여/남 (2 lần / 12s)'}</span>
                      </button>
                    )}

                    {!submittedExams[selectedExamId] ? (
                      <button
                        onClick={handleSubmitExam}
                        className="topik-exam-submit min-w-0 rounded-xl bg-red-600 px-3 py-2 text-xs font-bold text-white shadow-xs transition-all hover:bg-red-700 sm:px-4"
                      >
                        <span className="sm:hidden">Nộp bài</span>
                        <span className="hidden sm:inline">Nộp Bài Chấm Điểm</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRetakeExam(selectedExamId)}
                        className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl transition-all"
                      >
                        Làm lại
                      </button>
                    )}
                  </div>
                </div>

                {/* Status indicator when audio is playing in exam */}
                {isPlayingSequence && (
                  <div className="p-3 bg-red-50 border border-red-300 rounded-2xl flex items-center justify-between text-xs text-red-800 animate-in fade-in">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
                      <span className="font-bold">{audioStatusText || 'Đang phát âm thanh theo chu trình đề thi thật...'}</span>
                    </div>
                    {countdownSecs > 0 && (
                      <span className="font-mono font-black text-sm bg-red-600 text-white px-2.5 py-0.5 rounded-lg">
                        Còn {countdownSecs}s chuyển câu
                      </span>
                    )}
                  </div>
                )}

                {currentExam?.blocks.some(b => b.lines && b.lines.length > 0) && (
                  <p className="px-1 text-[10px] leading-relaxed text-stone-400">
                    Âm thanh nam–nữ được AI tạo ở lần nghe đầu và lưu thành MP3 cho các lần sau. Đây là giọng AI, không phải bản thu chính thức của TOPIK.
                  </p>
                )}

                {/* Exam Questions List */}
                <div className="space-y-4">
                  {currentExam?.blocks.map((block, bIdx) => {
                    const isSubmitted = !!submittedExams[selectedExamId];
                    const hasAudio = block.lines && block.lines.length > 0;
                    const isCurrentlyPlaying = currentAudioIndex === bIdx;

                    return (
                      <div
                        key={bIdx}
                        className={`topik-exam-block transition-all ${
                          isCurrentlyPlaying
                            ? 'is-playing'
                            : ''
                        }`}
                      >
                        <div className="topik-exam-block-head flex flex-wrap items-center justify-between gap-2 sm:gap-3">
                          <div className="flex min-w-0 items-center gap-2">
                            <span className="topik-exam-block-label">{block.label}</span>
                            {isCurrentlyPlaying && (
                              <span className="px-2 py-0.5 bg-red-600 text-white text-[10px] font-black rounded-full uppercase">
                                Đang phát
                              </span>
                            )}
                          </div>
                          {hasAudio && (
                            <div className="flex max-w-full flex-wrap items-center gap-1.5">
                              <button
                                onClick={() => handlePlayBlockAudio(block, true)}
                                className="px-2.5 py-1 bg-red-50 hover:bg-red-600 hover:text-white text-red-600 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors border border-red-200"
                                title="Đọc 2 lần + 2s 다시 들으십시오"
                              >
                                <Volume2 className="w-3.5 h-3.5" />
                                <span>Nghe 2 lần (Chuẩn thi)</span>
                              </button>
                              <button
                                onClick={() => handlePlayBlockAudio(block, false)}
                                className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-semibold"
                                title="Nghe nhanh 1 lần"
                              >
                                1 lần
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Passage text if Reading exam */}
                        {block.text && (
                          <div className="topik-exam-passage whitespace-pre-line">
                            {block.text}
                          </div>
                        )}

                        {/* Questions */}
                        <div className="topik-exam-questions">
                          {block.qs.map((q, qIdx) => {
                            const key = buildExamAnswerKey(selectedExamId, bIdx, qIdx);
                            const picked = examAnswers[key];
                            const correctAns = Number(q.ans);
                            const questionText = q.no ? q.q.replace(/^\s*\d+\s*[.)]\s*/, '') : q.q;
                            const optionImages = q.optionImages;
                            const longestOption = Math.max(...q.opts.map((option) => option.length));
                            const optionGrid = optionImages
                              ? 'is-picture-grid'
                              : longestOption <= 12 && block.qs.length === 1
                              ? 'is-four-column'
                              : longestOption <= 22
                                ? 'is-two-column'
                                : 'is-one-column';

                            return (
                              <div key={qIdx} className="topik-exam-question">
                                <p className="topik-exam-prompt">
                                  {q.no && <span className="topik-exam-question-number">{q.no}.</span>}{questionText}
                                  {q.no && <span className="topik-exam-points">({getTopikQuestionPoints(Number(q.no))}점)</span>}
                                </p>

                                <div className={`topik-exam-options ${optionGrid}`}>
                                  {q.opts.map((opt, oIdx) => {
                                    const optNum = oIdx + 1;
                                    const isPicked = picked === optNum;
                                    const isCorrect = correctAns === optNum;

                                    let btnStyle = 'is-idle';
                                    if (isSubmitted) {
                                      if (isCorrect) btnStyle = 'is-correct';
                                      else if (isPicked) btnStyle = 'is-wrong';
                                    } else if (isPicked) {
                                      btnStyle = 'is-selected';
                                    }

                                    return (
                                      <button
                                        key={oIdx}
                                        type="button"
                                        disabled={isSubmitted}
                                        onClick={() => handleSelectExamOption(key, optNum)}
                                        aria-pressed={isPicked}
                                        aria-label={optionImages?.[oIdx] ? `Chọn tranh ${optNum}` : undefined}
                                        className={`topik-exam-option ${optionImages?.[oIdx] ? 'is-picture-option' : ''} ${btnStyle}`}
                                      >
                                        {optionImages?.[oIdx] ? (
                                          <>
                                            <img
                                              src={optionImages[oIdx]}
                                              alt={`Tranh lựa chọn ${optNum}`}
                                              className="topik-exam-option-image"
                                              loading="lazy"
                                            />
                                            <span className="sr-only">{opt}</span>
                                            {isSubmitted && isCorrect && <CheckCircle2 className="topik-exam-picture-status text-emerald-600" />}
                                            {isSubmitted && isPicked && !isCorrect && <XCircle className="topik-exam-picture-status text-red-600" />}
                                          </>
                                        ) : (
                                          <>
                                            <span className="topik-exam-option-number" aria-hidden="true">
                                              {['①', '②', '③', '④'][oIdx] || `${optNum}.`}
                                            </span>
                                            <span className="topik-exam-option-text">{opt}</span>
                                            {isSubmitted && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                                            {isSubmitted && isPicked && !isCorrect && <XCircle className="w-4 h-4 text-red-600 shrink-0" />}
                                          </>
                                        )}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Explanations if submitted */}
                        {isSubmitted && block.explain && block.explain.length > 0 && (
                          <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
                            {block.explain.map(([k, v], mIdx) => (
                              <p key={mIdx}><strong>{k}:</strong> {v}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 6: TIPS & 31 GRAMMAR POINTS */}
        {activeTab === 'tips' && (
          <div className="space-y-6">
            <div className="p-5 bg-white rounded-2xl border border-stone-200 shadow-xs">
              <h2 className="text-lg font-bold text-stone-900">31 Điểm Ngữ Pháp & Chiến Thuật TOPIK I Đạt Điểm Cao</h2>
              <p className="text-xs text-stone-500 mt-1">
                Tổng hợp đầy đủ cấu trúc ngữ pháp xuất hiện nhiều nhất trong đề thi TOPIK I và kỹ thuật nhận diện bẫy.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {MASTER_DATA.tips.map((tip: MasterTip, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-2 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded uppercase">
                        {tip.grp}
                      </span>
                      <span className="text-stone-400 font-semibold">{tip.lv}</span>
                    </div>
                    <h4 className="font-extrabold text-stone-900 text-base mt-1">{tip.title}</h4>
                    <p className="text-xs font-bold text-red-600 mt-0.5">Trọng tâm: {tip.pts}</p>
                    <p className="text-xs text-stone-600 mt-1 bg-stone-50 p-2.5 rounded-lg font-serif leading-relaxed">
                      🎧 Luyện nghe: {tip.listen}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-stone-100 space-y-2 text-xs">
                    {tip.steps && tip.steps.length > 0 && (
                      <div className="space-y-1 text-stone-600">
                        {tip.steps.map((st, sIdx) => (
                          <p key={sIdx} className="text-[11px]">✓ {st}</p>
                        ))}
                      </div>
                    )}
                    <button
                      onClick={() => speakText(tip.listen)}
                      className="w-full py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold flex items-center justify-center gap-1 text-xs"
                      title="Nghe câu luyện"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-red-600" />
                      <span>Nghe câu luyện</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
