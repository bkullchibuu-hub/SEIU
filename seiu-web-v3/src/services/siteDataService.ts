import { getAdminKey } from './authService';

export interface GalleryItem {
  id: string;
  /** Thời điểm đăng — bài mới nhất luôn nằm trên cùng */
  createdAt?: string;
  /** Đã chuyển vào lưu trữ (không hiện trên trang chủ) */
  archived?: boolean;
  category: 'tiễn bay' | 'lớp học' | 'hàn quốc' | 'sự kiện' | string;
  title: string;
  location: string;
  date: string;
  url: string;
  caption: string;
}

export interface StudentItem {
  id: string;
  name: string;
  avatar?: string;
  phone: string;
  hometown: string;
  gpa: string;
  target: string;
  status: string;
  term: string;
  notes?: string;
}

export interface PartnerUniItem {
  id: string;
  nameVi: string;
  nameKr: string;
  location: string;
  type: string;
  scholarship: string;
  logo: string;
  highlight?: string;
  website?: string;
}

export interface VisaResultItem {
  id: string;
  studentName: string;
  avatar: string;
  hometown: string;
  gpa: string;
  visaCode: string;
  visaType: string;
  university: string;
  grantDate: string;
  costPackage: string;
  scholarship?: string;
  quote: string;
  branch: string;
}

export interface NewsEventItem {
  id: string;
  /** Thời điểm đăng — bài mới nhất luôn nằm trên cùng */
  createdAt?: string;
  /** Đã chuyển vào lưu trữ (không hiện trên trang chủ) */
  archived?: boolean;
  category: string;
  title: string;
  date: string;
  summary: string;
  tag: string;
  content?: string;
}

// Default initial datasets
export const DEFAULT_GALLERY: GalleryItem[] = [
  {
    id: 'g1',
    category: 'tiễn bay',
    title: 'Tiễn bay đoàn học viên kỳ tháng 3/2026',
    location: 'Sân bay Quốc tế Tân Sơn Nhất (SGN) → Incheon (ICN)',
    date: 'Tháng 03/2026',
    url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    caption: '12 học viên cơ sở Vị Thanh & TP.HCM rạng rỡ cầm Visa thẳng D4-1 lên đường sang Hàn Quốc.'
  },
  {
    id: 'g2',
    category: 'lớp học',
    title: 'Lớp Sơ Cấp & Luyện phản xạ Shadowing',
    location: 'Cơ sở SEIU Vị Thanh, Hậu Giang',
    date: 'Tháng 02/2026',
    url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80',
    caption: 'Không khí học tập sôi nổi cùng phương pháp đặt câu giao tiếp thực chiến 100% tiếng Hàn.'
  },
  {
    id: 'g3',
    category: 'hàn quốc',
    title: 'Học viên SEIU tại ký túc xá Đại học Quốc Gia Busan',
    location: 'Busan, Hàn Quốc',
    date: 'Tháng 01/2026',
    url: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=800&q=80',
    caption: 'Cuộc sống du học năng động, vừa học vừa làm thêm hợp pháp và thích nghi văn hóa nhanh chóng.'
  },
  {
    id: 'g4',
    category: 'sự kiện',
    title: 'Lễ Trao Visa & Học Bổng 50% Đại Học Kyungnam',
    location: 'Văn phòng SEIU TP. Hồ Chí Minh',
    date: 'Tháng 01/2026',
    url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
    caption: 'Niềm vui vỡ òa của phụ huynh và các em học sinh khi nhận kết quả đậu Visa 100%.'
  },
  {
    id: 'g5',
    category: 'lớp học',
    title: 'Giờ luyện phỏng vấn Đại sứ quán 1:1',
    location: 'Phòng phỏng vấn mô phỏng SEIU Vị Thanh',
    date: 'Tháng 12/2025',
    url: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80',
    caption: 'Thầy Bửu và đội ngũ giáo viên trực tiếp luyện bộ 50 câu hỏi độc quyền giúp học viên tự tin tuyệt đối.'
  },
  {
    id: 'g6',
    category: 'hàn quốc',
    title: 'Check-in mùa hoa anh đào tại Seoul',
    location: 'Đại học Yonsei & Konkuk, Seoul',
    date: 'Kỳ Mùa Xuân 2026',
    url: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?auto=format&fit=crop&w=800&q=80',
    caption: 'Kỷ niệm đẹp của nhóm học sinh SEIU khóa 2024 trong kỳ nghỉ lễ tại thủ đô Seoul.'
  }
];

