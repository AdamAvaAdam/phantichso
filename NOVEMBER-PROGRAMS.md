# Chương trình 03–13/11/2026

Nguồn: bốn ảnh chương trình do người dùng gửi ngày 04/11/2026, cùng các xác nhận trực tiếp trong chat. Xác nhận của người dùng ưu tiên khi khác ảnh.

## Phân nhóm đã xác nhận

- Bảng cao: `TierCode` bằng `BB` hoặc `BB2`; hoặc `ProvinceId` cũ `01` (Hà Nội) **và** `SalesStaffCode` phụ trách khách bằng `P.Anh`. Không dùng nhân viên trên đơn thay nhân viên phụ trách khách. Chuẩn hóa khoảng trắng/chữ hoa thường cho mã.
- Bảng thường: khách ngoài các nhóm trên. Không suy đoán theo tên khách/địa chỉ. Khách chưa khớp danh mục hoặc thiếu trường quyết định nhóm Hà Nội P.Anh giữ chờ xác minh.
- Đã kiểm tra nguồn thật: `CustomerType` hiện chứa mã 1/2; BB và BB2 nằm tại `TierCode`, cột đã có trong snapshot Hub. Không gán 1/2 thành bán buôn/bán lẻ.

## Mốc quà tặng chung

| Cách tính | Khách thường | BB/BB2 hoặc Hà Nội P.Anh | Quà |
|---|---:|---:|---|
| Tổng đơn cùng khách trong ngày | 30 triệu | Không áp dụng | Máy vắt cam Sharp EJ-J256-WH |
| Tổng đơn cùng khách trong ngày | 70 triệu | 100 triệu | Nồi cơm điện Sharp KS-181TJV |
| Cộng dồn cả kỳ | 200 triệu | 300 triệu | Lò vi sóng Electrolux EMM23D22B |
| Cộng dồn cả kỳ | 400 triệu | 550 triệu | Máy giặt Toshiba AW-M905BV (MK) |
| Cộng dồn cả kỳ | 500 triệu | 700 triệu | Máy giặt Toshiba AW-M1100JV (MK) |
| Cộng dồn cả kỳ | 700 triệu | 1 tỷ | Máy giặt Electrolux EWF1024D3EC |

Loại **điều hòa Daikin và Panasonic** khỏi quà tặng chung. Người dùng xác nhận bảng cao bắt đầu mốc ngày 100 triệu; không áp dụng mốc 50 triệu xuất hiện trong ảnh.

## Mốc điều hòa Daikin riêng

| Khách thường | BB/BB2 hoặc Hà Nội P.Anh | Quà |
|---:|---:|---|
| 400 triệu | 600 triệu | Lò vi sóng Electrolux EMM23D22B |
| 600 triệu | 800 triệu | Máy lọc không khí Daikin MCQ30ZVM7-A |

Chỉ **điều hòa Daikin**, không tính tất cả sản phẩm hãng Daikin. Sản phẩm thiếu thông tin xác định điều hòa giữ chờ phân loại; không đoán từ model.

## Phép tính và điều kiện nhận thưởng

- Từ 03/11 đến hết 13/11/2026 theo ngày chứng từ Việt Nam, không tính giao dịch tương lai so với ngày theo dõi. Cộng theo mã khách, không gộp khách trùng tên.
- Tiền đầu đơn `TotalAmount` theo quy ước đã chốt của Hub: đã gồm VAT, không nhân thêm. Không dùng đơn giá × số lượng thay tiền sau chiết khấu đầu đơn. Đơn có lẫn sản phẩm được/không được tính chỉ phân bổ khi tiền chi tiết khớp chính xác và không có chiết khấu; trường hợp còn lại chờ đối chiếu.
- Loại đơn hủy trạng thái 9 khỏi cả mốc ngày và kỳ. Giữ nguyên đơn âm chưa hủy. Phần trừ hàng trả lại được bổ sung sau; giữ lưu ý trên giao diện.
- Mốc ngày: cộng các đơn hợp lệ cùng mã khách, cùng ngày; không cộng nhiều ngày hoặc nhiều khách để đạt mốc ngày. Ngày có đơn chờ phân loại không kết luận đạt mốc.
- Thanh toán dứt điểm toàn bộ nợ đến hết 31/10. Đơn 03–13/11 được xem xét nợ 5–10 ngày cho khách thanh toán đúng hạn, theo danh sách BGD duyệt; thanh toán đúng hạn 14/11. Không thanh toán đúng hạn thì không nhận thưởng. NVBH đăng ký và báo kế toán trước hết 05/11.
- Chưa có dữ liệu xác nhận đăng ký, tất toán công nợ, thanh toán và phê duyệt. Chỉ báo mốc doanh số; **không tự kết luận được nhận quà**. Chưa chốt thưởng ngày có cộng với thưởng kỳ hoặc cách cộng nhiều mốc; không tính số quà phải trả.
- Bốn chương trình mới cùng tồn tại với ba chương trình cũ. Không cộng doanh số chương trình giao nhau thành tổng doanh số chung.

Kiểm tra: `node --test november-programs.test.cjs november-interface.test.cjs`.
