import { Course, StudyAbroadProgram, University, StudentStory, QuizQuestion, BlogPost } from '../types';

export const COURSES_DATA: Course[] = [
  {
    id: 'korean-basic-1',
    title: 'Tiếng Hàn Sơ Cấp 1 (Nhập Môn)',
    koreanTitle: '초급 1 한국어',
    category: 'beginner',
    level: 'A1 / TOPIK 1',
    duration: '2.5 Tháng (30 buổi)',
    schedule: 'T2-4-6 hoặc T3-5-7 (18:30 - 20:30)',
    originalPrice: 3800000,
    discountedPrice: 2890000,
    description: 'Khóa học thiết kế riêng cho người mới bắt đầu từ con số 0. Làm chủ bảng chữ cái Hangeul, phát âm chuẩn giọng Seoul, giao tiếp 10 chủ đề đời sống căn bản.',
    target: 'Học sinh, sinh viên, người đi làm chưa từng học tiếng Hàn.',
    output: 'Đạt trình độ TOPIK 1 Cấp 1, tự tin giới thiệu bản thân, mua sắm, hỏi đường, gọi món bằng tiếng Hàn.',
    highlights: [
      'Luyện phát âm 1:1 chuẩn giọng bản ngữ Seoul',
      'Giáo trình chuẩn ĐH Quốc gia Seoul & tài liệu độc quyền SEIU',
      'Tặng kèm khóa bổ trợ giao tiếp phản xạ miễn phí',
      'Cam kết đầu ra bằng văn bản - học lại miễn phí nếu chưa đạt'
    ],
    syllabus: [
      { week: 'Tuần 1-2', topic: 'Bảng chữ cái Hangeul & Nguyên tắc ghép âm', details: 'Nguyên âm, phụ âm, patchim đơn/kép, biến âm căn bản.' },
      { week: 'Tuần 3-5', topic: 'Chào hỏi & Đời sống hàng ngày', details: 'Cấu trúc câu cơ bản, số đếm Hàn - Thuần Hàn, giới thiệu quê quán, nghề nghiệp.' },
      { week: 'Tuần 6-8', topic: 'Giao tiếp thực tế & Vị trí, thời gian', details: 'Hỏi giờ, lịch trình, mua sắm ở chợ Dongdaemun, gọi món ở quán ăn.' },
      { week: 'Tuần 9-10', topic: 'Ôn tập & Luyện thi TOPIK I Level 1', details: 'Tổng hợp ngữ pháp, thi thử mô phỏng 100% đề thật.' }
    ],
    isPopular: true
  },
  {
    id: 'korean-basic-2',
    title: 'Tiếng Hàn Sơ Cấp 2 (Nâng Cao Sơ Cấp)',
    koreanTitle: '초급 2 한국어',
    category: 'beginner',
    level: 'A2 / TOPIK 2',
    duration: '3 Tháng (36 buổi)',
    schedule: 'T2-4-6 hoặc T3-5-7 (19:00 - 21:00)',
    originalPrice: 4500000,
    discountedPrice: 3490000,
    description: 'Nâng cao vốn từ vựng lên 1.500 từ, thành thạo các đuôi câu kính ngữ trang trọng và thân mật, làm chủ các tình huống giao tiếp đời sống và du lịch.',
    target: 'Học viên đã học xong Sơ cấp 1 hoặc nắm vững bảng chữ cái & ngữ pháp cơ bản.',
    output: 'Đạt TOPIK 1 Cấp 2, đủ điều kiện nền tảng nộp hồ sơ du học hệ tiếng D4-1.',
    highlights: [
      'Thực hành hội thoại trực tiếp với giáo viên Hàn Quốc 40% thời lượng',
      'Mở rộng 1,500 từ vựng theo cụm và phản xạ tức thì',
      'Tài liệu luyện đề TOPIK I độc quyền cập nhật 2026',
      'Hỗ trợ sửa bài tập và phát âm qua app 24/7'
    ],
    syllabus: [
      { week: 'Tuần 1-3', topic: 'Kính ngữ & Cuộc sống trường học/công sở', details: 'Quy tắc chia đuôi tôn kính (시/으시), diễn đạt cảm xúc và lý do.' },
      { week: 'Tuần 4-6', topic: 'Giao thông, Du lịch & Thời tiết Hàn Quốc', details: 'Đặt vé máy bay, hỏi đường tàu điện ngầm ngầm Subway Seoul, đặt phòng khách sạn.' },
      { week: 'Tuần 7-9', topic: 'Bệnh viện, Bưu điện & Ngân hàng', details: 'Mô tả triệu chứng bệnh, gửi bưu phẩm, mở thẻ ngân hàng tại Hàn.' },
      { week: 'Tuần 10-12', topic: 'Luyện đề thực chiến TOPIK Cấp 2', details: 'Mẹo làm bài thi nghe và đọc hiểu đạt điểm tối đa 180+/200.' }
    ]
  },
  {
    id: 'korean-intermediate-topik',
    title: 'Tiếng Hàn Trung Cấp 3 & 4 (TOPIK II Cấp 3-4)',
    koreanTitle: '중급 한국어 & 토픽 대비',
    category: 'intermediate',
    level: 'B1-B2 / TOPIK 3-4',
    duration: '3.5 Tháng (42 buổi)',
    schedule: 'T2-4-6 (19:30 - 21:30) hoặc T7-CN',
    originalPrice: 5900000,
    discountedPrice: 4790000,
    description: 'Khóa học chìa khóa để nộp hồ sơ du học chuyên ngành Đại học Hàn Quốc (Visa D2) hoặc xin việc tại các tập đoàn Samsung, LG, CJ, Lotte.',
    target: 'Học viên đã có TOPIK 2, sinh viên chuẩn bị du học chuyển tiếp chuyên ngành.',
    output: 'Đạt TOPIK II Cấp 3 hoặc 4, viết bài văn nghị luận tiếng Hàn 300-600 chữ trôi chảy.',
    highlights: [
      'Chuyên đề kỹ năng Viết TOPIK (Câu 51, 52, 53, 54) độc quyền do Master TOPIK 6 trực tiếp giảng dạy',
      'Chiến lược tăng 40 điểm phần Đọc hiểu (Reading) và Nghe hiểu (Listening)',
      'Học bổng 1.000.000đ khi thi đạt TOPIK 4 ngay lần đầu',
      'Tặng bộ flashcard 3.000 từ vựng trung cấp có ví dụ'
    ],
    syllabus: [
      { week: 'Tuần 1-4', topic: 'Ngữ pháp liên kết & Đọc báo tiếng Hàn', details: 'Các cặp liên từ đối lập, nguyên nhân - kết quả, cấu trúc trích dẫn gián tiếp.' },
      { week: 'Tuần 5-8', topic: 'Kỹ năng Viết luận TOPIK (Câu 51-53)', details: 'Phân tích biểu đồ xu hướng, điền từ vào thông báo công cộng.' },
      { week: 'Tuần 9-11', topic: 'Chinh phục bài văn nghị luận Câu 54', details: 'Dàn ý chuẩn, mẫu câu đắt giá về xã hội, giáo dục, công nghệ.' },
      { week: 'Tuần 12-14', topic: 'Giải đề thi chính thức TOPIK kỳ 80-98', details: 'Bấm giờ thi thử như thi thật, chữa chi tiết từng lỗi sai.' }
    ],
    isHot: true
  },
  {
    id: 'korean-express-study-abroad',
    title: 'Tiếng Hàn Cấp Tốc Phỏng Vấn Du Học (Visa D4-1, D2)',
    koreanTitle: '유학 면접 & 비자 속성반',
    category: 'study_abroad',
    level: 'Sơ cấp đến Phỏng vấn Visa',
    duration: '2 Tháng (Học cả ngày T2-T6)',
    schedule: 'Sáng 8:30 - 11:30 | Chiều 13:30 - 16:30',
    originalPrice: 8500000,
    discountedPrice: 6990000,
    description: 'Chương trình đào tạo cường độ cao dành riêng cho du học sinh chuẩn bị bay. Rèn luyện phản xạ phỏng vấn Đại sứ quán / Lãnh sự quán Hàn Quốc và trường ĐH.',
    target: 'Học sinh, sinh viên chuẩn bị nộp hồ sơ du học kỳ tháng 3, 6, 9, 12.',
    output: '100% tự tin vượt qua phỏng vấn visa với Đại sứ quán và Giáo sư trường Hàn.',
    highlights: [
      'Mô phỏng phỏng vấn 1:1 giả lập phòng thi Lãnh sự quán Hàn Quốc',
      'Bộ câu hỏi trúng tủ 100 câu phỏng vấn visa thường gặp nhất',
      'Rèn luyện tác phong chuẩn văn hóa Hàn: cúi chào, ánh mắt, tông giọng',
      'Cam kết tỷ lệ đậu phỏng vấn visa trên 98%'
    ],
    syllabus: [
      { week: 'Tuần 1-3', topic: 'Tiếng Hàn ứng dụng & Giới thiệu gia đình/tài chính', details: 'Nắm chắc thông tin bố mẹ, công việc, sổ tiết kiệm, lý do chọn trường.' },
      { week: 'Tuần 4-5', topic: 'Trả lời kế hoạch học tập & Định hướng tương lai', details: 'Mẫu câu trả lời thuyết phục Giáo sư về ngành học và ý định sau tốt nghiệp.' },
      { week: 'Tuần 6-7', topic: 'Xử lý câu hỏi bẫy & Tình huống bất ngờ', details: 'Cách ứng biến thông minh khi nghe không rõ hoặc câu hỏi khó.' },
      { week: 'Tuần 8', topic: 'Thi thử phỏng vấn với Ban Giám khảo Hàn - Việt', details: 'Chấm điểm tác phong, phát âm, phản xạ và cấp chứng nhận SEIU.' }
    ],
    isHot: true,
    isPopular: true
  },
  {
    id: 'korean-business',
    title: 'Tiếng Hàn Thương Mại & Doanh Nghiệp (Business Korean)',
    koreanTitle: '비즈니스 실무 한국어',
    category: 'business',
    level: 'TOPIK 3 Trở lên',
    duration: '2.5 Tháng (30 buổi)',
    schedule: 'T3-T5 (19:30 - 21:30)',
    originalPrice: 5200000,
    discountedPrice: 4190000,
    description: 'Dành cho nhân viên công ty Hàn Quốc, phiên dịch viên, thư ký. Viết email, soạn báo cáo kinh doanh, đàm phán hợp đồng, văn hóa công sở K-Corp.',
    target: 'Người đi làm tại các tập đoàn Hàn Quốc hoặc muốn apply vị trí lương cao.',
    output: 'Thành thạo văn phong công sở Hàn, tự tin họp hành và phiên dịch.',
    highlights: [
      'Mẫu 50+ email thương mại chuẩn phong cách Hàn',
      'Thực hành thuyết trình dự án và đàm phán thương vụ',
      'Giảng viên nguyên là Trưởng phòng Nhân sự tập đoàn đa quốc gia Hàn Quốc'
    ],
    syllabus: [
      { week: 'Tuần 1-3', topic: 'Quy tắc giao tiếp công sở & Kính ngữ doanh nghiệp', details: 'Danh xưng chức vụ (이사, 부장, 과장, 대리), chào hỏi đối tác.' },
      { week: 'Tuần 4-6', topic: 'Soạn thảo Email & Báo cáo công việc (보고서)', details: 'Cách dùng từ ngắn gọn, dứt khoát, logic thương mại.' },
      { week: 'Tuần 7-10', topic: 'Họp trực tuyến, Đàm phán giá & Phiên dịch hội thảo', details: 'Kỹ năng phản xạ dịch cabin cơ bản và xử lý mâu thuẫn đối tác.' }
    ]
  },
  {
    id: 'korean-topik-advanced',
    title: 'Luyện Thi Chuyên Sâu TOPIK II (Cấp 5 & 6)',
    koreanTitle: '토픽 고급 5·6급 마스터',
    category: 'topik',
    level: 'TOPIK 5-6',
    duration: '3 Tháng (36 buổi)',
    schedule: 'T7 & CN (14:00 - 17:00)',
    originalPrice: 6800000,
    discountedPrice: 5490000,
    description: 'Chinh phục đỉnh cao tiếng Hàn với mục tiêu TOPIK 5-6. Mở ra cơ hội học bổng Chính phủ GKS toàn phần 100% và cơ hội định cư visa F2, E7.',
    target: 'Học viên đã có TOPIK 4 vững vàng, muốn săn học bổng toàn phần.',
    output: 'Đạt TOPIK 5 hoặc 6 với điểm số cao, tự tin đọc báo cáo kinh tế chính trị.',
    highlights: [
      'Bộ đề dự đoán bám sát xu hướng đề thi mới nhất của Viện NIIED',
      'Chữa chi tiết từng từ ngữ và ngữ pháp trong bài viết Câu 54',
      'Hỗ trợ sửa bài viết 1:1 không giới hạn số lượng'
    ],
    syllabus: [
      { week: 'Tuần 1-4', topic: 'Từ vựng Hán Hàn cao cấp & Thành ngữ bốn chữ', details: 'Tục ngữ Hàn Quốc (속담), quán dụng ngữ (관용구), từ Hán Hàn chuyên sâu.' },
      { week: 'Tuần 5-8', topic: 'Nghị luận xã hội chuyên sâu & Đọc hiểu thời sự', details: 'Chủ đề: Trí tuệ nhân tạo AI, già hóa dân số, biến đổi khí hậu.' },
      { week: 'Tuần 9-12', topic: 'Chiến thuật đạt 85+ điểm Viết TOPIK', details: 'Kỹ thuật dùng đuôi câu gián tiếp, cấu trúc đảo ngữ nâng cao.' }
    ]
  }
];

