import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Search, 
  ChevronRight, 
  Calendar, 
  Clock, 
  User, 
  Plus, 
  Sparkles, 
  CheckCircle2, 
  Edit3, 
  Share2,
  Tag
} from 'lucide-react';
import { Article, BlogCategory, getStoredArticles } from '../services/blogService';

interface BlogGuidesProps {
  onSelectArticle: (article: Article) => void;
  onOpenAdminPanel?: () => void;
  onOpenConsultation: (topic?: string) => void;
}

export const BlogGuides: React.FC<BlogGuidesProps> = ({
  onSelectArticle,
  onOpenAdminPanel,
  onOpenConsultation,
}) => {
  const [articles, setArticles] = useState<Article[]>(getStoredArticles());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  useEffect(() => {
    const handleUpdate = () => setArticles(getStoredArticles());
    window.addEventListener('seiu_blog_updated', handleUpdate);
    return () => window.removeEventListener('seiu_blog_updated', handleUpdate);
  }, []);

  const categories = [
    { id: 'all', label: 'Tất Cả Bài Viết' },
    { id: 'Góc Thầy Bửu', label: 'Góc Thầy Bửu' },
    { id: 'Học tiếng Hàn Blog', label: 'Học Tiếng Hàn' },
    { id: 'Du học Hàn Quốc', label: 'Du Học Hàn Quốc' },
    { id: 'Chính sách & Học bổng', label: 'Chính Sách & Học Bổng' },
  ];

  const filteredArticles = articles.filter(art => {
    const matchCategory = selectedCategory === 'all' || art.category === selectedCategory;
    const matchSearch = searchKeyword.trim() === '' || 
      art.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      art.summary.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      (art.tags && art.tags.some(t => t.toLowerCase().includes(searchKeyword.toLowerCase())));
    return matchCategory && matchSearch;
  });

  return (
    <section id="blog" className="py-16 bg-white border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Top Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Góc Thầy Bửu & Cẩm Nang Du Học</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-stone-900 font-heading">
              Kinh Nghiệm Học Tiếng Hàn & Du Học
            </h2>
            <p className="text-stone-600 text-sm mt-1 max-w-2xl">
              Những phân tích chân thực, hướng dẫn phương pháp học phản xạ và cập nhật chính sách du học mới nhất từ SEIU.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-end">
            <button
              onClick={() => onOpenConsultation('Đăng ký nhận tài liệu cẩm nang du học & từ vựng')}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm transition-all"
            >
              <Sparkles className="w-4 h-4 text-red-200" />
              <span>Nhận Bộ Cẩm Nang Miễn Phí</span>
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-stone-50 p-3.5 rounded-2xl border border-stone-200">
          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="Tìm kiếm bài viết..."
              className="w-full pl-9 pr-3.5 py-1.5 text-xs bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-red-600 outline-hidden font-medium"
            />
          </div>
        </div>

        {/* Articles Grid */}
        {filteredArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((art) => (
              <div
                key={art.id}
                onClick={() => onSelectArticle(art)}
                className="bg-white rounded-2xl border border-stone-200 overflow-hidden hover:border-red-300 hover:shadow-lg transition-all flex flex-col justify-between cursor-pointer group"
              >
                <div>
                  {/* Thumbnail */}
                  <div className="relative h-48 sm:h-52 overflow-hidden bg-stone-100">
                    <img src={art.coverImage || '/seiu-logo.svg'} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full scale-110 object-cover opacity-25 blur-xl" />
                    <img
                      src={art.coverImage || '/seiu-logo.svg'}
                      alt={art.title}
                      className="relative h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                    />
                    <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
                      <span className="px-2.5 py-1 bg-red-600/90 text-white text-[11px] font-bold rounded-lg backdrop-blur-xs shadow-xs">
                        {art.category}
                      </span>
                      {art.subPages && art.subPages.length > 0 && (
                        <span className="px-2 py-1 bg-emerald-600/90 text-white text-[10px] font-bold rounded-lg backdrop-blur-xs shadow-xs flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          <span>{art.subPages.length} Trang con / Quiz</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5">
                    <div className="flex items-center gap-3 text-xs text-stone-400 mb-2.5">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-stone-400" />
                        {art.publishedAt}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-stone-400" />
                        {art.readTime}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-stone-900 group-hover:text-red-600 transition-colors line-clamp-2 leading-snug mb-2 font-heading">
                      {art.title}
                    </h3>

                    <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed">
                      {art.summary}
                    </p>
                  </div>
                </div>

                {/* Footer with Author and CTA */}
                <div className="px-5 py-3.5 bg-stone-50/70 border-t border-stone-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold text-[10px]">
                      {art.author.charAt(0) || 'S'}
                    </div>
                    <span className="text-xs font-semibold text-stone-700 truncate max-w-[120px]">
                      {art.author}
                    </span>
                  </div>

                  <span className="text-xs font-bold text-red-600 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    <span>Đọc tiếp</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-stone-50 rounded-2xl border border-stone-200">
            <BookOpen className="w-10 h-10 text-stone-400 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-stone-700">Không tìm thấy bài viết phù hợp</h4>
            <p className="text-xs text-stone-500 mt-1">Thử tìm kiếm với từ khóa khác hoặc bấm xem tất cả bài viết.</p>
          </div>
        )}

      </div>
    </section>
  );
};
