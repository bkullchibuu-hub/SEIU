import { author, authorRole, contactCta, driveImage } from './seoArticles';

/** Đợt bài SEO thứ hai: được thêm một lần vào danh sách đã lưu, không ghi đè bài admin đã sửa. */
export const SEO_BATCH2_SEED_VERSION = 'seiu-seo-v2-20260927';

const base = {
  seedVersion: SEO_BATCH2_SEED_VERSION,
  author,
  authorRole,
  isFeatured: false,
};

export const SEO_BATCH2_ARTICLES = [
  {
    ...base,
    id: 'topik-la-gi-cap-do-thang-diem',
    slug: 'topik-la-gi-cap-do-thang-diem',
    title: 'TOPIK Là Gì? Cấp Độ, Thang Điểm Và Cách Chọn Kỳ Thi Phù Hợp',
    category: 'Ngữ pháp & Luyện thi TOPIK',
    summary: 'Giải thích TOPIK I, TOPIK II, điểm cần đạt cho từng cấp và nên thi cấp nào khi học tiếng Hàn để du học, làm việc hay giao tiếp.',
    coverImage: driveImage('1DcDFMh3lqrKoMQnJf5Ds1b6V7ygugtj4'),
    coverImageAlt: 'Học viên SEIU luyện thi TOPIK tại Vị Thanh',
    readTime: '6 phút đọc',
    publishedAt: '27/09/2026',
    tags: ['TOPIK', 'LuyệnThiTOPIK', 'SEIU'],
    focusKeyword: 'TOPIK là gì',
    seoTitle: 'TOPIK Là Gì? Cấp Độ Và Thang Điểm TOPIK Mới Nhất',
    seoDescription: 'TOPIK là kỳ thi năng lực tiếng Hàn gồm TOPIK I (cấp 1–2) và TOPIK II (cấp 3–6). Xem điểm cần đạt từng cấp và cách ôn thi miễn phí cùng SEIU.',
    contentHtml: `
      <p><strong>TOPIK là gì?</strong> TOPIK (Test of Proficiency in Korean – 한국어능력시험) là kỳ thi đánh giá năng lực tiếng Hàn dành cho người nước ngoài. Chứng chỉ TOPIK thường được dùng khi xin học, xét học bổng, xin việc và một số thủ tục visa tại Hàn Quốc.</p>
      <h2>TOPIK I và TOPIK II khác nhau thế nào?</h2>
      <h3>TOPIK I – Sơ cấp (cấp 1–2)</h3>
      <p>Gồm hai phần Nghe và Đọc, tổng 200 điểm. Đây là mức phù hợp với người mới học khoảng 3–6 tháng và là nền tảng thường gặp khi chuẩn bị hồ sơ du học hệ tiếng.</p>
      <ul><li><strong>Cấp 1:</strong> từ 80 điểm trở lên</li><li><strong>Cấp 2:</strong> từ 140 điểm trở lên</li></ul>
      <h3>TOPIK II – Trung, cao cấp (cấp 3–6)</h3>
      <p>Gồm Nghe, Viết và Đọc, tổng 300 điểm. Phần Viết có các câu 51–54, trong đó câu 54 yêu cầu viết bài luận.</p>
      <ul><li><strong>Cấp 3:</strong> từ 120 điểm</li><li><strong>Cấp 4:</strong> từ 150 điểm</li><li><strong>Cấp 5:</strong> từ 190 điểm</li><li><strong>Cấp 6:</strong> từ 230 điểm</li></ul>
      <h2>Nên thi cấp nào?</h2>
      <p>Người mới bắt đầu nên đặt mục tiêu TOPIK I cấp 2 trước. Học viên dự định vào đại học hoặc học chuyên ngành nên hướng đến TOPIK II cấp 3–4. Yêu cầu cụ thể thay đổi theo từng trường và từng kỳ tuyển sinh, vì vậy cần đối chiếu thông báo chính thức trước khi nộp hồ sơ.</p>
      <h2>Tự kiểm tra trình độ miễn phí</h2>
      <p>Trên website SEIU, mục <a href="#topik-master">TOPIK Master</a> có đề Nghe và Đọc đủ 70 câu, chấm theo thang 200 điểm của TOPIK I. Làm thử một đề giúp bạn biết mình đang ở đâu trước khi chọn lớp.</p>
      ${contactCta}`,
  },
  {
    ...base,
    id: 'hoc-tieng-han-tai-can-tho',
    slug: 'hoc-tieng-han-tai-can-tho',
    title: 'Học Tiếng Hàn Cho Học Viên Cần Thơ: Học Ở Đâu, Học Thế Nào?',
    category: 'Học tiếng Hàn Blog',
    summary: 'Học viên Cần Thơ có thể kết hợp học trực tiếp tại SEIU Vị Thanh và tự luyện TOPIK trực tuyến. Hướng dẫn chọn hình thức học phù hợp.',
    coverImage: driveImage('1Lk0QHC-JGaC8GiRxwleUxt04uU5bUlyR'),
    coverImageAlt: 'Lớp tiếng Hàn SEIU dành cho học viên Cần Thơ và Hậu Giang',
    readTime: '5 phút đọc',
    publishedAt: '26/09/2026',
    tags: ['HọcTiếngHànCầnThơ', 'TiếngHànMiềnTây', 'SEIU'],
    focusKeyword: 'học tiếng Hàn Cần Thơ',
    seoTitle: 'Học Tiếng Hàn Cho Học Viên Cần Thơ | Tiếng Hàn SEIU',
    seoDescription: 'Học tiếng Hàn cho học viên Cần Thơ: lớp trực tiếp tại SEIU Vị Thanh cách Cần Thơ khoảng 60 km, kết hợp luyện TOPIK trực tuyến miễn phí.',
    contentHtml: `
      <p>Nhiều bạn ở Cần Thơ tìm nơi <strong>học tiếng Hàn</strong> với lộ trình rõ ràng và có người theo sát hồ sơ du học. SEIU đặt trụ sở tại Vị Thanh, Hậu Giang, cách trung tâm Cần Thơ khoảng 60 km, và hỗ trợ học viên khu vực Cần Thơ theo hai cách.</p>
      <h2>Cách 1: Học trực tiếp tại SEIU Vị Thanh</h2>
      <p>Phù hợp với học viên muốn được sửa phát âm trực tiếp và chuẩn bị hồ sơ du học. Lớp mới khai giảng mỗi tháng, sĩ số vừa đủ để giáo viên theo sát từng bạn. Hãy hỏi lịch học cụ thể để sắp xếp việc di chuyển.</p>
      <h2>Cách 2: Tự luyện trực tuyến, gặp tư vấn khi cần</h2>
      <p>Học viên bận hoặc ở xa có thể tự ôn bằng <a href="#topik-master">TOPIK Master</a> miễn phí trên website: đề Nghe và Đọc 70 câu, có giọng đọc và chấm điểm tự động. Khi cần chọn trường hay chuẩn bị hồ sơ, học viên liên hệ SEIU để được tư vấn.</p>
      <h2>Học viên Cần Thơ nên chuẩn bị gì?</h2>
      <ul><li>Xác định mục tiêu: giao tiếp, TOPIK hay du học.</li><li>Làm một đề thi thử để biết trình độ hiện tại.</li><li>Chọn khung giờ học ổn định ít nhất 3 buổi mỗi tuần.</li><li>Nếu đi du học, chuẩn bị học bạ, bằng tốt nghiệp và kế hoạch tài chính sớm.</li></ul>
      <h2>Vì sao lộ trình quan trọng hơn khoảng cách?</h2>
      <p>Tiếng Hàn cần học đều đặn. Một lộ trình có kiểm tra định kỳ và người sửa lỗi giúp tiết kiệm nhiều tháng so với tự học không định hướng.</p>
      ${contactCta}`,
  },
  {
    ...base,
    id: 'visa-d4-1-va-d2-khac-nhau',
    slug: 'visa-d4-1-va-d2-khac-nhau',
    title: 'Visa D4-1 Và D2 Khác Nhau Thế Nào? Chọn Hệ Du Học Hàn Phù Hợp',
    category: 'Du học Hàn Quốc',
    summary: 'So sánh visa D4-1 (học tiếng) và D2 (cao đẳng, đại học, sau đại học) để chọn hệ du học Hàn Quốc phù hợp với trình độ và mục tiêu.',
    coverImage: driveImage('1EyD3ciS-gm6cwblNIQTM9hU0zQ7Xi7r8'),
    coverImageAlt: 'Tư vấn visa D4-1 và D2 du học Hàn Quốc tại SEIU',
    readTime: '6 phút đọc',
    publishedAt: '25/09/2026',
    tags: ['VisaD41', 'VisaD2', 'DuHọcHànQuốc'],
    focusKeyword: 'visa D4-1 và D2',
    seoTitle: 'Visa D4-1 Và D2 Khác Nhau Thế Nào? | Du Học Hàn SEIU',
    seoDescription: 'So sánh visa D4-1 hệ tiếng và visa D2 hệ chuyên ngành khi du học Hàn Quốc: đối tượng, yêu cầu tiếng Hàn và lộ trình phù hợp.',
    contentHtml: `
      <p>Khi tìm hiểu du học Hàn Quốc, hai loại visa được nhắc nhiều nhất là <strong>visa D4-1 và D2</strong>. Chọn đúng hệ ngay từ đầu giúp học viên tiết kiệm thời gian và chi phí.</p>
      <h2>Visa D4-1 – Du học hệ tiếng</h2>
      <p>Dành cho người sang Hàn học tiếng tại viện ngôn ngữ của các trường đại học. Đây là lựa chọn phổ biến với học sinh vừa tốt nghiệp THPT và chưa có trình độ tiếng Hàn cao. Sau khi hoàn thành hệ tiếng, học viên có thể chuyển tiếp lên cao đẳng hoặc đại học nếu đáp ứng điều kiện.</p>
      <h2>Visa D2 – Du học hệ chuyên ngành</h2>
      <ul><li><strong>D2-1:</strong> cao đẳng.</li><li><strong>D2-2:</strong> đại học.</li><li><strong>D2-3, D2-4:</strong> thạc sĩ, tiến sĩ.</li></ul>
      <p>Hệ D2 thường yêu cầu năng lực tiếng Hàn (TOPIK) hoặc tiếng Anh theo quy định của từng trường và từng chương trình.</p>
      <h2>Nên chọn hệ nào?</h2>
      <p>Nếu chưa có TOPIK, D4-1 thường là bước khởi đầu hợp lý. Nếu đã có TOPIK cấp 3 trở lên và hồ sơ học tập tốt, học viên có thể cân nhắc nộp thẳng hệ D2. Điều kiện cụ thể thay đổi theo trường và theo kỳ tuyển sinh, nên cần được kiểm tra lại trên thông báo chính thức.</p>
      <h2>SEIU hỗ trợ gì?</h2>
      <p>SEIU giúp học viên đối chiếu hồ sơ với dữ liệu hơn 80 trường, luyện TOPIK và luyện phỏng vấn. Phí dịch vụ 75 triệu đồng chỉ thu sau khi học viên đậu visa, theo hợp đồng.</p>
      ${contactCta}`,
  },
  {
    ...base,
    id: 'ho-so-du-hoc-han-quoc-can-gi',
    slug: 'ho-so-du-hoc-han-quoc-can-gi',
    title: 'Hồ Sơ Du Học Hàn Quốc Cần Những Gì? Checklist Cho Học Sinh Miền Tây',
    category: 'Du học Hàn Quốc',
    summary: 'Danh sách giấy tờ thường cần khi làm hồ sơ du học Hàn Quốc và mốc thời gian nên bắt đầu chuẩn bị để không bị trễ kỳ nhập học.',
    coverImage: driveImage('1PVbNLZfHAKLg1vWLDOosTmdlG1q6vdom'),
    coverImageAlt: 'Chuẩn bị hồ sơ du học Hàn Quốc cùng SEIU',
    readTime: '6 phút đọc',
    publishedAt: '24/09/2026',
    tags: ['HồSơDuHọc', 'DuHọcHànQuốc', 'HậuGiang'],
    focusKeyword: 'hồ sơ du học Hàn Quốc',
    seoTitle: 'Hồ Sơ Du Học Hàn Quốc Cần Những Gì? Checklist Đầy Đủ',
    seoDescription: 'Checklist hồ sơ du học Hàn Quốc: giấy tờ học tập, nhân thân, tài chính, sức khỏe và mốc thời gian chuẩn bị. Tư vấn miễn phí tại SEIU Vị Thanh.',
    contentHtml: `
      <p>Chuẩn bị <strong>hồ sơ du học Hàn Quốc</strong> sớm và đủ là cách giảm rủi ro bị trễ kỳ nhập học. Dưới đây là danh sách giấy tờ thường gặp; yêu cầu chi tiết thay đổi theo trường, hệ học và thời điểm.</p>
      <h2>1. Giấy tờ học tập</h2>
      <ul><li>Bằng tốt nghiệp THPT, cao đẳng hoặc đại học.</li><li>Học bạ hoặc bảng điểm.</li><li>Chứng chỉ TOPIK hoặc chứng nhận đã học tiếng Hàn (nếu có).</li></ul>
      <h2>2. Giấy tờ nhân thân</h2>
      <ul><li>Hộ chiếu còn hạn.</li><li>Căn cước công dân, giấy khai sinh, giấy tờ chứng minh quan hệ gia đình.</li><li>Ảnh thẻ theo quy cách.</li></ul>
      <h2>3. Chứng minh tài chính</h2>
      <p>Thường gồm sổ tiết kiệm hoặc xác nhận số dư, giấy tờ thu nhập của người bảo lãnh. Mức yêu cầu và thời hạn gửi tiền do trường và cơ quan lãnh sự quy định.</p>
      <h2>4. Dịch thuật, hợp pháp hóa và sức khỏe</h2>
      <p>Nhiều giấy tờ cần dịch thuật công chứng và xác nhận theo quy định. Học viên cũng cần khám sức khỏe theo danh mục được yêu cầu.</p>
      <h2>Mốc thời gian gợi ý</h2>
      <ul><li><strong>Trước 6–9 tháng:</strong> học tiếng Hàn, chọn trường, chuẩn bị tài chính.</li><li><strong>Trước 3–5 tháng:</strong> hoàn thiện, dịch thuật và nộp hồ sơ.</li><li><strong>Sau khi có thư mời:</strong> luyện phỏng vấn và nộp hồ sơ visa.</li></ul>
      <p>Trong gói dịch vụ SEIU có hỗ trợ dịch thuật hồ sơ, lệ phí visa, khám sức khỏe và phí apply theo hợp đồng. Hãy liên hệ để nhận checklist chi tiết theo trường bạn chọn.</p>
      ${contactCta}`,
  },
  {
    ...base,
    id: 'chon-trung-tam-du-hoc-han-quoc-uy-tin',
    slug: 'chon-trung-tam-du-hoc-han-quoc-uy-tin',
    title: '7 Dấu Hiệu Chọn Trung Tâm Du Học Hàn Quốc Uy Tín, Tránh Mất Tiền Oan',
    category: 'Góc Thầy Bửu',
    summary: 'Những câu hỏi phụ huynh nên đặt ra trước khi ký hợp đồng du học Hàn Quốc để tránh phát sinh phí và cam kết không rõ ràng.',
    coverImage: driveImage('1yMqdh1Hfg6-aO0EsmPMTMqH8rcKBM2ws'),
    coverImageAlt: 'Phụ huynh tìm hiểu trung tâm du học Hàn Quốc uy tín',
    readTime: '7 phút đọc',
    publishedAt: '23/09/2026',
    tags: ['DuHọcUyTín', 'PhụHuynh', 'MinhBạch'],
    focusKeyword: 'trung tâm du học Hàn Quốc uy tín',
    seoTitle: '7 Dấu Hiệu Trung Tâm Du Học Hàn Quốc Uy Tín',
    seoDescription: 'Cách chọn trung tâm du học Hàn Quốc uy tín: giấy phép, hợp đồng, bảng phí rõ ràng, thời điểm thu phí và học viên thật. Lời khuyên từ Thầy Lê Trí Bửu.',
    contentHtml: `
      <p>Du học là khoản đầu tư lớn của cả gia đình. Trước khi chọn <strong>trung tâm du học Hàn Quốc uy tín</strong>, phụ huynh nên kiểm tra 7 điểm sau.</p>
      <h2>1. Có pháp nhân và giấy phép rõ ràng</h2>
      <p>Hỏi tên công ty, mã số doanh nghiệp, người đại diện và giấy tờ liên quan đến hoạt động tư vấn du học. Đơn vị uy tín sẵn sàng cho xem.</p>
      <h2>2. Hợp đồng bằng văn bản</h2>
      <p>Mọi khoản phí, quyền lợi và trường hợp hoàn phí phải được ghi trong hợp đồng, không chỉ hứa bằng lời.</p>
      <h2>3. Bảng phí tách từng khoản</h2>
      <p>Phí dịch vụ, học phí trường, ký túc xá, bảo hiểm và vé máy bay cần được tách riêng để gia đình so sánh.</p>
      <h2>4. Thời điểm thu phí hợp lý</h2>
      <p>Cẩn thận với nơi yêu cầu đóng toàn bộ phí dịch vụ trước khi có kết quả. Tại SEIU, phí dịch vụ 75 triệu đồng chỉ thu sau khi học viên đậu visa.</p>
      <h2>5. Không hứa "đậu 100%"</h2>
      <p>Kết quả visa do cơ quan lãnh sự quyết định. Lời hứa chắc chắn đậu là dấu hiệu cần cảnh giác.</p>
      <h2>6. Không ép chọn trường</h2>
      <p>Học viên nên được xem nhiều lựa chọn phù hợp với hồ sơ và ngân sách, thay vì bị đưa vào một trường duy nhất.</p>
      <h2>7. Có học viên thật để hỏi</h2>
      <p>Xin gặp hoặc nói chuyện với học viên đã sang Hàn. Trải nghiệm của họ là thông tin đáng tin nhất.</p>
      ${contactCta}`,
  },
  {
    ...base,
    id: 'co-nen-du-hoc-han-quoc-sau-lop-12',
    slug: 'co-nen-du-hoc-han-quoc-sau-lop-12',
    title: 'Có Nên Du Học Hàn Quốc Sau Lớp 12? Góc Nhìn Cho Phụ Huynh',
    category: 'Góc Thầy Bửu',
    summary: 'Ưu điểm, thách thức và những điều gia đình cần cân nhắc trước khi cho con du học Hàn Quốc ngay sau khi tốt nghiệp THPT.',
    coverImage: driveImage('1P9ndnQ5PPiXDcM4a8QcYwDdibRyV1j7W'),
    coverImageAlt: 'Phụ huynh và học sinh lớp 12 tìm hiểu du học Hàn Quốc',
    readTime: '6 phút đọc',
    publishedAt: '22/09/2026',
    tags: ['DuHọcSauLớp12', 'PhụHuynh', 'DuHọcHànQuốc'],
    focusKeyword: 'du học Hàn Quốc sau lớp 12',
    seoTitle: 'Có Nên Du Học Hàn Quốc Sau Lớp 12? | Tiếng Hàn SEIU',
    seoDescription: 'Du học Hàn Quốc sau lớp 12: ưu điểm, thách thức, chi phí và cách chuẩn bị. Học sinh lớp 12 đủ điều kiện được hỗ trợ học phí tiếng Hàn tại SEIU.',
    contentHtml: `
      <p>Nhiều phụ huynh hỏi: <strong>có nên cho con du học Hàn Quốc sau lớp 12</strong>? Câu trả lời phụ thuộc vào mục tiêu, tính tự lập của con và kế hoạch tài chính của gia đình.</p>
      <h2>Ưu điểm</h2>
      <ul><li>Bắt đầu sớm nên có thời gian học tiếng trước khi vào chuyên ngành.</li><li>Môi trường học tập và công nghệ hiện đại.</li><li>Có cơ hội học bổng khi đạt kết quả học tập và TOPIK tốt.</li></ul>
      <h2>Thách thức cần chuẩn bị</h2>
      <ul><li><strong>Ngôn ngữ:</strong> nếu chưa vững tiếng Hàn, con sẽ khó theo kịp bài học và cuộc sống.</li><li><strong>Tự lập:</strong> tự quản lý thời gian, chi tiêu và sức khỏe khi xa nhà.</li><li><strong>Tài chính:</strong> gia đình cần dự trù học phí, chỗ ở và sinh hoạt phí cho ít nhất năm đầu.</li></ul>
      <h2>Gợi ý lộ trình</h2>
      <p>Học tiếng Hàn từ lớp 11–12, đặt mục tiêu TOPIK I cấp 2 trước khi nộp hồ sơ, sau đó chọn hệ D4-1 hoặc D2 phù hợp. Gia đình nên nói chuyện thẳng thắn với con về lý do đi du học và kế hoạch sau khi tốt nghiệp.</p>
      <h2>Chính sách cho học sinh lớp 12</h2>
      <p>Học sinh lớp 12 đủ điều kiện được miễn học phí tiếng Hàn 1 năm đến ngày bay tại SEIU. Liên hệ để được kiểm tra điều kiện cụ thể.</p>
      ${contactCta}`,
  },
  {
    ...base,
    id: 'tu-hoc-bang-chu-cai-tieng-han-hangeul',
    slug: 'tu-hoc-bang-chu-cai-tieng-han-hangeul',
    title: 'Tự Học Bảng Chữ Cái Tiếng Hàn (Hangeul) Trong 7 Ngày',
    category: 'Học tiếng Hàn Blog',
    summary: 'Kế hoạch 7 ngày để đọc được Hangeul: nguyên âm, phụ âm, ghép chữ và patchim, kèm mẹo tránh lỗi phát âm hay gặp.',
    coverImage: driveImage('13yvodmbdBgfFSzZ-xEzKfAobRdExYjEx'),
    coverImageAlt: 'Học bảng chữ cái tiếng Hàn Hangeul tại SEIU',
    readTime: '7 phút đọc',
    publishedAt: '21/09/2026',
    tags: ['Hangeul', 'BảngChữCáiTiếngHàn', 'TựHọcTiếngHàn'],
    focusKeyword: 'bảng chữ cái tiếng Hàn',
    seoTitle: 'Tự Học Bảng Chữ Cái Tiếng Hàn (Hangeul) Trong 7 Ngày',
    seoDescription: 'Lộ trình 7 ngày học bảng chữ cái tiếng Hàn Hangeul cho người mới: nguyên âm, phụ âm, cách ghép chữ, patchim và mẹo phát âm.',
    contentHtml: `
      <p><strong>Bảng chữ cái tiếng Hàn</strong> (Hangeul – 한글) được thiết kế khoa học nên người mới có thể đọc được trong khoảng một tuần nếu học đúng thứ tự.</p>
      <h2>Ngày 1–2: Nguyên âm cơ bản</h2>
      <p>Học 10 nguyên âm cơ bản: ㅏ ㅑ ㅓ ㅕ ㅗ ㅛ ㅜ ㅠ ㅡ ㅣ. Mẹo: nét gạch ngắn thêm vào tạo ra âm có "y" (ㅏ → ㅑ).</p>
      <h2>Ngày 3: Phụ âm cơ bản</h2>
      <p>Học 14 phụ âm: ㄱ ㄴ ㄷ ㄹ ㅁ ㅂ ㅅ ㅇ ㅈ ㅊ ㅋ ㅌ ㅍ ㅎ. Lưu ý ㅇ không phát âm khi đứng đầu âm tiết.</p>
      <h2>Ngày 4: Ghép chữ</h2>
      <p>Mỗi âm tiết là một khối: phụ âm + nguyên âm, ví dụ ㄱ + ㅏ = 가, ㄴ + ㅜ = 누. Hãy tự ghép và đọc to 20 âm tiết mỗi ngày.</p>
      <h2>Ngày 5: Nguyên âm ghép và phụ âm căng</h2>
      <p>Nguyên âm ghép như ㅐ ㅔ ㅘ ㅝ ㅢ và phụ âm căng ㄲ ㄸ ㅃ ㅆ ㅉ. Người miền Tây hay đọc lẫn ㅓ và ㅗ, cần chú ý khẩu hình.</p>
      <h2>Ngày 6: Patchim (phụ âm cuối)</h2>
      <p>Ví dụ 한 (han), 국 (guk), 밥 (bap). Patchim quyết định việc nối âm, ví dụ 한국어 đọc là [한구거].</p>
      <h2>Ngày 7: Đọc từ và câu ngắn</h2>
      <p>Đọc các từ quen thuộc: 안녕하세요 (xin chào), 감사합니다 (cảm ơn), 학생 (học sinh), 베트남 (Việt Nam).</p>
      <p>Sau 7 ngày, hãy nhờ giáo viên kiểm tra phát âm. Sửa sớm dễ hơn nhiều so với sửa khi đã quen đọc sai. Bạn cũng có thể luyện phát âm bằng micro trong mục Học cùng AI trên website SEIU.</p>
      ${contactCta}`,
  },
  {
    ...base,
    id: 'cau-giao-tiep-tieng-han-co-ban',
    slug: 'cau-giao-tiep-tieng-han-co-ban',
    title: '30 Câu Giao Tiếp Tiếng Hàn Cơ Bản Dùng Mỗi Ngày',
    category: 'Học tiếng Hàn Blog',
    summary: '30 câu tiếng Hàn thông dụng khi chào hỏi, giới thiệu bản thân, mua sắm và đi lại, có phiên âm tham khảo và nghĩa tiếng Việt.',
    coverImage: driveImage('1Nyg8cmDs-J5o9FldvVSQpdN9P8tpCqQk'),
    coverImageAlt: 'Học viên SEIU luyện giao tiếp tiếng Hàn',
    readTime: '8 phút đọc',
    publishedAt: '20/09/2026',
    tags: ['GiaoTiếpTiếngHàn', 'TiếngHànCơBản', 'SEIU'],
    focusKeyword: 'câu giao tiếp tiếng Hàn cơ bản',
    seoTitle: '30 Câu Giao Tiếp Tiếng Hàn Cơ Bản Dùng Mỗi Ngày',
    seoDescription: '30 câu giao tiếp tiếng Hàn cơ bản: chào hỏi, giới thiệu bản thân, mua sắm, đi lại, kèm phiên âm và nghĩa tiếng Việt. Học cùng SEIU Vị Thanh.',
    contentHtml: `
      <p>Học thuộc các <strong>câu giao tiếp tiếng Hàn cơ bản</strong> giúp bạn tự tin ngay từ những tuần đầu. Phiên âm chỉ để tham khảo; hãy nghe người bản xứ để phát âm đúng.</p>
      <h2>Chào hỏi</h2>
      <ul>
        <li>안녕하세요 (an-nyeong-ha-se-yo) – Xin chào</li>
        <li>감사합니다 (gam-sa-ham-ni-da) – Cảm ơn</li>
        <li>죄송합니다 (joe-song-ham-ni-da) – Xin lỗi</li>
        <li>괜찮아요 (gwaen-chan-a-yo) – Không sao</li>
        <li>안녕히 가세요 (an-nyeong-hi ga-se-yo) – Tạm biệt (người đi)</li>
        <li>안녕히 계세요 (an-nyeong-hi gye-se-yo) – Tạm biệt (người ở lại)</li>
      </ul>
      <h2>Giới thiệu bản thân</h2>
      <ul>
        <li>처음 뵙겠습니다 – Rất hân hạnh được gặp</li>
        <li>제 이름은 ○○입니다 – Tên tôi là ○○</li>
        <li>저는 베트남 사람입니다 – Tôi là người Việt Nam</li>
        <li>저는 학생입니다 – Tôi là học sinh</li>
        <li>저는 베트남에서 왔어요 – Tôi đến từ Việt Nam</li>
        <li>만나서 반갑습니다 – Rất vui được gặp bạn</li>
      </ul>
      <h2>Trên lớp</h2>
      <ul>
        <li>다시 한번 말씀해 주세요 – Xin nói lại một lần nữa</li>
        <li>천천히 말씀해 주세요 – Xin nói chậm lại</li>
        <li>잘 모르겠어요 – Tôi không hiểu lắm</li>
        <li>질문이 있어요 – Tôi có câu hỏi</li>
        <li>이거 한국어로 뭐예요? – Cái này tiếng Hàn là gì?</li>
        <li>알겠습니다 – Tôi hiểu rồi</li>
      </ul>
      <h2>Mua sắm, ăn uống</h2>
      <ul>
        <li>이거 얼마예요? – Cái này bao nhiêu tiền?</li>
        <li>너무 비싸요 – Đắt quá</li>
        <li>이거 주세요 – Cho tôi cái này</li>
        <li>물 주세요 – Cho tôi nước</li>
        <li>맛있어요 – Ngon quá</li>
        <li>계산해 주세요 – Tính tiền giúp tôi</li>
      </ul>
      <h2>Đi lại</h2>
      <ul>
        <li>화장실이 어디예요? – Nhà vệ sinh ở đâu?</li>
        <li>지하철역이 어디예요? – Ga tàu điện ngầm ở đâu?</li>
        <li>여기서 멀어요? – Có xa đây không?</li>
        <li>여기 세워 주세요 – Dừng ở đây giúp tôi</li>
        <li>도와주세요 – Giúp tôi với</li>
        <li>한국어를 조금 할 수 있어요 – Tôi nói được một chút tiếng Hàn</li>
      </ul>
      <p>Mẹo: mỗi ngày chọn 5 câu, đọc to theo kiểu shadowing và tự đặt câu mới bằng cách thay từ.</p>
      ${contactCta}`,
  },
  {
    ...base,
    id: 'lam-them-khi-du-hoc-han-quoc',
    slug: 'lam-them-khi-du-hoc-han-quoc',
    title: 'Làm Thêm Khi Du Học Hàn Quốc: Những Điều Cần Biết Trước Khi Đi',
    category: 'Đời sống du học sinh',
    summary: 'Du học sinh được làm thêm khi nào, cần giấy phép gì và vì sao không nên tính việc làm thêm là nguồn chi trả chính cho du học.',
    coverImage: driveImage('1EMwrhMLZesOHwFU6YbZ-evydkSAOER_S'),
    coverImageAlt: 'Đời sống và làm thêm của du học sinh Hàn Quốc',
    readTime: '6 phút đọc',
    publishedAt: '19/09/2026',
    tags: ['LàmThêmHànQuốc', 'ĐờiSốngDuHọcSinh', 'DuHọcHànQuốc'],
    focusKeyword: 'làm thêm khi du học Hàn Quốc',
    seoTitle: 'Làm Thêm Khi Du Học Hàn Quốc: Quy Định Cần Biết',
    seoDescription: 'Làm thêm khi du học Hàn Quốc: điều kiện, giấy phép làm thêm, giới hạn giờ theo TOPIK và lưu ý để không vi phạm quy định visa.',
    contentHtml: `
      <p><strong>Làm thêm khi du học Hàn Quốc</strong> giúp du học sinh có thêm thu nhập và trải nghiệm, nhưng phải tuân thủ đúng quy định để không ảnh hưởng đến visa.</p>
      <h2>Điều kiện chung</h2>
      <ul><li>Du học sinh cần xin <strong>giấy phép làm thêm</strong> trước khi đi làm; làm không phép có thể bị xử phạt và ảnh hưởng đến việc gia hạn visa.</li><li>Hệ tiếng (D4-1) thường chỉ được xin làm thêm sau một thời gian học nhất định.</li><li>Số giờ được làm mỗi tuần phụ thuộc hệ học, năm học, trình độ TOPIK và kết quả chuyên cần.</li></ul>
      <p>Quy định có thể thay đổi, du học sinh nên kiểm tra thông tin mới nhất trên cổng Hi Korea hoặc hỏi phòng quốc tế của trường.</p>
      <h2>Công việc phổ biến</h2>
      <p>Phục vụ nhà hàng, cửa hàng tiện lợi, quán cà phê, trợ giảng tiếng Việt, phiên dịch. Có TOPIK càng cao, lựa chọn càng rộng và mức lương càng tốt.</p>
      <h2>Không nên dựa vào làm thêm để trả chi phí chính</h2>
      <p>Gia đình cần chuẩn bị tài chính cho học phí và sinh hoạt phí ít nhất năm đầu. Làm thêm quá nhiều dễ ảnh hưởng chuyên cần và điểm số, là những yếu tố quan trọng khi gia hạn visa.</p>
      <h2>Chuẩn bị từ Việt Nam</h2>
      <p>Học tốt tiếng Hàn trước khi đi là cách tăng cơ hội tìm việc làm thêm phù hợp. Đạt TOPIK trước khi bay cũng giúp thích nghi nhanh hơn.</p>
      ${contactCta}`,
  },
  {
    ...base,
    id: 'hoc-bong-du-hoc-han-quoc',
    slug: 'hoc-bong-du-hoc-han-quoc',
    title: 'Học Bổng Du Học Hàn Quốc: Các Loại Phổ Biến Và Cách Tăng Cơ Hội',
    category: 'Chính sách & Học bổng',
    summary: 'Tổng quan các loại học bổng du học Hàn Quốc từ trường, theo TOPIK và theo kết quả học tập, cùng cách chuẩn bị hồ sơ để tăng cơ hội.',
    coverImage: driveImage('1Q3J3p-bG5yRL6mneV9y5SJgpOXjBgFYV'),
    coverImageAlt: 'Học bổng du học Hàn Quốc cho học viên SEIU',
    readTime: '6 phút đọc',
    publishedAt: '18/09/2026',
    tags: ['HọcBổngHànQuốc', 'DuHọcHànQuốc', 'TOPIK'],
    focusKeyword: 'học bổng du học Hàn Quốc',
    seoTitle: 'Học Bổng Du Học Hàn Quốc: Loại Nào, Cần Gì?',
    seoDescription: 'Học bổng du học Hàn Quốc: học bổng đầu vào, học bổng theo TOPIK và GPA, học bổng chính phủ. Cách chuẩn bị hồ sơ để tăng cơ hội cùng SEIU.',
    contentHtml: `
      <p><strong>Học bổng du học Hàn Quốc</strong> giúp giảm đáng kể chi phí. Mức học bổng phổ biến dao động từ 30% đến 100% học phí tùy trường, kết quả học tập và TOPIK.</p>
      <h2>Các loại học bổng phổ biến</h2>
      <h3>1. Học bổng đầu vào của trường</h3>
      <p>Xét theo học bạ, GPA và TOPIK khi nhập học. Đây là loại dễ tiếp cận nhất.</p>
      <h3>2. Học bổng theo TOPIK</h3>
      <p>Nhiều trường giảm học phí theo cấp TOPIK đạt được. TOPIK càng cao, mức giảm thường càng lớn.</p>
      <h3>3. Học bổng theo kết quả từng kỳ</h3>
      <p>Xét theo điểm trung bình học kỳ trước, khuyến khích du học sinh học đều.</p>
      <h3>4. Học bổng chính phủ Hàn Quốc</h3>
      <p>Tiêu biểu là chương trình GKS, cạnh tranh cao, yêu cầu hồ sơ học tập xuất sắc và kế hoạch học tập thuyết phục.</p>
      <h2>Cách tăng cơ hội nhận học bổng</h2>
      <ul><li>Giữ GPA tốt từ THPT hoặc đại học.</li><li>Đạt TOPIK càng sớm càng tốt; mỗi cấp tăng thêm đều có giá trị.</li><li>Viết kế hoạch học tập rõ ràng, liên quan đến ngành chọn.</li><li>Nộp hồ sơ sớm vì nhiều suất học bổng có giới hạn.</li></ul>
      <p>Dùng công cụ <strong>Kiểm tra học bổng</strong> trên website SEIU để ước tính khả năng nhận học bổng theo GPA và TOPIK của bạn, sau đó liên hệ để được tư vấn chi tiết.</p>
      ${contactCta}`,
  },
];
