import { getAdminKey } from './authService';

export interface SiteConfig {
  configRevision?: number;
  brandName: string;
  sloganVi: string;
  sloganKo: string;
  subSlogan: string;
  
  // Legal & Founder
  companyName: string;
  licenseDate: string;
  representative: string;
  representativeTitle: string;
  representativeBio: string;
  representativeAvatar?: string;
  centerLogo?: string;
  
  // Contacts
  hotline: string;
  hotlineFormatted: string;
  zalo?: string;
  email: string;
  secondaryEmail: string;
  website: string;
  secondaryWebsite: string;
  
  // Headquarter & Branches
  headquarterAddress: string;
  headquarterCity: string;
  googleMapsUrl?: string;
  workingHours?: string;
  // Mạng xã hội (để trống thì không hiển thị)
  facebookUrl?: string;
  tiktokUrl?: string;
  hcmBranchAddress: string;
  hcmBranchCity: string;
  
  // Hero & Banner Customization
  heroTitle: string;
  heroHighlight: string;
  heroDescription: string;
  heroKoreanSlogan: string;
  heroSubtitle: string;
  heroBannerBgImage?: string;
  heroStudentImage?: string;

  // Ảnh bìa trang chủ (băng-rôn lớn nhất, nằm trên cùng)
  homeCoverEnabled?: boolean;
  homeCoverImage?: string;
  homeCoverImages?: string[];
  homeCoverHeadline?: string;
  homeCoverSubline?: string;
  /** Độ rộng và vị trí khối nội dung trắng trên banner (chỉ áp dụng màn hình lớn). */
  homeCoverPanelWidth?: number;
  homeCoverPanelX?: number;
  homeCoverPanelY?: number;
  /** Điểm lấy nét của ảnh bìa để ảnh tải từ máy không bị lệch chủ thể. */
  homeCoverImagePositionX?: number;
  homeCoverImagePositionY?: number;

  // Dự toán du học
  studyAbroadKrwRate?: number;

  // Bảng chiêu sinh nằm ngay dưới khu bài ghim
  admissionEnabled?: boolean;
  admissionBadge?: string;
  admissionTitle?: string;
  admissionDescription?: string;
  admissionOpeningDate?: string;
  admissionSchedule?: string;
  admissionAudience?: string;
  admissionLocation?: string;
  admissionTuition?: string;
  admissionSeats?: string;
  admissionImage?: string;
  admissionImageAlt?: string;

  // Số bản tin hiện trên trang chủ — bài cũ hơn tự chuyển vào lưu trữ
  newsVisibleCount?: number;
  
  // Core Pricing & Policies
  serviceFeePackage: string; // 75.000.000đ
  zeroDongVisaPolicy: string;
  trialPolicy: string;
  grade12Policy: string;
  referralReward: string;
  scholarshipRange: string;
  
  // SEO Meta
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
}

