export const SEO_ARTICLE_SEED_VERSION = 'seiu-seo-v1-20260823';

export const driveImage = (id: string) => `https://drive.google.com/thumbnail?id=${id}&sz=w1600`;

export const contactCta = `
  <aside class="my-8 rounded-2xl border border-red-200 bg-red-50 p-5">
    <h2>Nhận tư vấn trực tiếp tại SEIU Vị Thanh</h2>
    <p>SEIU khai giảng lớp mới mỗi tháng. Học viên có thể liên hệ để được tư vấn lịch học, lộ trình TOPIK hoặc hồ sơ du học phù hợp với mục tiêu cá nhân.</p>
    <p><strong>Địa chỉ:</strong> 197N Trần Hưng Đạo, Phường 5, TP. Vị Thanh, Hậu Giang<br />
    <strong>Hotline/Zalo:</strong> <a href="tel:0972249450">0972 249 450</a><br />
    <strong>Email:</strong> <a href="mailto:capseiu@gmail.com">capseiu@gmail.com</a><br />
    <strong>Giờ làm việc:</strong> 08:00–20:00, Thứ 2 đến Thứ 7.</p>
  </aside>`;

export const author = 'Thầy Lê Trí Bửu';
export const authorRole = 'Giám đốc SEIU · Cử nhân Hàn Quốc học';

