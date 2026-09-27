import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  User, 
  Share2, 
  CheckCircle2, 
  ChevronRight, 
  ArrowLeft, 
  BookOpen, 
  PhoneCall, 
  Sparkles, 
  Award,
  Layers,
  Check,
  ChevronLeft
} from 'lucide-react';
import { Article, SubPage } from '../services/blogService';
import { getStoredSiteConfig } from '../services/siteConfigService';
import { InteractiveContentRenderer } from './InteractiveContentRenderer';

interface ArticleModalProps {
  article: Article | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenConsultation: (topic?: string) => void;
}

export const ArticleModal: React.FC<ArticleModalProps> = ({
  article,
  isOpen,
  onClose,
  onOpenConsultation,
}) => {
  const siteConfig = getStoredSiteConfig();
  const [activeSubPageId, setActiveSubPageId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setActiveSubPageId(null); // Reset to main article
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, article?.id]);

  if (!isOpen || !article) return null;

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      alert('Đã sao chép đường link bài viết để chia sẻ!');
    }
  };

  const subPages = article.subPages || [];
  const activeSubPage = subPages.find(sp => sp.id === activeSubPageId);
  const currentContentHtml = activeSubPage ? activeSubPage.contentHtml : article.contentHtml;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex justify-center p-0 sm:p-4 md:p-6 animate-fadeIn">
      <div 
        className="bg-white w-full max-w-4xl min-h-screen sm:min-h-0 sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-stone-100 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-stone-100 px-4 sm:px-6 py-3 flex items-center justify-between">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 text-stone-600 hover:text-red-600 font-medium text-sm transition-colors py-1 px-2 rounded-lg hover:bg-stone-50"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại danh sách</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 text-stone-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Chia sẻ bài viết"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
              title="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Article Body */}
        <div className="p-4 sm:p-8 md:p-10 flex-grow overflow-y-auto max-h-[85vh]">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-4 flex-wrap">
            <span className="hover:text-red-600 cursor-pointer" onClick={onClose}>Trang chủ</span>
            <ChevronRight className="w-3 h-3 text-stone-400" />
            <span className="text-red-600 font-medium">{article.category}</span>
            {article.topic && (
              <>
                <ChevronRight className="w-3 h-3 text-stone-400" />
                <span className="text-stone-600 font-medium">{article.topic}</span>
              </>
            )}
            <ChevronRight className="w-3 h-3 text-stone-400" />
            <span className="text-stone-400 truncate max-w-xs">{article.title}</span>
            {activeSubPage && (
              <>
                <ChevronRight className="w-3 h-3 text-red-500" />
                <span className="text-red-600 font-bold truncate max-w-xs">{activeSubPage.title}</span>
              </>
            )}
          </div>

          {/* Category & Topic Badges */}
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="inline-block px-3 py-1 bg-red-50 text-red-700 text-xs font-bold rounded-full border border-red-200 uppercase tracking-wide">
              {article.category}
            </span>
            {article.topic && (
              <span className="inline-block px-3 py-1 bg-stone-100 text-stone-700 text-xs font-semibold rounded-full border border-stone-200">
                Đề mục: {article.topic}
              </span>
            )}
            {subPages.length > 0 && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">
                <Layers className="w-3 h-3" />
                <span>{subPages.length} Trang con / Bài tập</span>
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-stone-900 leading-tight mb-4 font-heading">
            {activeSubPage ? activeSubPage.title : article.title}
          </h1>

          {/* Subpages Navigation Tabs (Mục lục các trang con & bài tập) */}
          {subPages.length > 0 && (
            <div className="my-6 p-3.5 sm:p-4 bg-stone-50 rounded-2xl border border-stone-200">
              <div className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-2.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-red-600">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Mục lục & Các Trang Con:</span>
                </span>
                <span className="text-[11px] text-stone-500 font-normal">
                  Chuyển nhanh giữa bài học chính và bài tập
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setActiveSubPageId(null)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeSubPageId === null
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Bài Học Chính</span>
                </button>

                {subPages.map((sp, idx) => (
                  <button
                    key={sp.id}
                    type="button"
                    onClick={() => setActiveSubPageId(sp.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      activeSubPageId === sp.id
                        ? 'bg-red-600 text-white shadow-xs'
                        : 'bg-white text-stone-700 hover:bg-red-50 hover:text-red-700 border border-stone-200'
                    }`}
                  >
                    <span>{idx + 1}.</span>
                    <span className="truncate max-w-[200px]">{sp.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Author & Meta */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-6 border-b border-stone-100 text-xs text-stone-600">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold text-sm ring-2 ring-red-200">
                {article.author.charAt(0) || 'S'}
              </div>
              <div>
                <div className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                  <span>{article.author}</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-red-600 fill-red-100" />
                </div>
                <div className="text-stone-500">{article.authorRole}</div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-stone-500">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-stone-400" />
                <span>{article.publishedAt}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-stone-400" />
                <span>{article.readTime}</span>
              </div>
            </div>
          </div>

          {/* Featured Summary Box */}
          {(activeSubPage?.summary || (activeSubPageId === null && article.summary)) && (
            <div className="p-4 sm:p-5 bg-stone-50 border-l-4 border-red-600 rounded-r-xl text-stone-700 text-sm sm:text-base leading-relaxed mb-6 font-medium italic">
              {activeSubPage ? activeSubPage.summary : article.summary}
            </div>
          )}

          {/* Main Cover Image (Only on Main Article) */}
          {activeSubPageId === null && article.coverImage && (
            <div className="mb-8 rounded-xl overflow-hidden shadow-sm border border-stone-100 bg-stone-100">
              <img
                src={article.coverImage}
                alt={article.coverImageAlt || article.title}
                className="w-full h-64 sm:h-96 object-contain"
              />
            </div>
          )}

          {/* Rich Content & Interactive Exercise Renderer */}
          <InteractiveContentRenderer htmlContent={currentContentHtml} />

          {/* Subpages Navigation Footer within Article */}
          {subPages.length > 0 && (
            <div className="mt-8 p-4 bg-stone-50 border border-stone-200 rounded-2xl flex items-center justify-between gap-3">
              {activeSubPageId !== null ? (
                <button
                  type="button"
                  onClick={() => setActiveSubPageId(null)}
                  className="px-4 py-2 bg-white text-stone-700 hover:bg-stone-100 border border-stone-200 rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>&larr; Về bài học chính</span>
                </button>
              ) : (
                <div className="text-xs text-stone-500 font-medium">
                  Đã đọc xong bài chính? Chuyển sang làm bài tập ngay &rarr;
                </div>
              )}

              {subPages.map((sp, idx) => {
                if (activeSubPageId === null && idx === 0) {
                  return (
                    <button
                      key={sp.id}
                      type="button"
                      onClick={() => setActiveSubPageId(sp.id)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                    >
                      <span>Sang: {sp.title}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  );
                }
                return null;
              })}
            </div>
          )}

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="mt-8 pt-6 border-t border-stone-100 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Từ khóa:</span>
              {article.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 bg-stone-100 text-stone-700 rounded-lg text-xs font-medium hover:bg-red-50 hover:text-red-700 transition-colors"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Author Box / SEIU Guarantee */}
          <div className="mt-8 p-5 sm:p-6 bg-gradient-to-r from-red-50 to-white rounded-2xl border border-red-100 flex flex-col sm:flex-row items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-red-600 text-white flex items-center justify-center font-bold text-2xl shrink-0 shadow-md">
              SEIU
            </div>
            <div className="flex-grow text-center sm:text-left">
              <div className="text-xs font-bold uppercase text-red-600 tracking-wider">Tác giả & Đơn vị bảo trợ</div>
              <h4 className="text-base font-bold text-stone-900 mt-0.5">
                {siteConfig.representative} – {siteConfig.representativeTitle}
              </h4>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                {siteConfig.representativeBio}
              </p>
            </div>
            <button
              onClick={() => {
                onClose();
                onOpenConsultation(`Đăng ký tư vấn sau khi đọc bài: ${article.title}`);
              }}
              className="w-full sm:w-auto px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-md transition-all shrink-0 flex items-center justify-center gap-1.5"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Tư Vấn Trực Tiếp</span>
            </button>
          </div>

          {/* SEO Preview Snippet for Admins */}
          <div className="mt-8 p-4 bg-stone-50 rounded-xl border border-stone-200/80 text-xs text-stone-600">
            <div className="font-bold text-stone-700 mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-red-600" />
              <span>Hiển thị tìm kiếm Google (SEO Preview):</span>
            </div>
            <div className="text-blue-700 font-medium text-sm hover:underline cursor-pointer">
              {article.seoTitle || article.title} | SEIU
            </div>
            <div className="text-emerald-700 text-[11px] mt-0.5">
              https://tienghanseiu.com/blog/{article.slug}
            </div>
            <div className="text-stone-600 mt-1 line-clamp-2">
              {article.seoDescription || article.summary}
            </div>
          </div>
        </div>

        {/* Bottom CTA Bar */}
        <div className="bg-stone-50 border-t border-stone-100 px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-stone-600 text-center sm:text-left">
            <span className="font-semibold text-stone-900">SEIU – Đồng hành cùng học viên:</span> Hotline: <span className="font-bold text-red-600">{siteConfig.hotlineFormatted}</span> (Vị Thanh & TP.HCM)
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 rounded-xl text-xs font-semibold"
            >
              Đóng
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenConsultation(`Đăng ký tư vấn: ${article.title}`);
              }}
              className="flex-1 sm:flex-none px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-sm"
            >
              Đăng Ký Tư Vấn Ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
