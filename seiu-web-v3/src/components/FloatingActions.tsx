import React, { useState, useEffect } from 'react';
import { PhoneCall, Sparkles, ArrowUp, Award } from 'lucide-react';
import { getStoredSiteConfig } from '../services/siteConfigService';
import { getSocialLinks } from './SocialLinks';

interface FloatingActionsProps {
  onOpenConsultation: () => void;
  onOpenLevelTest: () => void;
  onOpenScholarshipCheck: () => void;
}

export const FloatingActions: React.FC<FloatingActionsProps> = ({
  onOpenConsultation,
  onOpenLevelTest,
  onOpenScholarshipCheck,
}) => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [siteConfig, setSiteConfig] = useState(getStoredSiteConfig());

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    const handleConfigUpdate = () => setSiteConfig(getStoredSiteConfig());
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('seiu_site_config_updated', handleConfigUpdate);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('seiu_site_config_updated', handleConfigUpdate);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="fixed bottom-6 right-4 sm:right-6 z-40 flex flex-col items-end gap-3">
      
      {/* Scroll to Top */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="w-10 h-10 rounded-full bg-stone-900 text-white flex items-center justify-center shadow-lg hover:bg-stone-800 transition-all active:scale-95 animate-in fade-in zoom-in-75 duration-200"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}

      {/* Quick Scholarship button */}
      <button
        onClick={onOpenScholarshipCheck}
        className="hidden sm:flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs shadow-lg transition-all active:scale-95 group border-2 border-white"
      >
        <Award className="w-4 h-4 text-stone-950" />
        <span>Kiểm tra học bổng</span>
      </button>

      {/* Quick Korean Level Test Floating Pill */}
      <button
        onClick={onOpenLevelTest}
        className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-full bg-white hover:bg-red-50 text-red-600 font-bold text-xs shadow-xl border-2 border-red-500 transition-all active:scale-95 group"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
        </span>
        <Sparkles className="w-4 h-4 text-red-600 group-hover:rotate-12 transition-transform" />
        <span>Thi thử TOPIK</span>
      </button>

      {/* Floating Hotline / Zalo Call */}
      <div className="flex items-center gap-2">
        {getSocialLinks(siteConfig).map(({ key, label, url, Icon, color }) => (
          <a
            key={key}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={`w-12 h-12 sm:w-13 sm:h-13 rounded-full text-white flex items-center justify-center shadow-xl border-2 border-white transition-all active:scale-95 ${color}`}
            title={`SEIU trên ${label}`}
            aria-label={`SEIU trên ${label}`}
          >
            <Icon className="w-5 h-5" />
          </a>
        ))}

        <a
          href={`https://zalo.me/${siteConfig.hotline}`}
          target="_blank"
          rel="noreferrer"
          className="w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-xl border-2 border-white transition-all active:scale-95 font-bold font-heading text-xs"
          title="Chat Zalo cùng SEIU"
        >
          Zalo
        </a>

        <a
          href={`tel:${siteConfig.hotline}`}
          className="w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-xl border-2 border-white transition-all active:scale-95 relative"
          title="Gọi Hotline tư vấn miễn phí"
        >
          <PhoneCall className="w-6 h-6" />
        </a>
      </div>

    </div>
  );
};
