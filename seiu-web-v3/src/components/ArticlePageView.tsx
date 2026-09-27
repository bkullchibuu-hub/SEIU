import React, { useState, useEffect } from 'react';
import { Article, SubPage } from '../services/blogService';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Tag, 
  Share2, 
  CheckCircle2, 
  BookOpen, 
  Layers, 
  GraduationCap, 
  PhoneCall, 
  Sparkles,
  ChevronRight,
  Home,
  Clock,
  Send,
  MessageSquare
} from 'lucide-react';
import { InteractiveContentRenderer } from './InteractiveContentRenderer';

interface ArticlePageViewProps {
  article: Article;
  allArticles: Article[];
  onBackToHome: () => void;
  onSelectArticle: (article: Article) => void;
  onOpenConsultation: (topic?: string) => void;
}

export const ArticlePageView: React.FC<ArticlePageViewProps> = ({
  article,
  allArticles,
  onBackToHome,
  onSelectArticle,
  onOpenConsultation,
}) => {
  const [activeSubPageIndex, setActiveSubPageIndex] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [commentName, setCommentName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<{ name: string; text: string; date: string }[]>([]);

  // Scroll to top when article or subpage changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setActiveSubPageIndex(null);
  }, [article.id]);

  // Áp dụng SEO thật cho trang bài viết: title, description, Open Graph, canonical và schema.
  useEffect(() => {
    const previousTitle = document.title;
    const touched: { element: HTMLElement; previous: string | null; attribute: string }[] = [];
    const setMeta = (selector: string, attribute: string, value: string) => {
      let element = document.head.querySelector<HTMLElement>(selector);
      if (!element) {
        element = document.createElement(selector.startsWith('link') ? 'link' : 'meta');
        if (selector.includes('name="')) element.setAttribute('name', selector.match(/name="([^"]+)/)?.[1] || '');
        if (selector.includes('property="')) element.setAttribute('property', selector.match(/property="([^"]+)/)?.[1] || '');
        if (selector.startsWith('link')) element.setAttribute('rel', 'canonical');
        document.head.appendChild(element);
      }
      touched.push({ element, previous: element.getAttribute(attribute), attribute });
      element.setAttribute(attribute, value);
    };

    const seoTitle = article.seoTitle || article.title;
    const seoDescription = article.seoDescription || article.summary;
    const publishedParts = String(article.publishedAt || '').split('/');
    const datePublished = publishedParts.length === 3
      ? `${publishedParts[2]}-${publishedParts[1].padStart(2, '0')}-${publishedParts[0].padStart(2, '0')}`
      : article.publishedAt;
    document.title = `${seoTitle} | SEIU`;
    setMeta('meta[name="description"]', 'content', seoDescription);
    setMeta('meta[name="robots"]', 'content', article.seoNoIndex ? 'noindex,nofollow' : 'index,follow,max-image-preview:large');
    setMeta('meta[property="og:title"]', 'content', seoTitle);
    setMeta('meta[property="og:description"]', 'content', seoDescription);
    setMeta('meta[property="og:type"]', 'content', 'article');
    if (article.coverImage) setMeta('meta[property="og:image"]', 'content', article.coverImage);
    setMeta('link[rel="canonical"]', 'href', article.canonicalUrl || window.location.href);

    const schema = document.createElement('script');
    schema.type = 'application/ld+json';
    schema.dataset.seiuArticleSchema = article.id;
    schema.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: seoTitle,
      description: seoDescription,
      image: article.coverImage ? [article.coverImage] : undefined,
      author: { '@type': 'Person', name: article.author || 'Lê Trí Bửu' },
      publisher: {
        '@type': 'EducationalOrganization',
        name: 'SEIU – Trung tâm Ngoại ngữ Tiếng Hàn',
        url: 'https://tienghanseiu.com/',
      },
      datePublished,
      mainEntityOfPage: window.location.href,
      keywords: [article.focusKeyword, ...(article.tags || [])].filter(Boolean).join(', '),
    });
    document.head.appendChild(schema);

    return () => {
      document.title = previousTitle;
      touched.forEach(({ element, previous, attribute }) => previous === null ? element.removeAttribute(attribute) : element.setAttribute(attribute, previous));
      schema.remove();
    };
  }, [article]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.summary,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setComments([
      ...comments,
      {
        name: commentName.trim() || 'Bạn đọc ẩn danh',
        text: commentText.trim(),
        date: 'Vừa xong'
      }
    ]);
    setCommentText('');
  };

  const currentSubPage: SubPage | null = 
    activeSubPageIndex !== null && article.subPages && article.subPages[activeSubPageIndex]
      ? article.subPages[activeSubPageIndex]
      : null;

  const currentHtmlContent = currentSubPage 
    ? currentSubPage.contentHtml 
    : article.contentHtml;

  // Filter related articles
  const relatedArticles = allArticles
    .filter(a => a.id !== article.id)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 font-sans pb-20">
      {/* Sticky Top Subpage Header & Breadcrumb */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs py-3 px-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <button
            onClick={onBackToHome}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-red-50 text-stone-700 hover:text-red-600 text-xs font-bold transition-all shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại Trang Chủ</span>
          </button>

          {/* Breadcrumbs */}
          <nav className="hidden sm:flex items-center gap-1.5 text-xs text-stone-500 truncate">
            <span 
              onClick={onBackToHome}
              className="cursor-pointer hover:text-red-600 flex items-center gap-1"
            >
              <Home className="w-3.5 h-3.5" /> Trang chủ
            </span>
            <ChevronRight className="w-3 h-3 text-stone-400" />
            <span className="text-stone-700 font-medium">{article.category}</span>
            <ChevronRight className="w-3 h-3 text-stone-400" />
            <span className="text-stone-900 font-bold truncate max-w-xs">{article.title}</span>
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-all"
              title="Chia sẻ bài viết"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{copied ? 'Đã sao chép link!' : 'Chia sẻ'}</span>
            </button>
            <button
              onClick={() => onOpenConsultation(`Tư vấn sau khi đọc bài: ${article.title}`)}
              className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-xs transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Nhận Tư Vấn</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6">
        {/* Main Article Container */}
        <article className="bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden">
          {/* Cover Hero Banner */}
          {article.coverImage && (
            <div className="relative h-64 sm:h-96 w-full overflow-hidden bg-stone-100">
              <img src={article.coverImage} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full scale-110 object-cover opacity-25 blur-2xl" />
              <img
                src={article.coverImage}
                alt={article.coverImageAlt || article.title}
                className="relative h-full w-full object-contain transition-transform duration-700 hover:scale-[1.02]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-900/40 to-transparent" />
              
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 text-white">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="px-3 py-1 bg-red-600 text-white text-xs font-black uppercase rounded-full tracking-wider shadow-md">
                    {article.category}
                  </span>
                  {article.subPages && article.subPages.length > 0 && (
                    <span className="px-2.5 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-bold rounded-full flex items-center gap-1 border border-white/30">
                      <Layers className="w-3 h-3 text-amber-300" />
                      <span>{article.subPages.length} Trang Con & Bài Tập</span>
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-4xl font-black leading-tight tracking-tight text-white drop-shadow-md">
                  {article.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 mt-4 text-xs sm:text-sm text-stone-300 font-medium">
                  <div className="flex items-center gap-1.5">
                    <User className="w-4 h-4 text-red-400" />
                    <span>Tác giả: <strong>{article.author || 'Thầy Lê Trí Bửu'}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-stone-400" />
                    <span>{article.publishedAt}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-stone-400" />
                    <span>Thời gian đọc: ~5 phút</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Article Summary Callout */}
          <div className="p-6 sm:p-8 bg-stone-50/70 border-b border-stone-200">
            <div className="text-sm sm:text-base text-stone-700 italic font-medium leading-relaxed border-l-4 border-red-600 pl-4 py-1">
              "{article.summary}"
            </div>
          </div>

          {/* Multi-Subpage Navigation Tabs Bar */}
          {article.subPages && article.subPages.length > 0 && (
            <div className="bg-red-50/40 p-4 border-b border-red-100">
              <div className="flex items-center gap-2 mb-2 text-xs font-bold text-red-800 uppercase tracking-wider">
                <Layers className="w-4 h-4 text-red-600" />
                <span>Mục Lục Các Trang Con & Phần Luyện Tập:</span>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setActiveSubPageIndex(null)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeSubPageIndex === null
                      ? 'bg-red-600 text-white shadow-sm ring-2 ring-red-600/30'
                      : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Trang 1: Bài Học Chính</span>
                </button>

                {article.subPages.map((sub, idx) => (
                  <button
                    key={sub.id || idx}
                    type="button"
                    onClick={() => setActiveSubPageIndex(idx)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      activeSubPageIndex === idx
                        ? 'bg-red-600 text-white shadow-sm ring-2 ring-red-600/30'
                        : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    <span>Trang {idx + 2}: {sub.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Subpage Title (If active) */}
          {currentSubPage && (
            <div className="px-6 sm:px-10 pt-8 pb-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-800 rounded-lg text-xs font-black uppercase mb-2">
                <span>Trang con {activeSubPageIndex! + 2}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-stone-900">
                {currentSubPage.title}
              </h2>
            </div>
          )}

          {/* Interactive HTML Content */}
          <div className="p-6 sm:p-10">
            <InteractiveContentRenderer 
              htmlContent={currentHtmlContent}
              className="text-stone-800 leading-relaxed space-y-4"
            />
          </div>

          {/* Next / Previous SubPage Navigation Footer */}
          {article.subPages && article.subPages.length > 0 && (
            <div className="p-6 bg-stone-50 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                disabled={activeSubPageIndex === null}
                onClick={() => {
                  if (activeSubPageIndex === 0) {
                    setActiveSubPageIndex(null);
                  } else if (activeSubPageIndex !== null && activeSubPageIndex > 0) {
                    setActiveSubPageIndex(activeSubPageIndex - 1);
                  }
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeSubPageIndex === null
                    ? 'opacity-40 cursor-not-allowed bg-stone-200 text-stone-500'
                    : 'bg-white text-stone-800 border border-stone-300 hover:bg-stone-100'
                }`}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Trang Trước</span>
              </button>

              <span className="text-xs font-semibold text-stone-500">
                Đang xem: {activeSubPageIndex === null ? 'Bài chính (1)' : `Trang con (${activeSubPageIndex + 2}/${article.subPages.length + 1})`}
              </span>

              <button
                type="button"
                disabled={activeSubPageIndex === article.subPages.length - 1}
                onClick={() => {
                  if (activeSubPageIndex === null) {
                    setActiveSubPageIndex(0);
                  } else if (activeSubPageIndex < article.subPages.length - 1) {
                    setActiveSubPageIndex(activeSubPageIndex + 1);
                  }
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeSubPageIndex === article.subPages.length - 1
                    ? 'opacity-40 cursor-not-allowed bg-stone-200 text-stone-500'
                    : 'bg-red-600 text-white hover:bg-red-700 shadow-sm'
                }`}
              >
                <span>Trang Tiếp Theo</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="p-6 sm:p-8 bg-white border-t border-stone-100 flex flex-wrap items-center gap-2">
              <Tag className="w-4 h-4 text-stone-400" />
              <span className="text-xs font-bold text-stone-500">Thẻ bài viết:</span>
              {article.tags.map((t, idx) => (
                <span key={idx} className="px-2.5 py-1 bg-stone-100 text-stone-700 text-xs rounded-lg font-medium">
                  #{t}
                </span>
              ))}
            </div>
          )}

          {/* Author Bio Card */}
          <div className="p-6 sm:p-8 bg-red-50/50 border-t border-red-100 flex flex-col sm:flex-row items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-red-600 text-white font-black text-xl flex items-center justify-center shadow-md shrink-0">
              SEIU
            </div>
            <div className="space-y-1 text-center sm:text-left">
              <div className="font-bold text-stone-900 flex items-center justify-center sm:justify-start gap-2">
                <span>{article.author || 'Thầy Lê Trí Bửu'}</span>
                <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded-full font-bold">{article.authorRole || 'Giám đốc SEIU'}</span>
              </div>
              <p className="text-xs text-stone-600 max-w-xl">
                Giám đốc SEIU, Cử nhân Hàn Quốc học với 7 năm kinh nghiệm trong lĩnh vực đào tạo tiếng Hàn và tư vấn du học Hàn Quốc.
              </p>
            </div>
          </div>
        </article>

        {/* Bottom Consultation CTA Banner */}
        <div className="mt-8 p-6 sm:p-8 bg-gradient-to-br from-red-600 via-red-700 to-stone-900 text-white rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-amber-300 rounded-full text-xs font-black uppercase tracking-wider inline-flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Phí dịch vụ chỉ thu sau khi đậu Visa
            </span>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight">
              Đăng Ký Học Tiếng Hàn & Thẩm Định Hồ Sơ Cùng Thầy Bửu
            </h3>
            <p className="text-xs sm:text-sm text-red-100 max-w-xl">
              SEIU đồng hành học tiếng Hàn và chuẩn bị hồ sơ tại khu vực Vị Thanh và TP.HCM. Gói phí dịch vụ được liệt kê rõ hạng mục bao gồm và không bao gồm trước khi ký hợp đồng.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <button
              onClick={() => onOpenConsultation(`Đăng ký qua bài viết: ${article.title}`)}
              className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-stone-100 text-red-700 font-black text-xs rounded-xl shadow-lg transition-all uppercase tracking-wide flex items-center justify-center gap-2"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Đăng Ký Tư Vấn Ngay</span>
            </button>
            <a
              href="tel:0972249450"
              className="w-full sm:w-auto px-5 py-3 bg-red-800 hover:bg-red-900 text-white font-bold text-xs rounded-xl border border-red-400/40 shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <PhoneCall className="w-4 h-4 text-amber-300" />
              <span>0972 249 450</span>
            </a>
          </div>
        </div>

        {/* Comments & Discussion */}
        <div className="mt-8 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm">
          <div className="flex items-center gap-2 mb-6 pb-3 border-b border-stone-200">
            <MessageSquare className="w-5 h-5 text-red-600" />
            <h4 className="text-base font-black text-stone-900">
              Hỏi Đáp & Thảo Luận Cùng Giảng Viên ({comments.length})
            </h4>
          </div>

          {/* Existing comments */}
          <div className="space-y-4 mb-6">
            {comments.map((c, idx) => (
              <div key={idx} className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
                <div className="flex items-center justify-between text-xs font-bold text-stone-900 mb-1">
                  <span>{c.name}</span>
                  <span className="text-stone-400 font-normal text-[11px]">{c.date}</span>
                </div>
                <p className="text-xs text-stone-700 leading-relaxed">{c.text}</p>
              </div>
            ))}
          </div>

          {/* Form write comment */}
          <form onSubmit={handleAddComment} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                value={commentName}
                onChange={(e) => setCommentName(e.target.value)}
                placeholder="Họ và tên của bạn..."
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-hidden focus:ring-2 focus:ring-red-600"
              />
            </div>
            <textarea
              rows={3}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Đặt câu hỏi hoặc chia sẻ ý kiến về bài học này..."
              className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-hidden focus:ring-2 focus:ring-red-600"
              required
            />
            <button
              type="submit"
              className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Gửi Câu Hỏi / Bình Luận</span>
            </button>
          </form>
        </div>

        {/* Related Articles Subpages */}
        {relatedArticles.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="text-lg font-black text-stone-900">Bài Viết & Cẩm Nang Liên Quan</h4>
                <p className="text-xs text-stone-500">Khám phá thêm các kiến thức du học và ngữ pháp tiếng Hàn</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => onSelectArticle(rel)}
                  className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col"
                >
                  <div className="relative h-44 overflow-hidden bg-stone-100">
                    <img src={rel.coverImage} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full scale-110 object-cover opacity-25 blur-xl" />
                    <img
                      src={rel.coverImage}
                      alt={rel.title}
                      className="relative h-full w-full object-contain group-hover:scale-[1.02] transition-transform duration-500"
                    />
                    <span className="absolute top-3 left-3 px-2.5 py-0.5 bg-stone-900/80 backdrop-blur-md text-white text-[10px] font-bold rounded-full">
                      {rel.category}
                    </span>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h5 className="font-bold text-stone-900 text-sm group-hover:text-red-600 transition-colors line-clamp-2">
                        {rel.title}
                      </h5>
                      <p className="text-xs text-stone-500 mt-1 line-clamp-2">
                        {rel.summary}
                      </p>
                    </div>
                    <div className="pt-3 mt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-400">
                      <span>{rel.publishedAt}</span>
                      <span className="font-bold text-red-600 flex items-center gap-1">
                        Xem bài <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