export const STUDY_ABROAD_PROGRAMS: StudyAbroadProgram[] = [
  {
    id: 'd4-1-language',
    type: 'd4',
    visaCode: 'D4-1',
    title: 'Du Học Tiếng Hàn (Visa D4-1)',
    badge: 'Phổ biến nhất • Tỷ lệ đậu 99%',
    shortDesc: 'Chương trình du học lý tưởng dành cho học sinh vừa tốt nghiệp THPT hoặc sinh viên muốn trải nghiệm học tiếng Hàn 1-2 năm tại các trường ĐH hàng đầu Hàn Quốc.',
    targetAudience: 'Học sinh tốt nghiệp THPT, Trung cấp, CĐ, ĐH không quá 3 năm.',
    duration: '1 đến 2 năm (4 kỳ/năm: Tháng 3, 6, 9, 12)',
    requirements: {
      gpa: 'Điểm trung bình cấp 3 từ 6.5 trở lên (Ưu tiên > 7.0 cho trường Top)',
      age: 'Từ 18 đến 25 tuổi (Tốt nghiệp không quá 2-3 năm)',
      koreanLevel: 'Chưa biết tiếng hoặc Sơ cấp (Được đào tạo cấp tốc tại SEIU)',
      finance: 'Sổ tiết kiệm 10.000$ (SEIU hỗ trợ thủ tục mở sổ đóng băng K-Bank/Woori)'
    },
    benefits: [
      'Được phép đi làm thêm hợp pháp sau 6 tháng (tối đa 20h-25h/tuần, thu nhập 25-40 triệu/tháng)',
      'Học tập và trải nghiệm văn hóa tại Seoul, Busan, Daegu...',
      'Sau khi có TOPIK 3-4 được chuyển thẳng lên Đại học chuyên ngành nhận học bổng 30-100%',
      'Lộ trình visa nhanh chóng chỉ từ 2-3 tháng kể từ lúc nộp hồ sơ'
    ],
    timeline: [
      { step: 1, title: 'Tư vấn chọn trường & Ký hợp đồng', desc: 'SEIU phân tích hồ sơ, chọn trường phù hợp với tài chính và nguyện vọng.' },
      { step: 2, title: 'Học tiếng Hàn & Chuẩn bị hồ sơ', desc: 'Học tiếng Hàn cấp tốc tại SEIU và dịch thuật công chứng hợp pháp hóa lãnh sự.' },
      { step: 3, title: 'Phỏng vấn trường & Nhận Invoice', desc: 'Luyện phỏng vấn với trường, đóng học phí trực tiếp sang tài khoản trường Hàn.' },
      { step: 4, title: 'Xin Visa & Xuất cảnh', desc: 'Nhận mã Code Visa hoặc thư mời, nộp visa Đại sứ quán và đặt vé bay cùng đoàn SEIU.' }
    ],
    averageCost: '140.000.000đ - 190.000.000đ (Trọn gói gồm 1 năm học phí + KTX 6 tháng + hồ sơ)',
    scholarshipRate: '10% - 30% cho học kỳ tiếp theo dựa trên điểm chuyên cần và GPA'
  },
  {
    id: 'd2-2-bachelor',
    type: 'd2_bachelor',
    visaCode: 'D2-2',
    title: 'Du Học Đại Học Chuyên Ngành (Visa D2-2)',
    badge: 'Học bổng khủng 30% - 100%',
    shortDesc: 'Nhập học thẳng hệ Cử nhân 4 năm tại các trường Đại học danh tiếng của Hàn Quốc với hàng trăm ngành học hot: Truyền thông, Kinh tế, IT, Kỹ thuật, Nghệ thuật.',
    targetAudience: 'Học sinh tốt nghiệp THPT có TOPIK 3+ hoặc sinh viên chuyển tiếp.',
    duration: '4 năm (Khai giảng Tháng 3 và Tháng 9)',
    requirements: {
      gpa: 'GPA THPT từ 7.0 trở lên',
      age: 'Từ 18 đến 24 tuổi',
      koreanLevel: 'Tối thiểu TOPIK 3 hoặc IELTS 5.5+ (cho hệ tiếng Anh)',
      finance: 'Sổ tiết kiệm 20.000$ gửi trước 3-6 tháng'
    },
    benefits: [
      'Cơ hội nhận học bổng đầu vào từ 30% đến 100% học phí',
      'Được phép làm thêm ngay khi nhập học (20-30h/tuần, full-time vào kỳ nghỉ hè/đông)',
      'Bằng cử nhân quốc tế có giá trị toàn cầu, cơ hội đổi visa E7 ở lại làm việc lâu dài',
      'Cơ hội thực tập có lương tại các tập đoàn đối tác của trường'
    ],
    timeline: [
      { step: 1, title: 'Đánh giá học bạ & Săn học bổng', desc: 'SEIU tối ưu bài luận (Statement of Purpose) và kế hoạch học tập.' },
      { step: 2, title: 'Nộp hồ sơ trực tiếp cho trường', desc: 'Apply cổng tuyển sinh quốc tế của các trường ĐH Top đầu.' },
      { step: 3, title: 'Phỏng vấn với Giáo sư', desc: 'Luyện phỏng vấn chuyên sâu ngành học cùng chuyên gia SEIU.' },
      { step: 4, title: 'Nhận thư mời & Cấp Visa D2-2', desc: 'Hoàn tất thủ tục visa và chuẩn bị hành trang cất cánh sang Hàn.' }
    ],
    averageCost: '60.000.000đ - 110.000.000đ / kỳ (Chưa trừ học bổng 30-100%)',
    scholarshipRate: 'Lên tới 100% học phí kỳ đầu cho học viên đạt TOPIK 4-6'
  },
  {
    id: 'd2-3-master-phd',
    type: 'd2_master',
    visaCode: 'D2-3 / D2-4',
    title: 'Du Học Thạc Sĩ / Tiến Sĩ (Visa D2-3)',
    badge: 'Học bổng Giáo sư 100% + Trợ cấp Lab',
    shortDesc: 'Dành cho các bạn đã tốt nghiệp Đại học muốn nâng cao trình độ thạc sĩ tại Hàn Quốc với nguồn học bổng dồi dào từ các phòng Lab nghiên cứu và Chính phủ Hàn Quốc.',
    targetAudience: 'Đã tốt nghiệp Đại học tại Việt Nam hoặc nước ngoài.',
    duration: '2 năm (Thạc sĩ) / 3-4 năm (Tiến sĩ)',
    requirements: {
      gpa: 'GPA Đại học từ 2.8/4.0 hoặc 7.0/10 trở lên',
      age: 'Dưới 35 tuổi',
      koreanLevel: 'TOPIK 4+ hoặc IELTS 6.0 / TOEFL iBT 80+',
      finance: 'Được bảo lãnh học bổng giáo sư hoặc sổ 20.000$'
    },
    benefits: [
      'Miễn 100% học phí + nhận trợ cấp sinh hoạt phí hàng tháng từ 700.000 - 1.500.000 KRW (13-28 triệu VNĐ)',
      'Được bảo lãnh vợ/chồng, con cái sang Hàn sinh sống cùng (Visa F3)',
      'Lộ trình lên visa F2 (cư trú dài hạn) và F5 (vĩnh trú) nhanh nhất',
      'Cơ hội làm việc tại các viện nghiên cứu và doanh nghiệp R&D lớn'
    ],
    timeline: [
      { step: 1, title: 'Tìm Giáo sư & Lab phù hợp', desc: 'SEIU hỗ trợ viết CV học thuật và liên hệ Giáo sư Hàn Quốc.' },
      { step: 2, title: 'Phỏng vấn học bổng với Lab', desc: 'Thuyết trình đề cương nghiên cứu và cam kết tài trợ.' },
      { step: 3, title: 'Hoàn thiện hồ sơ admission', desc: 'Nộp giấy tờ chính thức và nhận học bổng.' },
      { step: 4, title: 'Nhận Visa D2-3 & Hỗ trợ đón tại sân bay', desc: 'Đón tại Incheon, hỗ trợ đăng ký thẻ người nước ngoài ARC.' }
    ],
    averageCost: '0đ - 40.000.000đ (Nhờ chính sách học bổng toàn phần)',
    scholarshipRate: '80% - 100% chi phí + Sinh hoạt phí hàng tháng'
  },
  {
    id: 'd4-6-vocational',
    type: 'd4_6_vocational',
    visaCode: 'D4-6 / E7-1',
    title: 'Du Học Nghề & Chuyển Đổi Visa E-7 Định Cư',
    badge: 'Vừa học vừa làm • Thu nhập cao',
    shortDesc: 'Chương trình đào tạo nghề thực hành (Làm đẹp, Nấu ăn, Cơ khí, Điện tử, Khách sạn) kết hợp vừa học vừa làm, cơ hội chuyển đổi visa tay nghề cao E-7 sau tốt nghiệp.',
    targetAudience: 'Học sinh tốt nghiệp THPT, ưu tiên có tay nghề cơ bản.',
    duration: '2 - 3 năm',
    requirements: {
      gpa: 'GPA cấp 3 từ 6.0 trở lên',
      age: 'Từ 18 đến 30 tuổi',
      koreanLevel: 'TOPIK 1 hoặc TOPIK 2 cơ bản',
      finance: 'Sổ tiết kiệm 10.000$'
    },
    benefits: [
      'Thời gian học lý thuyết ít (3 buổi/tuần), 4 ngày còn lại thực hành hưởng lương',
      'Thu nhập làm thêm từ 30 - 45 triệu/tháng ngay trong thời gian học',
      'Được doanh nghiệp Hàn ký hợp đồng tuyển dụng sau tốt nghiệp',
      'Chuyển đổi sang Visa E-7 làm việc lâu dài và bảo lãnh người thân'
    ],
    timeline: [
      { step: 1, title: 'Chọn ngành nghề & Trường cao đẳng nghề', desc: 'Khảo sát nhu cầu nhân lực tại các tỉnh thành Hàn Quốc.' },
      { step: 2, title: 'Đào tạo tiếng Hàn & Kỹ năng', desc: 'Học tiếng Hàn chuyên ngành tại SEIU.' },
      { step: 3, title: 'Nhận hợp đồng đào tạo & Visa', desc: 'Tiếp nhận thư mời từ trường nghề danh tiếng.' },
      { step: 4, title: 'Học tập & Thực tập hưởng lương', desc: 'SEIU kết nối nơi thực tập và hỗ trợ việc làm.' }
    ],
    averageCost: '130.000.000đ - 160.000.000đ (Trọn gói năm đầu)',
    scholarshipRate: 'Hỗ trợ việc làm thêm 100% bảo đảm thu nhập'
  }
];

