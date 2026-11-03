# Mô hình dữ liệu đã xác minh qua connector

Sheet nguồn: https://docs.google.com/spreadsheets/d/1-9_nJCydsL3bmdcjKUr24FLkAkJsf6lKb8T9SXNhv4k/edit

Xác minh 03/11/2026. Gid 1411013804 là WH_ChiTietDon, không phải toàn bộ mô hình. `hub-core.js` chứa tiêu đề cột chính xác và từ chối dữ liệu khi schema đổi. Không commit bản ghi cá nhân/đơn hàng thật.

## Nguồn dùng trong Hub
| Tab | Khóa / cột chính | Vai trò |
|---|---|---|
| WH_KhachHang | CustomerCode, CustomerName, ProvinceId, ProvinceName, AddressFull, Phone, SalesStaffCode, CustomerType, RegionCode, TierCode, Status | Danh mục khách toàn công ty |
| WH_SanPham | ProductSku, ProductName, ModelCode, BrandCode, CategoryCode, SubCategoryCode, BaseUnit, WarrantyMonth, WeightKg, Status, Specifications | Danh mục sản phẩm |
| WH_DonBan | AppOrderId, OrderRefNo, DocDate, CustomerCode, CustomerName, ProvinceId, SalesStaffCode, TotalGoodsAmount, TotalDiscount, TotalAmount, DocStatus, TotalLine, PromoDescription | Nguồn KPI đầu đơn |
| WH_ChiTietDon | id, AppOrderId, LineOrder, ProductCode, ProductName, WarehouseCode, Quantity, UnitPrice, IsGift, WPromoCode, GiftProductCode, GiftQuantity | Liên kết đơn → sản phẩm, tìm đơn chứa hãng |
| WH_DoanhSo | CustomerCode, CustomerName, ProvinceId, ProvinceName, Month, OrderCount, TotalAmount | Tổng hợp tháng tham khảo; không cộng chồng vào KPI đầu đơn |
| WH_DongBo | Muc, GiaTri | Revision, phạm vi ngày, số dòng và tổng kiểm soát |
| Định vị | Mã điểm, Tên điểm, Địa chỉ, Kinh độ, Vĩ độ | Ghép CustomerCode = Mã điểm |

Hub đọc metadata trước, dùng tên tab thật và grid bounds, tải theo khối 3.000 dòng. Đối chiếu WH_DongBo trước/trong/sau lượt đọc, số đơn/chi tiết/khách và tổng tiền. Từ chối revision thay đổi hoặc tổng không khớp; giữ bản thành công trước đó khi cập nhật lỗi. Giới hạn snapshot upstream: revision không thay không thể phát hiện mọi sửa tay ngoài công cụ đồng bộ; Định vị không nằm trong transaction WH_.

Doanh số là TotalAmount đầu đơn đã gồm VAT, không nhân thêm 1,08. Không tính tổng doanh số bằng Quantity × UnitPrice vì chiết khấu đầu đơn và đơn nhiều hãng chưa có quy tắc phân bổ. Mã trạng thái quan sát có 4, 9; chưa có bảng nghĩa trạng thái, không tự gán là đã bán/hủy. Có mọi trạng thái và điều chỉnh không dương trong tổng nguồn. Không suy đoán KPI mục tiêu/tăng trưởng/công nợ/tiềm năng.

WH_DongBo cho biết 6 tab thay cùng lượt: khách, sản phẩm, đơn, chi tiết, doanh số, đồng bộ. Tồn kho không thuộc lượt hiện tại. Số liệu ngoài khoảng DonTuNgay–DonDenNgay được đánh dấu chưa đủ kỳ. Hồ sơ và tuyến đang lấy tập khách có giao dịch trong bộ lọc.

## Các tab đã kiểm tra, chưa đưa vào KPI mới
| Tab | Cấu trúc / lý do |
|---|---|
| Hàng tồn | Báo cáo có hàng tiêu đề nhóm, không phải bảng chuẩn row 1 |
| Giá 03/11/2026 | Tên đổi theo ngày (lúc đọc đầu là Giá 02/11/2026); A mã hàng, B tên, C model, D giá, E điều chỉnh, F giá cuối; có dòng tên nhóm xen kẽ |
| Thông số sản phẩm | Mã sản phẩm, Tên sản phẩm, Thông số & Tính năng nổi bật, Nguồn dữ liệu, Trạng thái / Cần bổ sung |
| Đơn hàng | Số, Ngày, Đối tượng, Nhân viên, Kho, Nội dung, Đvt, Số lượng, Đơn giá, Giá trị, Giá trị đã trừ chiết khấu, Thu nợ cũ, Ngày dự kiến, Ghi chú, Giá tiền, Tổng tiền, Hãng; không trộn vào WH_ |
| Bảng tổng hợp 2 | Đối tượng, SUM của Tổng tiền; bảng tổng hợp nguồn khác |
| Danh sách khách | Bảng cũ có Tên, Mã, Nhóm mẹ, Phân hạng, Tỉnh, Huyện, địa chỉ/liên hệ và thông tin nghiệp vụ khác; Hub dùng WH_KhachHang |
| Giao hàng | Vùng, Đại lý, Địa chỉ, Cung đường, Ghi chú; chưa xác minh join bằng mã |
| Trang tính8 | STT, Tên công ty, Tên điểm, Tên riêng, Địa chỉ, Bán kính, Kinh độ, Vĩ độ, Hiển thị điểm, Điểm kiểm soát, Ranh giới đường tròn/đa giác, Nhóm điểm, Mô tả |
| Gói mẫu | Hai dòng tiêu đề, dòng 3 là Gói, Mã hàng, Giá tiền, Thông số sản phẩm, Thưởng và các cột khách |
| WH_TonKho | id, ProductSku, ItemCode, ItemName, Unit, WarehouseCode, CloseInventory, updateLatestAt, insertLatestAt; chưa đồng bộ cùng revision hiện tại |