export const DEFAULT_STUDENTS: StudentItem[] = [
  {
    id: 'st-1',
    name: 'Nguyễn Hoàng Yến Nhi',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    phone: '0988***123',
    hometown: 'TP. Vị Thanh, Hậu Giang',
    gpa: '8.4',
    target: 'ĐH Konkuk Seoul (Visa D4-1)',
    status: 'Đã Có Visa & Đã Bay',
    term: 'Kỳ Tháng 3/2026',
    notes: 'Học bổng 30% học phí kỳ đầu, visa thẳng 3 tuần'
  },
  {
    id: 'st-2',
    name: 'Trần Văn Minh Khang',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    phone: '0912***456',
    hometown: 'Long Mỹ, Hậu Giang',
    gpa: '7.6',
    target: 'CĐ Nghề KIT Kyungnam (Visa D2-1)',
    status: 'Đã Cấp Visa E-7',
    term: 'Kỳ Tháng 3/2026',
    notes: 'Học nghề kỹ thuật thực hành'
  },
  {
    id: 'st-3',
    name: 'Lê Thảo My',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
    phone: '0934***789',
    hometown: 'Cần Thơ',
    gpa: '8.1',
    target: 'ĐH Quốc Gia Pusan (Visa D4-1)',
    status: 'Đã Có Code Visa',
    term: 'Kỳ Tháng 6/2026',
    notes: 'Luyện TOPIK 3 cấp tốc tại cơ sở Vị Thanh'
  },
  {
    id: 'st-4',
    name: 'Phạm Huỳnh Đức',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80',
    phone: '0977***654',
    hometown: 'Châu Thành, Hậu Giang',
    gpa: '8.5',
    target: 'ĐH Dong-A Busan (Visa D2-2)',
    status: 'Đạt Học Bổng 50%',
    term: 'Kỳ Tháng 9/2026',
    notes: 'Học bổng TOPIK 4, chuyên ngành QTKD'
  },
  {
    id: 'st-5',
    name: 'Huỳnh Minh Tuấn',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    phone: '0909***333',
    hometown: 'TP. Hồ Chí Minh',
    gpa: '7.2',
    target: 'ĐH Kookmin (Visa D4-1)',
    status: 'Đang Xử Lý Hồ Sơ',
    term: 'Kỳ Tháng 9/2026',
    notes: 'Gói 75 triệu trọn gói'
  }
];

export const DEFAULT_PARTNERS: PartnerUniItem[] = [
  {
    id: 'p1',
    nameVi: 'Đại Học Quốc Gia Pusan (PNU)',
    nameKr: '부산대학교',
    location: 'Busan',
    type: 'Top 1% Visa Thẳng',
    scholarship: '30% - 100% học phí',
    logo: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=120&q=80',
    highlight: 'Top 2 Đại học Quốc gia hàng đầu Hàn Quốc'
  },
  {
    id: 'p2',
    nameVi: 'Đại Học Konkuk',
    nameKr: '건국대학교',
    location: 'Seoul',
    type: 'Top 1% Visa Thẳng',
    scholarship: '30% - 50% học phí',
    logo: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=120&q=80',
    highlight: 'Khuôn viên trung tâm Seoul, cơ hội thực tập lớn'
  },
  {
    id: 'p3',
    nameVi: 'CĐ Nghề Kỹ Thuật Kyungnam (KIT)',
    nameKr: '경남정보대학교',
    location: 'Busan',
    type: 'Visa E-7 Định Cư',
    scholarship: 'Học bổng thực tập hưởng lương',
    logo: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=120&q=80',
    highlight: 'Đào tạo kỹ sư cơ khí, điện tử, IT bao việc làm'
  },
  {
    id: 'p4',
    nameVi: 'Đại Học Dong-A',
    nameKr: '동아대학교',
    location: 'Busan',
    type: 'Trường Chứng Nhận',
    scholarship: 'Học bổng TOPIK 30% - 70%',
    logo: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&w=120&q=80',
    highlight: 'Chi phí sinh hoạt hợp lý, cơ hội việc làm thêm cao'
  },
  {
    id: 'p5',
    nameVi: 'Đại Học Quốc Gia Chungnam',
    nameKr: '충남대학교',
    location: 'Daejeon',
    type: 'Top 1% Visa Thẳng',
    scholarship: 'Miễn 50% - 100% học phí',
    logo: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=120&q=80',
    highlight: 'Học phí rẻ nhất trong khối trường Quốc Gia'
  },
  {
    id: 'p6',
    nameVi: 'Đại Học Keimyung',
    nameKr: '계명대학교',
    location: 'Daegu',
    type: 'Trường Chứng Nhận',
    scholarship: '50% - 100% học phí',
    logo: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=120&q=80',
    highlight: 'Khuôn viên đẹp nhất Hàn Quốc'
  }
];

