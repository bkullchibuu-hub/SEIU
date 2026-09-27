import { SEO_ARTICLE_SEED_VERSION, SEO_INITIAL_ARTICLES } from '../data/seoArticles';
import { SEO_BATCH2_ARTICLES, SEO_BATCH2_SEED_VERSION } from '../data/seoArticlesBatch2';
import { getAdminKey } from './authService';

export type BlogCategory =
  | 'Học tiếng Hàn Blog'
  | 'Du học Hàn Quốc'
  | 'Góc Thầy Bửu'
  | 'Chính sách & Học bổng'
  | 'Đời sống du học sinh'
  | 'Ngữ pháp & Luyện thi TOPIK'
  | 'Văn hóa & Đời sống Hàn'
  | string;

export const STANDARD_CATEGORIES = [
  'Học tiếng Hàn Blog',
  'Du học Hàn Quốc',
  'Góc Thầy Bửu',
  'Chính sách & Học bổng',
  'Đời sống du học sinh',
  'Ngữ pháp & Luyện thi TOPIK',
  'Văn hóa & Đời sống Hàn',
];

export interface SubPage {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  contentHtml: string;
  order?: number;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  category: BlogCategory;
  topic?: string;
  subPages?: SubPage[];
  summary: string;
  contentHtml: string;
  coverImage: string;
  author: string;
  authorRole: string;
  authorAvatar?: string;
  readTime: string;
  publishedAt: string;
  tags: string[];
  isFeatured?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  focusKeyword?: string;
  coverImageAlt?: string;
  canonicalUrl?: string;
  seoNoIndex?: boolean;
  seedVersion?: string;
}

