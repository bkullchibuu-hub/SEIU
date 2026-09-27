import React, { useState, useEffect, useRef } from 'react';
import { 
  HomeworkAssignment, 
  HomeworkSubmission,
  getStoredHomeworkList, 
  saveStoredHomeworkList,
  saveSubmission,
  gradeHomeworkWithAI 
} from '../services/homeworkService';
import { 
  BookOpen, 
  Award, 
  Sparkles, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Plus, 
  User, 
  Clock, 
  Keyboard, 
  Check, 
  ChevronRight,
  Lightbulb,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { submitExamResult } from '../services/examResultService';

interface HomeworkZoneProps {
  onOpenConsultation: (topic?: string) => void;
  isAdminLoggedIn?: boolean;
}

export const HomeworkZone: React.FC<HomeworkZoneProps> = ({
  onOpenConsultation,
  isAdminLoggedIn = false,
}) => {
  const [assignments, setAssignments] = useState<HomeworkAssignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<HomeworkAssignment | null>(null);
  
  // Student Submission form state
  const [studentName, setStudentName] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [submissionText, setSubmissionText] = useState('');
  const [isGrading, setIsGrading] = useState(false);
  const [gradeResult, setGradeResult] = useState<any | null>(null);
  const [resultReportState, setResultReportState] = useState<'idle' | 'sending' | 'saved' | 'pending'>('idle');
  const [showVirtualKeyboard, setShowVirtualKeyboard] = useState(false);
  const assignmentStartedAtRef = useRef(Date.now());

  // Admin create assignment modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'vocabulary' | 'grammar' | 'essay' | 'interview'>('essay');
  const [newLevel, setNewLevel] = useState('Sơ cấp 1 - Sơ cấp 2');
  const [newInstructions, setNewInstructions] = useState('');
  const [newPrompt, setNewPrompt] = useState('');
  const [newKeywords, setNewKeywords] = useState('');
  const [newDeadline, setNewDeadline] = useState('23:59 Chủ Nhật hàng tuần');

  useEffect(() => {
    const list = getStoredHomeworkList();
    setAssignments(list);
    if (list.length > 0 && !selectedAssignment) {
      setSelectedAssignment(list[0]);
    }
  }, []);

  const handleSelectAssignment = (hw: HomeworkAssignment) => {
    setSelectedAssignment(hw);
    setSubmissionText('');
    setGradeResult(null);
    setResultReportState('idle');
    assignmentStartedAtRef.current = Date.now();
  };

  const handleGradeWithAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment || !submissionText.trim()) return;

    setIsGrading(true);
    setGradeResult(null);
    setResultReportState('idle');

    try {
      const result = await gradeHomeworkWithAI({
        assignmentTitle: selectedAssignment.title,
        question: selectedAssignment.promptQuestion,
        studentSubmission: submissionText,
        studentName: studentName.trim() || 'Học viên SEIU',
        targetLevel: selectedAssignment.level,
      });

      setGradeResult(result);

      // Save submission record
      const submission: HomeworkSubmission = {
        id: 'sub-' + Date.now(),
        assignmentId: selectedAssignment.id,
        studentName: studentName.trim() || 'Học viên SEIU',
        studentPhone: studentPhone.trim() || undefined,
        submissionText: submissionText,
        submittedAt: new Date().toLocaleDateString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }),
        gradedByAi: true,
        score: result.score,
        aiFeedback: result,
      };
      saveSubmission(submission);

      const phone = studentPhone.replace(/[^0-9+]/g, '');
      if (phone.replace(/\D/g, '').length >= 8) {
        setResultReportState('sending');
        void submitExamResult({
          name: studentName.trim() || 'Học viên SEIU',
          phone,
          goal: 'hoc-tieng-han',
        }, {
          testId: selectedAssignment.id,
          testTitle: `Bài tập AI — ${selectedAssignment.title}`,
          testKind: 'ai-homework',
          correct: Math.round(Number(result.score) || 0),
          total: 100,
          score: Number(result.score) || 0,
          maxScore: 100,
          durationSec: Math.max(1, Math.round((Date.now() - assignmentStartedAtRef.current) / 1000)),
        }).then(saved => setResultReportState(saved ? 'saved' : 'pending'));
      }

      if (result.score >= 80) {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGrading(false);
    }
  };

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newInstructions.trim()) return;

    const newHw: HomeworkAssignment = {
      id: 'hw-' + Date.now(),
      title: newTitle.trim(),
      category: newCategory,
      level: newLevel,
      deadline: newDeadline,
      assignedBy: 'Thầy Lê Trí Bửu (SEIU)',
      instructions: newInstructions.trim(),
      promptQuestion: newPrompt.trim() || newTitle.trim(),
      vocabularyKeywords: newKeywords.split(',').map(k => k.trim()).filter(Boolean),
      maxScore: 100,
    };

    const updated = [newHw, ...assignments];
    setAssignments(updated);
    saveStoredHomeworkList(updated);
    setSelectedAssignment(newHw);
    setShowCreateModal(false);

    // Reset
    setNewTitle('');
    setNewInstructions('');
    setNewPrompt('');
    setNewKeywords('');
  };

  const appendChar = (char: string) => {
    setSubmissionText(prev => prev + char);
  };

  const handleBackspace = () => {
    setSubmissionText(prev => prev.slice(0, -1));
  };

  const consonants = ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ', 'ㄲ', 'ㄸ', 'ㅃ', 'ㅆ', 'ㅉ'];
  const vowels = ['ㅏ', 'ㅑ', 'ㅓ', 'ㅕ', 'ㅗ', 'ㅛ', 'ㅜ', 'ㅠ', 'ㅡ', 'ㅣ', 'ㅐ', 'ㅒ', 'ㅔ', 'ㅖ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅢ'];

  return (
    <section id="homework-zone" className="py-16 bg-stone-50 border-t border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Phòng Bài Tập & Chấm Điểm AI Thông Minh</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-stone-900 tracking-tight">
              Mục Giao & Nộp Bài Tập Tiếng Hàn
            </h2>
            <p className="text-stone-600 text-sm mt-1 max-w-2xl">
              Học viên nộp bài viết tiếng Hàn, đặt câu, bài dịch ngữ pháp và nhận chấm điểm tức thì, sửa lỗi chi tiết từ <strong>Thầy Bửu AI</strong>.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isAdminLoggedIn && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>+ Giao Bài Tập Mới</span>
              </button>
            )}

            <button
              onClick={() => onOpenConsultation('Đăng ký lớp học tiếng Hàn có Thầy Bửu kèm 1:1')}
              className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-2"
            >
              <Award className="w-4 h-4 text-amber-300" />
              <span>Tư Vấn Khóa Học Có Chấm Bài 1:1</span>
            </button>
          </div>
        </div>

        {/* 2-Column Layout: Left List of Assignments, Right Submission & AI Grader */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Assignment List */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center justify-between px-2 text-xs font-bold text-stone-500 uppercase tracking-wider">
              <span>Danh Sách Bài Tập Được Giao ({assignments.length})</span>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {assignments.map((hw) => {
                const isSelected = selectedAssignment?.id === hw.id;
                return (
                  <div
                    key={hw.id}
                    onClick={() => handleSelectAssignment(hw)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white border-red-600 shadow-md ring-2 ring-red-600/20'
                        : 'bg-white border-stone-200 hover:border-stone-300 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="px-2.5 py-0.5 bg-red-50 text-red-700 rounded-md text-[10px] font-bold">
                        {hw.level}
                      </span>
                      <span className="text-[10px] text-stone-400 flex items-center gap-1 font-medium">
                        <Clock className="w-3 h-3" />
                        {hw.deadline}
                      </span>
                    </div>

                    <h4 className="font-bold text-stone-900 text-sm line-clamp-2 mb-1.5">
                      {hw.title}
                    </h4>

                    <p className="text-xs text-stone-500 line-clamp-2 mb-3">
                      {hw.instructions}
                    </p>

                    <div className="flex items-center justify-between text-[11px] font-semibold pt-2 border-t border-stone-100">
                      <span className="text-stone-400">{hw.assignedBy}</span>
                      <span className={`flex items-center gap-1 ${isSelected ? 'text-red-600 font-bold' : 'text-stone-600'}`}>
                        Làm bài <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Interactive Submission & AI Grader */}
          <div className="lg:col-span-8">
            {selectedAssignment ? (
              <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 sm:p-8 space-y-6">
                {/* Assignment Banner */}
                <div className="p-5 bg-gradient-to-br from-red-50 to-stone-100 rounded-2xl border border-red-100">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 bg-red-600 text-white rounded-md text-xs font-black uppercase">
                      Đang làm bài
                    </span>
                    <span className="text-xs text-stone-600 font-bold">
                      {selectedAssignment.level}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-black text-stone-900">
                    {selectedAssignment.title}
                  </h3>

                  <div className="mt-3 p-3.5 bg-white rounded-xl border border-stone-200 text-xs text-stone-800 space-y-2">
                    <div className="font-bold text-stone-900 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-red-600" />
                      <span>Yêu cầu đề bài từ Thầy Bửu:</span>
                    </div>
                    <p className="leading-relaxed">{selectedAssignment.instructions}</p>

                    {selectedAssignment.vocabularyKeywords && selectedAssignment.vocabularyKeywords.length > 0 && (
                      <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] font-bold text-stone-500">Từ khóa gợi ý:</span>
                        {selectedAssignment.vocabularyKeywords.map((kw, i) => (
                          <span key={i} className="px-2 py-0.5 bg-red-50 text-red-700 font-bold text-[11px] rounded-md border border-red-100">
                            {kw}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Submission Form */}
                <form onSubmit={handleGradeWithAI} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Họ và tên học viên:
                      </label>
                      <input
                        type="text"
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        placeholder="Ví dụ: Nguyễn Thị Mai"
                        className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-hidden focus:ring-2 focus:ring-red-600"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Số điện thoại / Zalo (nhận kết quả):
                      </label>
                      <input
                        type="tel"
                        value={studentPhone}
                        onChange={(e) => setStudentPhone(e.target.value)}
                        placeholder="09xx xxx xxx"
                        className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-hidden focus:ring-2 focus:ring-red-600"
                        required
                        minLength={8}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-stone-700">
                        Bài làm tiếng Hàn của bạn:
                      </label>

                      <button
                        type="button"
                        onClick={() => setShowVirtualKeyboard(!showVirtualKeyboard)}
                        className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1"
                      >
                        <Keyboard className="w-3.5 h-3.5" />
                        <span>{showVirtualKeyboard ? 'Đóng bàn phím ảo' : 'Mở bàn phím ảo Hangul'}</span>
                      </button>
                    </div>

                    <textarea
                      rows={6}
                      value={submissionText}
                      onChange={(e) => setSubmissionText(e.target.value)}
                      placeholder="Nhập bài viết đoạn văn hoặc câu trả lời bằng tiếng Hàn tại đây..."
                      className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl text-sm font-medium outline-hidden focus:ring-2 focus:ring-red-600 focus:bg-white transition-all leading-relaxed"
                      required
                    />
                  </div>

                  {/* Virtual Hangul Keyboard */}
                  {showVirtualKeyboard && (
                    <div className="p-3 bg-stone-100 rounded-2xl border border-stone-200 space-y-2">
                      <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                        Bàn phím ký tự tiếng Hàn (Bấm để gõ):
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

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-stone-400">
                      Hệ thống tự động phân tích ngữ pháp, chính tả & từ vựng
                    </span>

                    <button
                      type="submit"
                      disabled={isGrading || !submissionText.trim()}
                      className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 uppercase tracking-wide"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                      <span>{isGrading ? 'Thầy Bửu AI Đang Chấm Bài...' : 'Chấm Điểm & Sửa Lỗi Bằng AI'}</span>
                    </button>
                  </div>
                </form>

                {resultReportState !== 'idle' && (
                  <div className={`rounded-xl border px-4 py-3 text-xs font-bold ${resultReportState === 'saved' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>
                    {resultReportState === 'sending' && 'Đang gửi điểm bài tập về bảng thành tích…'}
                    {resultReportState === 'saved' && 'Điểm bài tập đã được lưu vào bảng thành tích.'}
                    {resultReportState === 'pending' && 'Điểm đã lưu trên thiết bị và sẽ tự gửi lại khi có mạng.'}
                  </div>
                )}

                {/* AI Grading Feedback Result Display */}
                {gradeResult && (
                  <div className="p-6 bg-gradient-to-br from-white via-red-50/30 to-amber-50/20 rounded-3xl border-2 border-red-200 shadow-md space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-red-600 text-white font-bold flex items-center justify-center shadow-xs">
                          <Award className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                            Kết quả thẩm định từ Thầy Bửu AI
                          </div>
                          <div className="text-base font-black text-stone-900">
                            Bảng Điểm & Nhận Xét Chi Tiết
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-stone-500 font-bold">Điểm số:</span>
                        <div className="text-3xl font-black text-red-600">
                          {gradeResult.score} <span className="text-sm font-normal text-stone-400">/ 100</span>
                        </div>
                      </div>
                    </div>

                    {/* Overall Feedback */}
                    <div className="p-4 bg-white rounded-2xl border border-stone-200 text-xs text-stone-800 space-y-1">
                      <div className="font-bold text-stone-900 flex items-center gap-1.5">
                        <Lightbulb className="w-4 h-4 text-amber-500" />
                        <span>Nhận xét tổng thể:</span>
                      </div>
                      <p className="leading-relaxed">{gradeResult.overallFeedback}</p>
                    </div>

                    {/* Strengths & Improvements */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
                        <div className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Điểm Mạnh Của Bài Viết:</span>
                        </div>
                        <ul className="list-disc list-inside space-y-1 text-xs text-emerald-900">
                          {gradeResult.strengths?.map((s: string, idx: number) => (
                            <li key={idx}>{s}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-2">
                        <div className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                          <AlertCircle className="w-4 h-4 text-amber-600" />
                          <span>Các Lỗi Cần Sửa Đổi:</span>
                        </div>
                        <ul className="list-disc list-inside space-y-1 text-xs text-amber-900">
                          {gradeResult.improvements?.map((imp: string, idx: number) => (
                            <li key={idx}>{imp}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Corrected Native Korean Version */}
                    {gradeResult.correctedVersion && (
                      <div className="p-4 bg-stone-900 text-white rounded-2xl space-y-2">
                        <div className="text-xs font-bold text-red-300 uppercase tracking-wider flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          <span>Phiên Bản Chuẩn Người Hàn Bản Xứ (Native Korean):</span>
                        </div>
                        <p className="text-sm font-semibold text-white leading-relaxed font-sans">
                          {gradeResult.correctedVersion}
                        </p>
                      </div>
                    )}

                    {/* Teacher Advice */}
                    {gradeResult.teacherAdvice && (
                      <div className="p-3.5 bg-red-50 rounded-xl border border-red-100 text-xs text-red-900 font-medium">
                        <strong>Lời khuyên từ Thầy Lê Trí Bửu:</strong> "{gradeResult.teacherAdvice}"
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-12 text-center bg-white rounded-3xl border border-stone-200 text-stone-400">
                Vui lòng chọn một bài tập từ danh sách bên trái để bắt đầu làm bài.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Admin Modal: Create New Assignment */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden">
            <div className="p-5 bg-red-600 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Giao Bài Tập Tiếng Hàn Mới (Admin)</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Tiêu đề bài tập:</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ví dụ: Bài Tập Viết Về Ước Mơ Đi Du Học Hàn Quốc"
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl outline-hidden focus:ring-2 focus:ring-red-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Trình độ áp dụng:</label>
                  <input
                    type="text"
                    value={newLevel}
                    onChange={(e) => setNewLevel(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Hạn nộp bài:</label>
                  <input
                    type="text"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Yêu cầu / Hướng dẫn làm bài:</label>
                <textarea
                  rows={3}
                  value={newInstructions}
                  onChange={(e) => setNewInstructions(e.target.value)}
                  placeholder="Hướng dẫn học viên số lượng câu, cấu trúc ngữ pháp cần dùng..."
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Từ khóa gợi ý (phân cách dấu phẩy):</label>
                <input
                  type="text"
                  value={newKeywords}
                  onChange={(e) => setNewKeywords(e.target.value)}
                  placeholder="유학, 장학금, 한국어..."
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 rounded-xl font-bold text-stone-700"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-md"
                >
                  Lưu & Giao Bài Tập
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