export const DEFAULT_VISAS: VisaResultItem[] = [
  {
    id: 'v1',
    studentName: 'Nguyễn Hoàng Yến Nhi',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    hometown: 'TP. Vị Thanh, Hậu Giang',
    gpa: '8.4',
    visaCode: 'Visa D4-1 (Visa Thẳng Top 1%)',
    visaType: 'D4-1',
    university: 'Đại Học Konkuk (Seoul)',
    grantDate: 'Tháng 02/2026',
    costPackage: 'Phí Dịch Vụ 75 Triệu (Thu Sau Khi Đậu Visa)',
    scholarship: 'Học bổng 30% học phí kỳ đầu',
    quote: 'Em đậu Visa thẳng chỉ sau 3 tuần nộp hồ sơ. Thầy Bửu và các thầy cô ở Vị Thanh hướng dẫn từng nét chữ!',
    branch: 'Cơ sở Vị Thanh'
  },
  {
    id: 'v2',
    studentName: 'Trần Văn Minh Khang',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    hometown: 'Long Mỹ, Hậu Giang',
    gpa: '7.6',
    visaCode: 'Visa D2-1 (CĐ Nghề KIT Kyungnam)',
    visaType: 'D2-1',
    university: 'Viện Công Nghệ KIT Kyungnam',
    grantDate: 'Tháng 01/2026',
    costPackage: 'Chuyển Đổi Kỹ Sư E-7 Định Cư',
    scholarship: 'Học bổng 50% kỳ chuyên ngành',
    quote: 'Học nghề kỹ thuật thực hành và cam kết việc làm sau tốt nghiệp, gia đình em rất an tâm về tương lai.',
    branch: 'Cơ sở TP.HCM'
  },
  {
    id: 'v3',
    studentName: 'Lê Thảo My',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
    hometown: 'Quận 7, TP. Hồ Chí Minh',
    gpa: '8.1',
    visaCode: 'Visa D4-1 (Hệ Tiếng)',
    visaType: 'D4-1',
    university: 'Đại Học Quốc Gia Pusan (PNU)',
    grantDate: 'Tháng 02/2026',
    costPackage: 'Trọn Gói 75 Triệu',
    scholarship: 'Học bổng 40% ký túc xá',
    quote: 'Chi phí cực kỳ rõ ràng, không phát sinh bất kỳ khoản nào ngoài hóa đơn. Rất cảm ơn đội ngũ SEIU!',
    branch: 'Cơ sở Vị Thanh'
  },
  {
    id: 'v4',
    studentName: 'Phạm Huỳnh Đức',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80',
    hometown: 'Châu Thành, Hậu Giang',
    gpa: '8.5',
    visaCode: 'Visa D2-2 (Đại Học Chuyên Ngành)',
    visaType: 'D2-2',
    university: 'Đại Học Dong-A (Busan)',
    grantDate: 'Tháng 12/2025',
    costPackage: 'Chuyên Ngành Quản Trị Kinh Doanh',
    scholarship: 'Học bổng TOPIK 4 (Giảm 50% Học Phí)',
    quote: 'Nhờ khóa luyện TOPIK phản xạ tại SEIU, em thi đạt TOPIK 4 ngay lần đầu và nhận học bổng 50%.',
    branch: 'Cơ sở Vị Thanh'
  }
];

