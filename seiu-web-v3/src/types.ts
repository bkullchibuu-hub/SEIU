export type CourseCategory = 'all' | 'beginner' | 'intermediate' | 'topik' | 'study_abroad' | 'business';

export interface Course {
  id: string;
  title: string;
  koreanTitle: string;
  category: CourseCategory;
  level: string;
  duration: string;
  schedule: string;
  originalPrice: number;
  discountedPrice: number;
  description: string;
  target: string;
  output: string;
  highlights: string[];
  syllabus: { week: string; topic: string; details: string }[];
  isHot?: boolean;
  isPopular?: boolean;
}

export type StudyAbroadProgramType = 'd4' | 'd2_bachelor' | 'd2_master' | 'd4_6_vocational';

export interface StudyAbroadProgram {
  id: string;
  type: StudyAbroadProgramType;
  visaCode: string;
  title: string;
  badge: string;
  shortDesc: string;
  targetAudience: string;
  duration: string;
  requirements: {
    gpa: string;
    age: string;
    koreanLevel: string;
    finance: string;
  };
  benefits: string[];
  timeline: { step: number; title: string; desc: string }[];
  averageCost: string;
  scholarshipRate: string;
}

export interface University {
  id: string;
  name: string;
  koreanName: string;
  region: 'Seoul' | 'Busan' | 'Incheon' | 'Gyeonggi' | 'Daegu' | 'Chungcheong';
  logoUrl?: string;
  image: string;
  ranking: string;
  tuitionYear: number; // in KRW
  dormCostQuarter: number; // in KRW
  visaType: 'Top 1% (Visa thẳng)' | 'Trường chứng nhận' | 'Trường phỏng vấn';
  topMajors: string[];
  scholarshipInfo: string;
  admissionRequirements: {
    gpa: number;
    topik: string;
    graduationGap: string;
  };
  features: string[];
  websiteUrl: string;
}

export interface StudentStory {
  id: string;
  name: string;
  avatar: string;
  hometown: string;
  program: string;
  school: string;
  major: string;
  topikScore: string;
  visaType: string;
  year: string;
  story: string;
  quote: string;
  scholarship: string;
}

export interface QuizQuestion {
  id: number;
  koreanText: string;
  transcription?: string;
  questionVi: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  levelTag: 'Sơ cấp 1' | 'Sơ cấp 2' | 'Trung cấp' | 'Cao cấp';
}

export interface BlogPost {
  id: string;
  title: string;
  category: 'Cẩm nang du học' | 'Mẹo học tiếng Hàn' | 'Kinh nghiệm Visa' | 'Học bổng';
  date: string;
  readTime: string;
  image: string;
  summary: string;
  tags: string[];
  author: string;
}
