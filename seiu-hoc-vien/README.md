# SEIU – Phần mềm quản lý học viên

App riêng (tách khỏi website) để trung tâm nhập tay học viên, xếp lớp và phân công giáo viên.

## Chức năng

**Quản trị viên (admin)**
- **Giáo viên**: thêm, sửa, khóa tài khoản, đổi mật khẩu. Mỗi giáo viên có tên đăng nhập riêng.
- **Lớp học**: tạo lớp (mã lớp, trình độ, lịch học, phòng, chi nhánh, sĩ số tối đa), chọn giáo viên phụ trách, xem danh sách học viên của lớp.
- **Học viên**: nhập tay qua form.
  - Mã học viên tự sinh (HV0001, HV0002…).
  - Báo trùng số điện thoại, kèm nút mở hồ sơ cũ.
  - Không cho thêm học viên vào lớp đã đủ sĩ số.
  - Chuyển lớp vẫn giữ lịch sử các lớp cũ.
  - Nút "Lưu và nhập tiếp" để nhập liên tục nhiều học viên.
  - Tìm kiếm theo tên, mã hoặc SĐT; lọc theo lớp và trạng thái.

**Giáo viên**
- Đăng nhập là thấy **Lớp của tôi**: chỉ các lớp mình được phân công và học viên trong lớp đó, có nút in danh sách.
- Không xem được lớp khác, không sửa được hồ sơ. Quyền được kiểm tra ở máy chủ, không chỉ ẩn trên giao diện.

## Chạy thử trên máy

```bash
cd seiu-hoc-vien
npm install
npm run dev        # mở http://localhost:5173
```

Tài khoản admin mặc định khi chạy local: `admin` / `admin123`. Dữ liệu lưu trong thư mục `.data/`.

Kiểm tra code: `npm test` (test API) và `npm run lint` (kiểm tra TypeScript).

## Đưa lên mạng (Netlify)

1. Trên Netlify chọn **Add new site → Import from Git**, chọn repo này.
2. Mục **Base directory** điền `seiu-hoc-vien`. Build command và thư mục publish đã có sẵn trong `netlify.toml`.
3. Vào **Site configuration → Environment variables** và thêm:
   - `ADMIN_USERNAME`: tên đăng nhập admin
   - `ADMIN_PASSWORD`: mật khẩu admin (nên dài, khó đoán)
   - `AUTH_SECRET` (không bắt buộc): một chuỗi ngẫu nhiên dài. Nếu bỏ trống, app tự tạo.
4. Deploy. Dữ liệu được lưu trong **Netlify Blobs** của site này, không cần cài database.

## Cấu trúc

```
server/api.mjs            API: đăng nhập, phân quyền, giáo viên / lớp / học viên
server/auth.mjs           Mã hóa mật khẩu, token đăng nhập, chặn đăng nhập sai nhiều lần
server/store.mjs          Lưu dữ liệu (Netlify Blobs, hoặc file JSON khi chạy local)
netlify/functions/api.mjs Chạy API trên Netlify tại /api/*
dev-server.mjs            Server chạy local (API + giao diện)
src/                      Giao diện React
test/                     Test API
```
