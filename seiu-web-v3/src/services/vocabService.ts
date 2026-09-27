export interface VocabItem {
  id: string;
  korean: string;
  vietnamese: string;
  romaja: string;
  hanViet?: string;
  category: 'beginner1' | 'beginner2' | 'intermediate' | 'studyAbroad' | 'interview';
  exampleKr: string;
  exampleVi: string;
  level: string;
  audioText?: string;
}

export const DEFAULT_VOCAB_LIST: VocabItem[] = [
  // Sơ cấp 1
  {
    id: 'v1',
    korean: '안녕하세요',
    vietnamese: 'Xin chào',
    romaja: 'an-nyeong-ha-se-yo',
    hanViet: 'An ninh',
    category: 'beginner1',
    exampleKr: '안녕하세요! 저는 베트남 사람입니다.',
    exampleVi: 'Xin chào! Tôi là người Việt Nam.',
    level: 'Sơ cấp 1'
  },
  {
    id: 'v2',
    korean: '감사합니다',
    vietnamese: 'Cảm ơn',
    romaja: 'gam-sa-ham-ni-da',
    hanViet: 'Cảm tạ',
    category: 'beginner1',
    exampleKr: '도와주셔서 감사합니다.',
    exampleVi: 'Cảm ơn vì đã giúp đỡ tôi.',
    level: 'Sơ cấp 1'
  },
  {
    id: 'v3',
    korean: '한국어',
    vietnamese: 'Tiếng Hàn',
    romaja: 'han-gu-geo',
    hanViet: 'Hàn Quốc ngữ',
    category: 'beginner1',
    exampleKr: '저는 SEIU에서 한국어를 공부해요.',
    exampleVi: 'Tôi học tiếng Hàn tại SEIU.',
    level: 'Sơ cấp 1'
  },
  {
    id: 'v4',
    korean: '선생님',
    vietnamese: 'Thầy/Cô giáo',
    romaja: 'seon-saeng-nim',
    hanViet: 'Tiên sinh',
    category: 'beginner1',
    exampleKr: '부우 선생님은 한국어를 아주 잘 가르치십니다.',
    exampleVi: 'Thầy Bửu dạy tiếng Hàn rất giỏi.',
    level: 'Sơ cấp 1'
  },
  {
    id: 'v5',
    korean: '학생',
    vietnamese: 'Học sinh, sinh viên',
    romaja: 'hak-saeng',
    hanViet: 'Học sinh',
    category: 'beginner1',
    exampleKr: '저는 유학생입니다.',
    exampleVi: 'Tôi là du học sinh.',
    level: 'Sơ cấp 1'
  },
  {
    id: 'v6',
    korean: '친구',
    vietnamese: 'Bạn bè',
    romaja: 'chin-gu',
    hanViet: 'Thân cựu',
    category: 'beginner1',
    exampleKr: '한국 친구와 이야기해요.',
    exampleVi: 'Tôi nói chuyện với bạn người Hàn Quốc.',
    level: 'Sơ cấp 1'
  },
  
  // Sơ cấp 2
  {
    id: 'v7',
    korean: '식당',
    vietnamese: 'Nhà hàng, quán ăn',
    romaja: 'sik-dang',
    hanViet: 'Thực đường',
    category: 'beginner2',
    exampleKr: '학교 식당에서 밥을 먹어요.',
    exampleVi: 'Tôi ăn cơm ở căng tin trường học.',
    level: 'Sơ cấp 2'
  },
  {
    id: 'v8',
    korean: '지하철',
    vietnamese: 'Tàu điện ngầm',
    romaja: 'ji-ha-cheol',
    hanViet: 'Địa hạ thiết',
    category: 'beginner2',
    exampleKr: '지하철 2호선을 타고 대학교에 가요.',
    exampleVi: 'Tôi đi tàu điện ngầm tuyến số 2 đến trường đại học.',
    level: 'Sơ cấp 2'
  },
  {
    id: 'v9',
    korean: '날씨',
    vietnamese: 'Thời tiết',
    romaja: 'nal-ssi',
    category: 'beginner2',
    exampleKr: '오늘 한국 날씨가 조금 춥습니다.',
    exampleVi: 'Hôm nay thời tiết Hàn Quốc hơi lạnh.',
    level: 'Sơ cấp 2'
  },
  {
    id: 'v10',
    korean: '도서관',
    vietnamese: 'Thư viện',
    romaja: 'do-seo-gwan',
    hanViet: 'Đồ thư quán',
    category: 'beginner2',
    exampleKr: '주말에 도서관에서 TOPIK 시험을 준비해요.',
    exampleVi: 'Cuối tuần tôi ôn thi TOPIK ở thư viện.',
    level: 'Sơ cấp 2'
  },

  // Chuyên ngành Du học & Đời sống Hàn Quốc
  {
    id: 'v11',
    korean: '유학',
    vietnamese: 'Du học',
    romaja: 'yu-hak',
    hanViet: 'Du học',
    category: 'studyAbroad',
    exampleKr: '저는 한국 유학을 준비하고 있습니다.',
    exampleVi: 'Tôi đang chuẩn bị đi du học Hàn Quốc.',
    level: 'Du học'
  },
  {
    id: 'v12',
    korean: '장학금',
    vietnamese: 'Học bổng',
    romaja: 'jang-hak-geum',
    hanViet: 'Tưởng học kim',
    category: 'studyAbroad',
    exampleKr: 'TOPIK 4급을 따서 50% 장학금을 받았어요.',
    exampleVi: 'Tôi đạt TOPIK 4 nên nhận được 50% học bổng.',
    level: 'Du học'
  },
  {
    id: 'v13',
    korean: '기숙사',
    vietnamese: 'Ký túc xá',
    romaja: 'gi-suk-sa',
    hanViet: 'Ký túc xá',
    category: 'studyAbroad',
    exampleKr: '대학교 기숙사는 깨끗하고 안전합니다.',
    exampleVi: 'Ký túc xá đại học sạch sẽ và an toàn.',
    level: 'Du học'
  },
  {
    id: 'v14',
    korean: '외국인등록증',
    vietnamese: 'Thẻ đăng ký người nước ngoài (Thẻ ARC)',
    romaja: 'oe-guk-in-deung-nok-jeung',
    hanViet: 'Ngoại quốc nhân đăng lục chứng',
    category: 'studyAbroad',
    exampleKr: '한국에 도착한 후 외국인등록증을 신청해야 합니다.',
    exampleVi: 'Sau khi đến Hàn Quốc, bạn phải đăng ký thẻ người nước ngoài.',
    level: 'Du học'
  },
  {
    id: 'v15',
    korean: '아르바이트',
    vietnamese: 'Làm thêm (Part-time job)',
    romaja: 'a-reu-ba-i-teu',
    category: 'studyAbroad',
    exampleKr: '주말에 편의점에서 아르바이트를 해요.',
    exampleVi: 'Cuối tuần tôi làm thêm tại cửa hàng tiện lợi.',
    level: 'Du học'
  },

  // Phỏng vấn Visa & Trung cấp
  {
    id: 'v16',
    korean: '자기소개',
    vietnamese: 'Tự giới thiệu bản thân',
    romaja: 'ja-gi-so-gae',
    hanViet: 'Tự kỷ thiệu giới',
    category: 'interview',
    exampleKr: '1분 동안 간단하게 자기소개를 해보세요.',
    exampleVi: 'Hãy tự giới thiệu bản thân ngắn gọn trong 1 phút.',
    level: 'Phỏng vấn'
  },
  {
    id: 'v17',
    korean: '전공',
    vietnamese: 'Chuyên ngành học',
    romaja: 'jeon-gong',
    hanViet: 'Chuyên công',
    category: 'interview',
    exampleKr: '제 전공은 한국어학 및 경영학입니다.',
    exampleVi: 'Chuyên ngành của tôi là Hàn Quốc học và Quản trị kinh doanh.',
    level: 'Phỏng vấn'
  },
  {
    id: 'v18',
    korean: '목표',
    vietnamese: 'Mục tiêu',
    romaja: 'mok-pyo',
    hanViet: 'Mục tiêu',
    category: 'interview',
    exampleKr: '제 최종 목표는 한국 대기업에 취업하는 것입니다.',
    exampleVi: 'Mục tiêu cuối cùng của tôi là làm việc cho tập đoàn lớn tại Hàn Quốc.',
    level: 'Phỏng vấn'
  }
];

const VOCAB_STORAGE_KEY = 'seiu_vocab_custom_items';
const VOCAB_LEARNED_KEY = 'seiu_vocab_learned_ids';

export function getStoredVocabList(): VocabItem[] {
  try {
    const raw = localStorage.getItem(VOCAB_STORAGE_KEY);
    if (!raw) return DEFAULT_VOCAB_LIST;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_VOCAB_LIST;
  } catch {
    return DEFAULT_VOCAB_LIST;
  }
}

export function saveStoredVocabList(items: VocabItem[]): void {
  localStorage.setItem(VOCAB_STORAGE_KEY, JSON.stringify(items));
}

export function getLearnedVocabIds(): string[] {
  try {
    const raw = localStorage.getItem(VOCAB_LEARNED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function toggleLearnedVocab(id: string): string[] {
  const current = getLearnedVocabIds();
  let updated: string[];
  if (current.includes(id)) {
    updated = current.filter(item => item !== id);
  } else {
    updated = [...current, id];
  }
  localStorage.setItem(VOCAB_LEARNED_KEY, JSON.stringify(updated));
  return updated;
}
