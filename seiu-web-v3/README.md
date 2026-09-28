# Website SEIU

Website giới thiệu khóa học tiếng Hàn, luyện TOPIK, tư vấn du học Hàn Quốc và cổng quản trị nội dung của SEIU.

## Chạy trên máy tính

Yêu cầu Node.js 20 trở lên.

1. Giải nén file ZIP và mở Terminal tại đúng thư mục có `package.json`.
2. Chạy `npm install`.
3. Chạy `npm run dev`.
4. Giữ cửa sổ Terminal đang chạy và mở `http://localhost:3000`.

Cổng quản trị dùng tài khoản riêng đã được cấu hình ở phía máy chủ. Hai ô đăng nhập luôn để trống, website không hiển thị gợi ý ID/mật khẩu và không xác thực bằng mã chạy trên trình duyệt.

Khi cần đổi tài khoản sau này, tạo `.env` từ `.env.example` và cấu hình các biến quản trị ở phía máy chủ; không đặt thông tin đăng nhập trong mã frontend.

## Phần mới

- Trang **Học vụ** tại `/hoc-vu`: quản lý học viên, lớp, giáo viên, sổ điểm danh và nội dung buổi học. Admin dùng tài khoản quản trị của website; giáo viên dùng tài khoản do admin tạo. Mã nguồn ở thư mục `seiu-hoc-vien/` (xem README trong đó); sau khi sửa, chạy `npm run build:web` trong thư mục đó.

