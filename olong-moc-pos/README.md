# Olong Mộc POS

App bán hàng (POS) cho quán trà Olong Mộc: chọn bàn, gọi món, **in bill bếp**, **in bill tính tiền**, xem hóa đơn và báo cáo doanh thu.

Chỉ có 1 file `index.html`, không cần cài đặt, không cần server. Chạy trên máy tính, tablet hoặc điện thoại (Chrome / Edge / Safari).

## Cách dùng nhanh

1. Mở file `index.html` bằng Chrome (hoặc đưa lên Netlify / GitHub Pages để mở bằng đường link).
2. Vào **Cài đặt**: nhập tên quán, địa chỉ, SĐT, wifi, tài khoản ngân hàng (để in mã QR chuyển khoản), chọn khổ giấy K80/K58, số bàn → **Lưu**.
3. Vào **Thực đơn**: sửa giá, thêm/xóa món theo menu thật của quán (menu có sẵn chỉ là mẫu).
4. **Bán hàng**:
   - Chọn bàn (hoặc **➕ Mang về**), bấm vào món để thêm. Bấm “✎ thêm ghi chú” để ghi *ít đá, 50% đường…*
   - **In bill bếp**: chỉ in những món *mới gọi thêm* từ lần in trước. Món bị giảm/xóa sau khi đã báo bếp sẽ in dòng **[HỦY]**.
   - **In tạm tính**: in phiếu cho khách xem trước khi trả tiền.
   - **Thanh toán & In bill**: chọn Tiền mặt / Chuyển khoản, nhập tiền khách đưa → app tự tính tiền thối và in hóa đơn.
   - Có giảm giá (% hoặc số tiền), chuyển/gộp bàn, hủy đơn.
5. **Hóa đơn**: xem lại, in lại, hủy hóa đơn.
6. **Báo cáo**: doanh thu theo ngày / 7 ngày / tháng, tiền mặt vs chuyển khoản, món bán chạy, in báo cáo cuối ca, xuất Excel (CSV).

## Máy in nhiệt (K80 / K58)

- Cài driver máy in nhiệt (Xprinter, Epson, Gprinter…) trên máy tính, in thử 1 trang từ Windows.
- Trong hộp thoại in của Chrome: chọn đúng máy in, **Lề: Không (None)**, tắt **Đầu trang và chân trang (Headers and footers)**. Chrome sẽ nhớ cho các lần sau.
- **In không cần bấm hộp thoại (in 1 chạm)**: tạo shortcut Chrome với tham số
  `--kiosk-printing` → app sẽ in thẳng ra máy in mặc định của Windows.
  Ví dụ Target của shortcut:
  `"C:\Program Files\Google\Chrome\Application\chrome.exe" --kiosk-printing "file:///C:/OlongMoc/index.html"`
- **Có 2 máy in (1 ở quầy, 1 ở bếp/quầy pha chế)**: trình duyệt không tự chọn máy in theo loại bill được. Cách làm phổ biến:
  - Dùng hộp thoại in bình thường và chọn máy in tương ứng (Chrome nhớ máy in dùng gần nhất), hoặc
  - Dùng 1 máy in và chọn **2 liên bill bếp** trong Cài đặt để xé 1 liên đưa bếp, hoặc
  - Đặt 1 máy tính/tablet riêng ở bếp.
- Điện thoại/tablet Android: in qua app máy in của hãng (VD: RawBT, Xprinter Print Service) hoặc máy in có Wifi/LAN.

## Dữ liệu

- Dữ liệu lưu ngay trong trình duyệt của máy đang dùng (localStorage). Mỗi máy/trình duyệt có dữ liệu riêng.
- **Không xóa lịch sử duyệt web/cookie** của trang này, nếu không sẽ mất dữ liệu.
- Vào **Cài đặt → Tải file sao lưu** định kỳ (mỗi ngày/tuần). Khôi phục bằng **Khôi phục từ file**.
- Mã QR chuyển khoản lấy từ dịch vụ VietQR nên máy cần có Internet khi in bill có QR. Các chức năng khác chạy được khi mất mạng.
