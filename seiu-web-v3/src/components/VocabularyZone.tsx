import React, { useState, useEffect } from 'react';
import { VocabItem, getStoredVocabList, getLearnedVocabIds, toggleLearnedVocab } from '../services/vocabService';
import { 
  BookOpen, 
  Volume2, 
  RotateCw, 
  CheckCircle2, 
  Sparkles, 
  Search, 
  Layers, 
  GraduationCap,
  Award,
  Edit3,
  ArrowRight,
  Filter,
  Check
} from 'lucide-react';

interface VocabularyZoneProps {
  onOpenWritingQuiz: () => void;
  onOpenHomeworkZone: () => void;
}

export const VocabularyZone: React.FC<VocabularyZoneProps> = ({
  onOpenWritingQuiz,
  onOpenHomeworkZone,
}) => {
  const [vocabList, setVocabList] = useState<VocabItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const [learnedIds, setLearnedIds] = useState<string[]>([]);
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'flashcard' | 'grid'>('flashcard');

  useEffect(() => {
    setVocabList(getStoredVocabList());
    setLearnedIds(getLearnedVocabIds());
  }, []);

  const handleToggleLearned = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = toggleLearnedVocab(id);
    setLearnedIds(updated);
  };

  const handleSpeak = (text: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleFlip = (id: string) => {
    setFlippedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Filtered list
  const filteredVocab = vocabList.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = 
      item.korean.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.vietnamese.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.hanViet && item.hanViet.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const activeCard = filteredVocab[currentFlashcardIndex] || filteredVocab[0];

  const categories = [
    { id: 'all', label: 'Tất Cả Từ Vựng', icon: Layers },
    { id: 'beginner1', label: 'Sơ Cấp 1 (Nhập Môn)', icon: BookOpen },
    { id: 'beginner2', label: 'Sơ Cấp 2 (Giao Tiếp)', icon: Edit3 },
    { id: 'studyAbroad', label: 'Du Học & Đời Sống Hàn', icon: GraduationCap },
    { id: 'interview', label: 'Phỏng Vấn Visa & TOPIK', icon: Award },
  ];

  const learnedCount = vocabList.filter(v => learnedIds.includes(v.id)).length;
  const progressPercent = vocabList.length > 0 ? Math.round((learnedCount / vocabList.length) * 100) : 0;

  return (
    <section id="vocab-zone" className="py-16 bg-gradient-to-b from-stone-50 via-white to-stone-50 border-t border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Học Từ Vựng Tiếng Hàn Thực Chiến Chuẩn SEIU</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-stone-900 tracking-tight">
              Khu Vực Học Từ Vựng & Luyện Phản Xạ
            </h2>
            <p className="text-stone-600 text-sm mt-1 max-w-2xl">
              Học từ vựng theo phương pháp Flashcard 3D, phát âm chuẩn giọng Seoul cùng giải nghĩa âm Hán - Hàn sâu sắc từ Thầy Lê Trí Bửu.
            </p>
          </div>

          {/* Quick Action Navigation */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenWritingQuiz}
              className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-red-500/20 transition-all flex items-center gap-2"
            >
              <Edit3 className="w-4 h-4 text-amber-300" />
              <span>Luyện Gõ & Kiểm Tra Từ Vựng</span>
            </button>

            <button
              onClick={onOpenHomeworkZone}
              className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-2"
            >
              <Award className="w-4 h-4 text-emerald-400" />
              <span>Khu Vực Giao & Chấm Bài AI</span>
            </button>
          </div>
        </div>

        {/* Progress Tracker Card */}
        <div className="mb-8 p-5 bg-white rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold text-lg">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-stone-500 font-semibold">Tiến độ ghi nhớ từ vựng của bạn</div>
              <div className="text-base font-black text-stone-900">
                Đã thuộc <span className="text-red-600">{learnedCount}</span> / {vocabList.length} từ vựng ({progressPercent}%)
              </div>
            </div>
          </div>

          <div className="w-full sm:w-64 bg-stone-100 h-3 rounded-full overflow-hidden border border-stone-200">
            <div 
              className="h-full bg-gradient-to-r from-red-500 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Category Tabs & Search Bar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setCurrentFlashcardIndex(0);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-stone-500'}`} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm từ Hàn, Việt, Hán Việt..."
                className="w-full pl-9 pr-3 py-2 bg-white border border-stone-200 rounded-xl text-xs outline-hidden focus:ring-2 focus:ring-red-600"
              />
            </div>

            <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200">
              <button
                onClick={() => setViewMode('flashcard')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  viewMode === 'flashcard' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500'
                }`}
              >
                Lật Thẻ
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  viewMode === 'grid' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500'
                }`}
              >
                Danh Sách
              </button>
            </div>
          </div>
        </div>

        {/* View Mode 1: Interactive 3D Flashcard Study Engine */}
        {viewMode === 'flashcard' && activeCard && (
          <div className="max-w-2xl mx-auto mb-12">
            <div 
              onClick={() => toggleFlip(activeCard.id)}
              className="relative h-96 w-full cursor-pointer perspective-1000 transition-all duration-300"
            >
              <div 
                className={`w-full h-full duration-500 preserve-3d relative rounded-3xl shadow-lg border-2 transition-transform ${
                  flippedCards[activeCard.id] ? 'rotate-y-180 border-red-300' : 'border-stone-200'
                }`}
                style={{
                  transformStyle: 'preserve-3d',
                  transform: flippedCards[activeCard.id] ? 'rotateY(180deg)' : 'none',
                }}
              >
                {/* Front Side */}
                <div 
                  className="absolute inset-0 w-full h-full bg-white rounded-3xl p-8 flex flex-col justify-between backface-hidden"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 bg-red-50 text-red-700 text-xs font-black rounded-full border border-red-100">
                      {activeCard.level}
                    </span>

                    <button
                      onClick={(e) => handleToggleLearned(activeCard.id, e)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
                        learnedIds.includes(activeCard.id)
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{learnedIds.includes(activeCard.id) ? 'Đã thuộc' : 'Đánh dấu đã thuộc'}</span>
                    </button>
                  </div>

                  <div className="text-center my-auto space-y-4">
                    <div className="text-5xl sm:text-6xl font-black text-stone-900 tracking-tight font-sans">
                      {activeCard.korean}
                    </div>

                    <div className="text-stone-400 font-mono text-sm">
                      [{activeCard.romaja}]
                    </div>

                    <button
                      onClick={(e) => handleSpeak(activeCard.korean, e)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-full text-xs font-bold transition-all shadow-2xs"
                    >
                      <Volume2 className="w-4 h-4 text-red-600" />
                      <span>Nghe phát âm chuẩn</span>
                    </button>
                  </div>

                  <div className="text-center text-xs text-stone-400 font-semibold flex items-center justify-center gap-1">
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Nhấp vào thẻ để xem nghĩa tiếng Việt & ví dụ câu</span>
                  </div>
                </div>

                {/* Back Side */}
                <div 
                  className="absolute inset-0 w-full h-full bg-gradient-to-br from-stone-900 via-stone-850 to-red-950 text-white rounded-3xl p-8 flex flex-col justify-between rotate-y-180 backface-hidden"
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 bg-white/20 text-white text-xs font-bold rounded-full">
                      Ý nghĩa & Ví dụ thực tế
                    </span>
                    {activeCard.hanViet && (
                      <span className="text-xs text-amber-300 font-bold">
                        Âm Hán Việt: <strong>{activeCard.hanViet}</strong>
                      </span>
                    )}
                  </div>

                  <div className="my-auto space-y-4 text-center">
                    <div className="text-3xl sm:text-4xl font-black text-white">
                      {activeCard.vietnamese}
                    </div>

                    <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md text-left space-y-2 border border-white/10">
                      <div className="text-xs font-bold text-red-300 uppercase tracking-wider">
                        Câu ví dụ giao tiếp:
                      </div>
                      <div className="text-sm font-semibold text-white">
                        {activeCard.exampleKr}
                      </div>
                      <div className="text-xs text-stone-300">
                        {activeCard.exampleVi}
                      </div>
                    </div>
                  </div>

                  <div className="text-center text-xs text-stone-300 font-semibold flex items-center justify-center gap-1">
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Nhấp để quay lại từ vựng</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Flashcard Nav Controls */}
            <div className="flex items-center justify-between mt-6">
              <button
                disabled={currentFlashcardIndex === 0}
                onClick={() => setCurrentFlashcardIndex(prev => Math.max(0, prev - 1))}
                className="px-4 py-2 bg-white text-stone-800 border border-stone-200 rounded-xl text-xs font-bold shadow-2xs hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ← Từ Trước
              </button>

              <span className="text-xs font-bold text-stone-600">
                Thẻ {currentFlashcardIndex + 1} / {filteredVocab.length}
              </span>

              <button
                disabled={currentFlashcardIndex === filteredVocab.length - 1}
                onClick={() => setCurrentFlashcardIndex(prev => Math.min(filteredVocab.length - 1, prev + 1))}
                className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold shadow-sm hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Từ Tiếp Theo →
              </button>
            </div>
          </div>
        )}

        {/* View Mode 2: Grid List of All Words */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVocab.map((v) => {
              const isLearned = learnedIds.includes(v.id);
              return (
                <div
                  key={v.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    isLearned ? 'bg-emerald-50/40 border-emerald-200' : 'bg-white border-stone-200 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="text-2xl font-black text-stone-900">{v.korean}</div>
                      <div className="text-xs text-stone-400 font-mono">[{v.romaja}]</div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleSpeak(v.korean)}
                        className="p-1.5 bg-stone-100 hover:bg-red-50 text-stone-700 hover:text-red-600 rounded-lg transition-colors"
                        title="Nghe phát âm"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleToggleLearned(v.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isLearned ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-400 hover:bg-stone-200'
                        }`}
                        title={isLearned ? 'Đã thuộc' : 'Đánh dấu đã thuộc'}
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="font-bold text-stone-800 text-sm mb-1">{v.vietnamese}</div>
                  {v.hanViet && (
                    <div className="text-[11px] text-amber-700 font-medium mb-3">
                      Âm Hán: <strong>{v.hanViet}</strong>
                    </div>
                  )}

                  <div className="p-3 bg-stone-50 rounded-xl text-xs space-y-1 border border-stone-100">
                    <div className="font-medium text-stone-900">{v.exampleKr}</div>
                    <div className="text-stone-500">{v.exampleVi}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* CTA to Practice Writing */}
        <div className="mt-12 p-8 bg-gradient-to-r from-red-600 to-stone-900 text-white rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-xl sm:text-2xl font-black">
              Muốn kiểm tra khả năng nhớ chính tả tiếng Hàn?
            </h3>
            <p className="text-xs sm:text-sm text-red-100 max-w-xl">
              Thử sức ngay với bài tập gõ từ vựng tiếng Hàn có tích hợp bàn phím ảo Hangul và tính năng chấm điểm, sửa lỗi bằng AI!
            </p>
          </div>

          <button
            onClick={onOpenWritingQuiz}
            className="px-6 py-3.5 bg-white hover:bg-stone-100 text-red-700 font-black text-xs rounded-2xl shadow-lg transition-all shrink-0 uppercase tracking-wide flex items-center gap-2"
          >
            <Edit3 className="w-4 h-4" />
            <span>Vào Phòng Kiểm Tra Viết Từ Vựng</span>
          </button>
        </div>
      </div>
    </section>
  );
};