- Sửa lỗi đề thi thử toàn phần chỉ hiện 69 câu: khôi phục đúng câu 28 trong block nghe 27–28, ghép câu 25–26 cho cả 10 đề và loại block câu 64 bị lặp. Mỗi đề hiện có đúng một câu cho từng số từ 1 đến 70.
- Khi thoát đề, về trang chủ, chọn đề khác hoặc nộp bài, hệ thống dừng ngay MP3 đang phát, hủy yêu cầu tạo/tải âm thanh còn chờ và vô hiệu toàn bộ hàng đợi tự phát câu tiếp theo; rời trang bằng nút quay lại của trình duyệt cũng được xử lý.
- Giao diện làm bài trên điện thoại đã khóa hoàn toàn cuộn ngang, không còn lệch trái/phải khi vuốt dọc.
- Header bài thi và thanh nộp bài được thu gọn thành hai hàng mỏng; tên đề tự rút gọn, các nút quay lại/chia sẻ dùng biểu tượng và nút nghe/nộp bài dùng nhãn ngắn trên màn hình nhỏ.
- Trong cửa sổ làm bài, nút thoát đã đổi thành “Về trang chủ” và luôn quay về trang chủ thay vì cố đóng tab trình duyệt.
- Câu nghe 15–16 có 9 bộ tranh thật (18 câu). Mỗi đáp án là một tranh có thể bấm; ảnh đã được cắt bỏ toàn bộ lời thoại, gợi ý và phần giải thích để không lộ đáp án trước khi nộp bài.
- Đề thi thử 1–9 được ghép đúng bộ tranh tương ứng; đáp án và lời giải chỉ hiện sau khi học viên nộp bài.
- Trang chủ đặt Bảng Thành Tích thi thử ngay dưới banner, gồm tổng lượt thi, số học viên, điểm cao nhất và Top 15; phía dưới có hai lối vào “Đăng ký du học SEIU” và “Ôn thi TOPIK miễn phí”.
- Đã bỏ hoàn toàn khối “SEIU Korean Academy / Chọn đúng chương trình” và trang con Khóa học. Liên kết `#courses` cũ tự chuyển sang TOPIK Master để không tạo trang lỗi.
- Trang Du học Hàn có dữ liệu 90 trường do SEIU cung cấp (giao diện giới thiệu “80+ trường”): lọc theo khu vực, tìm theo tên/ngành, chọn trường và mở bảng Invoice sau khi học viên nhập tên/SĐT.
- Mỗi trường có logo/biểu tượng tên miền và liên kết website chính thức khi dữ liệu có cung cấp.
- Dự toán chỉ cộng đúng 3 khoản: học phí tại Việt Nam 7 triệu + Invoice học phí trường quy đổi + phí dịch vụ 75 triệu đóng sau khi đậu Visa. KTX, bảo hiểm và khoản khác không được tự cộng.
- Admin có thể đổi tỷ giá KRW/VND và chỉnh điểm lấy nét trái/phải, lên/xuống của ảnh bìa; dữ liệu nội dung và khách đăng ký được đồng bộ bằng Netlify Functions/Blobs khi triển khai toàn bộ source.
- TOPIK Master mở thẳng thư viện đề Nghe & Đọc đủ 70 câu; đã bỏ hoàn toàn mục “Lộ trình 30 bài” và đưa tab đề thi lên vị trí đầu tiên.
- Khi học viên nhập tên/SĐT để mở đề, website tạo một mã đăng ký và gửi ngay vào Cổng quản trị → “Đăng Ký Thi”. Khi nộp bài, kết quả dùng cùng mã để tự chuyển trạng thái sang “Đã nộp bài”, xuất hiện tại “Kết Quả Thi” và tham gia Bảng Thành Tích.
- Phần nghe ưu tiên MP3 giọng AI nam–nữ: lần đầu hệ thống tạo âm thanh, lưu lại theo nội dung và vai nói; các lần sau phát trực tiếp file đã lưu, không tạo lại và không phụ thuộc giọng của điện thoại.
- Azure Speech được ưu tiên với giọng Hàn `ko-KR-SunHiNeural` (nữ) và `ko-KR-InJoonNeural` (nam); nếu chưa cấu hình Azure, hệ thống dùng OpenAI TTS, cuối cùng mới quay về giọng dự phòng của trình duyệt.
- Kết quả đề Nghe, Đọc, đề theo nhóm, đề thi thử, kiểm tra từ vựng, kiểm tra trình độ, bài tập AI, dịch AI, phát âm và phỏng vấn LSQ được lưu tập trung trên Netlify Blobs; nếu mất mạng, trình duyệt lưu hàng chờ và tự gửi lại khi quản trị tải bảng kết quả.
- Cổng quản trị có Bảng Thành Tích: tổng lượt thi, số người thi, điểm cao nhất, điểm trung bình và Top 15 học viên; mỗi học viên chỉ lấy bài có tỷ lệ điểm cao nhất.
- Giao diện làm bài mô phỏng đề TOPIK giấy: nền trắng, đoạn đọc và câu hỏi lớn hơn, đáp án gọn hơn; tự xếp 4, 2 hoặc 1 cột theo độ dài nội dung và tự tối ưu trên điện thoại.
- Phần nghe tự chuyển giọng nữ `여` và nam `남` theo từng lượt thoại, kể cả dữ liệu cũ viết chung trong một dòng; có hai bộ chọn giọng riêng và nút nghe thử cả hai giọng.
- Khi thiết bị chỉ có một giọng tiếng Hàn, hệ thống vẫn phân biệt vai nam/nữ bằng cao độ; chất giọng tốt nhất phụ thuộc bộ giọng tiếng Hàn có sẵn trên Chrome, Safari, macOS, iPhone hoặc Android.
- Kho TOPIK Master hiện có 1.556 câu trong 46 bài thi/luyện tập; các nhóm Nghe và Đọc đều giữ đúng cấu trúc từng dạng.
- Tất cả đề luyện theo cụm Nghe và Đọc hiện có ít nhất 18 câu; các nhóm Đọc 49–50 đến 69–70 đã được cân đủ nội dung.
- Trong Cổng quản trị → Banner & Hero có thể kéo thanh để chỉnh độ rộng, vị trí trái/phải và lên/xuống của khối nội dung trắng trên banner; có thêm nút đặt nhanh trái, giữa, phải.
- Thanh menu mới dạng học viện Hàn Quốc: gọn hơn, TOPIK Master được tô đỏ và gắn nhãn “Miễn phí”, có nhóm Du học, Khám phá và trạng thái trang đang xem rõ ràng.
- Sửa lỗi các câu trong bài kiểm tra tự chọn cùng đáp án do trùng mã lưu; mỗi câu và mỗi block hiện có mã đáp án riêng, kể cả các bộ luyện tổng hợp có số câu lặp lại.
- Khi nộp bài, hệ thống đếm theo số câu thực tế; đã rà soát 1.556 câu trong 46 bài thi và không còn đáp án nằm ngoài phạm vi lựa chọn hoặc mã đáp án trùng.
- Giao diện **SEIU Korea Style** dùng nền sáng, xanh navy – đỏ thương hiệu và các mảng pastel theo phong cách học viện Hàn Quốc hiện đại.
- Ảnh banner giữ nguyên màu và độ sáng, không phủ lớp màu đen; phóng chậm và tự chuyển sau đúng 5 giây.
- Thêm hai lối truy cập nhanh tập trung vào Du học SEIU và TOPIK Master ngay dưới Bảng Thành Tích.
- Trang chủ được sắp xếp lại theo phong cách học viện Hàn Quốc: banner lớn, tin/bài ghim, bảng chiêu sinh, tin mới, hoạt động học viên, kết quả và đối tác.
- Đã bỏ khối danh sách khóa học dài khỏi trang chủ và xóa trang khóa học riêng.
- Bảng chiêu sinh nằm ngay dưới bài ghim và được chỉnh toàn bộ nội dung, lịch, học phí, số chỗ và ảnh trong Cổng quản trị → Banner & Hero.
- Ảnh bìa bài viết hiển thị vuông 1:1; khi tải ảnh từ máy, hệ thống mở công cụ phóng, căn vị trí và cắt ảnh về 1200×1200.
- Trình viết bài có chế độ soạn trực quan, định dạng tiêu đề/danh sách/link và tải ảnh trực tiếp từ máy vào nội dung.
- Bảng SEO kiểm tra từ khóa chính, tiêu đề, mô tả, đường dẫn, số từ, H2/H3, ALT ảnh và nội dung tương tác; trang bài viết tự áp dụng Meta, Open Graph, Canonical và Article Schema.
- Trang chủ có banner 3 ảnh tự động chuyển sau 5 giây, nút chuyển thủ công và tự dừng khi người xem rê chuột hoặc thao tác bàn phím.
- Trong quản trị “Banner & Hero”, có thể tải trực tiếp từng ảnh trong 3 ảnh bìa từ máy, dán URL, gỡ ảnh và chỉnh điểm lấy nét.
- Các khối nội dung xuất hiện mượt từ dưới lên khi cuộn đến; nút, thẻ khóa học, bài viết và hình ảnh có hover rõ ràng trên máy tính.
- Album học viên dùng bố cục lưới và chuyển tab tức thời, không tải lại trang.
- TOPIK Master mở bài thi ở cửa sổ mới, yêu cầu tên, số điện thoại và mục tiêu trước khi làm.
- Thêm 5 bộ nghe câu 25–26 và hoàn thiện 5 đề thi thử đầu thành đủ 70 câu.
- “Học cùng AI” gồm dịch Việt → Hàn, luyện phát âm bằng micro điện thoại và “Phỏng vấn LSQ AI”.
- Admin có thể tạo câu dịch, đoạn luyện đọc, chèn ảnh/video vào bài viết và thay logo.
- AI viết bài và AI chấm bài có chế độ xử lý dự phòng; khi cài `OPENAI_API_KEY`, hệ thống dùng OpenAI qua Netlify Function để nhận xét sâu hơn.
- Luyện phát âm hiển thị điểm phát âm, độ rõ, mức đọc đủ và câu nhận diện được.
- Phỏng vấn LSQ AI có 9 chủ đề, hỏi bằng tiếng Hàn, nhận câu trả lời qua micro, chấm phát âm/ngữ pháp/độ rõ/độ tự nhiên và chỉ ra câu cần sửa để học viên luyện lại đến 90+.
- Đề 70 câu chấm theo thang TOPIK I 200 điểm: Nghe 100 + Đọc 100.
- Trang chủ hiển thị tối đa 2 bài ghim và 4 bài mới nhất ngay phía trên album học viên.
- Trong quản trị bài viết có thể ghim/bỏ ghim, sửa ngày đăng, tác giả, ảnh, nội dung và hashtag.
- Có sẵn 10 bài SEO địa phương về học tiếng Hàn, TOPIK và du học tại Vị Thanh, Hậu Giang; dùng ảnh hoạt động từ thư mục Google Drive SEIU.
- Thông tin liên hệ mặc định: 197N Trần Hưng Đạo, P.5, TP. Vị Thanh, Hậu Giang · Hotline/Zalo 0972 249 450 · capseiu@gmail.com · 08:00–20:00, Thứ 2 đến Thứ 7.

