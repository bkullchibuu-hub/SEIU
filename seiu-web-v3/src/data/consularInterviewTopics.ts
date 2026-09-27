export interface ConsularInterviewTopic {
  id: string;
  korean: string;
  vietnamese: string;
  question: string;
  questionVi: string;
  sampleAnswer: string;
}

export const CONSULAR_INTERVIEW_TOPICS: ConsularInterviewTopic[] = [
  { id: 'self', korean: '자기소개', vietnamese: 'Giới thiệu bản thân', question: '자기소개를 해 보세요.', questionVi: 'Hãy giới thiệu bản thân.', sampleAnswer: '안녕하십니까? 제 이름은 민수입니다. 저는 베트남에서 왔고 올해 열아홉 살입니다. 제 취미는 운동이고 한국어를 열심히 공부하고 있습니다. 잘 부탁드립니다.' },
  { id: 'why-korea', korean: '한국에 가는 이유', vietnamese: 'Lý do sang Hàn Quốc', question: '왜 한국에 유학을 가고 싶습니까?', questionVi: 'Tại sao bạn muốn đi du học Hàn Quốc?', sampleAnswer: '한국은 제가 공부하고 싶은 분야의 교육 환경이 좋습니다. 한국어와 전공을 열심히 공부해서 전문적인 지식과 경험을 쌓고 싶습니다.' },
  { id: 'school', korean: '학교를 선택한 이유', vietnamese: 'Lý do chọn trường', question: '왜 이 학교를 선택했습니까?', questionVi: 'Tại sao bạn chọn trường này?', sampleAnswer: '이 학교는 교육 과정이 체계적이고 유학생 지원 프로그램이 잘 되어 있습니다. 또한 제가 공부하고 싶은 전공이 있어서 선택했습니다.' },
  { id: 'major', korean: '전공을 선택한 이유', vietnamese: 'Lý do chọn chuyên ngành', question: '왜 이 전공을 선택했습니까?', questionVi: 'Tại sao bạn chọn chuyên ngành này?', sampleAnswer: '저는 예전부터 이 분야에 관심이 많았습니다. 대학에서 전문 지식을 배우고 제 능력을 발전시키고 싶어서 이 전공을 선택했습니다.' },
  { id: 'study-plan', korean: '학업 계획', vietnamese: 'Kế hoạch học tập', question: '한국에서 어떻게 공부할 계획입니까?', questionVi: 'Bạn dự định học tập tại Hàn Quốc như thế nào?', sampleAnswer: '먼저 한국어 실력을 높이기 위해 매일 복습하겠습니다. 수업에 성실하게 참여하고 전공 공부도 계획적으로 하겠습니다.' },
  { id: 'after-graduation', korean: '졸업 후 계획', vietnamese: 'Kế hoạch sau tốt nghiệp', question: '졸업 후에 무엇을 할 계획입니까?', questionVi: 'Bạn dự định làm gì sau khi tốt nghiệp?', sampleAnswer: '졸업 후에는 베트남으로 돌아와서 전공과 관련된 회사에 취업할 계획입니다. 한국에서 배운 지식과 경험을 활용하고 싶습니다.' },
  { id: 'family', korean: '가족', vietnamese: 'Gia đình', question: '가족에 대해 이야기해 보세요.', questionVi: 'Hãy nói về gia đình của bạn.', sampleAnswer: '저희 가족은 네 명입니다. 아버지, 어머니, 동생 그리고 저입니다. 부모님께서는 항상 제 유학 계획을 응원해 주십니다.' },
  { id: 'finance', korean: '재정', vietnamese: 'Tài chính', question: '유학 비용은 누가 준비합니까?', questionVi: 'Ai chuẩn bị chi phí du học cho bạn?', sampleAnswer: '유학 비용은 부모님께서 준비해 주십니다. 부모님은 안정적인 수입이 있고 학비와 생활비를 지원해 주실 계획입니다.' },
  { id: 'korean', korean: '한국어', vietnamese: 'Tiếng Hàn', question: '한국어를 얼마나 공부했습니까? 어떻게 공부하고 있습니까?', questionVi: 'Bạn đã học tiếng Hàn bao lâu và đang học như thế nào?', sampleAnswer: '저는 한국어를 육 개월 동안 공부했습니다. 매일 단어와 문법을 복습하고 듣기와 말하기도 꾸준히 연습하고 있습니다.' },
];