const CURRENT_CONFIG_REVISION = 3;
const DRIVE_HERO_IMAGES = [
  'https://drive.google.com/thumbnail?id=1P9ndnQ5PPiXDcM4a8QcYwDdibRyV1j7W&sz=w1920',
  'https://drive.google.com/thumbnail?id=1EMwrhMLZesOHwFU6YbZ-evydkSAOER_S&sz=w1920',
  'https://drive.google.com/thumbnail?id=1Nyg8cmDs-J5o9FldvVSQpdN9P8tpCqQk&sz=w1920',
];

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  configRevision: CURRENT_CONFIG_REVISION,
  brandName: 'SEIU – Trung tâm Ngoại ngữ Tiếng Hàn',
  sloganVi: 'Học tiếng Hàn – Du học Hàn',
  sloganKo: '한국어 교육과 한국 유학의 새로운 시작',
  subSlogan: 'SEIU – Education Partner / Đồng hành cùng học viên',
  
  companyName: 'CÔNG TY TNHH MTV SEIU',
  licenseDate: '30/05/2024',
  representative: 'Lê Trí Bửu',
  representativeTitle: 'Giám đốc',
  representativeBio: 'Cử nhân Hàn Quốc học, 7 năm kinh nghiệm trong lĩnh vực đào tạo tiếng Hàn và tư vấn du học Hàn Quốc.',
  representativeAvatar: '',
  centerLogo: '',
  
  hotline: '0972249450',
  hotlineFormatted: '0972 249 450',
  zalo: '0972249450',
  email: 'capseiu@gmail.com',
  secondaryEmail: 'duhochanquocseiu@gmail.com',
  website: 'tienghanseiu.com',
  secondaryWebsite: 'duhochanquocseiu.com',
  
  headquarterAddress: '197N Trần Hưng Đạo, Phường 5',
  headquarterCity: 'TP. Vị Thanh, Hậu Giang',
  googleMapsUrl: 'https://maps.app.goo.gl/nvgAs4G6yGSiesw68',
  workingHours: '08:00 – 20:00, Thứ 2 đến Thứ 7',
  facebookUrl: 'https://www.facebook.com/tienghan.seiu/',
  tiktokUrl: '',
  hcmBranchAddress: '36 Đường 5 - Khu TĐC Suối Nhum, P. Linh Xuân',
  hcmBranchCity: 'TP. Thủ Đức, TP. Hồ Chí Minh',
  
  heroTitle: 'Học Tiếng Hàn Tại Vị Thanh,',
  heroHighlight: 'Vững Bước Đến Hàn Quốc',
  heroDescription: 'Đào tạo tiếng Hàn, luyện TOPIK, tiếng Hàn du học, xuất khẩu lao động và kết hôn. Lớp mới khai giảng mỗi tháng, liên hệ SEIU để được tư vấn lịch học phù hợp.',
  heroKoreanSlogan: '함께 배우고 함께 성장합니다',
  heroSubtitle: 'Đồng hành trực tiếp cùng Thầy Lê Trí Bửu – Giám đốc SEIU, Cử nhân Hàn Quốc học với 7 năm kinh nghiệm trong lĩnh vực du học.',
  heroBannerBgImage: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?q=80&w=1600&auto=format&fit=crop',
  heroStudentImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1000&auto=format&fit=crop',

  homeCoverEnabled: true,
  homeCoverImage: DRIVE_HERO_IMAGES[0],
  homeCoverImages: DRIVE_HERO_IMAGES,
  homeCoverHeadline: 'Học Tiếng Hàn & Du Học Hàn Quốc Tại Vị Thanh',
  homeCoverSubline: 'Lớp mới mỗi tháng · TOPIK · Du học · XKLĐ · Kết hôn',
  homeCoverPanelWidth: 46,
  homeCoverPanelX: 4,
  homeCoverPanelY: 50,
  homeCoverImagePositionX: 50,
  homeCoverImagePositionY: 50,

  studyAbroadKrwRate: 19,

  admissionEnabled: true,
  admissionBadge: 'Tuyển sinh khóa mới',
  admissionTitle: 'Lớp tiếng Hàn SEIU – Học chắc nền tảng, sửa trực tiếp từng học viên',
  admissionDescription: 'Dành cho người mới bắt đầu, học viên chuẩn bị TOPIK và hồ sơ du học Hàn Quốc. Lớp vừa đủ để giáo viên theo sát từng bạn.',
  admissionOpeningDate: 'Khai giảng lớp mới mỗi tháng',
  admissionSchedule: 'Sáng · Chiều · Tối, Thứ 2 đến Thứ 7',
  admissionAudience: 'TOPIK · Du học · XKLĐ · Kết hôn',
  admissionLocation: '197N Trần Hưng Đạo, P.5, Vị Thanh, Hậu Giang',
  admissionTuition: 'Học phí cạnh tranh · Liên hệ để được tư vấn',
  admissionSeats: 'Số lượng lớp giới hạn để đảm bảo chất lượng',
  admissionImage: '',
  admissionImageAlt: 'Tuyển sinh lớp tiếng Hàn tại SEIU Vị Thanh',

  newsVisibleCount: 6,
  
  serviceFeePackage: '75.000.000đ',
  zeroDongVisaPolicy: 'Chỉ thu phí dịch vụ khi học viên đậu Visa; không phát sinh phí dịch vụ ngoài phạm vi hợp đồng',
  trialPolicy: 'Học thử miễn phí 1 tuần (3 buổi) trải nghiệm phương pháp',
  grade12Policy: 'Học sinh lớp 12 đủ điều kiện được miễn học phí tiếng Hàn 1 năm đến ngày bay',
  referralReward: '500.000đ thưởng giới thiệu học viên',
  scholarshipRange: '30% - 100% theo GPA & TOPIK',
  
  seoTitle: 'SEIU - Học Tiếng Hàn Tại Vị Thanh Hậu Giang & Du Học Hàn',
  seoDescription: 'SEIU đào tạo tiếng Hàn, luyện TOPIK, du học, XKLĐ và kết hôn tại 197N Trần Hưng Đạo, P.5, Vị Thanh, Hậu Giang. Lớp mới mỗi tháng.',
  seoKeywords: 'học tiếng Hàn tại Vị Thanh Hậu Giang, trung tâm tiếng Hàn Vị Thanh, luyện thi TOPIK Hậu Giang, học tiếng Hàn du học, du học Hàn Quốc SEIU',
};

const SITE_CONFIG_KEY = 'seiu_official_site_config_v2';