export const DEFAULT_NEWS: NewsEventItem[] = [
  {
    id: 'n1',
    category: 'Lịch thi TOPIK',
    title: 'Thông báo lịch đăng ký và thi TOPIK I & II các đợt trong năm 2026',
    date: '15/02/2026',
    summary: 'Tổng hợp chi tiết các mốc thời gian đăng ký thi TOPIK tại TP.HCM, Hà Nội, Đà Nẵng và Cần Thơ để học sinh chủ động kế hoạch hồ sơ.',
    tag: 'Quan trọng'
  },
  {
    id: 'n2',
    category: 'Tuyển sinh',
    title: 'Khởi động tuyển sinh Du học Hàn Quốc kỳ Tháng 06 & Tháng 09/2026',
    date: '10/02/2026',
    summary: 'Tư vấn lộ trình, điều kiện chương trình và các hạng mục chi phí rõ ràng trước khi phụ huynh, học viên quyết định đăng ký.',
    tag: 'Tuyển sinh'
  },
  {
    id: 'n3',
    category: 'Chính sách Visa',
    title: 'Cập nhật danh sách các trường Đại Học Top 1% và Trường Chứng Nhận 2026',
    date: '28/01/2026',
    summary: 'Hướng dẫn cách kiểm tra nhóm trường, điều kiện tuyển sinh và lựa chọn phù hợp với hồ sơ thay vì chỉ dựa vào quảng cáo visa.',
    tag: 'Chính sách'
  }
];

// Storage keys
const STORAGE_KEYS = {
  GALLERY: 'seiu_site_gallery_v2',
  STUDENTS: 'seiu_site_students_v2',
  PARTNERS: 'seiu_site_partners_v2',
  VISAS: 'seiu_site_visas_v2',
  NEWS: 'seiu_site_news_v2'
};

function triggerDataSync() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('seiu_site_data_updated'));
  }
}

function syncToServer(section: string, data: any) {
  if (typeof fetch !== 'undefined') {
    fetch('/api/content/save-section', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-seiu-admin-key': getAdminKey() },
      body: JSON.stringify({ section, data })
    }).catch(err => console.warn(`Server sync failed for ${section}:`, err));
  }
}

// 1. GALLERY
export const getStoredGallery = (): GalleryItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GALLERY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return [];
};

export const saveGallery = (items: GalleryItem[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(items));
  } catch (e) {
    console.warn('LocalStorage quota warning for gallery:', e);
  }
  syncToServer('gallery', items);
  triggerDataSync();
};

// 2. STUDENTS
export const getStoredStudents = (): StudentItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return [];
};

export const saveStudents = (items: StudentItem[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(items));
  } catch (e) {
    console.warn('LocalStorage quota warning for students:', e);
  }
  syncToServer('students', items);
  triggerDataSync();
};

// 3. PARTNERS
export const getStoredPartners = (): PartnerUniItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PARTNERS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return [];
};

export const savePartners = (items: PartnerUniItem[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.PARTNERS, JSON.stringify(items));
  } catch (e) {
    console.warn('LocalStorage quota warning for partners:', e);
  }
  syncToServer('partners', items);
  triggerDataSync();
};

// 4. VISAS
export const getStoredVisas = (): VisaResultItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.VISAS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return [];
};

export const saveVisas = (items: VisaResultItem[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.VISAS, JSON.stringify(items));
  } catch (e) {
    console.warn('LocalStorage quota warning for visas:', e);
  }
  syncToServer('visas', items);
  triggerDataSync();
};

// 5. NEWS
export const getStoredNews = (): NewsEventItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NEWS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return DEFAULT_NEWS;
};

