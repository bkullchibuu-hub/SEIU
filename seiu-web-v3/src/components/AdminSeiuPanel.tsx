import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  Image as ImageIcon, 
  Save, 
  RotateCcw, 
  Sparkles, 
  FileText, 
  Layers, 
  DollarSign, 
  Users, 
  ClipboardCheck,
  Globe, 
  Search, 
  Upload, 
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Code,
  CheckSquare,
  BookOpen,
  ArrowUp,
  ArrowDown,
  Layout,
  Table,
  Volume2,
  FolderPlus,
  Play,
  Video,
  Youtube,
  Quote,
  MessageSquare,
  Gauge,
  Check,
  Info,
  Building2,
  Award,
  Newspaper,
  Pin
} from 'lucide-react';
import { 
  Article, 
  BlogCategory, 
  SubPage,
  STANDARD_CATEGORIES,
  INTERACTIVE_TEMPLATES,
  getStoredArticles, 
  saveArticle, 
  deleteArticle, 
  resetArticles 
} from '../services/blogService';
import { 
  SiteConfig, 
  getStoredSiteConfig, 
  saveSiteConfig, 
  resetSiteConfig 
} from '../services/siteConfigService';
import { getStoredLeads, Lead } from '../services/leadService';
import { InteractiveContentRenderer } from './InteractiveContentRenderer';
import { clearAdminSession, getAdminKey, getAdminSession } from '../services/authService';
import { 
  AdminGalleryPanel, 
  AdminStudentsPanel, 
  AdminPartnersPanel, 
  AdminVisasPanel, 
  AdminNewsPanel 
} from './AdminNewSections';
import { compressImage } from '../utils/imageCompressor';
import { AdminLeadsPanel, AdminExamRegistrationsPanel, AdminExamResultsPanel } from './AdminLeadsResults';
import { AdminAiLearningPanel } from './AdminAiLearningPanel';
import { RichArticleEditor } from './RichArticleEditor';
import { SquareImageEditor } from './SquareImageEditor';

interface AdminSeiuPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onViewArticle?: (article: Article) => void;
  onOpenLogoManager?: () => void;
}

