import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Phone, Sparkles } from 'lucide-react';
import { getStoredSiteConfig, SiteConfig } from '../services/siteConfigService';

interface Props {
  onOpenConsultation: (topic?: string) => void;
}

interface HeroSlide {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  image: string;
  consultationTopic: string;
}

const AUTO_PLAY_MS = 5000;

/** Banner chuyển động đầu trang, tối đa 3 ảnh do quản trị viên cấu hình. */
export const HomeCover: React.FC<Props> = ({ onOpenConsultation }) => {
  const [cfg, setCfg] = useState<SiteConfig>(getStoredSiteConfig());
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const updateConfig = () => setCfg(getStoredSiteConfig());
    window.addEventListener('seiu_site_config_updated', updateConfig);
    return () => {
      window.removeEventListener('seiu_site_config_updated', updateConfig);
    };
  }, []);

  const slides = useMemo<HeroSlide[]>(() => {
    const configured = (cfg.homeCoverImages || []).filter(Boolean).slice(0, 3);
    const fallbackImages = [cfg.homeCoverImage, cfg.heroBannerBgImage, cfg.heroStudentImage]
      .filter((image): image is string => Boolean(image))
      .slice(0, 3);
    const images = (configured.length ? configured : fallbackImages)
      .filter((image, index, all) => all.indexOf(image) === index);
    const eyebrows = [
      'Học tiếng Hàn tại Vị Thanh, Hậu Giang',
      'TOPIK · Phản xạ · Phỏng vấn',
      'Du học Hàn Quốc cùng SEIU',
    ];

    const configuredSlides = images.map((image, index): HeroSlide => ({
      id: `home-cover-${index + 1}`,
      eyebrow: eyebrows[index] || 'SEIU · 한국어 교육',
      title: cfg.homeCoverHeadline || 'Học Tiếng Hàn & Du Học Hàn Quốc Tại Vị Thanh',
      subtitle: cfg.homeCoverSubline || cfg.heroDescription,
      image,
      consultationTopic: `Đăng ký tư vấn từ ảnh bìa ${index + 1} trang chủ`,
    }));

    return configuredSlides.length > 0 ? configuredSlides : [{
      id: 'fallback',
      eyebrow: 'SEIU · 한국어 교육',
      title: cfg.heroTitle,
      subtitle: cfg.heroDescription,
      image: '',
      consultationTopic: 'Đăng ký tư vấn tại SEIU',
    }];
  }, [cfg]);

  useEffect(() => {
    setActiveIndex((current) => Math.min(current, slides.length - 1));
  }, [slides.length]);

  useEffect(() => {
    if (paused || slides.length <= 1) return;
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, AUTO_PLAY_MS);
    return () => window.clearInterval(timer);
  }, [paused, slides.length]);

  if (cfg.homeCoverEnabled === false) return null;

  const goTo = (index: number) => setActiveIndex((index + slides.length) % slides.length);
  const activeSlide = slides[activeIndex];
  const clamp = (value: number | undefined, minimum: number, maximum: number, fallback: number) => (
    Math.min(maximum, Math.max(minimum, Number.isFinite(value) ? Number(value) : fallback))
  );
  const panelWidth = clamp(cfg.homeCoverPanelWidth, 34, 70, 46);
  const panelStyle = {
    '--k2-panel-width': `${panelWidth}%`,
    '--k2-panel-x': `${clamp(cfg.homeCoverPanelX, 0, 96 - panelWidth, 4)}%`,
    '--k2-panel-y': `${clamp(cfg.homeCoverPanelY, 24, 76, 50)}%`,
  } as React.CSSProperties;
  const imageFocusStyle = {
    objectPosition: `${clamp(cfg.homeCoverImagePositionX, 0, 100, 50)}% ${clamp(cfg.homeCoverImagePositionY, 0, 100, 50)}%`,
  } as React.CSSProperties;

  return (
    <section
      id="home-cover"
      className="seiu-hero-carousel k2-hero relative isolate overflow-hidden bg-[#f5f7fb]"
      aria-roledescription="carousel"
      aria-label="Thông tin nổi bật SEIU"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="relative min-h-[730px] sm:min-h-[760px] lg:min-h-[720px]">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-out ${
              index === activeIndex
                ? 'z-10 opacity-100'
                : 'z-0 opacity-0'
            }`}
            aria-hidden={index !== activeIndex}
          >
            {slide.image ? (
              <div className={`k2-hero-image absolute inset-x-0 top-0 h-[52%] overflow-hidden sm:h-[58%] lg:inset-0 lg:h-full ${index === activeIndex ? 'is-active' : ''}`}>
                <img
                  src={slide.image}
                  alt=""
                  className={`h-full w-full object-cover transition-transform duration-[5200ms] ease-out ${index === activeIndex ? 'scale-[1.035]' : 'scale-100'}`}
                  style={imageFocusStyle}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  referrerPolicy="no-referrer"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/90 lg:bg-gradient-to-r lg:from-white lg:via-white/55 lg:to-transparent" />
              </div>
            ) : (
              <div className="absolute inset-x-0 top-0 h-[52%] bg-gradient-to-br from-sky-100 via-white to-rose-100 sm:h-[58%] lg:inset-0 lg:h-full" />
            )}
          </div>
        ))}

        <div className="k2-hero-stage pointer-events-none relative z-20 mx-auto flex min-h-[730px] max-w-[1520px] items-end px-4 pb-14 pt-10 sm:min-h-[760px] sm:px-6 sm:pb-16 lg:min-h-[720px]" style={panelStyle}>
          <div className="k2-hero-panel-positioner w-full">
          <div key={activeSlide.id} className="seiu-hero-copy k2-hero-card pointer-events-auto relative w-full bg-white/95 px-6 py-8 text-[#14213d] shadow-[0_24px_70px_-30px_rgba(20,33,61,.28)] backdrop-blur-sm sm:px-10 sm:py-10 lg:px-12 lg:py-12" aria-live="polite">
            <span className="k2-floating-ko absolute -right-2 -top-10 hidden bg-[#153a70] px-4 py-2 text-xs font-black tracking-[0.18em] text-white sm:block">배움이 미래를 만듭니다</span>
            <div className="mb-5 flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.18em] text-[#e23b43]">
              <Sparkles className="h-4 w-4" />
              <span>{activeSlide.eyebrow}</span>
            </div>
            <h1 className="k1-display max-w-3xl text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-[58px]">
              {activeSlide.title}
            </h1>
            <p className="mt-5 max-w-2xl text-sm font-medium leading-7 text-slate-600 sm:text-base sm:leading-8">
              {activeSlide.subtitle}
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                onClick={() => onOpenConsultation(activeSlide.consultationTopic)}
                className="seiu-primary-action group inline-flex items-center justify-center gap-2 rounded-full bg-[#e23b43] px-7 py-3.5 text-sm font-black text-white transition-all hover:bg-[#c52833]"
              >
                Nhận tư vấn lộ trình
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </button>
              <a
                href={`tel:${cfg.hotline}`}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-7 py-3.5 text-sm font-black text-[#153a70] transition-all hover:border-[#153a70] hover:bg-[#eff5ff]"
              >
                <Phone className="h-5 w-5 text-[#e23b43]" />
                {cfg.hotlineFormatted}
              </a>
            </div>
            <div className="mt-7 flex items-center gap-3 border-t border-slate-200 pt-5 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
              <span className="h-2 w-2 rounded-full bg-[#e23b43]" /> SEIU Korean Language & Study Abroad
            </div>
          </div>
          </div>
        </div>

        {slides.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => goTo(activeIndex - 1)}
              className="absolute right-20 top-5 z-30 hidden h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-[#153a70] shadow-sm transition hover:border-[#153a70] hover:bg-[#153a70] hover:text-white lg:inline-flex"
              aria-label="Banner trước"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => goTo(activeIndex + 1)}
              className="absolute right-6 top-5 z-30 hidden h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-[#153a70] shadow-sm transition hover:border-[#153a70] hover:bg-[#153a70] hover:text-white lg:inline-flex"
              aria-label="Banner tiếp theo"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <div className="absolute bottom-5 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 lg:bottom-8 lg:left-auto lg:right-8 lg:translate-x-0">
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => goTo(index)}
                  className={`relative h-2 overflow-hidden rounded-full transition-all ${index === activeIndex ? 'w-12 bg-slate-300' : 'w-2 bg-slate-300 hover:bg-[#153a70]'}`}
                  aria-label={`Xem banner ${index + 1}: ${slide.title}`}
                  aria-current={index === activeIndex ? 'true' : undefined}
                >
                  {index === activeIndex && !paused && <span className="seiu-carousel-progress absolute inset-y-0 left-0 rounded-full bg-[#e23b43]" />}
                </button>
              ))}
            </div>
            <div className="absolute right-5 top-[calc(52%+12px)] z-30 font-mono text-[10px] font-bold tracking-[0.18em] text-slate-400 sm:top-[calc(58%+12px)] lg:bottom-8 lg:left-auto lg:right-8 lg:top-auto">
              <span className="text-lg text-[#153a70]">{String(activeIndex + 1).padStart(2, '0')}</span>
              <span className="mx-2 text-[#e23b43]">/</span>{String(slides.length).padStart(2, '0')}
            </div>
          </>
        )}
      </div>
    </section>
  );
};