export const getStoredSiteConfig = (): SiteConfig => {
  try {
    const raw = localStorage.getItem(SITE_CONFIG_KEY);
    if (raw) {
      const stored = JSON.parse(raw) as Partial<SiteConfig>;
      if ((Number(stored.configRevision) || 0) < CURRENT_CONFIG_REVISION) {
        return {
          ...DEFAULT_SITE_CONFIG,
          ...stored,
          configRevision: CURRENT_CONFIG_REVISION,
          brandName: DEFAULT_SITE_CONFIG.brandName,
          companyName: DEFAULT_SITE_CONFIG.companyName,
          representative: DEFAULT_SITE_CONFIG.representative,
          representativeTitle: DEFAULT_SITE_CONFIG.representativeTitle,
          representativeBio: DEFAULT_SITE_CONFIG.representativeBio,
          hotline: DEFAULT_SITE_CONFIG.hotline,
          hotlineFormatted: DEFAULT_SITE_CONFIG.hotlineFormatted,
          zalo: DEFAULT_SITE_CONFIG.zalo,
          email: DEFAULT_SITE_CONFIG.email,
          headquarterAddress: DEFAULT_SITE_CONFIG.headquarterAddress,
          headquarterCity: DEFAULT_SITE_CONFIG.headquarterCity,
          googleMapsUrl: DEFAULT_SITE_CONFIG.googleMapsUrl,
          workingHours: DEFAULT_SITE_CONFIG.workingHours,
          heroTitle: DEFAULT_SITE_CONFIG.heroTitle,
          heroHighlight: DEFAULT_SITE_CONFIG.heroHighlight,
          heroDescription: DEFAULT_SITE_CONFIG.heroDescription,
          heroSubtitle: DEFAULT_SITE_CONFIG.heroSubtitle,
          homeCoverImage: DEFAULT_SITE_CONFIG.homeCoverImage,
          homeCoverImages: DEFAULT_SITE_CONFIG.homeCoverImages,
          homeCoverHeadline: DEFAULT_SITE_CONFIG.homeCoverHeadline,
          homeCoverSubline: DEFAULT_SITE_CONFIG.homeCoverSubline,
          admissionOpeningDate: DEFAULT_SITE_CONFIG.admissionOpeningDate,
          admissionSchedule: DEFAULT_SITE_CONFIG.admissionSchedule,
          admissionAudience: DEFAULT_SITE_CONFIG.admissionAudience,
          admissionLocation: DEFAULT_SITE_CONFIG.admissionLocation,
          admissionTuition: DEFAULT_SITE_CONFIG.admissionTuition,
          zeroDongVisaPolicy: DEFAULT_SITE_CONFIG.zeroDongVisaPolicy,
          seoTitle: DEFAULT_SITE_CONFIG.seoTitle,
          seoDescription: DEFAULT_SITE_CONFIG.seoDescription,
          seoKeywords: DEFAULT_SITE_CONFIG.seoKeywords,
        };
      }
      return { ...DEFAULT_SITE_CONFIG, ...stored };
    }
  } catch (e) {
    console.error('Failed to load site config:', e);
  }
  return DEFAULT_SITE_CONFIG;
};

export const saveSiteConfig = (config: SiteConfig): void => {
  try {
    localStorage.setItem(SITE_CONFIG_KEY, JSON.stringify(config));
  } catch (e) {
    console.warn('LocalStorage quota warning for siteConfig:', e);
  }
  
  // Sync to persistent server storage
  if (typeof fetch !== 'undefined') {
    fetch('/api/content/save-section', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-seiu-admin-key': getAdminKey() },
      body: JSON.stringify({ section: 'config', data: config })
    }).catch(err => console.warn('Server sync failed:', err));
  }

  window.dispatchEvent(new Event('seiu_site_config_updated'));
};

export const resetSiteConfig = (): void => {
  try {
    localStorage.removeItem(SITE_CONFIG_KEY);
  } catch (e) {}
  
  if (typeof fetch !== 'undefined') {
    fetch('/api/content/save-section', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-seiu-admin-key': getAdminKey() },
      body: JSON.stringify({ section: 'config', data: DEFAULT_SITE_CONFIG })
    }).catch(err => console.warn('Server reset failed:', err));
  }

  window.dispatchEvent(new Event('seiu_site_config_updated'));
};

// Initial background sync from server if available
if (typeof window !== 'undefined') {
  fetch('/api/content/all')
    .then(res => res.json())
    .then(data => {
      if (data && data.config) {
        try {
          localStorage.setItem(SITE_CONFIG_KEY, JSON.stringify(data.config));
          window.dispatchEvent(new Event('seiu_site_config_updated'));
        } catch (e) {}
      }
    })
    .catch(() => {});
}