export const TOP_UNIVERSITIES: University[] = [
  {
    id: 'snu',
    name: 'Đại học Quốc gia Seoul (SNU)',
    koreanName: '서울대학교',
    region: 'Seoul',
    ranking: 'Top 1 Hàn Quốc • Top 30 Thế giới',
    tuitionYear: 6500000,
    dormCostQuarter: 900000,
    visaType: 'Top 1% (Visa thẳng)',
    topMajors: ['Kinh tế & Quản trị', 'Khoa học máy tính', 'Y Dược', 'Luật', 'Khoa học Xã hội'],
    scholarshipInfo: 'Học bổng SNU Global Scholarship (100% học phí + KTX + 1.000.000 KRW/tháng).',
    admissionRequirements: {
      gpa: 8.5,
      topik: 'TOPIK 4-6 hoặc IELTS 7.0+',
      graduationGap: 'Không quá 2 năm'
    },
    features: ['Biểu tượng số 1 của nền giáo dục Hàn Quốc', 'Cơ sở vật chất đỉnh cao', 'Tỷ lệ xin việc 99% sau tốt nghiệp'],
    image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80',
    websiteUrl: 'https://www.snu.ac.kr'
  },
  {
    id: 'yonsei',
    name: 'Đại học Yonsei',
    koreanName: '연세대학교',
    region: 'Seoul',
    ranking: 'Top 2 Hàn Quốc • Thành viên SKY danh giá',
    tuitionYear: 7200000,
    dormCostQuarter: 1400000,
    visaType: 'Top 1% (Visa thẳng)',
    topMajors: ['Quản trị kinh doanh Quốc tế', 'Truyền thông', 'Kỹ thuật Sinh học', 'Văn hóa Hàn Quốc'],
    scholarshipInfo: 'Học bổng Underwood International College 50% - 100% học phí.',
    admissionRequirements: {
      gpa: 8.0,
      topik: 'TOPIK 3-5 hoặc IELTS 6.5+',
      graduationGap: 'Không quá 2 năm'
    },
    features: ['Khuôn viên trường đẹp như phim trường điện ảnh', 'Cộng đồng sinh viên quốc tế năng động nhất', 'Mạng lưới cựu sinh viên quyền lực'],
    image: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80',
    websiteUrl: 'https://www.yonsei.ac.kr'
  },
  {
    id: 'korea-univ',
    name: 'Đại học Korea',
    koreanName: '고려대학교',
    region: 'Seoul',
    ranking: 'Top 3 Hàn Quốc • Thành viên SKY',
    tuitionYear: 7100000,
    dormCostQuarter: 1200000,
    visaType: 'Top 1% (Visa thẳng)',
    topMajors: ['Kinh tế', 'Truyền thông', 'Công nghệ thông tin AI', 'Quan hệ quốc tế'],
    scholarshipInfo: 'Học bổng Merit Scholarship miễn 50% - 100% học phí 4 năm.',
    admissionRequirements: {
      gpa: 8.0,
      topik: 'TOPIK 4+ hoặc IELTS 6.5+',
      graduationGap: 'Không quá 2 năm'
    },
    features: ['Kiến trúc phong cách Gothic cổ kính hùng vĩ', 'Học bổng dồi dào cho sinh viên Đông Nam Á'],
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80',
    websiteUrl: 'https://www.korea.ac.kr'
  },
  {
    id: 'hanyang',
    name: 'Đại học Hanyang',
    koreanName: '한양대학교',
    region: 'Seoul',
    ranking: 'Top 1 Hàn Quốc về khối ngành Kỹ thuật & Công nghệ',
    tuitionYear: 6800000,
    dormCostQuarter: 1100000,
    visaType: 'Top 1% (Visa thẳng)',
    topMajors: ['Kỹ thuật Cơ khí & Ô tô', 'Khoa học Máy tính', 'Thiết kế Thời trang', 'Quản trị Kinh doanh'],
    scholarshipInfo: 'Học bổng Hanyang International Excellence Award 30% - 100%.',
    admissionRequirements: {
      gpa: 7.5,
      topik: 'TOPIK 3-4',
      graduationGap: 'Không quá 3 năm'
    },
    features: ['Trạm tàu điện ngầm Hanyang Station nằm ngay trong lòng trường', 'Vườn ươm khởi nghiệp hàng đầu Châu Á'],
    image: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&w=800&q=80',
    websiteUrl: 'https://www.hanyang.ac.kr'
  },
  {
    id: 'chung-ang',
    name: 'Đại học Chung-Ang (CAU)',
    koreanName: '중앙대학교',
    region: 'Seoul',
    ranking: 'Top 1 Hàn Quốc về Truyền thông & Nghệ thuật / Điện ảnh',
    tuitionYear: 6000000,
    dormCostQuarter: 1000000,
    visaType: 'Top 1% (Visa thẳng)',
    topMajors: ['Truyền thông & Báo chí', 'Điện ảnh & Diễn xuất', 'Quản trị Kinh doanh', 'Tâm lý học'],
    scholarshipInfo: 'Học bổng TOPIK 5 giảm 70% học phí, TOPIK 6 giảm 100% học phí kỳ đầu.',
    admissionRequirements: {
      gpa: 7.2,
      topik: 'TOPIK 3-4',
      graduationGap: 'Không quá 3 năm'
    },
    features: ['Nơi theo học của hàng loạt ngôi sao K-Pop và diễn viên đình đám', 'Nằm ngay trung tâm thủ đô Seoul sôi động'],
    image: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=800&q=80',
    websiteUrl: 'https://neweng.cau.ac.kr'
  },
  {
    id: 'sejong',
    name: 'Đại học Sejong',
    koreanName: '세종대학교',
    region: 'Seoul',
    ranking: 'Top 1 ngành Quản trị Du lịch & Khách sạn tại Hàn',
    tuitionYear: 5800000,
    dormCostQuarter: 950000,
    visaType: 'Trường chứng nhận',
    topMajors: ['Quản trị Khách sạn & Du lịch', 'Hoạt hình & Thiết kế Đồ họa (Webtoon)', 'Khoa học Dữ liệu'],
    scholarshipInfo: 'Học bổng TOPIK 3 giảm 30%, TOPIK 4 giảm 50%, TOPIK 5-6 giảm 80-100%.',
    admissionRequirements: {
      gpa: 6.8,
      topik: 'TOPIK 2-3',
      graduationGap: 'Không quá 3 năm'
    },
    features: ['Chính sách học bổng hào phóng nhất Seoul', 'Vị trí đắc địa gần ga tàu điện ngầm'],
    image: 'https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?auto=format&fit=crop&w=800&q=80',
    websiteUrl: 'https://en.sejong.ac.kr'
  },
  {
    id: 'pusan-univ',
    name: 'Đại học Quốc gia Pusan (PNU)',
    koreanName: '부산대학교',
    region: 'Busan',
    ranking: 'Top 2 Đại học Quốc gia hàng đầu Hàn Quốc',
    tuitionYear: 4400000,
    dormCostQuarter: 750000,
    visaType: 'Top 1% (Visa thẳng)',
    topMajors: ['Logistics & Hàng hải', 'Kỹ thuật Cơ khí', 'Kinh tế Quốc tế', 'Ngôn ngữ & Văn hóa Hàn'],
    scholarshipInfo: 'Học phí trường công lập siêu rẻ (bằng 1/2 Seoul) + Học bổng PNU Premier 100%.',
    admissionRequirements: {
      gpa: 7.0,
      topik: 'TOPIK 3+',
      graduationGap: 'Không quá 3 năm'
    },
    features: ['Chi phí sinh hoạt tại Busan rẻ hơn Seoul 35%', 'Cơ hội việc làm tại thành phố cảng lớn nhất Hàn Quốc'],
    image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
    websiteUrl: 'https://www.pusan.ac.kr'
  },
  {
    id: 'konkuk',
    name: 'Đại học Konkuk (KU)',
    koreanName: '건국대학교',
    region: 'Seoul',
    ranking: 'Top 10 Đại học hàng đầu Hàn Quốc',
    tuitionYear: 6200000,
    dormCostQuarter: 1200000,
    visaType: 'Trường chứng nhận',
    topMajors: ['Thú y', 'Bất động sản', 'Thương mại Quốc tế', 'Thiết kế Media'],
    scholarshipInfo: 'Học bổng KU Global 40% - 100% học phí theo kết quả TOPIK.',
    admissionRequirements: {
      gpa: 7.2,
      topik: 'TOPIK 3+',
      graduationGap: 'Không quá 3 năm'
    },
    features: ['Hồ Ilgam tuyệt đẹp giữa lòng campus', 'Khu ký túc xá KU:L House chuẩn khách sạn hiện đại'],
    image: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=800&q=80',
    websiteUrl: 'https://www.konkuk.ac.kr'
  }
];

