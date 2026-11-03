# VT Intelligence Hub

Ứng dụng: https://adamavaadam.github.io/phantichso/hub.html?v=hub3-1
Repo: AdamAvaAdam/phantichso. Google Cloud Web OAuth Client ID dùng lại từ BHVer1.

## Bản hợp nhất
- Dashboard gọn, không slogan/banner; KPI ghi rõ triệu/tỷ đồng gồm VAT, bộ lọc thời gian/địa bàn/đơn chứa hãng/trạng thái/khách. Bộ lọc hãng tính toàn bộ đầu đơn chứa hãng, không tự phân bổ chiết khấu.
- Customer 360, danh sách giao dịch và kế hoạch tuyến CSV.
- Bản đồ nhanh giữ liên kết hồ sơ 360°. Chế độ **Bộ công cụ BHVer1** giữ kho/bán kính/nhóm phục vụ, khoảng cách đường xe chạy van/xe tải, khoanh tỉnh/huyện và nhiều tỉnh, ranh giới huyện năm 2020, nhãn đại lý, tuyến thị trường, đối soát, danh sách chưa định vị/chưa khớp và xuất/nhập thiết lập/XLSX. Bản đồ đầy đủ có thêm nút mở hồ sơ 360° và kỳ mặc định theo bộ lọc Hub. Chọn kỳ lịch dài hơn phạm vi đồng bộ sẽ báo chưa đủ dữ liệu.
- Quà tặng/du lịch mở trong Hub, cùng dữ liệu đã tải. Giữ công thức gốc trong index.html, kiểm thử hồi quy trước/sau. Root/index ở cửa sổ chính chuyển vào Hub; không điều hướng ra ngoài khi mở chương trình. Đơn nhiều sản phẩm có chiết khấu chưa phân bổ hoặc dữ liệu thiếu không tự cộng vào chương trình; số đơn cần đối soát và phạm vi kỳ được thông báo. Kết quả chương trình là tạm tính theo mọi trạng thái nguồn; chưa có bảng nghĩa mã trạng thái để xác nhận hủy/hoàn tất.
- AI hội thoại chưa kết nối dịch vụ; các nhận xét hiện có là phép tính từ dữ liệu, không giả là nội dung mô hình AI.

## Ghi nhớ thiết bị
Sau đăng nhập Google và tải thành công, snapshot được mã hóa AES-GCM trong IndexedDB cùng CryptoKey không xuất được của thiết bị/tài khoản. **Không lưu token Google, client secret hoặc mật khẩu.** Mở lại cùng trình duyệt tự mở bản lưu, không yêu cầu Google hay tải lại Sheet. Hết token vẫn xem/lọc bản lưu; bấm **Cập nhật dữ liệu** mới kết nối lại nếu cần.

Bản lưu luôn ghi thời điểm dữ liệu thực sự được tải. Cập nhật lỗi giữ bản trước. Nhãn/kho/vùng, chỉnh sửa chương trình và kế hoạch tuyến lưu cùng tài khoản. Đăng xuất tắt tự mở; ghi chú vẫn có thể khôi phục sau khi chính tài khoản đó đăng nhập lại. **Nguồn & thiết bị → Xóa bản dữ liệu trên thiết bị** xóa snapshot và thiết lập trong bản lưu. Không tự chuyển giữa các máy. Xóa dữ liệu trình duyệt/chế độ riêng tư có thể làm mất bản lưu.

Mã hóa không thay bảo vệ thiết bị hoặc chống mã độc cùng origin. Việc tự mở bản lưu là lựa chọn ghi nhớ trên thiết bị tin cậy, không phải phiên Google được kiểm tra lại ở mỗi lần mở. Chưa có service worker để bảo đảm vỏ app mở khi mất mạng hoàn toàn; khi vỏ đã tải, số liệu đã lưu xem được không gọi Google. Nền bản đồ và đường đi vẫn cần mạng.

## Kết nối Google và quyền nguồn
Scopes: spreadsheets.readonly, openid, email. Google xác minh email qua UserInfo; không mở bằng email tự gõ. Google Sheet là nguồn duy nhất, không gọi API Warehouse suy đoán.
- Bật Sheets API, OAuth consent/test users trong dự án Cloud BHVer1 đang có.
- Authorized JavaScript origin: https://adamavaadam.github.io (không thêm /phantichso).
- Sheet cần Restricted, chỉ chia sẻ cho tài khoản người dùng/đồng bộ. Lần kiểm tra trước Sheet có anyone/reader; đăng nhập Hub không che được nguồn đang công khai. App không tự sửa quyền chia sẻ.
- Biết link không thay quyền Google. Scope readonly được Google thực thi, có thể đọc các Sheet tài khoản có quyền; mã ứng dụng chỉ gọi Sheet ID cố định.

## Bản đồ và dịch vụ ngoài
Nguồn bộ công cụ: AdamAvaAdam/BHVer1 commit e8c33a10be4b7a2aecbbe134615430b8c0285b83. Gói HTML gốc được nén/chia phần và kiểm tra SHA-256 khi mở; không chứa dữ liệu khách/đơn tải thật. index.html chương trình gốc không bị thay công thức; chỉ thêm entry.js để root mở Hub.

Tile OpenStreetMap dùng Referer origin hợp lệ và cache mặc định, không proxy/né chặn. Nền vệ tinh dùng ArcGIS theo BHVer1. Khoảng cách/lộ trình dùng các dịch vụ BHVer1 đã có (OSRM/Valhalla/Nominatim); thao tác tính đường gửi tọa độ được chọn đến dịch vụ đó, không gửi token Google. Dịch vụ ngoài có thể giới hạn hoặc thiếu dữ liệu cấm tải trọng/theo giờ; không thay hướng dẫn giao thông thực tế.

## Kiểm thử
Node 18+ (CI Node 22), không cần npm install:
```
node test-tours.cjs
node test-hub.cjs
node test-login.cjs
node test-login-flow.cjs
node test-modules.cjs
node test-auth.cjs
```
Đã QA trình duyệt với dữ liệu thử riêng trên localhost: đăng nhập/tải, quà tặng hiển thị đúng gross/Sharp net trong Hub, bản đồ BHVer1, tạo nhãn và mở lại giữ nhãn, mở lại Dashboard không có request Sheet. Không commit fixture QA hoặc dữ liệu kinh doanh thật.

GitHub Pages: main/root. secure-server.cjs là phương án Node + HTTPS tùy chọn, hỗ trợ module/khung cùng origin; đọc SECURITY_SETUP.md. Chưa triển khai máy chủ ngoài hoặc AI backend.
