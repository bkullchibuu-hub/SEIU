import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Calendar, Clock, Newspaper, Pin, Sparkles } from 'lucide-react';
import { Article, getStoredArticles } from '../services/blogService';
import { AdmissionBoard } from './AdmissionBoard';

interface Props {
  onSelectArticle: (article: Article) => void;
  onViewAll: () => void;
  onOpenConsultation: (topic?: string) => void;
}

const articleDate = (value: string): number => {
  const parts = String(value || '').match(/(\d{1,2})\D+(\d{1,2})\D+(\d{4})/);
  if (parts) return new Date(Number(parts[3]), Number(parts[2]) - 1, Number(parts[1])).getTime();
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const ArticleCard: React.FC<{ article: Article; pinned?: boolean; onOpen: () => void }> = ({ article, pinned, onOpen }) => (
  <button data-motion-card onClick={onOpen} className={`group overflow-hidden border border-stone-200 bg-white text-left transition-all hover:border-red-700 ${pinned ? 'k1-pinned-card grid sm:grid-cols-2' : ''}`}>
    <div className="relative aspect-square overflow-hidden bg-stone-100">
      <img src={article.coverImage || '/seiu-logo.svg'} alt={article.coverImageAlt || article.title} className="relative z-[1] h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
      <div className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-t from-stone-950/35 via-transparent to-transparent" />
      <span className="absolute left-0 top-0 z-[3] max-w-[68%] truncate bg-red-700 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-white">{article.category}</span>
      {pinned && <span className="absolute right-0 top-0 z-[3] flex items-center gap-1 bg-stone-950 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-white"><Pin className="h-3 w-3" /> Bài ghim</span>}
    </div>
    <div className={`flex flex-col justify-center ${pinned ? 'p-6 lg:p-8' : 'p-5'}`}>
      <div className="mb-2 flex items-center gap-3 text-[11px] text-stone-400"><span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{article.publishedAt}</span><span className="flex items-center gap-1"><Clock className="h-3 w-3" />{article.readTime}</span></div>
      <h3 className={`line-clamp-3 font-black leading-snug text-stone-950 transition-colors group-hover:text-red-700 ${pinned ? 'text-xl lg:text-2xl' : 'text-base'}`}>{article.title}</h3>
      <p className="mt-3 line-clamp-3 text-xs leading-6 text-stone-600">{article.summary}</p>
      <span className="mt-5 flex items-center gap-2 text-xs font-black uppercase tracking-wider text-red-700">Đọc bài viết <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" /></span>
    </div>
  </button>
);

export const HomeLatestArticlesSection: React.FC<Props> = ({ onSelectArticle, onViewAll, onOpenConsultation }) => {
  const [articles, setArticles] = useState<Article[]>(getStoredArticles());

  useEffect(() => {
    const refresh = () => setArticles(getStoredArticles());
    window.addEventListener('seiu_articles_updated', refresh);
    window.addEventListener('seiu_blog_updated', refresh);
    return () => {
      window.removeEventListener('seiu_articles_updated', refresh);
      window.removeEventListener('seiu_blog_updated', refresh);
    };
  }, []);

  const { pinned, latest } = useMemo(() => {
    const sorted = articles
      .map((article, index) => ({ article, index }))
      .sort((a, b) => articleDate(b.article.publishedAt) - articleDate(a.article.publishedAt) || a.index - b.index)
      .map(item => item.article);
    const pinnedItems = sorted.filter(article => article.isFeatured).slice(0, 2);
    return { pinned: pinnedItems, latest: sorted.filter(article => !article.isFeatured).slice(0, 4) };
  }, [articles]);

  if (!articles.length) return null;

  return <section className="border-y border-stone-200 bg-stone-50 py-20 lg:py-28" id="latest-articles">
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
      <div className="mb-12 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div><div className="k1-eyebrow mb-4"><Newspaper className="h-3.5 w-3.5" /><span>SEIU JOURNAL</span><span>교육 소식</span></div><h2 className="k1-display text-3xl font-black tracking-tight text-stone-950 sm:text-5xl">Tin tức & câu chuyện học viên</h2><p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600">Hoạt động lớp học, kinh nghiệm tiếng Hàn và thông tin chuẩn bị du học được biên tập rõ ràng, dễ theo dõi.</p></div>
        <button onClick={onViewAll} className="k1-text-link flex items-center gap-2 self-start border-b border-stone-950 pb-2 text-xs font-black uppercase tracking-wider text-stone-950">Xem tất cả bài viết <ArrowRight className="h-4 w-4" /></button>
      </div>

      {pinned.length > 0 && <div className="mb-12"><h3 className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-red-700"><Pin className="h-4 w-4" /> Featured / Bài viết được ghim</h3><div className="grid gap-6 xl:grid-cols-2">{pinned.map(article => <ArticleCard key={article.id} article={article} pinned onOpen={() => onSelectArticle(article)} />)}</div></div>}

      <AdmissionBoard onOpenConsultation={onOpenConsultation} />

      <div><h3 className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-red-700"><Sparkles className="h-4 w-4" /> Latest / 4 bài mới nhất</h3><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{latest.map(article => <ArticleCard key={article.id} article={article} onOpen={() => onSelectArticle(article)} />)}</div></div>
    </div>
  </section>;
};