/** Các khối nội dung có thể chèn nhanh trong trình soạn bài chuẩn SEO. */
export const INTERACTIVE_TEMPLATES = {
  imageEmbed: `
<figure class="my-7 overflow-hidden rounded-2xl border border-stone-200 bg-stone-50">
  <img src="https://drive.google.com/thumbnail?id=1P9ndnQ5PPiXDcM4a8QcYwDdibRyV1j7W&sz=w1600" alt="Học tiếng Hàn tại SEIU Vị Thanh Hậu Giang" class="h-auto w-full object-cover" loading="lazy" />
  <figcaption class="px-4 py-2 text-center text-xs text-stone-500">Hoạt động tại SEIU Vị Thanh, Hậu Giang.</figcaption>
</figure>`,
  quiz: `
<div class="seiu-interactive-quiz my-6 rounded-2xl border-2 border-red-200 bg-red-50 p-5">
  <div class="mb-4 text-base font-bold text-stone-900">저는 베트남 사람____.</div>
  <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
    <button type="button" class="seiu-quiz-option rounded-xl border bg-white p-3 text-left" data-correct="false">① 은</button>
    <button type="button" class="seiu-quiz-option rounded-xl border bg-white p-3 text-left" data-correct="true">② 입니다</button>
    <button type="button" class="seiu-quiz-option rounded-xl border bg-white p-3 text-left" data-correct="false">③ 을</button>
    <button type="button" class="seiu-quiz-option rounded-xl border bg-white p-3 text-left" data-correct="false">④ 에서</button>
  </div>
  <div class="seiu-quiz-explanation hidden" data-text="N + 입니다 dùng để khẳng định ‘là N’. 여기서는 사람입니다가 맞습니다."></div>
  <div class="seiu-quiz-feedback hidden"></div>
</div>`,
  flashcard: `
<div class="seiu-interactive-flashcard my-6 cursor-pointer rounded-2xl border border-stone-200 bg-white p-6 text-center">
  <div class="seiu-flashcard-front"><strong class="text-2xl text-red-600">한국어</strong><p class="text-xs text-stone-400">Chạm để xem nghĩa</p></div>
  <div class="seiu-flashcard-back hidden"><strong>Tiếng Hàn</strong><p class="text-xs">한국어를 공부해요. – Tôi học tiếng Hàn.</p></div>
</div>`,
  fillBlank: `
<div class="seiu-fill-exercise my-6 rounded-2xl border-2 border-dashed border-red-300 bg-white p-5" data-answer="는">
  <p class="mb-3 text-sm">Điền từ: 저는 학생[ ... ] 아닙니다.</p>
  <div class="flex gap-2"><input type="text" class="seiu-fill-input flex-grow rounded-xl border px-3 py-2" /><button type="button" class="seiu-fill-check-btn rounded-xl bg-red-600 px-4 py-2 text-white">Kiểm tra</button></div>
  <div class="seiu-fill-result mt-3 hidden"></div>
</div>`,
  youtubeEmbed: `
<div class="my-6 aspect-video overflow-hidden rounded-2xl border border-stone-200">
  <iframe class="h-full w-full" src="https://www.youtube.com/embed/VIDEO_ID" title="Bài giảng tiếng Hàn SEIU" loading="lazy" allowfullscreen></iframe>
</div>`,
  tiktokEmbed: `
<div class="my-6 rounded-2xl border border-stone-200 bg-stone-50 p-5 text-center">
  <p><strong>Video TikTok SEIU</strong></p><p class="text-xs text-stone-500">Dán mã nhúng TikTok tại đây.</p>
</div>`,
  quoteHighlight: `
<blockquote class="my-6 rounded-r-2xl border-l-4 border-red-600 bg-red-50 p-5 italic">
  “Mỗi cấu trúc cần được biến thành câu nói của chính người học.”
  <cite class="mt-2 block text-xs font-bold not-italic text-red-700">— Thầy Lê Trí Bửu, Giám đốc SEIU</cite>
</blockquote>`,
  ctaConsultation: `
<aside class="my-8 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 p-6 text-white">
  <h2 class="text-xl font-black">Nhận tư vấn tại SEIU Vị Thanh</h2>
  <p class="mt-2 text-sm text-red-100">Lớp mới mỗi tháng · Tiếng Hàn · TOPIK · Du học · XKLĐ · Kết hôn</p>
  <a href="tel:0972249450" class="mt-4 inline-flex rounded-xl bg-white px-5 py-2.5 font-black text-red-700">0972 249 450</a>
</aside>`,
  callout: `
<aside class="my-6 rounded-r-xl border-l-4 border-red-600 bg-red-50 p-4 text-sm">
  <strong class="text-red-700">Lưu ý từ SEIU:</strong><p class="mt-1">Hãy kiểm tra ngày cập nhật, nguồn dữ liệu và điều kiện áp dụng trước khi xuất bản.</p>
</aside>`,
  calloutBox: `
<aside class="my-6 rounded-r-xl border-l-4 border-red-600 bg-red-50 p-4 text-sm">
  <strong class="text-red-700">Thông tin quan trọng:</strong><p class="mt-1">Nội dung có thể thay đổi theo kỳ tuyển sinh; vui lòng xác nhận lại với SEIU.</p>
</aside>`,
  fillInBlank: `
<div class="seiu-fill-exercise my-6 rounded-2xl border-2 border-dashed border-red-300 bg-white p-5" data-answer="은">
  <p class="mb-3 text-sm">Điền tiểu từ: 선생님[ ... ] 한국 사람입니다.</p>
  <div class="flex gap-2"><input type="text" class="seiu-fill-input flex-grow rounded-xl border px-3 py-2" /><button type="button" class="seiu-fill-check-btn rounded-xl bg-red-600 px-4 py-2 text-white">Kiểm tra</button></div>
  <div class="seiu-fill-result mt-3 hidden"></div>
</div>`,
  table: `
<div class="my-6 overflow-x-auto rounded-xl border border-stone-200"><table class="w-full text-left text-xs"><thead class="bg-red-50"><tr><th class="p-3">Nội dung</th><th class="p-3">Chi tiết</th></tr></thead><tbody><tr class="border-t"><td class="p-3 font-bold">Mục 1</td><td class="p-3">Nhập thông tin tại đây</td></tr></tbody></table></div>`,
  audioPlayer: `
<div class="my-6 rounded-2xl border border-stone-200 bg-stone-50 p-4">
  <p class="mb-2 text-xs font-bold text-red-600">Luyện nghe tiếng Hàn</p>
  <audio controls class="w-full"><source src="DUONG_DAN_FILE_MP3" type="audio/mpeg" />Trình duyệt không hỗ trợ audio.</audio>
</div>`,
};

export const INITIAL_ARTICLES: Article[] = [...SEO_INITIAL_ARTICLES, ...SEO_BATCH2_ARTICLES] as Article[];

