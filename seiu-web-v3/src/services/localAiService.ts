const normalize = (value: string) => value
  .toLowerCase()
  .normalize('NFKC')
  .replace(/[^a-z0-9가-힣]/g, '');

const similarity = (left: string, right: string): number => {
  const a = normalize(left);
  const b = normalize(right);
  if (!a || !b) return 0;
  const previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i += 1) {
    let diagonal = previous[0];
    previous[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const old = previous[j];
      previous[j] = Math.min(
        previous[j] + 1,
        previous[j - 1] + 1,
        diagonal + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
      diagonal = old;
    }
  }
  return Math.max(0, Math.round((1 - previous[b.length] / Math.max(a.length, b.length)) * 100));
};

const clamp = (value: number, min = 0, max = 100) => Math.max(min, Math.min(max, Math.round(value)));

export const gradeTranslationLocally = (answer: string, reference: string) => {
  const score = similarity(answer, reference);
  return {
    score,
    feedback: score >= 85
      ? 'Bản dịch rất gần với đáp án tham khảo.'
      : score >= 60
        ? 'Ý chính khá tốt; hãy kiểm tra lại trợ từ và đuôi câu.'
        : 'Bạn cần đối chiếu lại từ vựng, trật tự câu và ngữ pháp.',
    corrected: reference,
    mode: 'local',
  };
};

export const gradePronunciationLocally = (target: string, transcript: string, confidence = 0.8) => {
  const pronunciation = similarity(transcript, target);
  const clarity = clamp(Number(confidence || 0.8) * 100);
  const completeness = clamp((normalize(transcript).length / Math.max(1, normalize(target).length)) * 100);
  const score = clamp(pronunciation * 0.58 + clarity * 0.22 + completeness * 0.2);
  return {
    score,
    pronunciation,
    clarity,
    completeness,
    feedback: score >= 90 ? 'Phát âm rõ và đầy đủ. Bạn đã đạt mục tiêu 90+.' : score >= 70 ? 'Khá tốt. Hãy nghe câu mẫu và đọc chậm lại ở phần chưa khớp.' : 'Hãy nghe lại câu mẫu, chia câu thành cụm ngắn rồi đọc lại.',
    recognized: transcript,
    corrected: target,
    mode: 'local',
  };
};

export const gradeInterviewLocally = (answer: string, sampleAnswer: string, confidence = 0.8) => {
  const match = similarity(answer, sampleAnswer || answer);
  const koreanLength = (answer.match(/[가-힣]/g) || []).length;
  const hasPoliteEnding = /(습니다|ㅂ니다|입니다|어요|아요|예요|이에요)[.!?]?$/u.test(answer.trim());
  const pronunciation = clamp(match * 0.58 + Number(confidence || 0.8) * 42);
  const grammar = clamp(50 + Math.min(28, koreanLength * 0.7) + (hasPoliteEnding ? 14 : 0));
  const clarity = clamp(Number(confidence || 0.8) * 100);
  const naturalness = clamp(match * 0.55 + (hasPoliteEnding ? 25 : 12) + Math.min(20, koreanLength * 0.35));
  const total = clamp(pronunciation * 0.28 + grammar * 0.27 + clarity * 0.2 + naturalness * 0.25);
  const issues = total >= 90 ? [] : [{
    original: answer,
    corrected: sampleAnswer || answer,
    reason: hasPoliteEnding
      ? 'Nội dung đã đúng hướng; cần luyện lại nhịp đọc và cách diễn đạt tự nhiên hơn.'
      : 'Khi phỏng vấn nên dùng thống nhất đuôi câu trang trọng -습니다/ㅂ니다.',
  }];
  return {
    pronunciation,
    grammar,
    clarity,
    naturalness,
    total,
    feedback: total >= 90 ? 'Câu trả lời rõ ràng, tự nhiên và đã đạt mục tiêu 90+.' : 'Hãy sửa theo câu gợi ý, nghe lại và trả lời thêm một lần để nâng điểm.',
    recognized: answer,
    correctedAnswer: sampleAnswer || answer,
    issues,
    mode: 'local',
  };
};

const slugify = (value: string) => value
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/đ/g, 'd')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

export const generateLocalSeoArticle = (topic: string, keywords = '', category = 'Cẩm Nang Du Học') => {
  const cleanTopic = topic.trim();
  const mainKeyword = keywords.trim() || cleanTopic;
  const title = `${cleanTopic} – Hướng dẫn chi tiết từ SEIU`;
  return {
    title,
    seoTitle: `${cleanTopic} | Trung tâm SEIU`,
    seoDescription: `Tìm hiểu ${cleanTopic} cùng SEIU: lộ trình rõ ràng, kinh nghiệm thực tế và tư vấn phù hợp cho học viên tại Vị Thanh, Hậu Giang.`,
    slug: slugify(cleanTopic) || `bai-viet-${Date.now()}`,
    summary: `Thông tin cần biết về ${cleanTopic}, được SEIU tổng hợp ngắn gọn và dễ áp dụng cho học viên cùng phụ huynh.`,
    category,
    tags: ['#SEIU', '#HocTiengHanTaiViThanhHauGiang', '#HocTiengHanDuHoc', '#DuHocHan'],
    contentHtml: `
      <h2>1. Tổng quan về ${cleanTopic}</h2>
      <p><strong>${mainKeyword}</strong> là nội dung học viên và phụ huynh cần tìm hiểu kỹ trước khi lập kế hoạch học tiếng Hàn hoặc du học Hàn Quốc. Chuẩn bị đúng từ đầu giúp tiết kiệm thời gian, hạn chế sai sót và chọn được lộ trình phù hợp.</p>
      <h2>2. Những việc cần chuẩn bị</h2>
      <ul><li>Xác định rõ mục tiêu học tập và thời gian dự kiến.</li><li>Kiểm tra điều kiện học lực, tiếng Hàn và tài chính.</li><li>Chuẩn bị hồ sơ minh bạch, thống nhất thông tin.</li><li>Luyện tiếng Hàn và phỏng vấn theo tình huống thực tế.</li></ul>
      <h2>3. Lộ trình đề xuất tại SEIU</h2>
      <p>Học viên được kiểm tra trình độ, tư vấn kế hoạch cá nhân, học tiếng Hàn theo mục tiêu và luyện phỏng vấn trước khi hoàn thiện hồ sơ. Giáo viên theo dõi từng giai đoạn để kịp thời sửa bài và phát âm.</p>
      <h2>4. Lưu ý quan trọng</h2>
      <p>Không nên chọn trường hoặc chương trình chỉ dựa vào quảng cáo. Hãy đối chiếu điều kiện thật của hồ sơ, tổng chi phí và chính sách hỗ trợ được ghi rõ trong hợp đồng.</p>
      <div class="my-6 rounded-2xl bg-red-600 p-5 text-white"><h3>Nhận tư vấn cùng SEIU</h3><p>SEIU – 197N Trần Hưng Đạo, P.5, Vị Thanh, Hậu Giang · Hotline: 097 224 9450</p></div>
    `,
    subPages: [],
    mode: 'local',
  };
};