export const STUDENT_STORIES: StudentStory[] = [
  {
    id: 'story-1',
    name: 'Nguyễn Thảo My',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    hometown: 'Hà Nội',
    program: 'Du học Đại học D2-2',
    school: 'Đại học Chung-Ang (CAU)',
    major: 'Truyền thông & Báo chí',
    topikScore: 'TOPIK 5 (238/300)',
    visaType: 'Visa Thẳng D2-2',
    year: '2025',
    scholarship: 'Học bổng 70% Học phí kỳ 1',
    story: 'Mình xuất phát từ con số 0 tròn trĩnh với tiếng Hàn. Sau 7 tháng đồng hành cùng các thầy cô tại SEIU, mình đạt TOPIK 5 và nhận học bổng 70% của ĐH Chung-Ang. Thầy cô sửa từng câu trong bài luận và luyện phỏng vấn sát sao 1:1!',
    quote: 'SEIU không chỉ dạy tiếng Hàn mà còn là người dẫn đường tận tâm giúp mình biến ước mơ du học Hàn thành sự thật.'
  },
  {
    id: 'story-2',
    name: 'Trần Minh Quân',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    hometown: 'Đà Nẵng',
    program: 'Du học Thạc sĩ D2-3',
    school: 'Đại học Hanyang',
    major: 'Khoa học Máy tính & AI',
    topikScore: 'TOPIK 4 + IELTS 7.5',
    visaType: 'Visa D2-3',
    year: '2025',
    scholarship: 'Học bổng Giáo sư 100% + Trợ cấp 1.200.000 KRW/tháng',
    story: 'Nhờ sự kết nối của đội ngũ cựu du học sinh và chuyên gia SEIU, mình đã tiếp cận được trực tiếp Giáo sư Lab AI tại Hanyang. Hồ sơ visa và chứng minh tài chính được xử lý nhanh gọn chỉ trong 3 tuần.',
    quote: 'Chọn đúng trung tâm uy tín như SEIU giúp mình tiết kiệm gần 1 năm chuẩn bị và săn trọn gói học bổng toàn phần.'
  },
  {
    id: 'story-3',
    name: 'Lê Hoàng Yến Nhi',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
    hometown: 'TP. Hồ Chí Minh',
    program: 'Du học Tiếng D4-1',
    school: 'Đại học Yonsei (Seoul)',
    major: 'Khóa tiếng KLI Yonsei',
    topikScore: 'TOPIK 2 (Sau khóa cấp tốc SEIU)',
    visaType: 'Visa Thẳng D4-1 (Code 100%)',
    year: '2026',
    scholarship: 'Tài trợ ký túc xá & vé máy bay',
    story: 'Ban đầu mình rất sợ trượt phỏng vấn Đại sứ quán vì hộ khẩu miền Trung. Nhưng nhờ khóa phỏng vấn cấp tốc tại SEIU, mình trả lời lưu loát tự tin và nhận mã code visa thẳng chỉ sau 18 ngày nộp.',
    quote: 'Mọi thủ tục từ đổi tiền, sim thẻ, ký túc xá đến đưa đón tại sân bay Incheon đều được SEIU lo trọn gói chu đáo.'
  }
];

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    koreanText: '안녕하세요? 저는 베트남 사람_____ .',
    questionVi: 'Chọn trợ từ thích hợp điền vào chỗ trống:',
    options: ['이에요', '예요', '입니다', '이었습니다'],
    correctIndex: 0,
    explanation: 'Danh từ "사람" có phụ âm cuối (patchim "ㅁ") nên khi kết thúc đuôi câu thân mật lịch sự dùng "-이에요". (Nếu danh từ không có patchim dùng "-예요").',
    levelTag: 'Sơ cấp 1'
  },
  {
    id: 2,
    koreanText: '어제 백화점_____ 친구를 만났어요.',
    questionVi: 'Chọn tiểu từ chỉ nơi chốn diễn ra hành động:',
    options: ['에', '에서', '으로', '부터'],
    correctIndex: 1,
    explanation: 'Tiểu từ "에서" đi với nơi chốn diễn ra một hành động cụ thể (gặp bạn bè). Tiểu từ "에" thường dùng với động từ chỉ sự tồn tại (있다/없다) hoặc chuyển dịch (가다/오다).',
    levelTag: 'Sơ cấp 1'
  },
  {
    id: 3,
    koreanText: '한국 음식이 조금 맵_____ 맛있어요.',
    questionVi: 'Chọn liên từ nối hai vế mang ý nghĩa tương phản (nhưng):',
    options: ['고', '지만', '어서', '으면'],
    correctIndex: 1,
    explanation: 'Ngữ pháp "-지만" mang ý nghĩa "nhưng / tuy... nhưng", diễn tả hai vế câu có tính chất tương phản: Món ăn hơi cay nhưng ngon.',
    levelTag: 'Sơ cấp 1'
  },
  {
    id: 4,
    koreanText: '내일 비가 오_____ 집에 있을 거예요.',
    questionVi: 'Chọn ngữ pháp giả định "Nếu... thì":',
    options: ['거나', '려고', '면', '는데'],
    correctIndex: 2,
    explanation: 'Động từ "오다" không có patchim nên kết hợp với "-(으)면" mang nghĩa "Nếu... thì".',
    levelTag: 'Sơ cấp 2'
  },
  {
    id: 5,
    koreanText: '저는 한국 대학교에 가_____ 한국어를 열심히 공부해요.',
    questionVi: 'Chọn cấu trúc biểu thị mục đích (để / với ý định):',
    options: ['려고', '느라고', '자마자', '기 때문에'],
    correctIndex: 0,
    explanation: 'Cấu trúc "-(으)려고" biểu thị mục đích, dự định của người nói: "Tôi học tiếng Hàn chăm chỉ ĐỂ vào đại học Hàn Quốc".',
    levelTag: 'Sơ cấp 2'
  },
  {
    id: 6,
    koreanText: '영화가 너무 슬퍼서 눈물이 _____ 시작했어요.',
    questionVi: 'Chọn dạng động từ kết hợp với "-기 시작하다" (bắt đầu làm gì):',
    options: ['나고', '나기', '나서', '나면'],
    correctIndex: 1,
    explanation: 'Ngữ pháp "-기 시작하다" (bắt đầu hành động) luôn đi cùng gốc động từ + 기: "눈물이 나기 시작했어요" (Nước mắt bắt đầu rơi).',
    levelTag: 'Sơ cấp 2'
  },
  {
    id: 7,
    koreanText: '최근 환경 오염이 심각해짐에 _____ 정부의 대책이 시급하다.',
    questionVi: 'Chọn cấu trúc biểu thị "tùy theo / song song với sự phát triển":',
    options: ['따라', '대해', '위해', '관해'],
    correctIndex: 0,
    explanation: 'Ngữ pháp "-함에 따라" (Trung cấp/Cao cấp) nghĩa là "cùng với sự việc..., theo đà...". Môi trường ngày càng ô nhiễm nên biện pháp của chính phủ rất cấp bách.',
    levelTag: 'Trung cấp'
  },
  {
    id: 8,
    koreanText: '그는 실력뿐만 _____ 성실함까지 갖춘 인재이다.',
    questionVi: 'Chọn trợ từ đi kèm với "-뿐만" mang nghĩa "Không những... mà còn":',
    options: ['만', '조차', '마저', '아니라'],
    correctIndex: 3,
    explanation: 'Cấu trúc "A뿐만 아니라 B도" (Không chỉ A mà còn cả B): "Anh ấy không những có thực lực mà còn chăm chỉ".',
    levelTag: 'Trung cấp'
  },
  {
    id: 9,
    koreanText: '어려운 상황일수록 긍정적인 마음을 _____ 것이 중요하다.',
    questionVi: 'Chọn từ ngữ thể hiện việc "giữ vững, nuôi dưỡng (tâm trí/thái độ)":',
    options: ['갖는', '버리는', '잊는', '숨기는'],
    correctIndex: 0,
    explanation: 'Cụm từ "마음을 갖다/가지다" (giữ tinh thần/tấm lòng). Càng trong hoàn cảnh khó khăn thì việc giữ tinh thần lạc quan càng quan trọng.',
    levelTag: 'Trung cấp'
  },
  {
    id: 10,
    koreanText: '이번 연구 결과는 기존의 학설을 완전히 _____ 획기적인 발견이다.',
    questionVi: 'Chọn động từ mang nghĩa "lật ngược / bác bỏ (học thuyết cũ)":',
    options: ['뒤집는', '따르는', '받아들이는', '인정하는'],
    correctIndex: 0,
    explanation: 'Động từ "뒤집다" nghĩa là lật ngược, đảo lộn. Kết quả nghiên cứu lần này là phát hiện mang tính đột phá lật ngược hoàn toàn học thuyết trước đây (Trình độ TOPIK 5-6).',
    levelTag: 'Cao cấp'
  }
];