const BLOG_STORAGE_KEY = 'seiu_blog_articles_v2';
const LEGACY_ARTICLE_IDS = new Set([
  'chinh-sach-0-dong-truoc-visa-seiu',
  'phuong-phap-hoc-tieng-han-phan-xa-seiu',
  'cao-dang-cong-nghe-kyungnam-kit-visa-d2-1',
  'chinh-sach-mien-hoc-phi-lop-12-seiu',
  'nguyen-tac-khong-ep-truong-cua-seiu',
]);
const CURRENT_SEED_IDS = new Set(INITIAL_ARTICLES.map((article) => article.id));

const limitPinnedArticles = (articles: Article[]): Article[] => {
  let pinnedCount = 0;
  return articles.map((article) => {
    if (!article.isFeatured) return article;
    pinnedCount += 1;
    return pinnedCount <= 2 ? article : { ...article, isFeatured: false };
  });
};

/** Thêm đợt bài SEO 2 đúng một lần; bài admin đã xóa sau đó sẽ không quay lại. */
const addBatch2Articles = (articles: Article[]): Article[] => {
  if (articles.some((article) => article.seedVersion === SEO_BATCH2_SEED_VERSION)) return articles;
  const existingIds = new Set(articles.map((article) => article.id));
  const missing = (SEO_BATCH2_ARTICLES as Article[]).filter((article) => !existingIds.has(article.id));
  return [...articles, ...missing];
};

const normalizeArticles = (articles: Article[]): Article[] => {
  if (articles.some((article) => article.seedVersion === SEO_ARTICLE_SEED_VERSION)) {
    return limitPinnedArticles(addBatch2Articles(articles));
  }
  const customArticles = articles.filter((article) => (
    !LEGACY_ARTICLE_IDS.has(article.id) && !CURRENT_SEED_IDS.has(article.id)
  ));
  return limitPinnedArticles([...INITIAL_ARTICLES, ...customArticles]);
};

export const getStoredArticles = (): Article[] => {
  try {
    const raw = localStorage.getItem(BLOG_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Article[];
      if (Array.isArray(parsed) && parsed.length > 0) return normalizeArticles(parsed);
    }
  } catch (error) {
    console.error('Failed to get articles:', error);
  }
  return limitPinnedArticles(INITIAL_ARTICLES);
};

const syncArticles = (articles: Article[]) => {
  if (typeof fetch === 'undefined') return;
  fetch('/api/content/save-section', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-seiu-admin-key': getAdminKey() },
    body: JSON.stringify({ section: 'articles', data: articles }),
  }).catch((error) => console.warn('Server article sync failed:', error));
};

const announceUpdate = () => {
  window.dispatchEvent(new Event('seiu_blog_updated'));
  window.dispatchEvent(new Event('seiu_articles_updated'));
};

export const saveArticle = (article: Article): void => {
  try {
    const current = getStoredArticles();
    const existingIndex = current.findIndex((item) => item.id === article.id || item.slug === article.slug);
    const updated = [...current];
    if (existingIndex >= 0) updated[existingIndex] = article;
    else updated.unshift(article);
    const limited = limitPinnedArticles(updated);
    try {
      localStorage.setItem(BLOG_STORAGE_KEY, JSON.stringify(limited));
    } catch (error) {
      console.warn('LocalStorage quota limit reached, relying on server sync:', error);
    }
    syncArticles(limited);
    announceUpdate();
  } catch (error) {
    console.error('Failed to save article:', error);
  }
};

export const deleteArticle = (id: string): void => {
  try {
    const updated = getStoredArticles().filter((article) => article.id !== id);
    try {
      localStorage.setItem(BLOG_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
    syncArticles(updated);
    announceUpdate();
  } catch (error) {
    console.error('Failed to delete article:', error);
  }
};

export const resetArticles = (): void => {
  try {
    localStorage.setItem(BLOG_STORAGE_KEY, JSON.stringify(INITIAL_ARTICLES));
  } catch {}
  syncArticles(INITIAL_ARTICLES);
  announceUpdate();
};

if (typeof window !== 'undefined') {
  fetch('/api/content/all')
    .then((response) => response.json())
    .then((data) => {
      if (!data || !Array.isArray(data.articles)) return;
      const normalized = normalizeArticles(data.articles as Article[]);
      try {
        localStorage.setItem(BLOG_STORAGE_KEY, JSON.stringify(normalized));
        announceUpdate();
      } catch {}
    })
    .catch(() => {});
}