Micro nhận diện giọng nói hoạt động tốt nhất trên Chrome/Safari mới, qua `localhost` hoặc website dùng HTTPS.

## Đăng lên Netlify

- Để MP3 AI, AI viết/chấm bài và bảng kết quả dùng được trên nhiều thiết bị, phải đưa **toàn bộ source code** lên GitHub rồi kết nối repository với Netlify. Netlify sẽ chạy `npm run build` và triển khai cả thư mục `netlify/functions`.
- Không chỉ kéo riêng thư mục `dist`: cách đó chỉ tạo website tĩnh, không triển khai Functions nên không thể tạo MP3 AI hoặc nhận kết quả từ điện thoại học viên.
- Bản tĩnh vẫn mở được giao diện và dùng một số chế độ dự phòng trên trình duyệt, nhưng dữ liệu quản trị không đồng bộ giữa các thiết bị.

### Bật OpenAI cho viết và chấm bài

OpenAI chạy qua Netlify Function để khóa API không xuất hiện trong trình duyệt. Vì vậy không thể chỉ kéo riêng thư mục `dist` như một website tĩnh.

1. Đưa toàn bộ source code lên GitHub rồi kết nối repository đó với Netlify, hoặc triển khai bằng Netlify CLI.
2. Trong Netlify mở `Project configuration` → `Environment variables`.
3. Tạo biến `OPENAI_API_KEY` với API key của OpenAI và chọn scope có `Functions` nếu tài khoản hiển thị lựa chọn scope.
4. Có thể tạo thêm `OPENAI_MODEL=gpt-5.6`; nếu bỏ trống hệ thống cũng dùng model này.
5. Redeploy website. Netlify sẽ tự build function nằm trong `netlify/functions/openai.mjs`.