export const BLOG_POSTS: BlogPost[] = [
  {
    id: 'blog-1',
    title: 'Cập Nhật Chính Sách Visa Du Học Hàn Quốc Mới Nhất 2026',
    category: 'Kinh nghiệm Visa',
    date: '15/08/2026',
    readTime: '5 phút đọc',
    image: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?auto=format&fit=crop&w=600&q=80',
    summary: 'Tổng hợp quy định mới về chứng minh tài chính, mở sổ K-Bank 10.000 USD, danh sách trường Top 1% cấp visa thẳng và các lưu ý vàng khi phỏng vấn ĐSQ.',
    tags: ['Visa D4-1', 'Visa Thẳng', 'Quy định 2026'],
    author: 'Trưởng ban Visa SEIU'
  },
  {
    id: 'blog-2',
    title: 'Bí Quyết Ôn Thi TOPIK II Đạt Cấp 4 Trong 4 Tháng Cho Người Mất Gốc',
    category: 'Mẹo học tiếng Hàn',
    date: '10/08/2026',
    readTime: '7 phút đọc',
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=600&q=80',
    summary: 'Chiến thuật ăn trọn điểm câu 51-53 bài viết, cách gom 2.000 từ vựng theo trường nghĩa và mẹo nghe bắt từ khóa trong đề thi nghe.',
    tags: ['Luyện thi TOPIK', 'Mẹo thi', 'Tiếng Hàn'],
    author: 'ThS. Lee Min Ho (GV Bản ngữ)'
  },
  {
    id: 'blog-3',
    title: 'Chi Tiết Chi Phí Du Học Hàn Quốc 1 Năm Cần Chuẩn Bị Bao Nhiêu?',
    category: 'Cẩm nang du học',
    date: '02/08/2026',
    readTime: '6 phút đọc',
    image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=600&q=80',
    summary: 'Bảng kê chi tiết tiền học phí, ký túc xá, bảo hiểm y tế quốc dân và chi phí sinh hoạt tại Seoul so với Busan. Mẹo tiết kiệm đến 40% chi tiêu.',
    tags: ['Chi phí du học', 'Kinh nghiệm sống', 'Hàn Quốc'],
    author: 'Cố vấn tài chính SEIU'
  },
  {
    id: 'blog-4',
    title: 'Học Bổng Chính Phủ Toàn Phần GKS Hàn Quốc: Hướng Dẫn Nộp Hồ Sơ',
    category: 'Học bổng',
    date: '28/07/2026',
    readTime: '8 phút đọc',
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80',
    summary: 'Chi tiết lộ trình apply học bổng GKS qua đường Đại sứ quán và đường Trường ĐH. Cách viết Personal Statement ấn tượng chinh phục hội đồng xét duyệt.',
    tags: ['Học bổng GKS', 'Thạc sĩ Hàn Quốc', 'Miễn 100%'],
    author: 'Ban Du học SEIU'
  }
];