export const AdminSeiuPanel: React.FC<AdminSeiuPanelProps> = ({
  isOpen,
  onClose,
  onViewArticle,
  onOpenLogoManager,
}) => {
  const [activeTab, setActiveTab] = useState<
    'articles' | 'ai-learning' | 'gallery' | 'students' | 'partners' | 'visas' | 'news' | 'banner' | 'courses' | 'leads' | 'registrations' | 'results' | 'brand'
  >('articles');
  
  // Articles State
  const [articles, setArticles] = useState<Article[]>(getStoredArticles());
  const [isEditingArticle, setIsEditingArticle] = useState(false);
  const [editingArticleData, setEditingArticleData] = useState<Article>({
    id: '',
    slug: '',
    title: '',
    category: 'Học tiếng Hàn Blog',
    topic: '',
    summary: '',
    contentHtml: '',
    coverImage: '',
    author: 'Thầy Lê Trí Bửu',
    authorRole: 'Giám đốc SEIU · Cử nhân Hàn Quốc học',
    readTime: '4 phút đọc',
    publishedAt: new Date().toLocaleDateString('vi-VN'),
    tags: ['#HocTiengHanTaiViThanhHauGiang', '#DuHocHan'],
    isFeatured: false,
    seoTitle: '',
    seoDescription: '',
    focusKeyword: 'học tiếng Hàn tại Vị Thanh Hậu Giang',
    coverImageAlt: '',
    canonicalUrl: '',
    seoNoIndex: false,
    subPages: []
  });

  // Category custom input state
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState('');

  // Active preview tab for main content: 'code' | 'preview'
  const [contentViewMode, setContentViewMode] = useState<'compose' | 'code' | 'preview'>('compose');
  const [squareCoverFile, setSquareCoverFile] = useState<File | null>(null);
  const [isSquareCoverEditorOpen, setIsSquareCoverEditorOpen] = useState(false);

  // Subpage Editor State
  const [isEditingSubPage, setIsEditingSubPage] = useState(false);
  const [editingSubPageIndex, setEditingSubPageIndex] = useState<number | null>(null);
  const [subPageFormData, setSubPageFormData] = useState<SubPage>({
    id: '',
    title: '',
    slug: '',
    summary: '',
    contentHtml: '',
    order: 1
  });
  const [subPageContentViewMode, setSubPageContentViewMode] = useState<'code' | 'preview'>('code');

  // Site Config State
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(getStoredSiteConfig());
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Leads State
  const [leads, setLeads] = useState<Lead[]>(getStoredLeads());

  // AI SEO Generator State
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiKeywords, setAiKeywords] = useState('');
  const [aiCategory, setAiCategory] = useState('Cẩm Nang Du Học');
  const [aiCoverImage, setAiCoverImage] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setArticles(getStoredArticles());
      setSiteConfig(getStoredSiteConfig());
      setLeads(getStoredLeads());
    }
  }, [isOpen]);

  const showToast = (msg: string) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => setSaveSuccessMsg(''), 3000);
  };

  const [aiStepMessage, setAiStepMessage] = useState('Đang kết nối OpenAI...');

  const handleAiCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setAiCoverImage(await compressImage(file, 1600, 900, 0.82));
    } catch {
      alert('Không xử lý được ảnh bìa. Vui lòng chọn ảnh JPG, PNG hoặc WEBP khác.');
    }
  };

  const handleGenerateAiArticle = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!aiTopic.trim()) {
      alert('Vui lòng nhập chủ đề bài viết bạn muốn AI tạo!');
      return;
    }

    setIsGeneratingAi(true);
    setAiStepMessage('🤖 OpenAI đang phân tích từ khóa SEO & cấu trúc nội dung...');

    const stepTimer1 = setTimeout(() => {
      setAiStepMessage('✍️ Đang soạn bài chuyên sâu, checklist thực tế và lời khuyên Thầy Bửu...');
    }, 1500);

    const stepTimer2 = setTimeout(() => {
      setAiStepMessage('⚡ Đang rà lại tiêu đề, từ khóa, tính tự nhiên và thông tin liên hệ...');
    }, 3000);

    try {
      const response = await fetch('/api/openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getAdminKey()}` },
        body: JSON.stringify({ action: 'generateArticle', payload: { topic: aiTopic, keywords: aiKeywords, category: aiCategory } }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'OpenAI API chưa được cấu hình trên Netlify.');
      const newId = 'seiu-post-' + Date.now();

      const newArticle: Article = {
        id: newId,
        slug: data.slug || newId,
        title: data.title || aiTopic,
        category: data.category || aiCategory || 'Cẩm Nang Du Học',
        topic: aiKeywords || 'Cẩm Nang Toàn Diện',
        summary: data.summary || '',
        contentHtml: data.contentHtml || '',
        coverImage: aiCoverImage || '/seiu-logo.svg',
        author: 'Thầy Lê Trí Bửu',
        authorRole: 'Giám đốc SEIU · Cử nhân Hàn Quốc học',
        readTime: data.readTime || '6 phút đọc',
        publishedAt: new Date().toLocaleDateString('vi-VN'),
        tags: data.tags || ['#HocTiengHanTaiViThanhHauGiang', '#DuHocHan', '#SEIU'],
        isFeatured: false,
        seoTitle: data.seoTitle || data.title,
        seoDescription: data.seoDescription || data.summary,
        focusKeyword: aiKeywords.split(',')[0]?.trim() || 'học tiếng Hàn tại Vị Thanh Hậu Giang',
        coverImageAlt: data.title || aiTopic,
        canonicalUrl: '',
        seoNoIndex: false,
        subPages: data.subPages || []
      };

      // Mở bản nháp để admin kiểm tra ảnh và nội dung trước khi xuất bản.
      setEditingArticleData(newArticle);
      setIsCustomCategory(false);
      setContentViewMode('compose');
      setIsEditingArticle(true);
      setShowAiModal(false);
      setAiCoverImage('');

      showToast('✨ OpenAI đã tạo bài viết chuyên sâu. Bạn hãy xem lại và bấm lưu để xuất bản.');
    } catch (err: any) {
      alert('Không thể tạo bài viết: ' + (err.message || 'Lỗi mạng'));
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setIsGeneratingAi(false);
      setAiStepMessage('Đang kết nối OpenAI...');
    }
  };

  // Article Actions
  const handleNewArticle = () => {
    const newId = 'seiu-post-' + Date.now();
    setEditingArticleData({
      id: newId,
      slug: newId,
      title: '',
      category: 'Học tiếng Hàn Blog',
      topic: 'Chuyên Đề Phương Pháp & Ngữ Pháp',
      summary: '',
      contentHtml: `<h2>1. Mục Tiêu & Khái Niệm Chính</h2>\n<p>Nội dung hướng dẫn chi tiết dành cho học viên...</p>\n<ul>\n  <li>Ý chính 1</li>\n  <li>Ý chính 2</li>\n</ul>`,
      coverImage: '',
      author: 'Thầy Lê Trí Bửu',
      authorRole: 'Giám đốc SEIU · Cử nhân Hàn Quốc học',
      readTime: '4 phút đọc',
      publishedAt: new Date().toLocaleDateString('vi-VN'),
      tags: ['#HocTiengHanTaiViThanhHauGiang', '#DuHocHan', '#SEIU'],
      isFeatured: false,
      seoTitle: '',
      seoDescription: '',
      focusKeyword: 'học tiếng Hàn tại Vị Thanh Hậu Giang',
      coverImageAlt: '',
      canonicalUrl: '',
      seoNoIndex: false,
      subPages: []
    });
    setIsCustomCategory(false);
    setCustomCategoryName('');
    setContentViewMode('compose');
    setIsEditingArticle(true);
  };

  const handleEditArticle = (art: Article) => {
    setEditingArticleData({ 
      ...art,
      focusKeyword: art.focusKeyword || 'học tiếng Hàn tại Vị Thanh Hậu Giang',
      coverImageAlt: art.coverImageAlt || art.title,
      canonicalUrl: art.canonicalUrl || '',
      seoNoIndex: Boolean(art.seoNoIndex),
      subPages: art.subPages || []
    });
    const isStandard = STANDARD_CATEGORIES.includes(art.category);
    if (!isStandard) {
      setIsCustomCategory(true);
      setCustomCategoryName(art.category);
    } else {
      setIsCustomCategory(false);
    }
    setContentViewMode('compose');
    setIsEditingArticle(true);
  };

  const handleDeleteArticle = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
      deleteArticle(id);
      setArticles(getStoredArticles());
      showToast('Đã xóa bài viết thành công!');
    }
  };

  const handleTogglePinnedArticle = (article: Article) => {
    const nextPinned = !article.isFeatured;
    const otherPinnedCount = articles.filter(item => item.id !== article.id && item.isFeatured).length;
    if (nextPinned && otherPinnedCount >= 2) {
      alert('Trang chủ chỉ ghim tối đa 2 bài. Vui lòng bỏ ghim một bài khác trước.');
      return;
    }
    saveArticle({ ...article, isFeatured: nextPinned });
    setArticles(getStoredArticles());
    showToast(nextPinned ? 'Đã ghim bài viết lên trang chủ!' : 'Đã bỏ ghim bài viết!');
  };

  const handleSaveArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArticleData.title.trim()) {
      alert('Vui lòng nhập tiêu đề bài viết!');
      return;
    }

    const category = isCustomCategory && customCategoryName.trim() 
      ? customCategoryName.trim() 
      : editingArticleData.category;

    const slug = editingArticleData.slug || editingArticleData.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const finalArticle: Article = {
      ...editingArticleData,
      category,
      slug: slug || 'post-' + Date.now(),
      seoTitle: editingArticleData.seoTitle || editingArticleData.title,
      seoDescription: editingArticleData.seoDescription || editingArticleData.summary,
    };

    const otherPinnedCount = articles.filter(item => item.id !== finalArticle.id && item.isFeatured).length;
    if (finalArticle.isFeatured && otherPinnedCount >= 2) {
      alert('Trang chủ chỉ ghim tối đa 2 bài. Vui lòng bỏ ghim một bài khác trước.');
      return;
    }

    saveArticle(finalArticle);
    setArticles(getStoredArticles());
    setIsEditingArticle(false);
    showToast('Đã lưu và xuất bản bài viết thành công!');
  };

  // Comprehensive Real-time SEO Scoring Function
  const calculateSeoScore = (art: Article) => {
    let score = 0;
    const checks: { label: string; passed: boolean; tip: string; points: number }[] = [];
    const titleLen = (art.seoTitle || art.title || '').trim().length;
    const titlePassed = titleLen >= 45 && titleLen <= 65;
    score += titlePassed ? 15 : (titleLen > 0 ? 7 : 0);
    checks.push({
      label: 'Tiêu đề SEO 45–65 ký tự',
      passed: titlePassed,
      tip: `Hiện có ${titleLen} ký tự. ${titleLen < 45 ? 'Nên bổ sung lợi ích hoặc địa điểm.' : titleLen > 65 ? 'Nên rút gọn để tránh bị Google cắt.' : 'Độ dài phù hợp.'}`,
      points: 15
    });
    const descLen = (art.seoDescription || art.summary || '').trim().length;
    const descPassed = descLen >= 135 && descLen <= 160;
    score += descPassed ? 15 : (descLen > 0 ? 7 : 0);
    checks.push({
      label: 'Mô tả SEO 135–160 ký tự',
      passed: descPassed,
      tip: `Hiện có ${descLen} ký tự. Hãy tóm tắt lợi ích, địa điểm và lời kêu gọi hành động trong một câu rõ ràng.`,
      points: 15
    });
    const slug = (art.slug || '').trim();
    const slugPassed = slug.length > 5 && !/[^a-z0-9-]/.test(slug) && !slug.includes('--');
    score += slugPassed ? 10 : (slug.length > 0 ? 5 : 0);
    checks.push({
      label: 'Đường dẫn ngắn, không dấu',
      passed: slugPassed,
      tip: slugPassed ? 'Đường dẫn dễ đọc và dễ chia sẻ.' : 'Ví dụ: hoc-tieng-han-tai-vi-thanh.',
      points: 10
    });
    const content = art.contentHtml || '';
    const plainText = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const wordCount = plainText ? plainText.split(' ').length : 0;
    const keyword = (art.focusKeyword || '').trim().toLocaleLowerCase('vi');
    const keywordPassed = Boolean(keyword) && [art.seoTitle || art.title, art.seoDescription || art.summary, slug.replace(/-/g, ' '), plainText.slice(0, 500)]
      .filter(Boolean)
      .some(value => String(value).toLocaleLowerCase('vi').includes(keyword));
    score += keywordPassed ? 20 : 0;
    checks.push({
      label: 'Từ khóa chính xuất hiện tự nhiên',
      passed: keywordPassed,
      tip: keyword ? `Từ khóa đang kiểm tra: “${art.focusKeyword}”. Nên có trong tiêu đề, mô tả và đoạn mở đầu.` : 'Nhập một từ khóa chính mà học viên thường tìm trên Google.',
      points: 20
    });

    const lengthPassed = wordCount >= 450;
    score += lengthPassed ? 15 : (wordCount >= 250 ? 8 : 0);
    checks.push({
      label: 'Nội dung đủ chuyên sâu (từ 450 từ)',
      passed: lengthPassed,
      tip: `Bài hiện có khoảng ${wordCount} từ. ${lengthPassed ? 'Độ dài tốt.' : 'Nên bổ sung ví dụ, câu hỏi thường gặp và hướng dẫn thực tế.'}`,
      points: 15
    });

    const hasHeadings = /<h[2-4][^>]*>/i.test(content);
    score += hasHeadings ? 10 : 0;
    checks.push({
      label: 'Có tiêu đề mục H2/H3',
      passed: hasHeadings,
      tip: hasHeadings ? 'Bài được chia mục rõ ràng.' : 'Dùng nút “Tiêu đề mục” để chia bài thành các phần dễ đọc.',
      points: 10
    });
    const images = [...content.matchAll(/<img\b[^>]*>/gi)].map(match => match[0]);
    const hasImage = Boolean(art.coverImage);
    const imagesHaveAlt = hasImage && Boolean(art.coverImageAlt?.trim()) && images.every(tag => /alt=["'][^"']+["']/i.test(tag));
    score += imagesHaveAlt ? 10 : (hasImage ? 5 : 0);
    checks.push({
      label: 'Ảnh vuông và mô tả ALT đầy đủ',
      passed: imagesHaveAlt,
      tip: imagesHaveAlt ? 'Ảnh đã có mô tả để Google hiểu nội dung.' : 'Hãy thêm ảnh bìa 1:1 và nhập mô tả ảnh có từ khóa liên quan.',
      points: 10
    });
    const hasInteractive = (art.subPages && art.subPages.length > 0) || content.includes('seiu-interactive') || content.includes('iframe') || content.includes('audio');
    score += hasInteractive ? 5 : 0;
    checks.push({
      label: 'Có video, bài tập hoặc nội dung tương tác',
      passed: hasInteractive,
      tip: hasInteractive ? 'Nội dung có khả năng giữ người đọc lâu hơn.' : 'Không bắt buộc, nhưng có thể thêm video hoặc bài tập liên quan.',
      points: 5
    });

    // Calculate level
    let rank = 'Cần Cải Thiện';
    let rankColor = 'text-amber-600 bg-amber-50 border-amber-200';
    if (score >= 85) {
      rank = 'Chuẩn SEO Xuất Sắc (100%)';
      rankColor = 'text-emerald-700 bg-emerald-50 border-emerald-300';
    } else if (score >= 65) {
      rank = 'Chuẩn SEO Tốt';
      rankColor = 'text-blue-700 bg-blue-50 border-blue-200';
    }

    return { score: Math.min(100, score), rank, rankColor, checks };
  };

  // Quick Insert HTML Template Helpers
  const insertTemplateToMain = (templateKey: keyof typeof INTERACTIVE_TEMPLATES) => {
    const snippet = INTERACTIVE_TEMPLATES[templateKey];
    setEditingArticleData(prev => ({
      ...prev,
      contentHtml: prev.contentHtml + '\n\n' + snippet
    }));
    showToast(`Đã chèn mẫu ${templateKey.toUpperCase()} vào nội dung!`);
  };

  const insertTemplateToSubPage = (templateKey: keyof typeof INTERACTIVE_TEMPLATES) => {
    const snippet = INTERACTIVE_TEMPLATES[templateKey];
    setSubPageFormData(prev => ({
      ...prev,
      contentHtml: prev.contentHtml + '\n\n' + snippet
    }));
    showToast(`Đã chèn mẫu ${templateKey.toUpperCase()} vào trang con!`);
  };

  // Subpages Actions
  const handleOpenAddSubPage = () => {
    const nextOrder = (editingArticleData.subPages?.length || 0) + 1;
    setSubPageFormData({
      id: 'sub-' + Date.now(),
      title: `Trang con ${nextOrder}: `,
      slug: `trang-con-${nextOrder}`,
      summary: '',
      contentHtml: `<h3>Nội dung Trang con ${nextOrder}</h3>\n<p>Nhập nội dung bài học hoặc chèn ứng dụng bài tập trắc nghiệm dưới đây:</p>`,
      order: nextOrder
    });
    setEditingSubPageIndex(null);
    setSubPageContentViewMode('code');
    setIsEditingSubPage(true);
  };

  const handleOpenEditSubPage = (index: number) => {
    const sp = editingArticleData.subPages?.[index];
    if (sp) {
      setSubPageFormData({ ...sp });
      setEditingSubPageIndex(index);
      setSubPageContentViewMode('code');
      setIsEditingSubPage(true);
    }
  };

  const handleDeleteSubPage = (index: number) => {
    if (window.confirm('Bạn có chắc muốn xóa trang con này?')) {
      const updated = [...(editingArticleData.subPages || [])];
      updated.splice(index, 1);
      setEditingArticleData({ ...editingArticleData, subPages: updated });
      showToast('Đã xóa trang con!');
    }
  };

  const handleMoveSubPage = (index: number, direction: 'up' | 'down') => {
    const updated = [...(editingArticleData.subPages || [])];
    if (direction === 'up' && index > 0) {
      const temp = updated[index];
      updated[index] = updated[index - 1];
      updated[index - 1] = temp;
    } else if (direction === 'down' && index < updated.length - 1) {
      const temp = updated[index];
      updated[index] = updated[index + 1];
      updated[index + 1] = temp;
    }
    // update orders
    updated.forEach((sp, i) => { sp.order = i + 1; });
    setEditingArticleData({ ...editingArticleData, subPages: updated });
  };

  const handleSaveSubPage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subPageFormData.title.trim()) {
      alert('Vui lòng nhập tiêu đề trang con!');
      return;
    }

    const currentSubPages = [...(editingArticleData.subPages || [])];
    if (editingSubPageIndex !== null && editingSubPageIndex >= 0) {
      currentSubPages[editingSubPageIndex] = { ...subPageFormData };
    } else {
      currentSubPages.push({ ...subPageFormData });
    }

    setEditingArticleData({
      ...editingArticleData,
      subPages: currentSubPages
    });
    setIsEditingSubPage(false);
    showToast('Đã lưu trang con thành công!');
  };

  // Image Upload handler for article / banner / avatar (Auto compressed to prevent storage loss)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'article' | 'heroBg' | 'heroStudent' | 'representativeAvatar' | 'homeCover' | 'admission') => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        if (target === 'article') {
          setSquareCoverFile(file);
          setIsSquareCoverEditorOpen(true);
          e.target.value = '';
          return;
        }
        const compressedUrl = await compressImage(file, 1200, 1200, 0.78);
        if (target === 'heroBg') {
          setSiteConfig(prev => ({ ...prev, heroBannerBgImage: compressedUrl }));
        } else if (target === 'heroStudent') {
          setSiteConfig(prev => ({ ...prev, heroStudentImage: compressedUrl }));
        } else if (target === 'homeCover') {
          const wideUrl = await compressImage(file, 1920, 1080, 0.82);
          setSiteConfig(prev => ({ ...prev, homeCoverImage: wideUrl }));
        } else if (target === 'representativeAvatar') {
          setSiteConfig(prev => ({ ...prev, representativeAvatar: compressedUrl }));
        } else if (target === 'admission') {
          const admissionUrl = await compressImage(file, 1400, 1200, 0.8);
          setSiteConfig(prev => ({ ...prev, admissionImage: admissionUrl }));
        }
        showToast('Đã tải & tối ưu hóa ảnh thành công!');
      } catch (err) {
        console.error('Error processing image:', err);
        alert('Có lỗi khi xử lý hình ảnh. Vui lòng thử lại!');
      }
    }
  };

  const handleArticleBodyImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const imageUrl = await compressImage(file, 1400, 1400, 0.76);
      const fallbackAlt = file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ');
      const escapeHtml = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
      const alt = escapeHtml(editingArticleData.focusKeyword || editingArticleData.title || fallbackAlt);
      const figure = `\n<figure class="my-7 overflow-hidden rounded-2xl border border-stone-200 bg-stone-50">\n  <img src="${imageUrl}" alt="${alt}" class="h-auto w-full object-cover" loading="lazy" />\n  <figcaption class="px-4 py-2 text-center text-xs text-stone-500">${escapeHtml(fallbackAlt)}</figcaption>\n</figure>\n`;
      setEditingArticleData(prev => ({ ...prev, contentHtml: `${prev.contentHtml || ''}${figure}` }));
      setContentViewMode('compose');
      showToast('Đã thêm ảnh từ máy vào cuối nội dung bài viết!');
    } catch (error) {
      console.error(error);
      alert('Không thể xử lý ảnh này. Vui lòng chọn ảnh JPG, PNG hoặc WebP khác.');
    } finally {
      e.target.value = '';
    }
  };

  const handleHomeCoverFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const imageUrl = await compressImage(file, 1920, 1080, 0.82);
      setSiteConfig((previous) => {
        const images = [...(previous.homeCoverImages || [])];
        while (images.length < 3) images.push('');
        images[index] = imageUrl;
        return {
          ...previous,
          homeCoverImages: images.slice(0, 3),
          homeCoverImage: index === 0 ? imageUrl : (previous.homeCoverImage || images[0]),
        };
      });
      showToast(`Đã tải và tối ưu ảnh bìa ${index + 1}!`);
    } catch (error) {
      console.error(error);
      alert('Không thể xử lý ảnh này. Vui lòng chọn ảnh JPG, PNG hoặc WebP khác.');
    } finally {
      event.target.value = '';
    }
  };

  // Site Config Save
  const handleSaveSiteConfig = () => {
    saveSiteConfig(siteConfig);
    showToast('Đã lưu cấu hình website thành công!');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex justify-center p-2 sm:p-4 md:p-6 animate-fadeIn">
      <div 
        className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-stone-200 my-auto min-h-[90vh] max-h-[95vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-red-600 text-white px-5 sm:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-black text-lg">
              S
            </div>
            <div>
              <h2 className="font-bold text-lg leading-tight flex items-center gap-2">
                <span>Trung Tâm Quản Trị SEIU</span>
                <span className="px-2 py-0.5 bg-white/20 text-[11px] rounded-full font-medium">CMS v2.5 (Trang con & Bài tập HTML)</span>
              </h2>
              <p className="text-red-100 text-xs mt-0.5">
                Quản lý bài viết đa trang, chuyên mục, bộ câu hỏi trắc nghiệm, banner và hotline
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {saveSuccessMsg && (
              <span className="px-3 py-1 bg-emerald-500 text-white text-xs font-semibold rounded-lg animate-pulse flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {saveSuccessMsg}
              </span>
            )}

            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-red-700/80 rounded-lg text-xs border border-red-500/40 text-red-100">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Tài khoản được cấu hình riêng trên máy chủ.</span>
            </div>

            <button
              onClick={() => {
                clearAdminSession();
                onClose();
              }}
              className="px-2.5 py-1 bg-red-800 hover:bg-stone-900 text-white text-xs font-bold rounded-lg border border-red-600 transition-colors flex items-center gap-1"
              title="Đăng xuất và khóa quyền quản trị"
            >
              <span>Đăng Xuất</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-stone-50 border-b border-stone-200 px-4 sm:px-8 flex items-center gap-1 sm:gap-2 overflow-x-auto">
          <button
            onClick={() => { setActiveTab('articles'); setIsEditingArticle(false); }}
            className={`py-3.5 px-3 sm:px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'articles'
                ? 'border-red-600 text-red-600 bg-white shadow-xs rounded-t-lg'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Bài Viết & Quiz</span>
            <span className="px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px]">
              {articles.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('ai-learning')}
            className={`py-3.5 px-3 sm:px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'ai-learning'
                ? 'border-red-600 text-red-600 bg-white shadow-xs rounded-t-lg'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Học cùng AI</span>
          </button>

          <button
            onClick={() => setActiveTab('gallery')}
            className={`py-3.5 px-3 sm:px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'gallery'
                ? 'border-red-600 text-red-600 bg-white shadow-xs rounded-t-lg'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Hình Ảnh & Album</span>
          </button>

          <button
            onClick={() => setActiveTab('students')}
            className={`py-3.5 px-3 sm:px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'students'
                ? 'border-red-600 text-red-600 bg-white shadow-xs rounded-t-lg'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Học Sinh & Hồ Sơ</span>
          </button>

          <button
            onClick={() => setActiveTab('partners')}
            className={`py-3.5 px-3 sm:px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'partners'
                ? 'border-red-600 text-red-600 bg-white shadow-xs rounded-t-lg'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Đối Tác Trường ĐH</span>
          </button>

          <button
            onClick={() => setActiveTab('visas')}
            className={`py-3.5 px-3 sm:px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'visas'
                ? 'border-red-600 text-red-600 bg-white shadow-xs rounded-t-lg'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Kết Quả Visa</span>
          </button>

          <button
            onClick={() => setActiveTab('news')}
            className={`py-3.5 px-3 sm:px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'news'
                ? 'border-red-600 text-red-600 bg-white shadow-xs rounded-t-lg'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Newspaper className="w-4 h-4" />
            <span>Tin Tức & Sự Kiện</span>
          </button>

          <button
            onClick={() => setActiveTab('leads')}
            className={`py-3.5 px-3 sm:px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'leads'
                ? 'border-red-600 text-red-600 bg-white shadow-xs rounded-t-lg'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Khách Đăng Ký</span>
          </button>

          <button
            onClick={() => setActiveTab('registrations')}
            className={`py-3.5 px-3 sm:px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'registrations'
                ? 'border-red-600 text-red-600 bg-white shadow-xs rounded-t-lg'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <ClipboardCheck className="w-4 h-4" />
            <span>Đăng Ký Thi</span>
          </button>

          <button
            onClick={() => setActiveTab('results')}
            className={`py-3.5 px-3 sm:px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'results'
                ? 'border-red-600 text-red-600 bg-white shadow-xs rounded-t-lg'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <ClipboardCheck className="w-4 h-4" />
            <span>Kết Quả Thi</span>
          </button>

          <button
            onClick={() => setActiveTab('banner')}
            className={`py-3.5 px-3 sm:px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'banner'
                ? 'border-red-600 text-red-600 bg-white shadow-xs rounded-t-lg'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Layout className="w-4 h-4" />
            <span>Avatar, Banner & Panel</span>
          </button>

          <button
            onClick={() => setActiveTab('courses')}
            className={`py-3.5 px-3 sm:px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'courses'
                ? 'border-red-600 text-red-600 bg-white shadow-xs rounded-t-lg'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Khóa Học & Phí</span>
          </button>

          <button
            onClick={() => setActiveTab('brand')}
            className={`py-3.5 px-3 sm:px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'brand'
                ? 'border-red-600 text-red-600 bg-white shadow-xs rounded-t-lg'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Thương hiệu & Logo</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6 md:p-8 flex-grow overflow-y-auto max-h-[calc(90vh-140px)]">

          {activeTab === 'ai-learning' && <AdminAiLearningPanel />}

          {/* TAB 1: ARTICLES MANAGEMENT */}
          {activeTab === 'articles' && (
            <div>
              {!isEditingArticle ? (
                <div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <h3 className="text-base font-bold text-stone-900">Danh Sách Bài Viết & Cẩm Nang SEIU</h3>
                      <p className="text-xs text-stone-500 mt-0.5">
                        Tạo bài viết mới, quản lý các trang con, chèn bộ câu hỏi trắc nghiệm & ứng dụng HTML tương tác
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAiModal(true)}
                        className="px-4 py-2.5 bg-gradient-to-r from-stone-900 to-red-950 hover:from-stone-800 hover:to-red-900 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 border border-red-500/30"
                      >
                        <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                        <span>Tự Động Viết Bài SEO Bằng AI</span>
                      </button>

                      <button
                        onClick={handleNewArticle}
                        className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Viết Bài Thủ Công</span>
                      </button>
                    </div>
                  </div>

                  {/* Articles Table */}
                  <div className="overflow-x-auto rounded-xl border border-stone-200">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase font-bold tracking-wider">
                        <tr>
                          <th className="py-3 px-4">Ảnh</th>
                          <th className="py-3 px-4">Tiêu đề bài viết</th>
                          <th className="py-3 px-4">Chuyên mục / Đề mục</th>
                          <th className="py-3 px-4">Trang con / Quiz</th>
                          <th className="py-3 px-4">Điểm SEO</th>
                          <th className="py-3 px-4">Ngày đăng</th>
                          <th className="py-3 px-4 text-right">Hành động</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {articles.map((art) => {
                          const artSeo = calculateSeoScore(art);
                          return (
                          <tr key={art.id} className="hover:bg-red-50/30 transition-colors">
                            <td className="py-3 px-4">
                              <img
                                src={art.coverImage || '/seiu-logo.svg'}
                                alt="thumb"
                                className="w-12 h-12 object-contain rounded-lg border border-stone-200 bg-stone-50"
                              />
                            </td>
                            <td className="py-3 px-4 font-semibold text-stone-900 max-w-xs">
                              <div className="line-clamp-2">{art.title}</div>
                              {art.isFeatured && (
                                <span className="mt-1 inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-black uppercase text-amber-800">
                                  <Pin className="h-3 w-3" /> Đang ghim trang chủ
                                </span>
                              )}
                              {art.summary && (
                                <div className="text-[11px] text-stone-400 line-clamp-1 font-normal mt-0.5">
                                  {art.summary}
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <span className="inline-block px-2.5 py-1 bg-stone-100 text-stone-700 font-medium rounded-md text-[11px]">
                                {art.category}
                              </span>
                              {art.topic && (
                                <div className="text-[10px] text-red-600 font-semibold mt-1">
                                  {art.topic}
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              {art.subPages && art.subPages.length > 0 ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-lg text-[11px] border border-emerald-200">
                                  <Layers className="w-3 h-3" />
                                  <span>{art.subPages.length} trang con</span>
                                </span>
                              ) : (
                                <span className="text-stone-400 text-[11px]">Trang đơn</span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1.5">
                                <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${
                                  artSeo.score >= 80 
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                    : artSeo.score >= 60 
                                    ? 'bg-blue-50 text-blue-700 border-blue-200' 
                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                                }`}>
                                  {artSeo.score}/100
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-stone-500 whitespace-nowrap">
                              {art.publishedAt}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {onViewArticle && (
                                  <button
                                    onClick={() => onViewArticle(art)}
                                    className="p-1.5 text-stone-500 hover:text-red-600 hover:bg-stone-100 rounded-lg transition-colors"
                                    title="Xem bài viết trên giao diện"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleTogglePinnedArticle(art)}
                                  className={`p-1.5 rounded-lg transition-colors ${art.isFeatured ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'text-stone-400 hover:bg-amber-50 hover:text-amber-700'}`}
                                  title={art.isFeatured ? 'Bỏ ghim khỏi trang chủ' : 'Ghim lên trang chủ (tối đa 2 bài)'}
                                >
                                  <Pin className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleEditArticle(art)}
                                  className="p-1.5 text-stone-600 hover:text-blue-600 hover:bg-stone-100 rounded-lg transition-colors"
                                  title="Chỉnh sửa bài & trang con"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteArticle(art.id)}
                                  className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-stone-100 rounded-lg transition-colors"
                                  title="Xóa bài viết"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-6 flex items-center justify-between pt-4 border-t border-stone-200">
                    <span className="text-xs text-stone-500">
                      Tổng số: <strong>{articles.length}</strong> bài viết đã xuất bản
                    </span>
                    <button
                      onClick={() => {
                        if (window.confirm('Khôi phục danh sách bài viết mẫu mặc định của SEIU?')) {
                          resetArticles();
                          setArticles(getStoredArticles());
                          showToast('Đã khôi phục các bài viết mẫu chuẩn!');
                        }
                      }}
                      className="text-xs text-stone-500 hover:text-red-600 flex items-center gap-1 font-medium"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Khôi phục bài viết mẫu ban đầu</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* FORM EDIT / CREATE ARTICLE */
                <form onSubmit={handleSaveArticle} className="space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-stone-200">
                    <div>
                      <h3 className="text-base font-bold text-stone-900">
                        {editingArticleData.id.startsWith('seiu-post-') ? 'Tạo Bài Viết & Bài Tập Mới' : 'Chỉnh Sửa Bài Viết & Trang Con'}
                      </h3>
                      <p className="text-xs text-stone-500">
                        Hỗ trợ quyền chọn đề mục, soạn thảo nhiều trang con và chèn ứng dụng bài tập HTML
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsEditingArticle(false)}
                      className="px-3 py-1.5 text-xs text-stone-600 hover:bg-stone-100 rounded-lg"
                    >
                      Hủy bỏ
                    </button>
                  </div>

                  {/* Category & Topic Selection Block */}
                  <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-4">
                    <div className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5 text-red-600">
                      <FolderPlus className="w-3.5 h-3.5" />
                      <span>1. Quyền Chọn Chuyên Mục & Đề Mục Phụ</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Standard Category dropdown or custom */}
                      <div className="md:col-span-1">
                        <label className="block text-xs font-bold text-stone-700 mb-1">
                          Chuyên mục bài viết
                        </label>
                        {!isCustomCategory ? (
                          <div className="space-y-1.5">
                            <select
                              value={editingArticleData.category}
                              onChange={(e) => {
                                if (e.target.value === '__custom__') {
                                  setIsCustomCategory(true);
                                  setCustomCategoryName('');
                                } else {
                                  setEditingArticleData({ ...editingArticleData, category: e.target.value as BlogCategory });
                                }
                              }}
                              className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl focus:ring-2 focus:ring-red-600 outline-hidden font-medium bg-white"
                            >
                              {STANDARD_CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                              ))}
                              <option value="__custom__">+ Thêm chuyên mục mới...</option>
                            </select>
                            <button
                              type="button"
                              onClick={() => { setIsCustomCategory(true); setCustomCategoryName(''); }}
                              className="text-[11px] text-red-600 hover:underline font-medium"
                            >
                              + Tự nhập tên chuyên mục mới
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            <input
                              type="text"
                              required
                              value={customCategoryName}
                              onChange={(e) => setCustomCategoryName(e.target.value)}
                              placeholder="Nhập tên chuyên mục mới..."
                              className="w-full px-3 py-2 text-xs border border-red-300 rounded-xl focus:ring-2 focus:ring-red-600 outline-hidden font-medium bg-white"
                            />
                            <button
                              type="button"
                              onClick={() => setIsCustomCategory(false)}
                              className="text-[11px] text-stone-500 hover:underline font-medium"
                            >
                              &larr; Chọn từ danh sách có sẵn
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Topic (Đề mục phụ / Chuyên đề) */}
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-stone-700 mb-1">
                          Đề mục cụ thể / Chuyên đề (Topic)
                        </label>
                        <input
                          type="text"
                          value={editingArticleData.topic || ''}
                          onChange={(e) => setEditingArticleData({ ...editingArticleData, topic: e.target.value })}
                          placeholder="VD: Chuyên Đề Ngữ Pháp Sơ Cấp 1, Luyện Phát Âm Shadowing, Visa D2..."
                          className="w-full px-3.5 py-2 text-xs border border-stone-300 rounded-xl focus:ring-2 focus:ring-red-600 outline-hidden bg-white"
                        />
                        <p className="text-[11px] text-stone-400 mt-1">
                          Ghi chú đề mục giúp học viên dễ dàng theo dõi theo từng chủ đề hoặc bài học
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Title & Summary */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Tiêu đề bài viết <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={editingArticleData.title}
                        onChange={(e) => setEditingArticleData({ ...editingArticleData, title: e.target.value })}
                        placeholder="VD: Phương pháp học tiếng Hàn phản xạ tại SEIU Vị Thanh..."
                        className="w-full px-3.5 py-2.5 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-hidden font-bold text-stone-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Đoạn tóm tắt mở đầu (Sapo)
                      </label>
                      <textarea
                        rows={2}
                        value={editingArticleData.summary}
                        onChange={(e) => setEditingArticleData({ ...editingArticleData, summary: e.target.value })}
                        placeholder="Tóm tắt ngắn gọn 1-2 câu để thu hút người đọc..."
                        className="w-full px-3.5 py-2 text-xs border border-stone-300 rounded-xl focus:ring-2 focus:ring-red-600 outline-hidden"
                      />
                    </div>
                  </div>

                  {/* Cover Image */}
                  <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
                    <div><label className="block text-xs font-bold text-stone-800">Ảnh bìa bài viết vuông 1:1</label><p className="mt-0.5 text-[11px] text-stone-500">Ảnh tải từ máy sẽ mở công cụ căn chỉnh và cắt về 1200×1200 để hiển thị đồng đều.</p></div>
                    
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      {editingArticleData.coverImage && (
                        <img
                          src={editingArticleData.coverImage}
                          alt={editingArticleData.coverImageAlt || 'Xem trước ảnh bìa'}
                          className="w-32 h-32 object-cover rounded-xl border border-stone-300 bg-stone-100 shrink-0"
                        />
                      )}
                      
                      <div className="space-y-2 flex-grow w-full">
                        <div className="flex items-center gap-2">
                          <label className="cursor-pointer px-3 py-1.5 bg-white border border-stone-300 hover:bg-stone-100 text-stone-700 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5">
                            <Upload className="w-3.5 h-3.5 text-red-600" />
                            <span>Tải ảnh từ máy tính</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleFileUpload(e, 'article')}
                            />
                          </label>
                          <span className="text-xs text-stone-400">hoặc</span>
                        </div>
                        <input
                          type="text"
                          value={editingArticleData.coverImage}
                          onChange={(e) => setEditingArticleData({ ...editingArticleData, coverImage: e.target.value })}
                          placeholder="Dán đường link ảnh trực tiếp (VD: https://.../anh.jpg)"
                          className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg bg-white outline-hidden"
                        />
                        <input
                          type="text"
                          value={editingArticleData.coverImageAlt || ''}
                          onChange={(e) => setEditingArticleData({ ...editingArticleData, coverImageAlt: e.target.value })}
                          placeholder="Mô tả ảnh cho Google, VD: lớp học tiếng Hàn tại SEIU Vị Thanh"
                          className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg bg-white outline-hidden"
                        />
                      </div>
                    </div>
                  </div>

                  <label className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${editingArticleData.isFeatured ? 'border-amber-300 bg-amber-50' : 'border-stone-200 bg-white hover:bg-stone-50'}`}>
                    <input
                      type="checkbox"
                      checked={Boolean(editingArticleData.isFeatured)}
                      onChange={e => setEditingArticleData({ ...editingArticleData, isFeatured: e.target.checked })}
                      className="mt-0.5 h-4 w-4 accent-amber-600"
                    />
                    <span><span className="flex items-center gap-1.5 text-xs font-black text-stone-900"><Pin className="h-3.5 w-3.5 text-amber-600" /> Ghim bài viết lên trang chủ</span><span className="mt-0.5 block text-[11px] text-stone-500">Tối đa 2 bài ghim, hiển thị phía trên 4 bài mới nhất.</span></span>
                  </label>

                  {/* SUBPAGES MANAGEMENT SECTION (Trang con & Bài tập con) */}
                  <div className="p-5 bg-gradient-to-br from-stone-50 to-red-50/20 rounded-2xl border-2 border-dashed border-red-200 space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <div className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5 text-red-600">
                          <Layers className="w-4 h-4" />
                          <span>2. Danh Sách Các Trang Con & Bài Tập Kèm Theo ({editingArticleData.subPages?.length || 0})</span>
                        </div>
                        <p className="text-[11px] text-stone-500 mt-0.5">
                          Tạo các trang con (VD: Trang 1: Lý thuyết mở rộng, Trang 2: Bài tập trắc nghiệm, Trang 3: Luyện phát âm)
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleOpenAddSubPage}
                        className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ Thêm Trang Con / Bài Tập Mới</span>
                      </button>
                    </div>

                    {editingArticleData.subPages && editingArticleData.subPages.length > 0 ? (
                      <div className="space-y-2.5">
                        {editingArticleData.subPages.map((sp, idx) => (
                          <div
                            key={sp.id || idx}
                            className="p-3.5 bg-white rounded-xl border border-stone-200 shadow-2xs flex items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="w-6 h-6 rounded-lg bg-red-100 text-red-700 text-xs font-bold flex items-center justify-center shrink-0">
                                {idx + 1}
                              </span>
                              <div className="min-w-0">
                                <h4 className="text-xs font-bold text-stone-900 truncate">
                                  {sp.title}
                                </h4>
                                <p className="text-[11px] text-stone-500 truncate max-w-md">
                                  {sp.summary || 'Trang con có nội dung HTML & Bài tập tương tác'}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleMoveSubPage(idx, 'up')}
                                disabled={idx === 0}
                                className="p-1 text-stone-400 hover:text-stone-700 disabled:opacity-30"
                                title="Di chuyển lên"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveSubPage(idx, 'down')}
                                disabled={idx === (editingArticleData.subPages?.length || 1) - 1}
                                className="p-1 text-stone-400 hover:text-stone-700 disabled:opacity-30"
                                title="Di chuyển xuống"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenEditSubPage(idx)}
                                className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-1"
                              >
                                <Edit3 className="w-3 h-3" />
                                <span>Sửa</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteSubPage(idx)}
                                className="p-1 text-stone-400 hover:text-red-600 rounded-lg"
                                title="Xóa trang con"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 bg-white/70 rounded-xl border border-stone-200/80">
                        <Layers className="w-6 h-6 text-stone-400 mx-auto mb-1.5" />
                        <p className="text-xs font-medium text-stone-600">Chưa có trang con nào cho bài viết này</p>
                        <p className="text-[11px] text-stone-400 mt-0.5">
                          Nhấp vào nút "+ Thêm Trang Con / Bài Tập Mới" ở trên để phân chia nội dung hoặc thêm bài tập kiểm tra.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* HTML Content & Interactive Inserter Toolbar for MAIN article */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                        <Code className="w-4 h-4 text-red-600" />
                        <span>3. Nội Dung Bài Chính (HTML & Chèn Ứng Dụng Bài Tập)</span>
                      </label>

                      {/* Code vs Live Preview Switcher */}
                      <div className="flex items-center bg-stone-100 p-0.5 rounded-lg border border-stone-200">
                        <button
                          type="button"
                          onClick={() => setContentViewMode('compose')}
                          className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                            contentViewMode === 'compose' ? 'bg-white text-red-600 shadow-2xs' : 'text-stone-600'
                          }`}
                        >
                          ✍️ Soạn bài dễ dàng
                        </button>
                        <button
                          type="button"
                          onClick={() => setContentViewMode('code')}
                          className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                            contentViewMode === 'code' ? 'bg-white text-red-600 shadow-2xs' : 'text-stone-600'
                          }`}
                        >
                          &lt;Code HTML&gt;
                        </button>
                        <button
                          type="button"
                          onClick={() => setContentViewMode('preview')}
                          className={`px-3 py-1 text-xs font-bold rounded-md transition-all flex items-center gap-1 ${
                            contentViewMode === 'preview' ? 'bg-white text-red-600 shadow-2xs' : 'text-stone-600'
                          }`}
                        >
                          <Play className="w-3 h-3 text-emerald-600" />
                          <span>👁️ Xem Trước Tương Tác</span>
                        </button>
                      </div>
                    </div>

                    {/* Interactive HTML Template Toolbar */}
                    <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200">
                      <div className="text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-2.5 flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-red-600">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Kho Mẫu Mã Nhúng HTML & Ứng Dụng Tương Tác Sẵn Có:</span>
                        </span>
                        <span className="text-[11px] text-stone-400 font-normal">
                          1 click để chèn mã vào vị trí soạn thảo
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-1.5">
                        <label className="cursor-pointer px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow-2xs transition-all flex items-center gap-1">
                          <Upload className="w-3.5 h-3.5" />
                          <span>+ Tải ảnh từ máy vào bài</span>
                          <input type="file" accept="image/*" className="hidden" onChange={handleArticleBodyImageUpload} />
                        </label>
                        <button
                          type="button"
                          onClick={() => insertTemplateToMain('imageEmbed')}
                          className="px-2.5 py-1.5 bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold shadow-2xs transition-all flex items-center gap-1"
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span>+ Ảnh bằng đường link</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => insertTemplateToMain('quiz')}
                          className="px-2.5 py-1.5 bg-white hover:bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-bold shadow-2xs transition-all flex items-center gap-1"
                        >
                          <CheckSquare className="w-3.5 h-3.5 text-red-600" />
                          <span>+ Trắc Nghiệm (Quiz Tự Chấm)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => insertTemplateToMain('flashcard')}
                          className="px-2.5 py-1.5 bg-white hover:bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-xs font-bold shadow-2xs transition-all flex items-center gap-1"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                          <span>+ Flashcard Lật Thẻ</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => insertTemplateToMain('fillInBlank')}
                          className="px-2.5 py-1.5 bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold shadow-2xs transition-all flex items-center gap-1"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                          <span>+ Điền Khuyết Ngữ Pháp</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => insertTemplateToMain('youtubeEmbed')}
                          className="px-2.5 py-1.5 bg-white hover:bg-red-50 text-stone-800 border border-stone-200 rounded-lg text-xs font-semibold shadow-2xs transition-all flex items-center gap-1"
                        >
                          <Youtube className="w-3.5 h-3.5 text-red-600" />
                          <span>+ Nhúng Video YouTube</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => insertTemplateToMain('tiktokEmbed')}
                          className="px-2.5 py-1.5 bg-white hover:bg-stone-100 text-stone-800 border border-stone-200 rounded-lg text-xs font-semibold shadow-2xs transition-all flex items-center gap-1"
                        >
                          <Video className="w-3.5 h-3.5 text-stone-900" />
                          <span>+ Nhúng Video TikTok</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => insertTemplateToMain('audioPlayer')}
                          className="px-2.5 py-1.5 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold shadow-2xs transition-all flex items-center gap-1"
                        >
                          <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>+ File Audio Luyện Nghe</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => insertTemplateToMain('table')}
                          className="px-2.5 py-1.5 bg-white hover:bg-stone-100 text-stone-800 border border-stone-200 rounded-lg text-xs font-semibold shadow-2xs transition-all flex items-center gap-1"
                        >
                          <Table className="w-3.5 h-3.5 text-stone-600" />
                          <span>+ Bảng So Sánh</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => insertTemplateToMain('callout')}
                          className="px-2.5 py-1.5 bg-white hover:bg-stone-100 text-stone-800 border border-stone-200 rounded-lg text-xs font-semibold shadow-2xs transition-all flex items-center gap-1"
                        >
                          <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                          <span>+ Lưu Ý Thầy Bửu</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => insertTemplateToMain('quoteHighlight')}
                          className="px-2.5 py-1.5 bg-white hover:bg-stone-100 text-stone-800 border border-stone-200 rounded-lg text-xs font-semibold shadow-2xs transition-all flex items-center gap-1"
                        >
                          <Quote className="w-3.5 h-3.5 text-amber-600" />
                          <span>+ Trích Dẫn & Châm Ngôn</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => insertTemplateToMain('ctaConsultation')}
                          className="px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow-2xs transition-all flex items-center gap-1"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          <span>+ Hộp Kêu Gọi Đăng Ký (CTA)</span>
                        </button>
                      </div>
                    </div>

                    {/* View Mode: Code vs Interactive Preview */}
                    {contentViewMode === 'compose' ? (
                      <RichArticleEditor
                        value={editingArticleData.contentHtml}
                        onChange={(contentHtml) => setEditingArticleData(prev => ({ ...prev, contentHtml }))}
                        onUploadImage={handleArticleBodyImageUpload}
                      />
                    ) : contentViewMode === 'code' ? (
                      <textarea
                        rows={10}
                        value={editingArticleData.contentHtml}
                        onChange={(e) => setEditingArticleData({ ...editingArticleData, contentHtml: e.target.value })}
                        placeholder="Nhập nội dung bài viết hoặc sử dụng các nút chèn mẫu bài tập ở trên..."
                        className="w-full p-3 font-mono text-xs border border-stone-300 rounded-xl focus:ring-2 focus:ring-red-600 outline-hidden bg-stone-50"
                      />
                    ) : (
                      <div className="p-4 bg-white border border-stone-300 rounded-xl shadow-inner min-h-[250px] max-h-[400px] overflow-y-auto">
                        <div className="text-xs text-stone-400 mb-2 italic">
                          ⚡ Đang hiển thị bản xem trước trực tiếp (Bạn có thể nhấp thử chọn đáp án trắc nghiệm hoặc lật flashcard):
                        </div>
                        <InteractiveContentRenderer htmlContent={editingArticleData.contentHtml} />
                      </div>
                    )}
                  </div>

                  {/* Author, Tags */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-stone-200">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Tác giả bài viết</label>
                      <input
                        type="text"
                        value={editingArticleData.author}
                        onChange={(e) => setEditingArticleData({ ...editingArticleData, author: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Thời gian đọc ước tính</label>
                      <input
                        type="text"
                        value={editingArticleData.readTime}
                        onChange={(e) => setEditingArticleData({ ...editingArticleData, readTime: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Ngày đăng (dùng để xếp 4 bài mới nhất)</label>
                      <input
                        type="text"
                        value={editingArticleData.publishedAt}
                        onChange={(e) => setEditingArticleData({ ...editingArticleData, publishedAt: e.target.value })}
                        placeholder="VD: 22/08/2026"
                        className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Hashtag (cách nhau bằng dấu phẩy)</label>
                      <input
                        type="text"
                        value={(editingArticleData.tags || []).join(', ')}
                        onChange={(e) => setEditingArticleData({ ...editingArticleData, tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean) })}
                        placeholder="#SEIU, #HocTiengHan, #DuHocHan"
                        className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg"
                      />
                    </div>
                  </div>

                  {/* 4. REAL-TIME SEO AUDIT & EVALUATION DASHBOARD (Đánh giá chuẩn SEO) */}
                  {(() => {
                    const seo = calculateSeoScore(editingArticleData);
                    return (
                      <div className="p-5 bg-gradient-to-br from-stone-50 via-white to-red-50/20 rounded-2xl border-2 border-stone-200 shadow-sm space-y-4">
                        <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-stone-200">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-bold">
                              <Gauge className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-xs font-black text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                                <span>4. Bảng Đánh Giá Bài Viết Chuẩn SEO Google (SEO Audit)</span>
                              </div>
                              <p className="text-[11px] text-stone-500">
                                Hệ thống chấm điểm tự động các tiêu chí xếp hạng tìm kiếm của Google
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <div className="text-[11px] text-stone-400 font-semibold">Điểm SEO bài viết</div>
                              <div className="text-lg font-black text-stone-900 leading-none">
                                <span className={seo.score >= 80 ? 'text-emerald-600' : seo.score >= 60 ? 'text-blue-600' : 'text-amber-600'}>
                                  {seo.score}
                                </span>
                                <span className="text-xs text-stone-400">/100</span>
                              </div>
                            </div>
                            <span className={`px-3 py-1 text-xs font-bold rounded-full border ${seo.rankColor}`}>
                              {seo.rank}
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div>
                          <div className="w-full bg-stone-200 h-2.5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-500 rounded-full ${
                                seo.score >= 80 ? 'bg-emerald-500' : seo.score >= 60 ? 'bg-blue-500' : 'bg-amber-500'
                              }`}
                              style={{ width: `${seo.score}%` }}
                            />
                          </div>
                        </div>

                        {/* Check items list */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                          {seo.checks.map((c, i) => (
                            <div 
                              key={i} 
                              className={`p-3 rounded-xl border text-xs transition-all ${
                                c.passed 
                                  ? 'bg-emerald-50/50 border-emerald-200 text-stone-800' 
                                  : 'bg-amber-50/40 border-amber-200 text-stone-800'
                              }`}
                            >
                              <div className="flex items-start gap-2">
                                <div className="mt-0.5 shrink-0">
                                  {c.passed ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                  ) : (
                                    <AlertCircle className="w-4 h-4 text-amber-600" />
                                  )}
                                </div>
                                <div className="space-y-0.5">
                                  <div className="font-bold text-stone-900 flex items-center justify-between gap-2">
                                    <span>{c.label}</span>
                                    <span className="text-[10px] font-semibold opacity-70">+{c.points}đ</span>
                                  </div>
                                  <p className="text-[11px] text-stone-600 leading-snug">{c.tip}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* SEO Customization Fields */}
                        <div className="pt-3 border-t border-stone-200 space-y-3 bg-white p-4 rounded-xl border border-stone-200">
                          <div className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-red-600" />
                            <span>Tùy Chỉnh Thẻ Meta Title & Meta Description Cho Google:</span>
                          </div>

                          <div className="grid grid-cols-1 gap-3">
                            <div>
                              <label className="text-[11px] font-bold text-stone-700">Từ khóa chính cần SEO</label>
                              <input
                                type="text"
                                value={editingArticleData.focusKeyword || ''}
                                onChange={(e) => setEditingArticleData({ ...editingArticleData, focusKeyword: e.target.value })}
                                placeholder="VD: học tiếng Hàn tại Vị Thanh Hậu Giang"
                                className="mt-1 w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg outline-hidden focus:ring-1 focus:ring-red-600"
                              />
                              <p className="mt-1 text-[10px] text-stone-500">Chỉ chọn một cụm từ chính, đúng với điều học viên có thể gõ trên Google.</p>
                            </div>
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <label className="text-[11px] font-bold text-stone-700">
                                  Tiêu đề hiển thị Google (Meta Title)
                                </label>
                                <span className={`text-[10px] ${
                                  (editingArticleData.seoTitle?.length || 0) >= 45 && (editingArticleData.seoTitle?.length || 0) <= 65
                                    ? 'text-emerald-600 font-bold'
                                    : 'text-stone-400'
                                }`}>
                                  {editingArticleData.seoTitle?.length || 0}/65 ký tự
                                </span>
                              </div>
                              <input
                                type="text"
                                value={editingArticleData.seoTitle || ''}
                                onChange={(e) => setEditingArticleData({ ...editingArticleData, seoTitle: e.target.value })}
                                placeholder="Nếu để trống, hệ thống sẽ lấy Tiêu đề bài viết chính"
                                className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg outline-hidden focus:ring-1 focus:ring-red-600"
                              />
                            </div>

                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <label className="text-[11px] font-bold text-stone-700">
                                  Mô tả hiển thị Google (Meta Description)
                                </label>
                                <span className={`text-[10px] ${
                                  (editingArticleData.seoDescription?.length || 0) >= 135 && (editingArticleData.seoDescription?.length || 0) <= 160
                                    ? 'text-emerald-600 font-bold'
                                    : 'text-stone-400'
                                }`}>
                                  {editingArticleData.seoDescription?.length || 0}/160 ký tự
                                </span>
                              </div>
                              <textarea
                                rows={2}
                                value={editingArticleData.seoDescription || ''}
                                onChange={(e) => setEditingArticleData({ ...editingArticleData, seoDescription: e.target.value })}
                                placeholder="Nếu để trống, hệ thống sẽ lấy phần Tóm tắt bài viết..."
                                className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg outline-hidden focus:ring-1 focus:ring-red-600"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-bold text-stone-700">Đường dẫn chính thức (Canonical URL – không bắt buộc)</label>
                              <input
                                type="url"
                                value={editingArticleData.canonicalUrl || ''}
                                onChange={(e) => setEditingArticleData({ ...editingArticleData, canonicalUrl: e.target.value })}
                                placeholder="https://tienghanseiu.com/#article/duong-dan-bai-viet"
                                className="mt-1 w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg outline-hidden focus:ring-1 focus:ring-red-600"
                              />
                            </div>
                            <label className="flex items-center gap-2 rounded-lg border border-stone-200 bg-stone-50 p-3 text-[11px] font-bold text-stone-700">
                              <input type="checkbox" checked={Boolean(editingArticleData.seoNoIndex)} onChange={(e) => setEditingArticleData({ ...editingArticleData, seoNoIndex: e.target.checked })} className="accent-red-600" />
                              Ẩn bài này khỏi Google (chỉ bật cho bài nháp hoặc nội dung nội bộ)
                            </label>
                          </div>

                          {/* Live Google Search Snippet Simulation */}
                          <div className="mt-2 p-3 bg-stone-50 rounded-lg border border-stone-200">
                            <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                              🔍 Mô phỏng hiển thị trên kết quả tìm kiếm Google:
                            </div>
                            <div className="text-[#1a0dab] font-medium text-sm hover:underline truncate">
                              {editingArticleData.seoTitle || editingArticleData.title || 'Tiêu đề bài viết SEIU'} | CÔNG TY SEIU
                            </div>
                            <div className="text-[#006621] text-[11px] font-mono mt-0.5 truncate">
                              https://tienghanseiu.com/blog/{editingArticleData.slug || 'bai-viet-seiu'}
                            </div>
                            <div className="text-[#545454] text-xs mt-1 line-clamp-2">
                              {editingArticleData.seoDescription || editingArticleData.summary || 'Tóm tắt bài viết về du học Hàn Quốc và học tiếng Hàn tại trung tâm SEIU...'}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Submit Button */}
                  <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsEditingArticle(false)}
                      className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5"
                    >
                      <Save className="w-4 h-4" />
                      <span>Lưu & Xuất Bản Bài Viết Toàn Diện</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: BANNER & HERO IMAGES */}
          {activeTab === 'banner' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-stone-900">Quản Lý Hình Ảnh Banner, Hero & Nền</h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Tải lên ảnh nền banner chính, ảnh học viên xuất sắc và khẩu hiệu thương hiệu SEIU
                </p>
              </div>

              {/* Slogan */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Tiêu đề chính Hero Banner
                  </label>
                  <input
                    type="text"
                    value={siteConfig.heroTitle}
                    onChange={(e) => setSiteConfig({ ...siteConfig, heroTitle: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs border border-stone-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Câu tiếng Hàn định hướng thương hiệu
                  </label>
                  <input
                    type="text"
                    value={siteConfig.heroKoreanSlogan}
                    onChange={(e) => setSiteConfig({ ...siteConfig, heroKoreanSlogan: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs border border-stone-300 rounded-xl font-medium text-red-600"
                  />
                </div>
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Đoạn mô tả phụ Hero Banner
                </label>
                <textarea
                  rows={2}
                  value={siteConfig.heroSubtitle}
                  onChange={(e) => setSiteConfig({ ...siteConfig, heroSubtitle: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs border border-stone-300 rounded-xl"
                />
              </div>

              {/* Representative / Teacher Avatar */}
              <div className="p-4 bg-red-50/60 rounded-xl border border-red-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-stone-900">
                    Ảnh đại diện / Avatar Thầy Bửu (Người sáng lập & Cố vấn du học)
                  </label>
                  <span className="text-[10px] bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full">
                    Hiển thị trên Banner & Trang chủ
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  {siteConfig.representativeAvatar ? (
                    <img
                      src={siteConfig.representativeAvatar}
                      alt="Representative Avatar"
                      className="w-16 h-16 object-cover rounded-full border-2 border-red-600 shadow-sm shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-lg shrink-0">
                      TB
                    </div>
                  )}
                  <div className="space-y-2 flex-grow w-full">
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="cursor-pointer px-3 py-1.5 bg-white border border-stone-300 hover:bg-stone-100 text-stone-700 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs">
                        <Upload className="w-3.5 h-3.5 text-red-600" />
                        <span>Tải ảnh Avatar mới từ máy</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, 'representativeAvatar')}
                        />
                      </label>
                    </div>
                    <input
                      type="text"
                      value={siteConfig.representativeAvatar || ''}
                      onChange={(e) => setSiteConfig({ ...siteConfig, representativeAvatar: e.target.value })}
                      placeholder="Hoặc dán link ảnh URL avatar..."
                      className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg bg-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* ẢNH BÌA TRANG CHỦ — băng-rôn lớn nhất, nằm trên cùng */}
              <div className="p-4 bg-red-50/60 rounded-xl border-2 border-red-200 space-y-3">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <label className="block text-xs font-black text-red-700 uppercase tracking-wide">
                      3 ảnh bìa trang chủ
                    </label>
                    <p className="text-[11px] text-stone-600 mt-0.5">
                      Tự động chuyển ảnh sau mỗi 5 giây. Có thể tải từng ảnh trực tiếp từ máy; nên dùng ảnh ngang từ 1600×900.
                    </p>
                  </div>
                  <label className="flex items-center gap-2 text-xs font-bold text-stone-700">
                    <input
                      type="checkbox"
                      checked={siteConfig.homeCoverEnabled !== false}
                      onChange={(e) => setSiteConfig({ ...siteConfig, homeCoverEnabled: e.target.checked })}
                    />
                    <span>Hiển thị ảnh bìa</span>
                  </label>
                </div>

                <div className="grid gap-3 lg:grid-cols-3">
                  {[0, 1, 2].map((index) => {
                    const image = siteConfig.homeCoverImages?.[index] || (index === 0 ? siteConfig.homeCoverImage : '') || '';
                    return (
                      <div key={index} className="rounded-xl border border-red-200 bg-white p-3">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-[11px] font-black text-stone-800">Ảnh {index + 1}</span>
                          {image && <span className="text-[9px] font-black uppercase tracking-wider text-emerald-600">Đang dùng</span>}
                        </div>
                        {image ? (
                          <img src={image} alt={`Ảnh bìa ${index + 1}`} className="aspect-video w-full rounded-lg border border-stone-200 object-cover" />
                        ) : (
                          <div className="flex aspect-video w-full items-center justify-center rounded-lg border-2 border-dashed border-stone-300 bg-stone-50 text-[11px] text-stone-400">Chưa có ảnh</div>
                        )}
                        <label className="mt-2 flex cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-xs font-bold text-white hover:bg-red-700">
                          <Upload className="h-3.5 w-3.5" /> Tải ảnh từ máy
                          <input type="file" accept="image/*" className="hidden" onChange={(event) => handleHomeCoverFileUpload(event, index)} />
                        </label>
                        <input
                          type="url"
                          value={image}
                          onChange={(event) => {
                            const images = [...(siteConfig.homeCoverImages || [])];
                            while (images.length < 3) images.push('');
                            images[index] = event.target.value;
                            setSiteConfig({ ...siteConfig, homeCoverImages: images.slice(0, 3), homeCoverImage: index === 0 ? event.target.value : siteConfig.homeCoverImage });
                          }}
                          placeholder="Hoặc dán link ảnh"
                          className="mt-2 w-full rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-[10px]"
                        />
                        {image && (
                          <button
                            type="button"
                            onClick={() => {
                              const images = [...(siteConfig.homeCoverImages || [])];
                              while (images.length < 3) images.push('');
                              images[index] = '';
                              setSiteConfig({ ...siteConfig, homeCoverImages: images.slice(0, 3), homeCoverImage: index === 0 ? '' : siteConfig.homeCoverImage });
                            }}
                            className="mt-2 text-[10px] font-bold text-stone-400 underline hover:text-red-600"
                          >
                            Gỡ ảnh {index + 1}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Dòng chữ lớn trên ảnh bìa</label>
                    <input
                      type="text"
                      value={siteConfig.homeCoverHeadline || ''}
                      onChange={(e) => setSiteConfig({ ...siteConfig, homeCoverHeadline: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Dòng chữ nhỏ bên dưới</label>
                    <input
                      type="text"
                      value={siteConfig.homeCoverSubline || ''}
                      onChange={(e) => setSiteConfig({ ...siteConfig, homeCoverSubline: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl bg-white"
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-black uppercase tracking-wide text-[#153a70]">Kích thước & vị trí khối chữ trắng</p>
                      <p className="mt-1 text-[11px] text-stone-500">Kéo thanh để chỉnh trực tiếp trên máy tính. Trên điện thoại, khối tự về kích thước an toàn để không tràn màn hình.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSiteConfig({ ...siteConfig, homeCoverPanelWidth: 46, homeCoverPanelX: 4, homeCoverPanelY: 50, homeCoverImagePositionX: 50, homeCoverImagePositionY: 50 })}
                      className="rounded-full border border-slate-200 px-3 py-1.5 text-[11px] font-bold text-slate-600 transition hover:border-[#153a70] hover:text-[#153a70]"
                    >
                      Về mặc định
                    </button>
                  </div>

                  <div className="mt-4 grid gap-4 lg:grid-cols-3">
                    <label className="block">
                      <span className="flex items-center justify-between text-[11px] font-bold text-stone-700"><span>Độ rộng</span><strong className="text-[#e23b43]">{siteConfig.homeCoverPanelWidth ?? 46}%</strong></span>
                      <input type="range" min={34} max={70} step={1} value={siteConfig.homeCoverPanelWidth ?? 46} onChange={(e) => { const width = Number(e.target.value); setSiteConfig({ ...siteConfig, homeCoverPanelWidth: width, homeCoverPanelX: Math.min(siteConfig.homeCoverPanelX ?? 4, 96 - width) }); }} className="mt-2 w-full accent-[#e23b43]" />
                    </label>
                    <label className="block">
                      <span className="flex items-center justify-between text-[11px] font-bold text-stone-700"><span>Trái ↔ Phải</span><strong className="text-[#153a70]">{siteConfig.homeCoverPanelX ?? 4}%</strong></span>
                      <input type="range" min={0} max={Math.max(0, 96 - (siteConfig.homeCoverPanelWidth ?? 46))} step={1} value={Math.min(siteConfig.homeCoverPanelX ?? 4, 96 - (siteConfig.homeCoverPanelWidth ?? 46))} onChange={(e) => setSiteConfig({ ...siteConfig, homeCoverPanelX: Number(e.target.value) })} className="mt-2 w-full accent-[#153a70]" />
                    </label>
                    <label className="block">
                      <span className="flex items-center justify-between text-[11px] font-bold text-stone-700"><span>Lên ↕ Xuống</span><strong className="text-[#153a70]">{siteConfig.homeCoverPanelY ?? 50}%</strong></span>
                      <input type="range" min={24} max={76} step={1} value={siteConfig.homeCoverPanelY ?? 50} onChange={(e) => setSiteConfig({ ...siteConfig, homeCoverPanelY: Number(e.target.value) })} className="mt-2 w-full accent-[#153a70]" />
                    </label>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="mr-1 self-center text-[10px] font-black uppercase tracking-wider text-stone-400">Đặt nhanh</span>
                    <button type="button" onClick={() => setSiteConfig({ ...siteConfig, homeCoverPanelX: 4 })} className="rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-200">Bên trái</button>
                    <button type="button" onClick={() => setSiteConfig({ ...siteConfig, homeCoverPanelX: Math.max(0, Math.round((100 - (siteConfig.homeCoverPanelWidth ?? 46)) / 2)) })} className="rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-200">Ở giữa</button>
                    <button type="button" onClick={() => setSiteConfig({ ...siteConfig, homeCoverPanelX: Math.max(0, 96 - (siteConfig.homeCoverPanelWidth ?? 46)) })} className="rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-200">Bên phải</button>
                    <button type="button" onClick={() => setSiteConfig({ ...siteConfig, homeCoverPanelY: 38 })} className="rounded-full bg-red-50 px-3 py-1.5 text-[11px] font-bold text-red-700 hover:bg-red-100">Lên trên</button>
                    <button type="button" onClick={() => setSiteConfig({ ...siteConfig, homeCoverPanelY: 62 })} className="rounded-full bg-red-50 px-3 py-1.5 text-[11px] font-bold text-red-700 hover:bg-red-100">Xuống dưới</button>
                  </div>

                  <div className="mt-5 border-t border-slate-200 pt-4">
                    <p className="text-xs font-black uppercase tracking-wide text-[#153a70]">Căn lại chủ thể trong ảnh bìa</p>
                    <p className="mt-1 text-[11px] text-stone-500">Dùng khi ảnh bị lệch người hoặc lệch trọng tâm. Kéo ngang/dọc đến khi chủ thể nằm đúng vị trí.</p>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <label className="block">
                        <span className="flex items-center justify-between text-[11px] font-bold text-stone-700"><span>Ảnh trái ↔ phải</span><strong className="text-[#e23b43]">{siteConfig.homeCoverImagePositionX ?? 50}%</strong></span>
                        <input type="range" min={0} max={100} step={1} value={siteConfig.homeCoverImagePositionX ?? 50} onChange={(e) => setSiteConfig({ ...siteConfig, homeCoverImagePositionX: Number(e.target.value) })} className="mt-2 w-full accent-[#e23b43]" />
                      </label>
                      <label className="block">
                        <span className="flex items-center justify-between text-[11px] font-bold text-stone-700"><span>Ảnh lên ↕ xuống</span><strong className="text-[#e23b43]">{siteConfig.homeCoverImagePositionY ?? 50}%</strong></span>
                        <input type="range" min={0} max={100} step={1} value={siteConfig.homeCoverImagePositionY ?? 50} onChange={(e) => setSiteConfig({ ...siteConfig, homeCoverImagePositionY: Number(e.target.value) })} className="mt-2 w-full accent-[#e23b43]" />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* BẢNG CHIÊU SINH DƯỚI BÀI GHIM */}
              <div className="rounded-2xl border-2 border-amber-200 bg-amber-50/50 p-5 space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div><h4 className="text-sm font-black text-stone-900 flex items-center gap-2"><Newspaper className="h-4 w-4 text-red-600" /> Bảng chiêu sinh dưới bài ghim</h4><p className="mt-1 text-[11px] text-stone-600">Mọi nội dung và hình ảnh ở bảng này đều có thể thay đổi tại đây.</p></div>
                  <label className="flex items-center gap-2 text-xs font-bold text-stone-700"><input type="checkbox" checked={siteConfig.admissionEnabled !== false} onChange={(e) => setSiteConfig({ ...siteConfig, admissionEnabled: e.target.checked })} className="accent-red-600" /> Hiển thị bảng chiêu sinh</label>
                </div>

                <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
                  <div>
                    <div className="aspect-square overflow-hidden rounded-xl border border-stone-300 bg-white">
                      {siteConfig.admissionImage ? <img src={siteConfig.admissionImage} alt={siteConfig.admissionImageAlt || ''} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-xs text-stone-400">Chưa có ảnh chiêu sinh</div>}
                    </div>
                    <label className="mt-2 flex cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-xs font-bold text-white hover:bg-red-700"><Upload className="h-3.5 w-3.5" /> Tải ảnh từ máy<input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'admission')} /></label>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input value={siteConfig.admissionBadge || ''} onChange={(e) => setSiteConfig({ ...siteConfig, admissionBadge: e.target.value })} placeholder="Nhãn: Tuyển sinh khóa mới" className="rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs" />
                    <input value={siteConfig.admissionOpeningDate || ''} onChange={(e) => setSiteConfig({ ...siteConfig, admissionOpeningDate: e.target.value })} placeholder="Ngày khai giảng" className="rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs" />
                    <input value={siteConfig.admissionTitle || ''} onChange={(e) => setSiteConfig({ ...siteConfig, admissionTitle: e.target.value })} placeholder="Tiêu đề chiêu sinh" className="sm:col-span-2 rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs font-bold" />
                    <textarea rows={2} value={siteConfig.admissionDescription || ''} onChange={(e) => setSiteConfig({ ...siteConfig, admissionDescription: e.target.value })} placeholder="Mô tả ngắn" className="sm:col-span-2 rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs" />
                    <input value={siteConfig.admissionSchedule || ''} onChange={(e) => setSiteConfig({ ...siteConfig, admissionSchedule: e.target.value })} placeholder="Lịch học" className="rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs" />
                    <input value={siteConfig.admissionAudience || ''} onChange={(e) => setSiteConfig({ ...siteConfig, admissionAudience: e.target.value })} placeholder="Đối tượng học" className="rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs" />
                    <input value={siteConfig.admissionLocation || ''} onChange={(e) => setSiteConfig({ ...siteConfig, admissionLocation: e.target.value })} placeholder="Địa điểm" className="rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs" />
                    <input value={siteConfig.admissionTuition || ''} onChange={(e) => setSiteConfig({ ...siteConfig, admissionTuition: e.target.value })} placeholder="Học phí / ưu đãi" className="rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs" />
                    <input value={siteConfig.admissionSeats || ''} onChange={(e) => setSiteConfig({ ...siteConfig, admissionSeats: e.target.value })} placeholder="Số lượng / tình trạng lớp" className="rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs" />
                    <input value={siteConfig.admissionImageAlt || ''} onChange={(e) => setSiteConfig({ ...siteConfig, admissionImageAlt: e.target.value })} placeholder="Mô tả ảnh chuẩn SEO" className="rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs" />
                  </div>
                </div>
              </div>

              {/* Tỷ giá dùng cho công cụ dự toán du học */}
              <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-5">
                <label className="block text-xs font-black uppercase tracking-wide text-[#153a70]">Tỷ giá dự toán KRW → VND</label>
                <p className="mt-1 text-[11px] text-stone-600">Dùng để quy đổi Invoice trường Hàn sang tiền Việt. Có thể thay đổi theo tỷ giá tư vấn thực tế.</p>
                <div className="mt-3 flex max-w-sm items-center gap-2">
                  <input type="number" min={1} max={100} step={0.1} value={siteConfig.studyAbroadKrwRate ?? 19} onChange={(e) => setSiteConfig({ ...siteConfig, studyAbroadKrwRate: Number(e.target.value) })} className="w-28 rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm font-black text-[#153a70]" />
                  <span className="text-xs font-bold text-stone-600">VND cho 1 KRW</span>
                </div>
              </div>

              {/* Số bản tin hiện trên trang chủ */}
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Số bản tin hiển thị trên trang chủ
                </label>
                <p className="text-[11px] text-stone-500 mb-2">
                  Bài mới đăng luôn nằm trên cùng. Khi vượt quá số này, bài cũ nhất tự chuyển vào mục lưu trữ
                  (vẫn xem lại được ở tab Tin Tức).
                </p>
                <input
                  type="number"
                  min={3}
                  max={24}
                  value={siteConfig.newsVisibleCount ?? 6}
                  onChange={(e) => setSiteConfig({ ...siteConfig, newsVisibleCount: Number(e.target.value) || 6 })}
                  className="w-28 px-3 py-2 text-xs border border-stone-300 rounded-xl bg-white"
                />
              </div>

              {/* Banner Background Image */}
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
                <label className="block text-xs font-bold text-stone-800">
                  Ảnh nền Hero Banner (Khổ ngang)
                </label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  {siteConfig.heroBannerBgImage && (
                    <img
                      src={siteConfig.heroBannerBgImage}
                      alt="Banner Preview"
                      className="w-32 h-20 object-cover rounded-lg border border-stone-300 shrink-0"
                    />
                  )}
                  <div className="space-y-2 flex-grow w-full">
                    <label className="cursor-pointer px-3 py-1.5 bg-white border border-stone-300 hover:bg-stone-100 text-stone-700 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5 text-red-600" />
                      <span>Tải ảnh nền mới</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, 'heroBg')}
                      />
                    </label>
                    <input
                      type="text"
                      value={siteConfig.heroBannerBgImage || ''}
                      onChange={(e) => setSiteConfig({ ...siteConfig, heroBannerBgImage: e.target.value })}
                      placeholder="Dán link ảnh URL..."
                      className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Hero Student Feature Image */}
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
                <label className="block text-xs font-bold text-stone-800">
                  Ảnh học viên / Đại diện SEIU trên Hero
                </label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  {siteConfig.heroStudentImage && (
                    <img
                      src={siteConfig.heroStudentImage}
                      alt="Student Preview"
                      className="w-20 h-24 object-cover rounded-lg border border-stone-300 shrink-0"
                    />
                  )}
                  <div className="space-y-2 flex-grow w-full">
                    <label className="cursor-pointer px-3 py-1.5 bg-white border border-stone-300 hover:bg-stone-100 text-stone-700 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5 text-red-600" />
                      <span>Tải ảnh học viên / đại diện</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, 'heroStudent')}
                      />
                    </label>
                    <input
                      type="text"
                      value={siteConfig.heroStudentImage || ''}
                      onChange={(e) => setSiteConfig({ ...siteConfig, heroStudentImage: e.target.value })}
                      placeholder="Dán link ảnh URL..."
                      className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-200 flex justify-end">
                <button
                  onClick={handleSaveSiteConfig}
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Lưu Cài Đặt Banner</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: COURSES & POLICIES */}
          {activeTab === 'courses' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-stone-900">Quản Lý Khóa Học & Chính Sách Cốt Lõi</h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Cập nhật phí dịch vụ 75 triệu, thời điểm thanh toán sau Visa và các chính sách hiện hành
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-2">
                  <label className="block text-xs font-bold text-red-900">Phí Dịch Vụ Du Học Trọn Gói</label>
                  <input
                    type="text"
                    value={siteConfig.serviceFeePackage}
                    onChange={(e) => setSiteConfig({ ...siteConfig, serviceFeePackage: e.target.value })}
                    className="w-full px-3 py-2 text-sm font-bold text-red-700 bg-white border border-red-300 rounded-lg"
                  />
                  <p className="text-[11px] text-red-600">Minh bạch không phát sinh theo chính sách SEIU</p>
                </div>

                <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
                  <label className="block text-xs font-bold text-stone-800">Chính Sách 0 Đồng Trước Visa</label>
                  <input
                    type="text"
                    value={siteConfig.zeroDongVisaPolicy}
                    onChange={(e) => setSiteConfig({ ...siteConfig, zeroDongVisaPolicy: e.target.value })}
                    className="w-full px-3 py-2 text-xs text-stone-700 bg-white border border-stone-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Chính sách học thử</label>
                  <input
                    type="text"
                    value={siteConfig.trialPolicy}
                    onChange={(e) => setSiteConfig({ ...siteConfig, trialPolicy: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs border border-stone-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Chính sách học sinh lớp 12</label>
                  <input
                    type="text"
                    value={siteConfig.grade12Policy}
                    onChange={(e) => setSiteConfig({ ...siteConfig, grade12Policy: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs border border-stone-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Thưởng giới thiệu học viên (Referral)</label>
                  <input
                    type="text"
                    value={siteConfig.referralReward}
                    onChange={(e) => setSiteConfig({ ...siteConfig, referralReward: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs border border-stone-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Khung học bổng du học</label>
                  <input
                    type="text"
                    value={siteConfig.scholarshipRange}
                    onChange={(e) => setSiteConfig({ ...siteConfig, scholarshipRange: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs border border-stone-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-stone-200 flex justify-end">
                <button
                  onClick={handleSaveSiteConfig}
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Lưu Chính Sách</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: BRAND & BRANCHES */}
          {activeTab === 'brand' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-stone-900">Thông Tin Pháp Nhân, Chi Nhánh & Hotline SEIU</h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Đồng bộ thông tin Vị Thanh - Hậu Giang và Cơ sở TP. Hồ Chí Minh
                </p>
              </div>

              {/* Legal & Founder */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Tên pháp nhân</label>
                  <input
                    type="text"
                    value={siteConfig.companyName}
                    onChange={(e) => setSiteConfig({ ...siteConfig, companyName: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs border border-stone-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Người đại diện / Giám đốc</label>
                  <input
                    type="text"
                    value={siteConfig.representative}
                    onChange={(e) => setSiteConfig({ ...siteConfig, representative: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs border border-stone-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Ngày cấp phép hoạt động</label>
                  <input
                    type="text"
                    value={siteConfig.licenseDate}
                    onChange={(e) => setSiteConfig({ ...siteConfig, licenseDate: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs border border-stone-300 rounded-xl"
                  />
                </div>
              </div>

              {/* Hotlines & Websites */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Hotline chính thức</label>
                  <input
                    type="text"
                    value={siteConfig.hotlineFormatted}
                    onChange={(e) => setSiteConfig({ ...siteConfig, hotlineFormatted: e.target.value, hotline: e.target.value.replace(/\D/g, '') })}
                    className="w-full px-3.5 py-2 text-xs border border-stone-300 rounded-xl font-bold text-red-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Email liên hệ</label>
                  <input
                    type="text"
                    value={siteConfig.email}
                    onChange={(e) => setSiteConfig({ ...siteConfig, email: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs border border-stone-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Số Zalo</label>
                  <input
                    type="text"
                    value={siteConfig.zalo || ''}
                    onChange={(e) => setSiteConfig({ ...siteConfig, zalo: e.target.value.replace(/\D/g, '') })}
                    className="w-full px-3.5 py-2 text-xs border border-stone-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Giờ làm việc</label>
                  <input
                    type="text"
                    value={siteConfig.workingHours || ''}
                    onChange={(e) => setSiteConfig({ ...siteConfig, workingHours: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs border border-stone-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Link Fanpage Facebook</label>
                  <input
                    type="url"
                    placeholder="https://www.facebook.com/tienghan.seiu/"
                    value={siteConfig.facebookUrl || ''}
                    onChange={(e) => setSiteConfig({ ...siteConfig, facebookUrl: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs border border-stone-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Link kênh TikTok (để trống sẽ ẩn nút)</label>
                  <input
                    type="url"
                    placeholder="https://www.tiktok.com/@tienghanseiu"
                    value={siteConfig.tiktokUrl || ''}
                    onChange={(e) => setSiteConfig({ ...siteConfig, tiktokUrl: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs border border-stone-300 rounded-xl"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 mb-1">Link Google Maps trụ sở Vị Thanh</label>
                  <input
                    type="url"
                    value={siteConfig.googleMapsUrl || ''}
                    onChange={(e) => setSiteConfig({ ...siteConfig, googleMapsUrl: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs border border-stone-300 rounded-xl"
                  />
                </div>
              </div>

              {/* Addresses */}
              <div className="space-y-4">
                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-xs font-bold text-red-600 uppercase tracking-wider block mb-2">
                    1. Trụ sở chính: Vị Thanh - Hậu Giang
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={siteConfig.headquarterAddress}
                      onChange={(e) => setSiteConfig({ ...siteConfig, headquarterAddress: e.target.value })}
                      placeholder="Số nhà, đường, phường..."
                      className="px-3 py-2 text-xs border border-stone-300 rounded-lg bg-white"
                    />
                    <input
                      type="text"
                      value={siteConfig.headquarterCity}
                      onChange={(e) => setSiteConfig({ ...siteConfig, headquarterCity: e.target.value })}
                      placeholder="Thành phố, Tỉnh..."
                      className="px-3 py-2 text-xs border border-stone-300 rounded-lg bg-white"
                    />
                  </div>
                </div>

                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-xs font-bold text-red-600 uppercase tracking-wider block mb-2">
                    2. Cơ sở: TP. Hồ Chí Minh
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={siteConfig.hcmBranchAddress}
                      onChange={(e) => setSiteConfig({ ...siteConfig, hcmBranchAddress: e.target.value })}
                      placeholder="Số nhà, đường, khu TĐC..."
                      className="px-3 py-2 text-xs border border-stone-300 rounded-lg bg-white"
                    />
                    <input
                      type="text"
                      value={siteConfig.hcmBranchCity}
                      onChange={(e) => setSiteConfig({ ...siteConfig, hcmBranchCity: e.target.value })}
                      placeholder="Quận / Thành phố..."
                      className="px-3 py-2 text-xs border border-stone-300 rounded-lg bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* SEO Meta Keywords */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Hashtag & Từ khóa SEO
                </label>
                <input
                  type="text"
                  value={siteConfig.seoKeywords}
                  onChange={(e) => setSiteConfig({ ...siteConfig, seoKeywords: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs border border-stone-300 rounded-xl"
                />
              </div>

              <div className="pt-4 border-t border-stone-200 flex items-center justify-between">
                {onOpenLogoManager && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenLogoManager();
                    }}
                    className="text-xs text-red-600 font-bold hover:underline"
                  >
                    Tùy chỉnh Logo SEIU &rarr;
                  </button>
                )}
                <button
                  onClick={handleSaveSiteConfig}
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Lưu Thông Tin Địa Chỉ & Hotline</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: GALLERY MANAGEMENT */}
          {activeTab === 'gallery' && <AdminGalleryPanel />}

          {/* TAB 6: STUDENTS MANAGEMENT */}
          {activeTab === 'students' && <AdminStudentsPanel />}

          {/* TAB 7: PARTNERS MANAGEMENT */}
          {activeTab === 'partners' && <AdminPartnersPanel />}

          {/* TAB 8: VISAS MANAGEMENT */}
          {activeTab === 'visas' && <AdminVisasPanel />}

          {/* TAB 9: NEWS MANAGEMENT */}
          {activeTab === 'news' && <AdminNewsPanel />}

          {/* KHÁCH ĐĂNG KÝ TƯ VẤN — nhận từ mọi máy, lưu trên máy chủ */}
          {activeTab === 'leads' && <AdminLeadsPanel />}

          {/* KẾT QUẢ BÀI THI CỦA HỌC VIÊN */}
          {activeTab === 'registrations' && <AdminExamRegistrationsPanel />}

          {/* KẾT QUẢ BÀI THI CỦA HỌC VIÊN */}
          {activeTab === 'results' && <AdminExamResultsPanel />}

        </div>
      </div>

      {/* SUBPAGE MODAL / DRAWER */}
      {isEditingSubPage && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
          <div 
            className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-red-700 text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-red-200" />
                <h4 className="font-bold text-sm">
                  {editingSubPageIndex !== null ? 'Chỉnh Sửa Trang Con' : 'Thêm Trang Con / Bài Tập Mới'}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingSubPage(false)}
                className="p-1 text-white/80 hover:text-white rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSubPage} className="p-5 overflow-y-auto space-y-4 flex-grow">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Tiêu đề trang con <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={subPageFormData.title}
                  onChange={(e) => setSubPageFormData({ ...subPageFormData, title: e.target.value })}
                  placeholder="VD: Trang con 1: Kiểm tra trắc nghiệm phản xạ (Interactive Quiz)..."
                  className="w-full px-3.5 py-2 text-xs border border-stone-300 rounded-xl focus:ring-2 focus:ring-red-600 outline-hidden font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Mô tả / Tóm tắt ngắn trang con
                </label>
                <input
                  type="text"
                  value={subPageFormData.summary || ''}
                  onChange={(e) => setSubPageFormData({ ...subPageFormData, summary: e.target.value })}
                  placeholder="Mô tả mục tiêu của trang con hoặc bài tập..."
                  className="w-full px-3.5 py-2 text-xs border border-stone-300 rounded-xl"
                />
              </div>

              {/* Subpage Interactive HTML Toolbar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label className="text-xs font-bold text-stone-800 flex items-center gap-1">
                    <Code className="w-3.5 h-3.5 text-red-600" />
                    <span>Nội Dung HTML Trang Con & Bài Tập</span>
                  </label>

                  <div className="flex items-center bg-stone-100 p-0.5 rounded-lg border border-stone-200">
                    <button
                      type="button"
                      onClick={() => setSubPageContentViewMode('code')}
                      className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                        subPageContentViewMode === 'code' ? 'bg-white text-red-600 shadow-2xs' : 'text-stone-600'
                      }`}
                    >
                      &lt;Mã HTML&gt;
                    </button>
                    <button
                      type="button"
                      onClick={() => setSubPageContentViewMode('preview')}
                      className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all flex items-center gap-1 ${
                        subPageContentViewMode === 'preview' ? 'bg-white text-red-600 shadow-2xs' : 'text-stone-600'
                      }`}
                    >
                      <Play className="w-3 h-3 text-emerald-600" />
                      <span>👁️ Xem Trước</span>
                    </button>
                  </div>
                </div>

                <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200 flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => insertTemplateToSubPage('quiz')}
                    className="px-2.5 py-1 bg-white hover:bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-bold shadow-2xs flex items-center gap-1"
                  >
                    <CheckSquare className="w-3 h-3 text-red-600" />
                    <span>+ Quiz Trắc Nghiệm</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => insertTemplateToSubPage('flashcard')}
                    className="px-2.5 py-1 bg-white hover:bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-xs font-bold shadow-2xs flex items-center gap-1"
                  >
                    <BookOpen className="w-3 h-3 text-amber-600" />
                    <span>+ Flashcard Lật Thẻ</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => insertTemplateToSubPage('fillInBlank')}
                    className="px-2.5 py-1 bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold shadow-2xs flex items-center gap-1"
                  >
                    <Edit3 className="w-3 h-3 text-blue-600" />
                    <span>+ Điền Khuyết</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => insertTemplateToSubPage('youtubeEmbed')}
                    className="px-2.5 py-1 bg-white hover:bg-red-50 text-stone-800 border border-stone-200 rounded-lg text-xs font-semibold shadow-2xs flex items-center gap-1"
                  >
                    <Youtube className="w-3 h-3 text-red-600" />
                    <span>+ Nhúng Video YouTube</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => insertTemplateToSubPage('audioPlayer')}
                    className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold shadow-2xs flex items-center gap-1"
                  >
                    <Volume2 className="w-3 h-3 text-emerald-600" />
                    <span>+ File Audio Luyện Nghe</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => insertTemplateToSubPage('table')}
                    className="px-2.5 py-1 bg-white hover:bg-stone-100 text-stone-800 border border-stone-200 rounded-lg text-xs font-semibold shadow-2xs flex items-center gap-1"
                  >
                    <Table className="w-3 h-3 text-stone-600" />
                    <span>+ Bảng So Sánh</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => insertTemplateToSubPage('callout')}
                    className="px-2.5 py-1 bg-white hover:bg-stone-100 text-stone-800 border border-stone-200 rounded-lg text-xs font-semibold shadow-2xs flex items-center gap-1"
                  >
                    <AlertCircle className="w-3 h-3 text-red-600" />
                    <span>+ Lưu Ý Thầy Bửu</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => insertTemplateToSubPage('quoteHighlight')}
                    className="px-2.5 py-1 bg-white hover:bg-stone-100 text-stone-800 border border-stone-200 rounded-lg text-xs font-semibold shadow-2xs flex items-center gap-1"
                  >
                    <Quote className="w-3 h-3 text-amber-600" />
                    <span>+ Trích Dẫn</span>
                  </button>
                </div>

                {subPageContentViewMode === 'code' ? (
                  <textarea
                    rows={8}
                    value={subPageFormData.contentHtml}
                    onChange={(e) => setSubPageFormData({ ...subPageFormData, contentHtml: e.target.value })}
                    placeholder="Nhập mã HTML hoặc bấm các nút chèn Quiz, Flashcard ở trên..."
                    className="w-full p-3 font-mono text-xs border border-stone-300 rounded-xl focus:ring-2 focus:ring-red-600 outline-hidden bg-stone-50"
                  />
                ) : (
                  <div className="p-4 bg-white border border-stone-300 rounded-xl shadow-inner min-h-[200px] max-h-[300px] overflow-y-auto">
                    <InteractiveContentRenderer htmlContent={subPageFormData.contentHtml} />
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingSubPage(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  Lưu Trang Con
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI SEO ARTICLE GENERATOR MODAL */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 bg-gradient-to-r from-stone-900 to-red-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                <h3 className="font-black text-sm uppercase tracking-wide">
                  Viết Bài Chuyên Sâu Bằng OpenAI
                </h3>
              </div>
              <button 
                onClick={() => setShowAiModal(false)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGenerateAiArticle} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-800 mb-1">
                  Chủ đề bài viết bạn muốn AI tạo: <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  placeholder="VD: Chi phí du học Hàn Quốc 2026 trọn gói 75 triệu tại Vị Thanh..."
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl outline-hidden focus:ring-2 focus:ring-red-600 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-stone-800 mb-1">Ảnh bìa thật của SEIU</label>
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-red-300 bg-red-50/50 p-3 hover:bg-red-50">
                  {aiCoverImage ? <img src={aiCoverImage} alt="Ảnh bìa đã chọn" className="h-16 w-24 rounded-lg border border-stone-200 bg-white object-contain" /> : <div className="flex h-16 w-24 items-center justify-center rounded-lg bg-white text-stone-400"><ImageIcon className="h-6 w-6" /></div>}
                  <div><div className="flex items-center gap-1 font-bold text-red-700"><Upload className="h-3.5 w-3.5" /> Chọn ảnh từ máy</div><p className="mt-0.5 text-[11px] text-stone-500">Nên dùng ảnh ngang 16:9. Website sẽ hiển thị đầy đủ, không cắt mất người.</p></div>
                  <input type="file" accept="image/*" className="hidden" onChange={handleAiCoverUpload} />
                </label>
              </div>

              <div>
                <label className="block font-bold text-stone-800 mb-1">
                  Từ khóa chính cần SEO lên Top Google:
                </label>
                <input
                  type="text"
                  value={aiKeywords}
                  onChange={(e) => setAiKeywords(e.target.value)}
                  placeholder="VD: du hoc han quoc, hoc tieng han vi thanh, visa d4-1..."
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl outline-hidden focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-800 mb-1">
                  Chuyên mục bài viết:
                </label>
                <select
                  value={aiCategory}
                  onChange={(e) => setAiCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl outline-hidden focus:ring-2 focus:ring-red-600 font-medium"
                >
                  {STANDARD_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="p-3.5 bg-red-50/80 rounded-2xl border border-red-200 text-stone-700 space-y-1">
                <div className="font-bold text-red-700 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI sẽ tự động tạo hoàn chỉnh:</span>
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-stone-600">
                  <li>Tiêu đề SEO & Meta Title 30 - 70 ký tự</li>
                  <li>Meta Description 120 - 160 ký tự kích thích nhấp chuột</li>
                  <li>Đường dẫn URL Slug thân thiện</li>
                  <li>Nội dung HTML với Heading, bảng biểu, checklist, lời khuyên Thầy Bửu và CTA liên hệ</li>
                  <li>OpenAI chấm cấu trúc và tạo bài 1.000–1.500 từ, không dùng mẫu lặp</li>
                </ul>
              </div>

              {isGeneratingAi && (
                <div className="p-4 bg-gradient-to-r from-red-900 to-stone-900 text-white rounded-2xl shadow-md border border-red-500/30 animate-pulse space-y-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
                    <span className="font-bold text-xs text-amber-200">Đang tạo bài viết chuyên sâu:</span>
                  </div>
                  <p className="text-[11px] text-stone-200 font-medium">
                    {aiStepMessage}
                  </p>
                  <div className="w-full bg-stone-800 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-gradient-to-r from-amber-400 to-red-500 h-full w-full animate-[shimmer_2s_infinite]"></div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowAiModal(false)}
                  disabled={isGeneratingAi}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isGeneratingAi || !aiTopic.trim()}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow-md flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                  <span>{isGeneratingAi ? 'OpenAI Đang Soạn Bài...' : 'Viết Bài Bằng OpenAI'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <SquareImageEditor
        isOpen={isSquareCoverEditorOpen}
        file={squareCoverFile}
        onClose={() => {
          setIsSquareCoverEditorOpen(false);
          setSquareCoverFile(null);
        }}
        onSave={(coverImage) => setEditingArticleData(prev => ({
          ...prev,
          coverImage,
          coverImageAlt: prev.coverImageAlt || prev.focusKeyword || prev.title,
        }))}
      />
    </div>
  );
};
