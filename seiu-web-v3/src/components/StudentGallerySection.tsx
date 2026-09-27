import React, { useState, useEffect } from 'react';
import { Camera, Sparkles, Heart, Users, MapPin, CheckCircle2 } from 'lucide-react';
import { getStoredGallery, sortNewestFirst, GalleryItem } from '../services/siteDataService';

interface Props {
  onOpenConsultation?: (topic?: string) => void;
}

export const StudentGallerySection: React.FC<Props> = ({ onOpenConsultation }) => {
  const readGallery = () => sortNewestFirst(getStoredGallery().filter(g => !g.archived));
  const [items, setItems] = useState<GalleryItem[]>(readGallery);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  useEffect(() => {
    const handleSync = () => setItems(readGallery());
    window.addEventListener('seiu_site_data_updated', handleSync);
    return () => window.removeEventListener('seiu_site_data_updated', handleSync);
  }, []);

  const filteredItems = activeCategory === 'all' 
    ? items 
    : items.filter(item => item.category.toLowerCase().includes(activeCategory.toLowerCase()));

  return (
    <section className="border-t border-stone-200 bg-white py-20 lg:py-28" id="student-gallery">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="k1-eyebrow mb-4">
              <Camera className="w-3.5 h-3.5" />
              <span>SEIU CAMPUS LIFE</span><span>학생 이야기</span>
            </div>
            <h2 className="k1-display text-3xl font-black tracking-tight text-stone-950 sm:text-5xl">
              Khoảnh khắc thật tại SEIU
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600">
              Lớp học, sự kiện, tiễn bay và cuộc sống học viên tại Hàn Quốc.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 no-scrollbar" role="tablist" aria-label="Lọc hình ảnh hoạt động">
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'tiễn bay', label: 'Tiễn bay sân bay' },
              { id: 'lớp học', label: 'Lớp học SEIU' },
              { id: 'hàn quốc', label: 'Cuộc sống Hàn Quốc' },
              { id: 'sự kiện', label: 'Trao Visa & Học bổng' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                role="tab"
                aria-selected={activeCategory === cat.id}
                aria-controls="student-gallery-grid"
                className={`relative border-b-2 px-3 py-2 text-xs font-black uppercase tracking-wide whitespace-nowrap transition-all ${
                  activeCategory === cat.id
                    ? 'border-red-700 text-red-700'
                    : 'border-transparent text-stone-500 hover:border-stone-300 hover:text-stone-950'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        <div
          key={activeCategory}
          id="student-gallery-grid"
          role="tabpanel"
          className="seiu-tab-panel grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {filteredItems.length === 0 && (
            <div className="sm:col-span-2 lg:col-span-3 rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center">
              <Camera className="mx-auto h-8 w-8 text-red-500" />
              <p className="mt-3 text-sm font-bold text-stone-800">Album ảnh thực tế đang được cập nhật</p>
              <p className="mt-1 text-xs text-stone-500">Quản trị viên có thể tải ảnh lớp học, sự kiện và hành trình sang Hàn trong Cổng quản trị.</p>
            </div>
          )}
          {filteredItems.map(item => (
            <div
              key={item.id}
              data-motion-card
              className="group flex flex-col justify-between overflow-hidden border border-stone-200 bg-white transition-all hover:border-red-700"
            >
              <div className="relative aspect-4/3 overflow-hidden bg-stone-100">
                <img
                  src={item.url}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute left-0 top-0 bg-stone-950/90 px-3 py-1.5 text-[11px] font-bold text-white backdrop-blur-xs">
                  {item.date}
                </div>
                <div className="absolute right-0 top-0 bg-red-700/95 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-white">
                  {item.category}
                </div>
              </div>

              <div className="p-4.5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-red-600 font-semibold mb-1">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{item.location}</span>
                  </div>
                  <h3 className="font-extrabold text-stone-900 text-sm sm:text-base leading-snug group-hover:text-red-600 transition-colors">
                    {item.title}
                  </h3>
                  {item.caption && (
                    <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                      {item.caption}
                    </p>
                  )}
                </div>

                {onOpenConsultation && (
                  <div className="pt-3 mt-3 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-[11px] text-stone-400 font-medium">Trung tâm SEIU</span>
                    <button
                      onClick={() => onOpenConsultation(`Đăng ký tư vấn du học giống học viên: ${item.title}`)}
                      className="text-xs font-bold text-red-600 hover:text-red-700 underline"
                    >
                      Tư vấn lộ trình →
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