export const FAQS_DATA = [
  {
    question: 'Chưa biết một chữ tiếng Hàn nào thì có thể đăng ký đi du học được không?',
    answer: 'Hoàn toàn được! SEIU có lộ trình đào tạo tiếng Hàn cấp tốc từ con số 0 (Sơ cấp 1 đến phỏng vấn visa) chỉ trong 2-3 tháng. Bạn sẽ được học song song với việc chuẩn bị hồ sơ du học, đảm bảo khi có visa là bạn đã đủ tiếng Hàn để sang trường nhập học tự tin.'
  },
  {
    question: 'Tỷ lệ đậu Visa du học Hàn Quốc tại SEIU là bao nhiêu?',
    answer: 'Tỷ lệ đậu visa của học viên SEIU trong 5 năm qua luôn duy trì trên 98.5%. SEIU là đối tác trực tiếp của hơn 60+ trường ĐH Top 1% visa thẳng và trường chứng nhận tại Hàn Quốc, hỗ trợ luyện phỏng vấn 1:1 kỹ càng với giáo viên Hàn Quốc.'
  },
  {
    question: 'Học phí tại SEIU có cam kết không phát sinh không?',
    answer: 'Cam kết 100% minh bạch bằng hợp đồng pháp lý rõ ràng. Toàn bộ chi phí học tiếng Hàn, phí xử lý hồ sơ, dịch thuật công chứng, phí nộp trường và ký túc xá đều được liệt kê chi tiết từng khoản trước khi ký, cam kết tuyệt đối không phát sinh chi phí ẩn.'
  },
  {
    question: 'Sang Hàn Quốc bao lâu thì được đi làm thêm và thu nhập ra sao?',
    answer: 'Theo quy định của Bộ Tư pháp Hàn Quốc, du học sinh hệ tiếng D4-1 được phép đi làm thêm hợp pháp sau 6 tháng nhập học (có Topik 2). Học sinh hệ Đại học D2-2 được làm thêm ngay khi sang. Mức lương làm thêm cơ bản tại Hàn từ 9.860 - 12.000 KRW/giờ (khoảng 180.000 - 230.000đ/giờ), thu nhập trung bình 25 - 40 triệu VNĐ/tháng.'
  },
  {
    question: 'SEIU có hỗ trợ đón học viên tại sân bay và tìm ký túc xá bên Hàn không?',
    answer: 'Có! SEIU có văn phòng đại diện và ban hỗ trợ du học sinh trực tiếp tại Seoul và Busan. Chúng tôi sẽ đón học viên tại sân bay Incheon / Gimhae, đưa về ký túc xá, hỗ trợ làm thẻ cư trú người nước ngoài (ARC), mở tài khoản ngân hàng, mua sim 4G và kết nối cộng đồng cựu học viên SEIU tại trường.'
  }
];