export const saveNews = (items: NewsEventItem[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.NEWS, JSON.stringify(items));
  } catch (e) {
    console.warn('LocalStorage quota warning for news:', e);
  }
  syncToServer('news', items);
  triggerDataSync();
};

// Reset all to default
export const resetAllSiteData = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.GALLERY);
    localStorage.removeItem(STORAGE_KEYS.STUDENTS);
    localStorage.removeItem(STORAGE_KEYS.PARTNERS);
    localStorage.removeItem(STORAGE_KEYS.VISAS);
    localStorage.removeItem(STORAGE_KEYS.NEWS);
  } catch (e) {}

  syncToServer('gallery', DEFAULT_GALLERY);
  syncToServer('students', DEFAULT_STUDENTS);
  syncToServer('partners', DEFAULT_PARTNERS);
  syncToServer('visas', DEFAULT_VISAS);
  syncToServer('news', DEFAULT_NEWS);

  triggerDataSync();
};

// Initial background sync from server
if (typeof window !== 'undefined') {
  fetch('/api/content/all')
    .then(res => res.json())
    .then(data => {
      if (data) {
        let changed = false;
        if (data.gallery && Array.isArray(data.gallery)) {
          try { localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(data.gallery)); changed = true; } catch (e) {}
        }
        if (data.students && Array.isArray(data.students)) {
          try { localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(data.students)); changed = true; } catch (e) {}
        }
        if (data.partners && Array.isArray(data.partners)) {
          try { localStorage.setItem(STORAGE_KEYS.PARTNERS, JSON.stringify(data.partners)); changed = true; } catch (e) {}
        }
        if (data.visas && Array.isArray(data.visas)) {
          try { localStorage.setItem(STORAGE_KEYS.VISAS, JSON.stringify(data.visas)); changed = true; } catch (e) {}
        }
        if (data.news && Array.isArray(data.news)) {
          try { localStorage.setItem(STORAGE_KEYS.NEWS, JSON.stringify(data.news)); changed = true; } catch (e) {}
        }
        if (changed) triggerDataSync();
      }
    })
    .catch(() => {});
}

/* ============================================================
   SẮP XẾP & LUÂN PHIÊN BÀI ĐĂNG
   Bài mới đăng luôn lên đầu; khi vượt quá số lượng cho phép,
   bài cũ nhất tự động chuyển vào lưu trữ (ẩn khỏi trang chủ).
   ============================================================ */

/** Bài có ngày đăng xếp mới → cũ, bài cũ chưa có ngày giữ nguyên thứ tự phía sau. */
export function sortNewestFirst<T extends { createdAt?: string }>(items: T[]): T[] {
  const dated = items
    .map((item, i) => ({ item, i }))
    .filter(x => !!x.item.createdAt)
    .sort((a, b) => Date.parse(b.item.createdAt as string) - Date.parse(a.item.createdAt as string))
    .map(x => x.item);
  const undated = items.filter(item => !item.createdAt);
  return [...dated, ...undated];
}

/** Danh sách hiện ra ngoài trang chủ (đã bỏ bài lưu trữ và cắt theo giới hạn). */
export function visibleSlice<T extends { createdAt?: string; archived?: boolean }>(
  items: T[],
  limit: number
): T[] {
  const live = sortNewestFirst(items.filter(i => !i.archived));
  return limit > 0 ? live.slice(0, limit) : live;
}

/** Những bài đã bị đẩy khỏi trang chủ — vẫn xem lại được trong trang quản trị. */
export function archivedSlice<T extends { createdAt?: string; archived?: boolean }>(
  items: T[],
  limit: number
): T[] {
  const manual = items.filter(i => i.archived);
  const live = sortNewestFirst(items.filter(i => !i.archived));
  const pushedOut = limit > 0 ? live.slice(limit) : [];
  return [...pushedOut, ...manual];
}

export const getVisibleNews = (limit = 6): NewsEventItem[] => visibleSlice(getStoredNews(), limit);
export const getVisibleGallery = (limit = 8): GalleryItem[] => visibleSlice(getStoredGallery(), limit);
