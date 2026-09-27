import React, { useState, useEffect } from 'react';
import { Newspaper, Calendar, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import { getStoredNews, visibleSlice, NewsEventItem } from '../services/siteDataService';
import { getStoredSiteConfig } from '../services/siteConfigService';

interface Props {
  onNavigateToNews?: () => void;
}

export const NewsEventsSection: React.FC<Props> = ({ onNavigateToNews }) => {
  const readNews = () =>
    visibleSlice(getStoredNews(), getStoredSiteConfig().newsVisibleCount ?? 6);

  const [newsList, setNewsList] = useState<NewsEventItem[]>(readNews);

  useEffect(() => {
    const handleSync = () => setNewsList(readNews());
    window.addEventListener('seiu_site_data_updated', handleSync);
    window.addEventListener('seiu_site_config_updated', handleSync);
    return () => {
      window.removeEventListener('seiu_site_data_updated', handleSync);
      window.removeEventListener('seiu_site_config_updated', handleSync);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="border-t border-stone-200 bg-white py-20 lg:py-28" id="news-events">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <div className="k1-eyebrow mb-4">
              <Newspaper className="w-3.5 h-3.5" />
              <span>EDUCATION NEWS</span><span>교육 뉴스</span>
            </div>
            <h2 className="k1-display text-3xl font-black tracking-tight text-stone-950 sm:text-5xl">
              Tin Tức, Lịch Thi TOPIK & Sự Kiện Mới Nhất
            </h2>
          </div>

          {onNavigateToNews && (
            <button
              onClick={onNavigateToNews}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-red-600 hover:text-red-700 transition-colors group"
            >
              <span>Xem tất cả bản tin</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          )}
        </div>

        {/* News Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {newsList.map((item) => (
            <div
              key={item.id}
              data-motion-card
              className="flex flex-col justify-between border border-stone-200 bg-stone-50 p-6 transition-all hover:border-red-700"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="border-l-2 border-red-700 bg-red-50 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide text-red-700">
                    {item.category}
                  </span>
                  <span className="text-xs text-stone-400 font-mono flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{item.date}</span>
                  </span>
                </div>

                <h3 className="font-extrabold text-stone-900 text-base leading-snug mb-2 hover:text-red-600 transition-colors">
                  {item.title}
                </h3>

                <p className="text-xs text-stone-600 leading-relaxed">
                  {item.summary}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-stone-200 flex items-center justify-between text-xs">
                <span className="font-bold text-stone-700 bg-white px-2.5 py-1 rounded-lg border border-stone-200">
                  {item.tag}
                </span>
                <span className="text-red-600 font-bold">Chi tiết →</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