export const SEO_INITIAL_ARTICLES = [
  {
    seedVersion: SEO_ARTICLE_SEED_VERSION,
    id: 'hoc-tieng-han-tai-vi-thanh-hau-giang',
    slug: 'hoc-tieng-han-tai-vi-thanh-hau-giang',
    title: 'Học Tiếng Hàn Tại Vị Thanh, Hậu Giang: Lộ Trình Cho Người Mới',
    category: 'Học tiếng Hàn Blog',
    summary: 'Lộ trình học tiếng Hàn tại Vị Thanh từ Hangeul, giao tiếp nền tảng đến TOPIK, phù hợp cho người mới, học viên du học, XKLĐ và kết hôn.',
    coverImage: driveImage('1P9ndnQ5PPiXDcM4a8QcYwDdibRyV1j7W'),
    coverImageAlt: 'Học tiếng Hàn tại SEIU Vị Thanh Hậu Giang',
    author,
    authorRole,
    readTime: '6 phút đọc',
    publishedAt: '23/08/2026',
    tags: ['HọcTiếngHànVịThanh', 'TiếngHànHậuGiang', 'SEIU'],
    isFeatured: true,
    focusKeyword: 'học tiếng Hàn tại Vị Thanh Hậu Giang',
    seoTitle: 'Học Tiếng Hàn Tại Vị Thanh Hậu Giang | SEIU',
    seoDescription: 'Học tiếng Hàn tại Vị Thanh, Hậu Giang theo lộ trình từ Hangeul đến TOPIK. SEIU khai giảng lớp mới mỗi tháng. Hotline 0972 249 450.',
    contentHtml: `
      <p>Nếu đang tìm nơi <strong>học tiếng Hàn tại Vị Thanh, Hậu Giang</strong>, điều quan trọng nhất không phải học thật nhiều ngay từ đầu mà là chọn đúng trình tự. Một lộ trình rõ giúp người mới phát âm đúng, hiểu cấu trúc câu và biết mình cần học gì cho mục tiêu giao tiếp, TOPIK hay du học.</p>
      <h2>Lộ trình tiếng Hàn cho người bắt đầu từ số 0</h2>
      <h3>Giai đoạn 1: Hangeul và phát âm</h3>
      <p>Học viên cần nhận diện nguyên âm, phụ âm, quy tắc ghép âm và tập đọc thành tiếng. Đây là nền móng cho kỹ năng nghe và nói; nếu đọc sai từ đầu, việc sửa nối âm về sau sẽ khó hơn.</p>
      <h3>Giai đoạn 2: Câu giao tiếp nền tảng</h3>
      <p>Thay vì chỉ chép công thức, hãy dùng mỗi cấu trúc để tự đặt câu về bản thân, gia đình, trường học và công việc. Cách học này biến ngữ pháp thành phản xạ có thể dùng trong đời sống.</p>
      <h3>Giai đoạn 3: Chọn hướng học chuyên biệt</h3>
      <ul><li><strong>TOPIK:</strong> luyện từ vựng, nghe và đọc theo cấu trúc đề.</li><li><strong>Du học:</strong> bổ sung giới thiệu bản thân, kế hoạch học tập và phỏng vấn.</li><li><strong>XKLĐ hoặc kết hôn:</strong> ưu tiên hội thoại tình huống, nghe hiểu và phát âm rõ.</li></ul>
      <h2>Cách chọn lớp tiếng Hàn phù hợp tại Vị Thanh</h2>
      <p>Trước khi đăng ký, học viên nên xác định mục tiêu, khung giờ có thể học và thời hạn cần đạt. SEIU có lớp mới mỗi tháng; lịch cụ thể và học phí được tư vấn theo lớp đang mở để tránh đăng thông tin đã hết hạn.</p>
      <p>Thầy Lê Trí Bửu là Giám đốc SEIU, Cử nhân Hàn Quốc học và có 7 năm kinh nghiệm trong lĩnh vực đào tạo tiếng Hàn, tư vấn du học. Việc theo dõi tiến độ nên dựa trên khả năng đọc, nghe hiểu và sử dụng câu của từng học viên thay vì chỉ dựa vào số buổi đã học.</p>
      ${contactCta}`,
  },
  {
    seedVersion: SEO_ARTICLE_SEED_VERSION,
    id: 'trung-tam-tieng-han-seiu-vi-thanh',
    slug: 'trung-tam-tieng-han-seiu-vi-thanh',
    title: 'Trung Tâm Tiếng Hàn SEIU Vị Thanh Có Những Chương Trình Nào?',
    category: 'Góc Thầy Bửu',
    summary: 'Tổng quan các chương trình tiếng Hàn, TOPIK, du học, XKLĐ và kết hôn tại SEIU Vị Thanh để học viên chọn đúng mục tiêu.',
    coverImage: driveImage('1EMwrhMLZesOHwFU6YbZ-evydkSAOER_S'),
    coverImageAlt: 'Trung tâm tiếng Hàn SEIU tại Vị Thanh Hậu Giang',
    author,
    authorRole,
    readTime: '5 phút đọc',
    publishedAt: '22/08/2026',
    tags: ['TrungTâmTiếngHàn', 'SEIUVịThanh', 'HậuGiang'],
    isFeatured: true,
    focusKeyword: 'trung tâm tiếng Hàn Vị Thanh',
    seoTitle: 'Trung Tâm Tiếng Hàn SEIU Vị Thanh, Hậu Giang',
    seoDescription: 'Tìm hiểu chương trình tiếng Hàn, TOPIK, du học, XKLĐ và kết hôn tại SEIU Vị Thanh. Lớp mới mỗi tháng, tư vấn theo mục tiêu.',
    contentHtml: `
      <p>Một <strong>trung tâm tiếng Hàn tại Vị Thanh</strong> nên giúp học viên trả lời ba câu hỏi: học để làm gì, cần đạt mức nào và có bao nhiêu thời gian. Từ mục tiêu đó, chương trình mới được chọn đúng.</p>
      <h2>Các hướng học hiện có tại SEIU</h2>
      <ul><li><strong>Tiếng Hàn nền tảng:</strong> dành cho người chưa biết Hangeul hoặc cần học lại căn bản.</li><li><strong>Luyện thi TOPIK:</strong> tập trung cấu trúc đề nghe–đọc, chiến lược thời gian và sửa lỗi.</li><li><strong>Tiếng Hàn du học:</strong> kết hợp nền tảng, giới thiệu bản thân, kế hoạch học tập và luyện phỏng vấn.</li><li><strong>Tiếng Hàn cho XKLĐ:</strong> tăng cường từ vựng công việc và giao tiếp thực tế.</li><li><strong>Tiếng Hàn cho kết hôn:</strong> ưu tiên hội thoại gia đình, đời sống và văn hóa ứng xử.</li></ul>
      <h2>Học phí và lịch học được tư vấn thế nào?</h2>
      <p>SEIU mở lớp mới mỗi tháng. Học phí được xây dựng theo hướng cạnh tranh và được tư vấn dựa trên chương trình, thời lượng, hình thức học và lớp đang tuyển sinh. Cách công bố này giúp học viên nhận đúng lịch đang còn chỗ thay vì dựa vào bảng giá cũ.</p>
      <h2>Ai phụ trách chuyên môn?</h2>
      <p>Thầy Lê Trí Bửu, Giám đốc SEIU, là Cử nhân Hàn Quốc học với 7 năm kinh nghiệm trong lĩnh vực đào tạo tiếng Hàn và tư vấn du học. Học viên nên trao đổi rõ mục tiêu đầu vào để được đề xuất lộ trình phù hợp.</p>
      <h2>Đăng ký học cần chuẩn bị gì?</h2>
      <p>Hãy chuẩn bị mục tiêu, thời gian dự kiến, khung giờ rảnh và trình độ hiện tại. Người đã từng học có thể làm bài kiểm tra để tránh học lại nội dung đã vững.</p>
      ${contactCta}`,
  },
  {
    seedVersion: SEO_ARTICLE_SEED_VERSION,
    id: 'luyen-thi-topik-tai-vi-thanh',
    slug: 'luyen-thi-topik-tai-vi-thanh',
    title: 'Luyện Thi TOPIK Tại Vị Thanh: Cách Ôn Nghe Và Đọc Hiệu Quả',
    category: 'Ngữ pháp & Luyện thi TOPIK',
    summary: 'Hướng dẫn xây kế hoạch luyện TOPIK tại Vị Thanh với bài nghe, bài đọc, cách ghi lỗi và thi thử theo thang điểm đề thật.',
    coverImage: driveImage('1Nyg8cmDs-J5o9FldvVSQpdN9P8tpCqQk'),
    coverImageAlt: 'Luyện thi TOPIK tại SEIU Vị Thanh',
    author,
    authorRole,
    readTime: '7 phút đọc',
    publishedAt: '21/08/2026',
    tags: ['LuyệnTOPIKVịThanh', 'TOPIK', 'TiếngHànHậuGiang'],
    isFeatured: false,
    focusKeyword: 'luyện thi TOPIK tại Vị Thanh',
    seoTitle: 'Luyện Thi TOPIK Tại Vị Thanh: Nghe & Đọc | SEIU',
    seoDescription: 'Kế hoạch luyện thi TOPIK tại Vị Thanh với đề nghe, đọc, ghi lỗi và thi thử theo thang điểm. Ôn miễn phí tại TOPIK Master SEIU.',
    contentHtml: `
      <p><strong>Luyện thi TOPIK tại Vị Thanh</strong> hiệu quả cần kết hợp kiến thức ngôn ngữ và kỹ năng làm đề. Chỉ làm thật nhiều câu nhưng không phân tích lỗi sẽ khó cải thiện ổn định.</p>
      <h2>Bước 1: Xác định trình độ và mục tiêu điểm</h2>
      <p>Hãy làm một bài thi thử trong thời gian quy định. Ghi riêng số câu đúng và điểm của phần nghe, phần đọc. Mục tiêu điểm nên gắn với kỳ thi dự kiến và yêu cầu hồ sơ thực tế.</p>
      <h2>Bước 2: Luyện nghe theo cụm câu</h2>
      <p>Với mỗi bài, học viên nên nghe một lượt như thi thật, kiểm tra đáp án, đọc lại transcript và nghe lần nữa để nhận diện từ khóa. Đoạn hội thoại có nam và nữ cần được phân biệt vai nói, mục đích và thông tin thay đổi.</p>
      <h2>Bước 3: Luyện đọc theo dạng</h2>
      <p>Chia bài đọc thành dạng chọn từ, nối câu, tìm ý chính và đọc đoạn văn theo cụm. Khi sai, cần ghi nguyên nhân: thiếu từ vựng, hiểu sai ngữ pháp hay phân bổ thời gian chưa hợp lý.</p>
      <h2>Bước 4: Thi thử và xem lại bảng thành tích</h2>
      <p>TOPIK Master của SEIU cung cấp đề nghe–đọc và lưu kết quả để học viên theo dõi tiến bộ. Bảng thành tích chỉ nên dùng làm động lực; giá trị chính nằm ở việc biết phần nào đang mất điểm.</p>
      <h2>Lịch ôn gợi ý trong một tuần</h2>
      <ul><li>Hai buổi nghe theo cụm câu.</li><li>Hai buổi đọc theo dạng.</li><li>Một buổi ôn từ và ngữ pháp từ lỗi sai.</li><li>Một bài thi thử có bấm giờ.</li></ul>
      ${contactCta}`,
  },
  {
    seedVersion: SEO_ARTICLE_SEED_VERSION,
    id: 'hoc-tieng-han-du-hoc-khi-nao',
    slug: 'hoc-tieng-han-du-hoc-khi-nao',
    title: 'Học Tiếng Hàn Du Học Nên Bắt Đầu Khi Nào?',
    category: 'Du học Hàn Quốc',
    summary: 'Mốc chuẩn bị tiếng Hàn cho học viên có kế hoạch du học, từ nền tảng, phỏng vấn đến việc chọn trường và theo dõi Invoice.',
    coverImage: driveImage('13yvodmbdBgfFSzZ-xEzKfAobRdExYjEx'),
    coverImageAlt: 'Học tiếng Hàn chuẩn bị du học tại SEIU',
    author,
    authorRole,
    readTime: '6 phút đọc',
    publishedAt: '20/08/2026',
    tags: ['HọcTiếngHànDuHọc', 'DuHọcHànQuốc', 'SEIU'],
    isFeatured: false,
    focusKeyword: 'học tiếng Hàn du học',
    seoTitle: 'Học Tiếng Hàn Du Học Nên Bắt Đầu Khi Nào?',
    seoDescription: 'Tìm hiểu thời điểm nên học tiếng Hàn để chuẩn bị du học, phỏng vấn và chọn trường. SEIU tư vấn lộ trình tại Vị Thanh, Hậu Giang.',
    contentHtml: `
      <p><strong>Học tiếng Hàn du học</strong> nên bắt đầu càng sớm càng tốt sau khi đã xác định mục tiêu, nhưng không cần học vội theo kiểu ghi nhớ ngắn hạn. Một nền tảng đủ chắc giúp học viên phỏng vấn tự tin và thích nghi tốt hơn khi nhập học.</p>
      <h2>Ba mốc chuẩn bị quan trọng</h2>
      <h3>Trước khi chọn trường</h3><p>Học viên làm quen Hangeul, thông tin cá nhân, gia đình và mục tiêu. Đồng thời cần đánh giá hồ sơ học tập, khoảng trống học tập và khả năng tài chính.</p>
      <h3>Trong thời gian chuẩn bị hồ sơ</h3><p>Tập trả lời bằng tiếng Hàn về lý do chọn Hàn Quốc, chọn trường, ngành học, kế hoạch học tập và dự định sau tốt nghiệp. Câu trả lời phải đúng thông tin thật của hồ sơ.</p>
      <h3>Trước phỏng vấn và nhập học</h3><p>Luyện nghe câu hỏi ở tốc độ tự nhiên, trả lời rõ, ngắn và nhất quán. Tiếp tục học từ vựng sinh hoạt để sẵn sàng cho lớp học và đời sống tại Hàn Quốc.</p>
      <h2>Không nên chỉ học thuộc một bộ câu trả lời</h2>
      <p>Người phỏng vấn có thể đổi cách hỏi hoặc hỏi tiếp dựa trên câu trả lời trước. Vì vậy, học viên cần hiểu nội dung mình nói, phát âm rõ và biết diễn đạt cùng một ý theo nhiều cách đơn giản.</p>
      <h2>SEIU hỗ trợ học viên tại Vị Thanh ra sao?</h2>
      <p>SEIU kết hợp chương trình tiếng Hàn, luyện TOPIK, luyện phỏng vấn và công cụ chọn trường. Lịch lớp được mở mỗi tháng; học viên liên hệ để nhận lịch và mức học phí đang áp dụng.</p>
      ${contactCta}`,
  },
  {
    seedVersion: SEO_ARTICLE_SEED_VERSION,
    id: 'chi-phi-du-hoc-han-quoc-seiu',
    slug: 'chi-phi-du-hoc-han-quoc-seiu',
    title: 'Dự Toán Chi Phí Du Học Hàn Quốc: 3 Khoản Cần Xem Tại SEIU',
    category: 'Du học Hàn Quốc',
    summary: 'Cách dùng công cụ SEIU để dự toán ba khoản: học phí tại Việt Nam 7 triệu, Invoice học phí trường và phí dịch vụ 75 triệu sau Visa.',
    coverImage: driveImage('1Lk0QHC-JGaC8GiRxwleUxt04uU5bUlyR'),
    coverImageAlt: 'Tư vấn dự toán chi phí du học Hàn Quốc tại SEIU',
    author,
    authorRole,
    readTime: '6 phút đọc',
    publishedAt: '19/08/2026',
    tags: ['ChiPhíDuHọcHàn', 'InvoiceTrườngHàn', 'SEIU'],
    isFeatured: false,
    focusKeyword: 'chi phí du học Hàn Quốc tại Hậu Giang',
    seoTitle: 'Dự Toán Chi Phí Du Học Hàn Quốc Tại SEIU',
    seoDescription: 'Dự toán 3 khoản tại SEIU: học phí Việt Nam 7 triệu, Invoice học phí trường và phí dịch vụ 75 triệu chỉ thu sau khi đậu Visa.',
    contentHtml: `
      <p>Khi tìm hiểu <strong>chi phí du học Hàn Quốc</strong>, phụ huynh nên tách rõ khoản nào là học phí trong nước, khoản nào đóng theo Invoice của trường và khoản nào là phí dịch vụ.</p>
      <h2>Ba khoản được tính trong công cụ SEIU</h2>
      <ol><li><strong>Học phí tại Việt Nam:</strong> 7.000.000 đồng.</li><li><strong>Invoice học phí trường Hàn Quốc:</strong> lấy theo dữ liệu của trường đã chọn và quy đổi theo tỷ giá dự kiến.</li><li><strong>Phí dịch vụ SEIU:</strong> 75.000.000 đồng, chỉ thu khi học viên đậu Visa.</li></ol>
      <p>Công cụ không cộng ký túc xá, bảo hiểm hoặc các khoản khác vào tổng dự toán này. Nếu trường chưa có số Invoice học phí rõ ràng trong dữ liệu, hệ thống sẽ yêu cầu liên hệ SEIU thay vì tự ước tính.</p>
      <h2>Vì sao Invoice của mỗi trường khác nhau?</h2>
      <p>Mức học phí phụ thuộc trường, chương trình và kỳ nhập học. Dữ liệu trực tuyến có thể thay đổi, vì vậy phụ huynh nên đối chiếu Invoice chính thức trước khi thanh toán.</p>
      <h2>Tỷ giá chỉ là con số dự kiến</h2>
      <p>Khoản KRW được quy đổi sang VND theo tỷ giá hiển thị trong công cụ. Số tiền thực tế tại thời điểm chuyển khoản có thể khác; bảng dự toán không thay thế Invoice hoặc xác nhận thanh toán của trường.</p>
      <h2>Cách xem dự toán</h2>
      <p>Chọn khu vực, tìm trường mong muốn, sau đó nhập họ tên và số điện thoại. Thông tin này được gửi về hệ thống đăng ký để SEIU có thể tư vấn đúng trường đã chọn.</p>
      ${contactCta}`,
  },
  {
    seedVersion: SEO_ARTICLE_SEED_VERSION,
    id: 'phi-dich-vu-du-hoc-75-trieu-sau-visa',
    slug: 'phi-dich-vu-du-hoc-75-trieu-sau-visa',
    title: 'Phí Dịch Vụ Du Học 75 Triệu: SEIU Thu Khi Nào?',
    category: 'Chính sách & Học bổng',
    summary: 'Giải thích chính sách phí dịch vụ 75 triệu chỉ thu sau khi học viên đậu Visa và nguyên tắc không phát sinh phí dịch vụ ngoài hợp đồng.',
    coverImage: driveImage('1EyD3ciS-gm6cwblNIQTM9hU0zQ7Xi7r8'),
    coverImageAlt: 'Tư vấn chính sách phí dịch vụ du học SEIU',
    author,
    authorRole,
    readTime: '5 phút đọc',
    publishedAt: '18/08/2026',
    tags: ['PhíDịchVụDuHọc', 'VisaHànQuốc', 'MinhBạchChiPhí'],
    isFeatured: false,
    focusKeyword: 'phí dịch vụ du học Hàn Quốc 75 triệu',
    seoTitle: 'Phí Dịch Vụ Du Học 75 Triệu Thu Sau Visa | SEIU',
    seoDescription: 'SEIU thu phí dịch vụ 75 triệu khi học viên đậu Visa và không phát sinh phí dịch vụ ngoài hợp đồng. Xem nguyên tắc minh bạch chi phí.',
    contentHtml: `
      <p>SEIU áp dụng mức <strong>phí dịch vụ du học 75 triệu đồng</strong> và thời điểm thanh toán là sau khi học viên đậu Visa. Chính sách này cần được hiểu đúng và tách biệt khỏi Invoice học phí do trường Hàn Quốc phát hành.</p>
      <h2>Khi nào học viên thanh toán phí dịch vụ?</h2>
      <p>Phí dịch vụ SEIU được thu khi học viên đã đậu Visa. Trước khi ký, phạm vi công việc, thời điểm thanh toán và trách nhiệm của các bên cần được thể hiện trong hợp đồng.</p>
      <h2>“Không phát sinh” nghĩa là gì?</h2>
      <p>SEIU không phát sinh thêm phí dịch vụ ngoài phạm vi đã thống nhất trong hợp đồng. Học phí trường là khoản độc lập, thể hiện trên Invoice trường và không được xem là phí dịch vụ của SEIU.</p>
      <h2>Ba câu hỏi phụ huynh nên kiểm tra</h2>
      <ul><li>Khoản tiền này nộp cho SEIU hay nộp trực tiếp theo Invoice trường?</li><li>Thời điểm thanh toán được ghi thế nào trong hợp đồng?</li><li>Nội dung hỗ trợ và trường hợp phát sinh thay đổi hồ sơ được xử lý ra sao?</li></ul>
      <p>Việc đọc kỹ chứng từ và lưu lại bản đối chiếu giúp phụ huynh theo dõi hồ sơ rõ ràng. Nếu thông tin kỳ tuyển sinh thay đổi, học viên nên yêu cầu cập nhật bằng văn bản.</p>
      ${contactCta}`,
  },
  {
    seedVersion: SEO_ARTICLE_SEED_VERSION,
    id: 'luyen-phong-van-visa-han-quoc',
    slug: 'luyen-phong-van-visa-han-quoc',
    title: 'Luyện Phỏng Vấn Visa Hàn Quốc: 9 Chủ Đề Cần Chuẩn Bị',
    category: 'Du học Hàn Quốc',
    summary: 'Danh sách 9 chủ đề phỏng vấn thường cần chuẩn bị và cách luyện trả lời tiếng Hàn rõ ràng, nhất quán với hồ sơ thật.',
    coverImage: driveImage('1PVbNLZfHAKLg1vWLDOosTmdlG1q6vdom'),
    coverImageAlt: 'Luyện phỏng vấn Visa Hàn Quốc tại SEIU Vị Thanh',
    author,
    authorRole,
    readTime: '7 phút đọc',
    publishedAt: '17/08/2026',
    tags: ['PhỏngVấnVisaHàn', 'TiếngHànDuHọc', 'SEIU'],
    isFeatured: false,
    focusKeyword: 'luyện phỏng vấn Visa Hàn Quốc',
    seoTitle: 'Luyện Phỏng Vấn Visa Hàn Quốc: 9 Chủ Đề',
    seoDescription: 'Chuẩn bị 9 chủ đề phỏng vấn Visa Hàn Quốc: bản thân, lý do đi Hàn, trường, ngành, kế hoạch, gia đình, tài chính và tiếng Hàn.',
    contentHtml: `
      <p><strong>Luyện phỏng vấn Visa Hàn Quốc</strong> không phải học thuộc một đoạn thật dài. Mục tiêu là nghe đúng câu hỏi, trả lời ngắn gọn và đảm bảo mọi thông tin thống nhất với hồ sơ.</p>
      <h2>9 chủ đề nên luyện trước</h2>
      <ol><li>자기소개 – giới thiệu bản thân.</li><li>한국에 가는 이유 – lý do đến Hàn Quốc.</li><li>학교를 선택한 이유 – lý do chọn trường.</li><li>전공을 선택한 이유 – lý do chọn ngành.</li><li>학업 계획 – kế hoạch học tập.</li><li>졸업 후 계획 – kế hoạch sau tốt nghiệp.</li><li>가족 – gia đình.</li><li>재정 – tài chính.</li><li>한국어 – năng lực và quá trình học tiếng Hàn.</li></ol>
      <h2>Cấu trúc một câu trả lời tốt</h2>
      <p>Bắt đầu bằng câu trả lời trực tiếp, sau đó thêm một hoặc hai lý do cụ thể. Không nên dùng từ quá khó nếu phát âm chưa chắc. Câu đúng, rõ và tự nhiên tốt hơn câu dài nhưng dễ mâu thuẫn.</p>
      <h2>Cách luyện bằng công cụ AI</h2>
      <p>Học viên chọn chủ đề, nghe câu hỏi tiếng Hàn, nói vào điện thoại và xem đánh giá phát âm, ngữ pháp, độ rõ, độ tự nhiên. Sau khi AI chỉ ra câu cần sửa, hãy đọc lại đến khi ổn định. Kết quả AI là công cụ luyện tập, không thay thế đánh giá chính thức của cơ quan xét duyệt.</p>
      <h2>Ba lỗi thường gặp</h2>
      <ul><li>Thông tin trường hoặc ngành không thống nhất.</li><li>Trả lời học thuộc nhưng không hiểu câu hỏi phụ.</li><li>Nói quá nhanh, nuốt âm và không ngắt ý.</li></ul>
      ${contactCta}`,
  },
  {
    seedVersion: SEO_ARTICLE_SEED_VERSION,
    id: 'tieng-han-xuat-khau-lao-dong-ket-hon',
    slug: 'tieng-han-xuat-khau-lao-dong-ket-hon',
    title: 'Học Tiếng Hàn Cho XKLĐ Và Kết Hôn Tại Vị Thanh',
    category: 'Học tiếng Hàn Blog',
    summary: 'Cách xác định nội dung cần học cho mục tiêu xuất khẩu lao động và kết hôn, ưu tiên giao tiếp thực tế, nghe hiểu và từ vựng đời sống.',
    coverImage: driveImage('1yMqdh1Hfg6-aO0EsmPMTMqH8rcKBM2ws'),
    coverImageAlt: 'Học tiếng Hàn giao tiếp cho XKLĐ và kết hôn tại Vị Thanh',
    author,
    authorRole,
    readTime: '5 phút đọc',
    publishedAt: '16/08/2026',
    tags: ['TiếngHànXKLĐ', 'TiếngHànKếtHôn', 'VịThanh'],
    isFeatured: false,
    focusKeyword: 'học tiếng Hàn XKLĐ tại Vị Thanh',
    seoTitle: 'Học Tiếng Hàn XKLĐ & Kết Hôn Tại Vị Thanh',
    seoDescription: 'Lộ trình tiếng Hàn cho XKLĐ và kết hôn tại Vị Thanh, tập trung nghe nói, từ vựng công việc, gia đình và đời sống thực tế.',
    contentHtml: `
      <p>Người <strong>học tiếng Hàn cho XKLĐ hoặc kết hôn tại Vị Thanh</strong> có nhu cầu giao tiếp khác với người chỉ luyện thi. Vì vậy, lộ trình cần ưu tiên tình huống thật và vốn từ phù hợp.</p>
      <h2>Tiếng Hàn cho mục tiêu XKLĐ</h2>
      <p>Ngoài nền tảng Hangeul và ngữ pháp cơ bản, học viên cần từ vựng công việc, an toàn lao động, thời gian, số lượng và cách nghe chỉ dẫn. Việc luyện nghe câu ngắn ở nhiều tốc độ giúp giảm bỡ ngỡ trong môi trường làm việc.</p>
      <h2>Tiếng Hàn cho mục tiêu kết hôn</h2>
      <p>Nội dung nên tập trung giới thiệu bản thân, gia đình, sinh hoạt, sức khỏe, mua sắm và văn hóa ứng xử. Khả năng diễn đạt nhu cầu và hỏi lại khi chưa hiểu đặc biệt quan trọng.</p>
      <h2>Ba nguyên tắc học dễ duy trì</h2>
      <ul><li>Học theo tình huống thay vì danh sách từ rời rạc.</li><li>Đọc thành tiếng và ghi âm để tự nghe lại.</li><li>Ôn lặp cách quãng, dùng từ cũ trong câu mới.</li></ul>
      <p>SEIU mở lớp mới mỗi tháng. Do lịch và hình thức lớp có thể thay đổi, học viên nên liên hệ trực tiếp để được tư vấn chương trình, lịch học và học phí đang áp dụng.</p>
      ${contactCta}`,
  },
  {
    seedVersion: SEO_ARTICLE_SEED_VERSION,
    id: 'phuong-phap-shadowing-tieng-han',
    slug: 'phuong-phap-shadowing-tieng-han',
    title: 'Phương Pháp Shadowing Tiếng Hàn: Luyện Phản Xạ Đúng Cách',
    category: 'Học tiếng Hàn Blog',
    summary: 'Hướng dẫn luyện Shadowing theo từng bước: nghe, chia cụm, bắt chước nhịp, ghi âm và sửa phát âm để hình thành phản xạ.',
    coverImage: driveImage('1DcDFMh3lqrKoMQnJf5Ds1b6V7ygugtj4'),
    coverImageAlt: 'Luyện phản xạ và Shadowing tiếng Hàn tại SEIU',
    author,
    authorRole,
    readTime: '6 phút đọc',
    publishedAt: '15/08/2026',
    tags: ['ShadowingTiếngHàn', 'PhảnXạTiếngHàn', 'SEIU'],
    isFeatured: false,
    focusKeyword: 'phương pháp Shadowing tiếng Hàn',
    seoTitle: 'Phương Pháp Shadowing Tiếng Hàn Đúng Cách | SEIU',
    seoDescription: 'Học phương pháp Shadowing tiếng Hàn qua 5 bước: nghe, chia cụm, bắt chước nhịp, ghi âm và sửa lỗi để tăng phản xạ giao tiếp.',
    contentHtml: `
      <p><strong>Shadowing tiếng Hàn</strong> là cách nghe và nhắc lại gần như đồng thời với giọng mẫu. Phương pháp này hữu ích cho nhịp câu và phản xạ, nhưng cần luyện đúng mức để không lặp lại cả lỗi nghe sai.</p>
      <h2>Quy trình Shadowing 5 bước</h2>
      <ol><li><strong>Nghe toàn đoạn:</strong> xác định bối cảnh và người nói.</li><li><strong>Đọc transcript:</strong> tra từ mới, chia cụm ý và đánh dấu nối âm.</li><li><strong>Nghe–dừng–nhắc lại:</strong> luyện từng câu ngắn đến khi rõ.</li><li><strong>Shadowing liên tục:</strong> bắt chước tốc độ, cao độ và điểm ngắt.</li><li><strong>Ghi âm:</strong> so sánh với mẫu rồi sửa từng lỗi.</li></ol>
      <h2>Nên luyện bao lâu mỗi ngày?</h2>
      <p>Một đoạn ngắn được luyện kỹ thường hiệu quả hơn nghe nhiều đoạn nhưng không sửa. Học viên mới có thể bắt đầu với 10–15 phút, dùng câu phù hợp trình độ và tăng dần tốc độ.</p>
      <h2>Kết hợp Shadowing với ngữ pháp</h2>
      <p>Sau khi thuộc nhịp câu mẫu, thay chủ ngữ, thời gian, địa điểm hoặc động từ để tạo câu mới. Bước này biến việc bắt chước thành khả năng sử dụng ngôn ngữ chủ động.</p>
      <h2>Khi nào cần giáo viên sửa?</h2>
      <p>Nếu đã nghe lại nhiều lần nhưng vẫn không nhận ra lỗi nối âm, khẩu hình hoặc ngữ điệu, phản hồi trực tiếp sẽ giúp tránh lặp sai thành thói quen.</p>
      ${contactCta}`,
  },
  {
    seedVersion: SEO_ARTICLE_SEED_VERSION,
    id: 'chon-truong-han-quoc-80-truong',
    slug: 'chon-truong-han-quoc-80-truong',
    title: 'Cách Chọn Trường Hàn Quốc Với Dữ Liệu 80+ Trường Tại SEIU',
    category: 'Du học Hàn Quốc',
    summary: 'Hướng dẫn lọc hơn 80 trường theo khu vực, điều kiện và ngành học, xem Invoice và lập dự toán ba khoản trước khi để lại thông tin tư vấn.',
    coverImage: driveImage('1Q3J3p-bG5yRL6mneV9y5SJgpOXjBgFYV'),
    coverImageAlt: 'Tra cứu và chọn trường Hàn Quốc cùng SEIU',
    author,
    authorRole,
    readTime: '7 phút đọc',
    publishedAt: '14/08/2026',
    tags: ['ChọnTrườngHànQuốc', 'DuHọcHànQuốc', '80TrườngHàn'],
    isFeatured: false,
    focusKeyword: 'chọn trường Hàn Quốc phù hợp',
    seoTitle: 'Cách Chọn Trường Hàn Quốc Với Dữ Liệu 80+ Trường',
    seoDescription: 'Lọc 80+ trường Hàn Quốc theo khu vực, điều kiện và ngành học; xem Invoice học phí và dự toán chi phí trực tuyến cùng SEIU.',
    contentHtml: `
      <p>Việc <strong>chọn trường Hàn Quốc phù hợp</strong> nên dựa trên hồ sơ, mục tiêu, khu vực và Invoice học phí thay vì chỉ nhìn tên trường. Công cụ SEIU hiện có dữ liệu hơn 80 trường để học viên chủ động so sánh.</p>
      <h2>Bước 1: Chọn khu vực</h2>
      <p>Khu vực ảnh hưởng đến môi trường sống, cơ hội trải nghiệm và ngân sách cá nhân. Học viên có thể lọc Seoul, Busan, Daegu, Daejeon, Gyeonggi và các khu vực khác trong danh sách.</p>
      <h2>Bước 2: Đối chiếu điều kiện hồ sơ</h2>
      <p>Kiểm tra GPA, yêu cầu TOPIK, loại bằng được chấp nhận, giới hạn vùng nếu có và ghi chú tài chính. Đây là dữ liệu tham khảo; tiêu chí tuyển sinh cần được xác nhận lại theo kỳ nhập học.</p>
      <h2>Bước 3: Xem ngành học và website trường</h2>
      <p>Mỗi thẻ trường có tên tiếng Việt/Anh, tên tiếng Hàn, khu vực, ngành và đường dẫn website. Logo hoặc biểu tượng tên miền giúp nhận diện nhanh, nhưng quyết định cuối cùng cần dựa trên thông báo tuyển sinh chính thức.</p>
      <h2>Bước 4: Dự toán đúng ba khoản</h2>
      <p>Hệ thống chỉ cộng học phí tại Việt Nam 7 triệu đồng, Invoice học phí trường quy đổi sang VND và phí dịch vụ SEIU 75 triệu đồng sau Visa. Ký túc xá, bảo hiểm và khoản khác không được tự động cộng.</p>
      <h2>Bước 5: Để lại thông tin để xem kết quả</h2>
      <p>Học viên nhập họ tên và số điện thoại. Lựa chọn trường và dự toán được lưu để nhân viên SEIU tư vấn đúng nhu cầu, không hiển thị công khai trên website.</p>
      ${contactCta}`,
  },
];
