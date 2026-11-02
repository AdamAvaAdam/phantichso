# VT Intelligence Hub — Đăng nhập quản trị

## Trạng thái
Đã bổ sung máy chủ xác thực Node.js (không cần thư viện ngoài). Khi chạy bằng máy chủ này, `hub.html` và `index.html` chỉ được phục vụ sau khi đăng nhập.

**Quan trọng:** GitHub Pages chỉ phục vụ file tĩnh. Các địa chỉ `github.io` hoặc file `hub.html` xem trực tiếp trên GitHub **không được bảo vệ** bởi máy chủ này. Không dùng GitHub Pages để công bố dữ liệu kinh doanh nhạy cảm. Muốn bảo mật thực tế, triển khai trên server hỗ trợ Node.js, HTTPS và vô hiệu hóa trang công khai.

## Chuẩn bị
Cần Node.js 18+. Không ghi mật khẩu hoặc SESSION_SECRET vào repository.

PowerShell (chỉ ví dụ, hãy tự điền giá trị bí mật trên máy chủ):
```powershell
$env:ADMIN_USER="admin"
$env:ADMIN_PASSWORD=Read-Host "Mat khau quan tri"
$env:SESSION_SECRET=Read-Host "Session secret ngau nhien it nhat 32 ky tu"
node secure-server.cjs
```

Truy cập `http://127.0.0.1:3000/login` khi chạy trên máy cục bộ.

## Bảo vệ
- Mật khẩu được đối chiếu với scrypt trong RAM; không lưu mật khẩu vào GitHub.
- Phiên đăng nhập ký HMAC, cookie HttpOnly / SameSite=Strict, hết hạn sau 8 giờ.
- Giới hạn 5 lần thử thất bại mỗi IP trước khi khóa tạm 15 phút (bộ đếm RAM).
- Đăng xuất thu hồi cookie ở trình duyệt. Để thu hồi đồng loạt, thay SESSION_SECRET.
- Chạy máy chủ nội bộ mặc định. Triển khai công khai bắt buộc HTTPS reverse proxy và `TRUST_TLS_PROXY=1` cùng HOST phù hợp.
- Không dùng làm hệ thống nhiều tài khoản hoặc phân quyền production; khi mở rộng dùng hệ thống định danh được quản trị và lưu phiên phía server.

## Kiểm tra
1. Mở /hub.html khi chưa đăng nhập → chuyển về /login.
2. Thử sai thông tin → từ chối.
3. Đăng nhập đúng → vào Hub.
4. Đăng xuất → quay lại đăng nhập.
5. Truy cập lại Hub sau đăng xuất → bị từ chối.

Giữ nguyên các tệp nghiệp vụ gốc: `index.html`, `test-tours.cjs`.