Không ghi `OPENAI_API_KEY` vào source code, `.env` được upload công khai hoặc biến có tiền tố `VITE_`.

### Bật MP3 AI nam–nữ cho đề nghe

Khuyên dùng Azure Speech vì có giọng được thiết kế riêng cho tiếng Hàn. Trong Netlify → `Project configuration` → `Environment variables`, thêm:

```text
AZURE_SPEECH_KEY=khóa Azure Speech
AZURE_SPEECH_REGION=khu-vực-tài-nguyên
AZURE_TTS_FEMALE_VOICE=ko-KR-SunHiNeural
AZURE_TTS_MALE_VOICE=ko-KR-InJoonNeural
```

Nếu chưa có Azure nhưng đã cấu hình `OPENAI_API_KEY`, hệ thống tự dùng:

```text
OPENAI_TTS_MODEL=gpt-4o-mini-tts
OPENAI_TTS_FEMALE_VOICE=marin
OPENAI_TTS_MALE_VOICE=cedar
```

Mỗi đoạn tiếng Hàn và vai nam/nữ tạo đúng một file MP3 rồi được giữ trong kho âm thanh của website. Khi thay nội dung, giọng hoặc model, hệ thống tự tạo file mới. Giao diện có ghi rõ đây là âm thanh AI.

### Lưu đăng ký, kết quả và Bảng Thành Tích trên Netlify

Khi deploy toàn bộ source qua Git, Netlify Functions `exam-registrations` và `exam-results` tự lưu từng lượt vào thi và từng kết quả thành các bản ghi riêng trong Netlify Blobs. Hai bản ghi được ghép bằng mã đăng ký thi. Không cần tạo cơ sở dữ liệu thủ công. Không chỉ kéo thư mục `dist`, vì cách đó không triển khai Functions nên không thể nhận đăng ký hoặc kết quả từ thiết bị học viên.

### Tắt “Powered by Netlify”

Trong Netlify mở `Project configuration` → `Build & deploy` → `Continuous deployment` → `Collaboration tools` → `Configure`, sau đó tắt `Netlify Drawer`. Có thể kiểm tra nhanh bằng cách thêm `?ntl-drawer-state=hidden` vào cuối địa chỉ trang.

## Kiểm tra trước khi đăng web

- `npm run lint`: kiểm tra TypeScript.
- `npm run build`: tạo bản sản xuất trong thư mục `dist`.

## Lưu ý dữ liệu

- Khách đăng ký và kết quả bài thi được lưu trong `server_data/` khi chạy máy chủ Node.
- Không đưa file `.env`, dữ liệu khách hàng hoặc khóa Telegram/Gemini lên GitHub.
- Ảnh học viên, visa và đối tác chỉ nên đăng sau khi đã kiểm tra nội dung và quyền sử dụng.