export const BRANCH_LOCATIONS = [
  {
    city: 'Hà Nội (Trụ sở chính)',
    address: 'Tầng 5, Tòa nhà SEIU Tower, Phố Trần Thái Tông, Cầu Giấy, Hà Nội',
    hotline: '0972 249 450',
    email: 'hanoi@seiu.edu.vn',
    workHours: 'Thứ 2 - Thứ 7: 8:00 - 21:00 | Chủ Nhật: 8:30 - 17:30'
  },
  {
    city: 'TP. Hồ Chí Minh',
    address: 'Số 188 Nguyễn Thị Minh Khai, Phường Võ Thị Sáu, Quận 3, TP.HCM',
    hotline: '0977.654.321',
    email: 'hcm@seiu.edu.vn',
    workHours: 'Thứ 2 - Thứ 7: 8:00 - 21:00 | Chủ Nhật: 8:30 - 17:30'
  },
  {
    city: 'Đà Nẵng',
    address: 'Số 45 Nguyễn Văn Linh, Quận Hải Châu, TP. Đà Nẵng',
    hotline: '0966.888.999',
    email: 'danang@seiu.edu.vn',
    workHours: 'Thứ 2 - Thứ 7: 8:00 - 20:00'
  },
  {
    city: 'Seoul Support Office (Hàn Quốc)',
    address: '4th Floor, Gangnam-daero 94-gil, Gangnam-gu, Seoul, Korea',
    hotline: '+82 10-8888-SEIU',
    email: 'korea.support@seiu.edu.vn',
    workHours: 'Mon - Fri: 9:00 - 18:00 (Hỗ trợ khẩn cấp 24/7)'
  }
];
