# VT Intelligence Hub

Mở `hub.html` trên GitHub Pages. `index.html` là ứng dụng quà tặng/du lịch cũ, giữ nguyên byte và nghiệp vụ.

## Đã xây dựng
- Giao diện responsive, Dashboard đầu đơn gồm VAT, biểu đồ theo ngày, địa bàn, khách dẫn đầu.
- Bộ lọc thời gian, địa bàn, mã trạng thái, khách, đơn chứa hãng. Bộ lọc hãng tính TOÀN BỘ tiền đầu đơn chứa hãng, không giả phân bổ tiền dòng sau chiết khấu.
- Customer 360 theo mã khách, thông tin liên hệ, hạng, nhân viên, lịch sử đơn trong bộ lọc.
- Bản đồ nhiệt: tái sử dụng Leaflet và thuật toán ba vòng tròn/sqrt từ `AdamAvaAdam/BHVer1` commit `e8c33a10be4b7a2aecbbe134615430b8c0285b83`. Ghép mã khách với tab Định vị, xử lý số thập phân dấu phẩy, loại mã tọa độ trùng và tọa độ không hợp lệ. Không lấy số doanh số nhập tay từ tab định vị.
- Kế hoạch tuyến: thêm/bỏ/sắp xếp khách, tải CSV chống công thức bảng tính. Chỉ trong phiên; chưa tính đường bộ hoặc đồng bộ nhiều máy.
- Phân tích tự động có cơ sở tính toán, kiểm tra đơn chưa khớp khách và tiền không dương. AI hội thoại chưa được kết nối, UI ghi rõ.

## Kết nối riêng tư trên Pages
Google Identity Services token model + Google Sheets REST API v4 `values:batchGet`, scopes `spreadsheets.readonly openid email`. Không dùng API Warehouse suy đoán, proxy công khai, API key, client secret hoặc service account trong trình duyệt. Token và dữ liệu chỉ nằm trong RAM, xóa khi đăng xuất/rời trang/hết phiên. Không có service worker, localStorage hoặc offline snapshot mới.

OAuth Client ID công khai được tái sử dụng từ BHVer1. Trước khi dùng, chủ dự án Google Cloud cần xác nhận:
1. Sheets API đã bật; consent screen/test users được cấu hình.
2. Web OAuth client cho phép origin `https://adamavaadam.github.io` (không thêm `/phantichso`). Với localhost QA, thêm `http://127.0.0.1:4173` nếu muốn thử OAuth tại máy.
3. Google Sheet để Bị hạn chế, chỉ chia sẻ cho tài khoản được phép. App không thay đổi quyền Sheet. Scope readonly có thể đọc các Sheet tài khoản có quyền xem; mã ứng dụng chỉ gọi ID Sheet cố định.
4. Người dùng bấm Kết nối Google rồi cấp quyền chỉ đọc. Connector trong chat không tự cung cấp quyền/token cho website.

Bản Pages công khai vỏ giao diện và quy tắc, Google thực thi quyền truy cập dữ liệu. Không cung cấp đăng nhập admin giả ở client. Nếu cần admin/password: chạy `secure-server.cjs` trên Node + HTTPS theo SECURITY_SETUP.md, và vẫn kết nối Google để đọc Sheet. Chưa triển khai máy chủ này lên dịch vụ ngoài vì chưa có hosting/runtime secrets được cấp.

AI hội thoại cần một máy chủ xác thực và khóa AI lưu bằng biến môi trường, hạn mức và chính sách chia sẻ dữ liệu. Không thêm ô nhập khóa AI lên Pages.

## Kiểm tra và triển khai
Node 18+ (CI Node 22), không cần npm install:
```
node test-tours.cjs
node test-hub.cjs
node test-auth.cjs
```
GitHub Pages: Settings → Pages → Deploy from branch → main / root. Hub tại `/phantichso/hub.html`, ứng dụng cũ tại `/phantichso/`. Workflow verify chỉ chạy kiểm thử, không thay cấu hình Pages hoặc deploy máy chủ. Không upload snapshot dữ liệu thật vào repo hoặc artifact công khai.

Đã kiểm tra tổng đầu đơn trực tiếp qua connector khớp WH_DongBo và mã khách không trùng. Đọc DATA_MODEL.md để biết phạm vi và cảnh báo. QA trình duyệt không thay thế việc cấp quyền Google thật của người sử dụng.

Tài liệu API chính thức:
- https://developers.google.com/identity/oauth2/web/guides/use-token-model
- https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets.values/batchGet

## Quyền nguồn tại thời điểm bàn giao
Connector xác minh 03/11/2026: Sheet có permission `anyone / reader / allowFileDiscovery=false` (ai có liên kết đều đọc được). Đây là cấu hình công khai ở nguồn; OAuth của Hub không thể che truy cập trực tiếp. Chủ Sheet cần chuyển General access thành Restricted, giữ chủ sở hữu và các tài khoản đồng bộ/nhân viên được phép. Chưa thay quyền chia sẻ vì yêu cầu dùng Sheet làm nguồn chỉ đọc; cần kiểm tra công cụ đồng bộ có dùng tài khoản Google trước khi thu hồi truy cập ẩn danh.

Kiểm thử mô hình với toàn bộ nguồn thật: 9.528 đơn, 15.566 chi tiết, 10.776 khách, 2.530 sản phẩm; tổng đầu đơn khớp WH_DongBo. 2.542 khách có giao dịch, 1.783 ghép tọa độ, 9 mã tọa độ trùng bị loại, 19 đơn chưa khớp danh mục khách. Không lưu dữ liệu thật vào repo. Luồng OAuth đầy đủ còn cần người dùng đăng nhập/cấp quyền trên website.

## Sửa nền bản đồ 403
Thay Referrer-Policy no-referrer bằng strict-origin-when-cross-origin ở trang Hub, máy chủ và ảnh tile Leaflet. Chỉ gửi origin công khai của ứng dụng đến OpenStreetMap, không gửi mã khách/tọa độ điểm trong Referer. Không thêm proxy hoặc đổi máy chủ để né chặn. Bổ sung cảnh báo tileerror; giữ caching mặc định của trình duyệt. Chính sách: https://operations.osmfoundation.org/policies/tiles/

## Đăng nhập Google theo BHVer1
Trang đầu chỉ hiển thị nút Đăng nhập. Dùng lại Web OAuth Client ID của BHVer1, không tạo dự án Google Cloud mới. Google xác minh email qua UserInfo (sub + email + email_verified=true). Chỉ mở Hub sau khi tải/đối soát Sheet thành công; lỗi hoặc hủy đăng nhập giữ màn hình khóa. Đăng xuất/hết hạn quay về màn hình đăng nhập và xóa bộ nhớ. Không nhập email thủ công, không dùng địa chỉ email tự khai để mở khóa.

Không có danh sách email cố định do người dùng chưa chỉ định; cùng mô hình BHVer1, quyền đọc do Google Sheet kiểm soát. Với Sheet công khai, mọi tài khoản Google đã xác minh có thể đọc; cần Restricted và chia sẻ đúng tài khoản để giới hạn người dùng thực sự. Vỏ đăng nhập trên Pages không thay thế phân quyền Sheet hoặc xác thực máy chủ. Các phạm vi openid/email mới có thể cần đồng ý lại trong dự án Cloud hiện có. Không tự động chấp nhận quyền thay người dùng.
