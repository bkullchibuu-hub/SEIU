import { getAdminKey } from './authService';

export interface AiTranslationPrompt {
  id: string;
  vietnamese: string;
  referenceKorean: string;
  hint?: string;
}

export interface AiPronunciationPassage {
  id: string;
  title: string;
  korean: string;
  vietnamese?: string;
}

export interface AiLearningConfig {
  translations: AiTranslationPrompt[];
  pronunciation: AiPronunciationPassage[];
}

const STORAGE_KEY = 'seiu_ai_learning_v1';

export const DEFAULT_AI_LEARNING: AiLearningConfig = {
  translations: [
    { id: 'tr-1', vietnamese: 'Tôi đang học tiếng Hàn tại trung tâm SEIU.', referenceKorean: '저는 SEIU 센터에서 한국어를 배우고 있습니다.', hint: 'Nơi diễn ra hành động: 에서' },
    { id: 'tr-2', vietnamese: 'Ngày mai tôi sẽ đi thư viện cùng bạn.', referenceKorean: '내일 친구와 같이 도서관에 갈 거예요.', hint: 'Dùng -(으)ㄹ 거예요 cho dự định' },
    { id: 'tr-3', vietnamese: 'Vì trời mưa nên tôi đã mang theo ô.', referenceKorean: '비가 와서 우산을 가져왔어요.', hint: 'Nguyên nhân: -아/어서' },
  ],
  pronunciation: [
    { id: 'pr-1', title: 'Giới thiệu bản thân', korean: '안녕하세요. 저는 베트남에서 온 학생입니다. 한국어를 열심히 공부하고 있습니다.', vietnamese: 'Xin chào. Tôi là học sinh đến từ Việt Nam. Tôi đang chăm chỉ học tiếng Hàn.' },
    { id: 'pr-2', title: 'Mục tiêu học tập', korean: '제 목표는 한국어능력시험에서 좋은 점수를 받는 것입니다.', vietnamese: 'Mục tiêu của tôi là đạt điểm tốt trong kỳ thi năng lực tiếng Hàn.' },
  ],
};

const validConfig = (value: any): value is AiLearningConfig =>
  value && Array.isArray(value.translations) && Array.isArray(value.pronunciation);

export const getStoredAiLearning = (): AiLearningConfig => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return validConfig(parsed) ? parsed : DEFAULT_AI_LEARNING;
  } catch {
    return DEFAULT_AI_LEARNING;
  }
};

export const syncAiLearningFromServer = async (): Promise<void> => {
  try {
    const response = await fetch('/api/content/all');
    if (!response.ok) return;
    const data = await response.json();
    if (validConfig(data.aiLearning)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data.aiLearning));
      window.dispatchEvent(new CustomEvent('seiu_ai_learning_updated'));
    }
  } catch {
    // Bản lưu trên trình duyệt vẫn dùng được khi máy chủ ngoại tuyến.
  }
};

export const saveAiLearning = async (config: AiLearningConfig): Promise<void> => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  window.dispatchEvent(new CustomEvent('seiu_ai_learning_updated'));
  const response = await fetch('/api/content/save-section', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getAdminKey()}` },
    body: JSON.stringify({ section: 'aiLearning', data: config }),
  });
  if (!response.ok) throw new Error('Không thể lưu nội dung Học cùng AI lên máy chủ.');
};
