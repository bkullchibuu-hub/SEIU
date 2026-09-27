/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { lazy, Suspense, useState, useEffect } from 'react';
import { Navbar, AppPageType } from './components/Navbar';
import { HomeCover } from './components/HomeCover';
import { HomeExamAchievementSection } from './components/HomeExamAchievementSection';
import { K1StudentJourney } from './components/K1StudentJourney';
import { StudentGallerySection } from './components/StudentGallerySection';
import { HomeLatestArticlesSection } from './components/HomeLatestArticlesSection';
import { VisaResultsSection } from './components/VisaResultsSection';
import { PartnersSection } from './components/PartnersSection';
import { NewsEventsSection } from './components/NewsEventsSection';
import { ConsultationSection } from './components/ConsultationSection';
import { FaqSection } from './components/FaqSection';
import { Footer } from './components/Footer';
import { FloatingActions } from './components/FloatingActions';
import { Article, getStoredArticles } from './services/blogService';
import { getAdminSession } from './services/authService';

const TopikLevelTestModal = lazy(() => import('./components/TopikLevelTestModal').then(m => ({ default: m.TopikLevelTestModal })));
const ScholarshipEligibilityModal = lazy(() => import('./components/ScholarshipEligibilityModal').then(m => ({ default: m.ScholarshipEligibilityModal })));
const ConsultationModal = lazy(() => import('./components/ConsultationModal').then(m => ({ default: m.ConsultationModal })));
const LeadManagerModal = lazy(() => import('./components/LeadManagerModal').then(m => ({ default: m.LeadManagerModal })));
const LogoManagerModal = lazy(() => import('./components/LogoManagerModal').then(m => ({ default: m.LogoManagerModal })));
const AdminSeiuPanel = lazy(() => import('./components/AdminSeiuPanel').then(m => ({ default: m.AdminSeiuPanel })));
const AdminLoginModal = lazy(() => import('./components/AdminLoginModal').then(m => ({ default: m.AdminLoginModal })));
const ArticlePageView = lazy(() => import('./components/ArticlePageView').then(m => ({ default: m.ArticlePageView })));
const KoreanTopikMasterView = lazy(() => import('./components/KoreanTopikMasterView').then(m => ({ default: m.KoreanTopikMasterView })));
const StudyAbroadSubPageView = lazy(() => import('./components/StudyAbroadSubPageView').then(m => ({ default: m.StudyAbroadSubPageView })));
const UniversitySubPageView = lazy(() => import('./components/UniversitySubPageView').then(m => ({ default: m.UniversitySubPageView })));
const Cost75mSubPageView = lazy(() => import('./components/Cost75mSubPageView').then(m => ({ default: m.Cost75mSubPageView })));
const AiLearningSubPageView = lazy(() => import('./components/AiLearningSubPageView').then(m => ({ default: m.AiLearningSubPageView })));
const BlogSubPageView = lazy(() => import('./components/BlogSubPageView').then(m => ({ default: m.BlogSubPageView })));
const BranchesSubPageView = lazy(() => import('./components/BranchesSubPageView').then(m => ({ default: m.BranchesSubPageView })));

