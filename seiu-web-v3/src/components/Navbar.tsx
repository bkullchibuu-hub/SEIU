import React, { useState, useEffect } from 'react';
import { SeiuLogo } from './SeiuLogo';
import { 
  PhoneCall, 
  Sparkles, 
  Menu, 
  X, 
  GraduationCap, 
  Building2, 
  Award,
  ChevronDown,
  Settings,
  MapPin,
  Compass,
  ArrowUpRight
} from 'lucide-react';
import { getStoredSiteConfig, SiteConfig } from '../services/siteConfigService';

export type AppPageType = 
  | 'home' 
  | 'topik-master' 
  | 'study-abroad' 
  | 'universities' 
  | 'cost-75m' 
  | 'ai-learning' 
  | 'blog' 
  | 'branches';

interface NavbarProps {
  currentPage: AppPageType;
  onNavigate: (page: AppPageType) => void;
  onOpenConsultation: (topic?: string) => void;
  onOpenLevelTest: () => void;
  onOpenScholarshipCheck: () => void;
  onOpenLeadManager: () => void;
  onOpenLogoManager: () => void;
  onOpenAdminPanel?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  onOpenConsultation,
  onOpenLevelTest,
  onOpenScholarshipCheck,
  onOpenLeadManager,
  onOpenLogoManager,
  onOpenAdminPanel,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [studyAbroadDropdown, setStudyAbroadDropdown] = useState(false);
  const [moreDropdown, setMoreDropdown] = useState(false);
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(getStoredSiteConfig());

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    const handleConfigUpdate = () => {
      setSiteConfig(getStoredSiteConfig());
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('seiu_site_config_updated', handleConfigUpdate);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('seiu_site_config_updated', handleConfigUpdate);
    };
  }, []);

  const handleNavClick = (page: AppPageType) => {
    setMobileMenuOpen(false);
    setStudyAbroadDropdown(false);
    setMoreDropdown(false);
    onNavigate(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [logoClickCount, setLogoClickCount] = useState(0);

  const handleLogoClick = () => {
    handleNavClick('home');
    const newCount = logoClickCount + 1;
    setLogoClickCount(newCount);
    if (newCount >= 3) {
      setLogoClickCount(0);
      if (onOpenAdminPanel) {
        onOpenAdminPanel();
      }
    } else {
      setTimeout(() => setLogoClickCount(0), 1000);
    }
  };

  return (
    <>
      {/* Top Clean White & Red Notification Bar */}
      <div className="k1-topbar k2-topbar border-b border-white/10 bg-[#153a70] px-4 py-2 text-xs text-white transition-colors">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 border-r border-white/30 pr-3 text-[10px] font-black uppercase tracking-[0.16em] text-white">
              <Sparkles className="w-3 h-3 animate-pulse" /> {siteConfig.sloganVi}
            </span>
            <span className="hidden font-medium text-red-50 sm:inline">
              Lớp vừa đủ để giáo viên theo sát từng học viên · Đăng ký lịch học mới
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs font-semibold">
            <div className="hidden items-center gap-1.5 text-[11px] font-medium text-red-100 md:flex">
              <MapPin className="w-3.5 h-3.5 text-white" />
              <span>Vị Thanh, Hậu Giang · TP.HCM</span>
            </div>

            <a
              href={`tel:${siteConfig.hotline}`}
              className="flex items-center gap-1.5 border-l border-white/30 pl-3 font-bold text-white transition-colors hover:text-red-100"
            >
              <PhoneCall className="w-3.5 h-3.5 text-white" />
              <span>{siteConfig.hotlineFormatted}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Sticky Navbar */}
      <header
        className={`k1-navbar k2-navbar sticky top-0 z-40 w-full transition-all duration-300 ${
          isScrolled
            ? 'border-b border-stone-200 bg-white/95 py-2 shadow-[0_8px_30px_-20px_rgba(0,0,0,.45)] backdrop-blur-md'
            : 'border-b border-stone-200 bg-white py-3'
        }`}
      >
        <div className="k2-navbar-shell mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          {/* Logo with Brand */}
          <div
            onClick={handleLogoClick}
            className="k2-brand-lockup flex cursor-pointer items-center gap-3 focus:outline-none"
            role="button"
            tabIndex={0}
            title="Trung Tâm Du Học & Tiếng Hàn SEIU"
          >
            <SeiuLogo size="md" variant="horizontal" />
            <span className="hidden border-l border-slate-200 pl-3 text-[9px] font-black uppercase leading-4 tracking-[0.18em] text-slate-400 2xl:block">한국어 교육<br />유학 컨설팅</span>
          </div>

          {/* Desktop navigation — gom nhóm gọn như website giáo dục Hàn Quốc. */}
          <nav className="k2-desktop-nav hidden items-center gap-1 rounded-full border border-slate-200/80 bg-slate-50/90 p-1 text-[13px] font-bold text-slate-700 xl:flex">
            <button onClick={() => handleNavClick('home')} className={`k2-nav-item ${currentPage === 'home' ? 'is-active' : ''}`}>Trang chủ</button>

            <button onClick={() => handleNavClick('topik-master')} className={`k2-master-pill ${currentPage === 'topik-master' ? 'is-active' : ''}`}>
              <Sparkles className="h-3.5 w-3.5" /><span>TOPIK MASTER</span><span className="k2-master-free">MIỄN PHÍ</span><span className="k2-live-dot" />
            </button>

            <div className="relative" onMouseEnter={() => setStudyAbroadDropdown(true)} onMouseLeave={() => setStudyAbroadDropdown(false)}>
              <button onClick={() => handleNavClick('study-abroad')} className={`k2-nav-item flex items-center gap-1 ${currentPage === 'study-abroad' ? 'is-active' : ''}`}>
                Du học Hàn <ChevronDown className={`h-3.5 w-3.5 transition-transform ${studyAbroadDropdown ? 'rotate-180' : ''}`} />
              </button>
              {studyAbroadDropdown && (
                <div className="k2-nav-dropdown absolute left-0 top-[calc(100%+12px)] z-50 w-[360px] p-3">
                  <div className="mb-2 rounded-2xl bg-[#153a70] p-4 text-white">
                    <span className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-100">Study in Korea</span>
                    <p className="mt-1 text-sm font-black">Lộ trình rõ từng bước, hồ sơ minh bạch</p>
                  </div>
                  <button onClick={() => handleNavClick('study-abroad')} className="k2-dropdown-row"><GraduationCap className="h-4 w-4" /><span><strong>Hệ tiếng D4-1</strong><small>Chuẩn bị tiếng Hàn và hồ sơ trường</small></span></button>
                  <button onClick={() => handleNavClick('study-abroad')} className="k2-dropdown-row"><Building2 className="h-4 w-4" /><span><strong>Cao đẳng · Đại học</strong><small>D2-1 · D2-2 · D2-3</small></span></button>
                  <button onClick={() => handleNavClick('cost-75m')} className="k2-dropdown-row"><Award className="h-4 w-4" /><span><strong>Chi phí & chính sách</strong><small>Xem rõ hạng mục gói 75 triệu</small></span></button>
                </div>
              )}
            </div>

            <button onClick={() => handleNavClick('ai-learning')} className={`k2-nav-item flex items-center gap-1.5 ${currentPage === 'ai-learning' ? 'is-active' : ''}`}><Sparkles className="h-3.5 w-3.5 text-[#e23b43]" />Học cùng AI</button>
            <button onClick={() => handleNavClick('blog')} className={`k2-nav-item ${currentPage === 'blog' ? 'is-active' : ''}`}>Tin tức</button>

            <div className="relative" onMouseEnter={() => setMoreDropdown(true)} onMouseLeave={() => setMoreDropdown(false)}>
              <button className={`k2-nav-item flex items-center gap-1 ${['universities', 'cost-75m', 'branches'].includes(currentPage) ? 'is-active' : ''}`}>
                Khám phá <ChevronDown className={`h-3.5 w-3.5 transition-transform ${moreDropdown ? 'rotate-180' : ''}`} />
              </button>
              {moreDropdown && (
                <div className="k2-nav-dropdown absolute right-0 top-[calc(100%+12px)] z-50 w-[290px] p-3">
                  <button onClick={() => handleNavClick('universities')} className="k2-dropdown-row"><Building2 className="h-4 w-4" /><span><strong>Trường đối tác</strong><small>Tra cứu trường Hàn Quốc</small></span></button>
                  <button onClick={() => handleNavClick('branches')} className="k2-dropdown-row"><MapPin className="h-4 w-4" /><span><strong>Cơ sở SEIU</strong><small>Vị Thanh, Hậu Giang · TP.HCM</small></span></button>
                  <button onClick={() => handleNavClick('cost-75m')} className="k2-dropdown-row"><Compass className="h-4 w-4" /><span><strong>Gói dịch vụ 75 triệu</strong><small>Phạm vi hỗ trợ và chi phí</small></span></button>
                </div>
              )}
            </div>
          </nav>

          {/* Action Buttons & Admin Login */}
          <div className="hidden items-center gap-2 lg:flex">
            {onOpenAdminPanel && (
              <button
                onClick={onOpenAdminPanel}
                className="k2-admin-button inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-all hover:-translate-y-0.5 hover:border-[#153a70] hover:text-[#153a70]"
                title="Đăng nhập bảng quản trị Admin"
              >
                <Settings className="h-4 w-4" />
              </button>
            )}

            <button
              onClick={() => onOpenConsultation('Đăng ký tư vấn du học & chính sách thu phí dịch vụ sau Visa')}
                className="k2-consult-button group flex items-center gap-2 rounded-full bg-[#e23b43] px-5 py-3 text-xs font-black text-white transition-all hover:-translate-y-0.5 hover:bg-[#c52833]"
            >
              <span>Tư vấn lộ trình</span>
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </button>
          </div>

          {/* Mobile Hamburger */}
          <div className="xl:hidden flex items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="k2-menu-toggle rounded-full border border-slate-200 bg-white p-2.5 text-[#153a70] shadow-sm transition hover:border-[#153a70] focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="k2-mobile-menu border-b border-slate-200 bg-white px-4 pb-6 pt-3 shadow-xl animate-in slide-in-from-top-4 duration-200 xl:hidden">
            <div className="mb-3 flex items-center justify-between rounded-2xl bg-[#153a70] px-4 py-3 text-white">
              <div><p className="text-[9px] font-black uppercase tracking-[0.18em] text-blue-100">SEIU Navigation</p><p className="mt-0.5 text-sm font-black">Học tiếng Hàn · Du học Hàn</p></div>
              <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold">한국어</span>
            </div>
            <nav className="grid grid-cols-1 gap-1.5 text-sm font-semibold sm:grid-cols-2">
              <button
                onClick={() => handleNavClick('home')}
                className={`px-3 py-2.5 text-left rounded-xl transition-colors ${
                  currentPage === 'home' ? 'bg-red-50 text-red-600 font-bold' : 'text-stone-700 hover:bg-stone-50'
                }`}
              >
                Trang Chủ
              </button>

              <button
                onClick={() => handleNavClick('topik-master')}
                className={`px-3 py-2.5 text-left rounded-xl transition-colors flex items-center justify-between ${
                  currentPage === 'topik-master' ? 'bg-red-600 text-white font-bold' : 'bg-red-50 text-red-700 font-bold'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Học Tiếng Hàn - MASTER (1.556 câu)
                </span>
                <span className="text-[10px] bg-white text-red-600 px-2 py-0.5 rounded font-black">HOT</span>
              </button>

              <button
                onClick={() => handleNavClick('study-abroad')}
                className={`px-3 py-2.5 text-left rounded-xl transition-colors ${
                  currentPage === 'study-abroad' ? 'bg-red-50 text-red-600 font-bold' : 'text-stone-700 hover:bg-stone-50'
                }`}
              >
                Du Học Hàn Quốc (D4-1, D2-1, D2-2)
              </button>

              <button
                onClick={() => handleNavClick('universities')}
                className={`px-3 py-2.5 text-left rounded-xl transition-colors ${
                  currentPage === 'universities' ? 'bg-red-50 text-red-600 font-bold' : 'text-stone-700 hover:bg-stone-50'
                }`}
              >
                Trường Đại Học Đối Tác
              </button>

              <button
                onClick={() => handleNavClick('cost-75m')}
                className={`px-3 py-2.5 text-left rounded-xl transition-colors ${
                  currentPage === 'cost-75m' ? 'bg-red-50 text-red-600 font-bold' : 'text-stone-700 hover:bg-stone-50'
                }`}
              >
                Phí 75 Triệu (Thu Sau Visa)
              </button>

              <button
                onClick={() => handleNavClick('ai-learning')}
                className={`px-3 py-2.5 text-left rounded-xl transition-colors ${
                  currentPage === 'ai-learning' ? 'bg-red-50 text-red-600 font-bold' : 'text-stone-700 hover:bg-stone-50'
                }`}
              >
                Học cùng AI · Dịch & Phát âm
              </button>

              <button
                onClick={() => handleNavClick('blog')}
                className={`px-3 py-2.5 text-left rounded-xl transition-colors ${
                  currentPage === 'blog' ? 'bg-red-50 text-red-600 font-bold' : 'text-stone-700 hover:bg-stone-50'
                }`}
              >
                Blog
              </button>

              <button
                onClick={() => handleNavClick('branches')}
                className={`px-3 py-2.5 text-left rounded-xl transition-colors ${
                  currentPage === 'branches' ? 'bg-red-50 text-red-600 font-bold' : 'text-stone-700 hover:bg-stone-50'
                }`}
              >
                Cơ Sở (Vị Thanh - HCM)
              </button>
            </nav>

            <div className="pt-3 border-t border-stone-100 flex flex-col gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenConsultation('Đăng ký tư vấn du học');
                }}
                className="w-full py-3 bg-red-600 text-white rounded-xl font-bold text-xs text-center shadow-md flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Tư Vấn Miễn Phí · Phí Dịch Vụ Sau Visa</span>
              </button>

              {onOpenAdminPanel && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAdminPanel();
                  }}
                  className="w-full py-2.5 bg-stone-100 text-stone-800 rounded-xl font-bold text-xs text-center border border-stone-200"
                >
                  Đăng Nhập Cổng Admin
                </button>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
};