export default function App() {
  // Page Routing State
  const [currentPage, setCurrentPage] = useState<AppPageType>('home');
  const [currentArticlePage, setCurrentArticlePage] = useState<Article | null>(null);
  // Id bài thi lấy từ link chia sẻ #test/<id>
  const [shareTestId, setShareTestId] = useState<string | null>(null);

  // Modals State
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);
  const [consultationDefaultTopic, setConsultationDefaultTopic] = useState('');
  const [isLevelTestModalOpen, setIsLevelTestModalOpen] = useState(false);
  const [isScholarshipModalOpen, setIsScholarshipModalOpen] = useState(false);
  const [isLeadManagerOpen, setIsLeadManagerOpen] = useState(false);
  const [isLogoManagerOpen, setIsLogoManagerOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [pendingAdminAction, setPendingAdminAction] = useState<'admin' | 'leads' | 'logo' | null>(null);

  // Articles state
  const [articlesList, setArticlesList] = useState<Article[]>(getStoredArticles());

  // Sync stored articles
  useEffect(() => {
    const list = getStoredArticles();
    setArticlesList(list);

    const handleArticlesUpdated = () => {
      const updated = getStoredArticles();
      setArticlesList(updated);
      if (currentArticlePage) {
        const found = updated.find(a => a.id === currentArticlePage.id);
        if (found) setCurrentArticlePage(found);
      }
    };

    window.addEventListener('seiu_articles_updated', handleArticlesUpdated);
    return () => window.removeEventListener('seiu_articles_updated', handleArticlesUpdated);
  }, [currentArticlePage]);

  // Handle URL hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#article/')) {
        const slug = hash.replace('#article/', '');
        const found = getStoredArticles().find(a => a.slug === slug || a.id === slug);
        if (found) {
          setCurrentArticlePage(found);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } else if (hash === '#admin') {
        requireAdminAuth('admin');
      } else if (hash === '#courses') {
        setCurrentArticlePage(null);
        setCurrentPage('topik-master');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash.startsWith('#test/')) {
        // Link chia sẻ bài thi: mở thẳng phần TOPIK Master vào đúng đề đó
        setCurrentArticlePage(null);
        setShareTestId(hash.replace('#test/', ''));
        setCurrentPage('topik-master');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash === '#topik-master' || hash === '#master') {
        setCurrentArticlePage(null);
        setCurrentPage('topik-master');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash === '#study-abroad') {
        setCurrentArticlePage(null);
        setCurrentPage('study-abroad');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash === '#universities') {
        setCurrentArticlePage(null);
        setCurrentPage('universities');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash === '#cost-75m') {
        setCurrentArticlePage(null);
        setCurrentPage('cost-75m');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash === '#vocab' || hash === '#homework' || hash === '#ai-learning') {
        setCurrentArticlePage(null);
        setCurrentPage('ai-learning');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash === '#blog') {
        setCurrentArticlePage(null);
        setCurrentPage('blog');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash === '#branches') {
        setCurrentArticlePage(null);
        setCurrentPage('branches');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash === '' || hash === '#' || hash === '#home') {
        setCurrentArticlePage(null);
        setCurrentPage('home');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Admin access with credentials
  const requireAdminAuth = (action: 'admin' | 'leads' | 'logo' = 'admin') => {
    const session = getAdminSession();
    if (session) {
      if (action === 'admin') setIsAdminPanelOpen(true);
      else if (action === 'leads') setIsLeadManagerOpen(true);
      else if (action === 'logo') setIsLogoManagerOpen(true);
    } else {
      setPendingAdminAction(action);
      setIsAdminLoginOpen(true);
    }
  };

  const handleAdminAuthSuccess = () => {
    setIsAdminLoginOpen(false);
    const target = pendingAdminAction || 'admin';
    if (target === 'admin') setIsAdminPanelOpen(true);
    else if (target === 'leads') setIsLeadManagerOpen(true);
    else if (target === 'logo') setIsLogoManagerOpen(true);
    setPendingAdminAction(null);
  };

  // Open consultation modal
  const handleOpenConsultation = (topic?: string) => {
    setConsultationDefaultTopic(topic || 'Tư vấn du học & tiếng Hàn');
    setIsConsultationModalOpen(true);
  };

  const handleApplyUniversity = (univName: string) => {
    handleOpenConsultation(`Nộp hồ sơ ứng tuyển: ${univName}`);
  };

  const handleClaimLevelVoucher = (summary: string) => {
    handleOpenConsultation(summary);
  };

  const handleApplyScholarship = (info: string) => {
    handleOpenConsultation(info);
  };

  // Navigating to article page view
  const handleOpenArticle = (article: Article) => {
    setCurrentArticlePage(article);
    window.location.hash = `#article/${article.slug || article.id}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToHome = () => {
    setCurrentArticlePage(null);
    setCurrentPage('home');
    window.location.hash = '#home';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigatePage = (page: AppPageType) => {
    setCurrentArticlePage(null);
    setShareTestId(null);
    setCurrentPage(page);
    window.location.hash = `#${page}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Secret Hotkey: Ctrl + Shift + A
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        requireAdminAuth('admin');
      }
    };

    const handleLogout = () => {
      setIsAdminPanelOpen(false);
      setIsLeadManagerOpen(false);
      setIsLogoManagerOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('seiu_admin_logout', handleLogout);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('seiu_admin_logout', handleLogout);
    };
  }, []);

  // Reveal từng khối khi cuộn đến vị trí của khối trên trang chủ.
  useEffect(() => {
    if (currentPage !== 'home' || currentArticlePage) return;

    let observer: IntersectionObserver | null = null;
    const frame = window.requestAnimationFrame(() => {
      const sections = Array.from(document.querySelectorAll<HTMLElement>('main > section:not(#home-cover)'));
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        sections.forEach((section) => section.classList.add('seiu-reveal-visible'));
        return;
      }

      sections.forEach((section, index) => {
        section.classList.add('seiu-reveal');
        section.style.setProperty('--seiu-reveal-delay', `${Math.min(index * 35, 140)}ms`);
      });

      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('seiu-reveal-visible');
          observer?.unobserve(entry.target);
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -7% 0px' });

      sections.forEach((section) => observer?.observe(section));
    });

    return () => {
      window.cancelAnimationFrame(frame);
      observer?.disconnect();
    };
  }, [currentPage, currentArticlePage]);

  const isFocusedTest = currentPage === 'topik-master' && Boolean(shareTestId);

  return (
    <div className="min-h-screen flex flex-col bg-white text-stone-900 selection:bg-red-600 selection:text-white font-sans antialiased">
      
      {/* Main Navbar */}
      {!isFocusedTest && <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigatePage}
        onOpenConsultation={handleOpenConsultation}
        onOpenLevelTest={() => setIsLevelTestModalOpen(true)}
        onOpenScholarshipCheck={() => setIsScholarshipModalOpen(true)}
        onOpenLeadManager={() => requireAdminAuth('leads')}
        onOpenLogoManager={() => requireAdminAuth('logo')}
        onOpenAdminPanel={() => requireAdminAuth('admin')}
      />}

      <Suspense fallback={(
        <div className="flex min-h-[40vh] items-center justify-center bg-white" role="status" aria-live="polite">
          <div className="flex items-center gap-3 text-sm font-semibold text-stone-600">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
            Đang tải nội dung…
          </div>
        </div>
      )}>

      {/* CONDITIONAL RENDER: Subpages or Home Page */}
      {currentArticlePage ? (
        <ArticlePageView
          article={currentArticlePage}
          allArticles={articlesList}
          onBackToHome={() => handleNavigatePage('blog')}
          onSelectArticle={handleOpenArticle}
          onOpenConsultation={handleOpenConsultation}
        />
      ) : currentPage === 'topik-master' ? (
        <KoreanTopikMasterView
          onBackToHome={() => handleNavigatePage('home')}
          onOpenConsultation={handleOpenConsultation}
          shareTestId={shareTestId}
        />
      ) : currentPage === 'study-abroad' ? (
        <StudyAbroadSubPageView
          onBackToHome={() => handleNavigatePage('home')}
          onOpenConsultation={handleOpenConsultation}
        />
      ) : currentPage === 'universities' ? (
        <UniversitySubPageView
          onBackToHome={() => handleNavigatePage('home')}
          onSelectUniversity={handleApplyUniversity}
          onOpenConsultation={handleOpenConsultation}
        />
      ) : currentPage === 'cost-75m' ? (
        <Cost75mSubPageView
          onBackToHome={() => handleNavigatePage('home')}
          onOpenConsultation={handleOpenConsultation}
        />
      ) : currentPage === 'ai-learning' ? (
        <AiLearningSubPageView
          onBackToHome={() => handleNavigatePage('home')}
        />
      ) : currentPage === 'blog' ? (
        <BlogSubPageView
          onBackToHome={() => handleNavigatePage('home')}
          onSelectArticle={handleOpenArticle}
          onOpenAdminPanel={() => requireAdminAuth('admin')}
          onOpenConsultation={handleOpenConsultation}
        />
      ) : currentPage === 'branches' ? (
        <BranchesSubPageView
          onBackToHome={() => handleNavigatePage('home')}
          onOpenConsultation={handleOpenConsultation}
        />
      ) : (
        /* HOME PAGE VIEW */
        <main className="k1-home k2-home flex-grow">
          {/* 0. Ảnh bìa trang chủ (admin đổi được trong Cổng Quản Trị) */}
          <HomeCover onOpenConsultation={handleOpenConsultation} />

          {/* Bảng thành tích và hai lối vào chính */}
          <HomeExamAchievementSection
            onOpenStudyAbroad={() => handleNavigatePage('study-abroad')}
            onOpenTopikMaster={() => handleNavigatePage('topik-master')}
          />

          {/* Bài ghim và 4 bài đăng mới nhất */}
          <HomeLatestArticlesSection
            onSelectArticle={handleOpenArticle}
            onViewAll={() => handleNavigatePage('blog')}
            onOpenConsultation={handleOpenConsultation}
          />

          {/* Hình Ảnh & Album Hoạt Động */}
          <StudentGallerySection onOpenConsultation={handleOpenConsultation} />

          {/* Hành trình học viên SEIU-K1 */}
          <K1StudentJourney onOpenConsultation={handleOpenConsultation} />

          {/* 5. Kết Quả Visa (Visa Results Section) */}
          <VisaResultsSection onOpenConsultation={handleOpenConsultation} />

          {/* 6. Đối Tác (Partners Section) */}
          <PartnersSection onOpenConsultation={handleOpenConsultation} />

          {/* 7. Tin Tức (News & Events Section) */}
          <NewsEventsSection onOpenConsultation={handleOpenConsultation} />

          {/* 8. Consultation Section */}
          <ConsultationSection />

          {/* 9. FAQ Section */}
          <FaqSection onOpenConsultation={handleOpenConsultation} />
        </main>
      )}

      {/* Main Footer */}
      {!isFocusedTest && <Footer
        onOpenConsultation={handleOpenConsultation}
        onOpenLeadManager={() => requireAdminAuth('leads')}
        onOpenLogoManager={() => requireAdminAuth('logo')}
        onOpenAdminPanel={() => requireAdminAuth('admin')}
      />}

      {/* Floating Actions */}
      {!isFocusedTest && <FloatingActions
        onOpenConsultation={handleOpenConsultation}
        onOpenLevelTest={() => setIsLevelTestModalOpen(true)}
        onOpenScholarshipCheck={() => setIsScholarshipModalOpen(true)}
      />}

      {/* MODALS */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => {
          setIsAdminLoginOpen(false);
          setPendingAdminAction(null);
        }}
        onSuccess={handleAdminAuthSuccess}
        targetFeatureName={
          pendingAdminAction === 'leads' ? 'Hộp Thư Khách Hàng Leads' :
          pendingAdminAction === 'logo' ? 'Quản Lý Logo & Thương Hiệu' : 'Cổng Quản Trị SEIU'
        }
      />

      <AdminSeiuPanel
        isOpen={isAdminPanelOpen}
        onClose={() => setIsAdminPanelOpen(false)}
        onViewArticle={(art) => {
          setIsAdminPanelOpen(false);
          handleOpenArticle(art);
        }}
        onOpenLogoManager={() => {
          setIsAdminPanelOpen(false);
          setIsLogoManagerOpen(true);
        }}
      />

      <TopikLevelTestModal
        isOpen={isLevelTestModalOpen}
        onClose={() => setIsLevelTestModalOpen(false)}
        onClaimVoucher={handleClaimLevelVoucher}
      />

      <ScholarshipEligibilityModal
        isOpen={isScholarshipModalOpen}
        onClose={() => setIsScholarshipModalOpen(false)}
        onApplyScholarship={handleApplyScholarship}
      />

      <ConsultationModal
        isOpen={isConsultationModalOpen}
        onClose={() => setIsConsultationModalOpen(false)}
        defaultTopic={consultationDefaultTopic}
      />

      <LeadManagerModal
        isOpen={isLeadManagerOpen}
        onClose={() => setIsLeadManagerOpen(false)}
      />

      <LogoManagerModal
        isOpen={isLogoManagerOpen}
        onClose={() => setIsLogoManagerOpen(false)}
      />

      </Suspense>

    </div>
  );
}
