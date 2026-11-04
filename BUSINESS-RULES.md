# Quy tắc doanh số

## Danh sách kiểm tra chất lượng dữ liệu

- Mục Kiểm tra dữ liệu dùng cùng bộ lọc với tổng quan và chỉ xét đơn chưa hủy. Một đơn có thể có nhiều vấn đề nhưng chỉ cộng một lần vào số đơn/tiền cần kiểm tra.
- Chưa khớp khách, lệch số dòng hoặc thiếu thông tin sản phẩm không tự làm mất tiền đầu đơn. Giữ nguyên số tiền nguồn; không coi tổng tiền của các đơn cảnh báo là số tiền đã sai hoặc bị loại.
- Không tự tạo khách, ghép theo tên, xóa chi tiết hoặc sửa TotalLine để hết cảnh báo. Cần xác minh mã khách và cấu trúc chứng từ tại nguồn.
- Nếu dữ liệu đã đồng bộ khớp Warehouse nhưng đầu đơn và chi tiết nguồn vẫn lệch, đồng bộ lại không tự khắc phục được. Các chương trình có điều kiện tiếp tục chờ phân loại theo quy tắc hiện hành.
- CSV đối soát chỉ xuất dữ liệu từ bản đang tải và nhóm đang chọn; bảo vệ chuỗi có thể trở thành công thức. Đăng xuất xóa danh sách và các tổng kiểm tra khỏi giao diện.

Chương trình 03–13/11/2026: xem `NOVEMBER-PROGRAMS.md`. Bảng cao áp dụng `TierCode` BB/BB2 hoặc Hà Nội cũ (01) do P.Anh phụ trách; mốc ngày cộng đơn cùng khách trong ngày; Daikin riêng chỉ tính điều hòa. Điều kiện nhận thưởng chờ xác minh, không tự duyệt từ doanh số.

Xác nhận trực tiếp bởi người dùng ngày 03/11/2026:

- `DocStatus` / `temp.DocStatus` bằng `9` là **đơn đã hủy**. Luôn loại khỏi doanh số, số đơn có hiệu lực, biểu đồ, bản đồ và tiến độ/thưởng của mọi chương trình, kể cả khi không chọn bộ lọc trạng thái.
- Giữ nguyên bản ghi nguồn và chi tiết đơn hủy để tra cứu, đối soát. Khi xem đơn hủy, hiển thị tiền nguồn, lý do loại và doanh số được cộng bằng 0. Không xóa hoặc sửa số tiền nguồn.
- Đối soát `WH_DongBo` dùng toàn bộ snapshot nguồn, bao gồm đơn hủy; tổng này khác với doanh số nghiệp vụ đã loại hủy. Không bỏ đơn hủy trước bước kiểm tra toàn vẹn snapshot.
- Chưa gán thêm ý nghĩa cho mã 4 hoặc các mã khác. Đơn âm chưa hủy vẫn giữ theo nguồn.

Kiểm tra quy tắc: `node --test cancellation.test.cjs`.

## Chuẩn hóa ngày 04/11/2026

- **Hạng mục còn lại: trừ hàng bán trả lại.** Người dùng đồng ý bổ sung sau (04/11/2026), không hủy yêu cầu. Giữ lưu ý thiếu dữ liệu trả hàng trên giao diện; chỉ hoàn thành khi có nguồn, quy tắc ghi nhận và đối soát chống trừ hai lần. Tiếp tục các chức năng hiện có trong thời gian chờ.

- Doanh số đầu đơn dùng `TotalAmount`, đã gồm VAT và chiết khấu theo xác nhận người dùng. Không cộng VAT thêm; không thay tiền đầu đơn bằng số lượng × đơn giá chi tiết.
- Phạm vi ngày dùng `DocDate`, bao gồm cả ngày đầu và ngày cuối; từ chối ngày lịch không tồn tại. Cảnh báo riêng khi chọn vượt phạm vi lịch sử nguồn.
- Theo cùng một bộ lọc: tổng đầu đơn nguồn − tổng tiền đơn hủy = doanh số được tính. Tiền đơn hủy có thể âm; giữ dấu gốc. CSV và bảng đối soát giữ cả đơn hủy.
- Giữ nguyên đơn âm chưa hủy. Chưa có chứng từ trả hàng riêng, không tự gán đơn âm/IsAdjustment thành hàng bán trả lại. Không gọi chỉ tiêu đầu đơn là doanh thu thuần hoặc lợi nhuận.
- Khách hàng phân biệt theo mã; chuẩn hóa mã tỉnh số một chữ số thành hai chữ số khi lọc, không suy đoán tỉnh cũ từ địa chỉ.
- Bộ lọc hãng lấy toàn bộ đơn có chứa hãng, không phải tiền phân bổ cho hãng. Không cộng các tổng theo hãng hoặc các chương trình giao nhau thành doanh số chung.
- Đơn thiếu khách/chi tiết vẫn giữ số tiền đầu đơn trong tổng và được cảnh báo. Phân loại chương trình tiếp tục chờ đối soát nếu thiếu điều kiện; không tự phân bổ chiết khấu hoặc VAT cho dòng sản phẩm.
- Mã thiếu/trùng, tổng snapshot không khớp hoặc tiền vượt giới hạn số nguyên an toàn chặn sử dụng bản tải mới. Không chỉnh sửa dữ liệu nguồn để ép khớp tổng.
- Giao diện hiển thị luồng đọc nguồn thật của phiên hiện tại. Chưa có dịch vụ tìm kiếm khách online hoặc AI; không hiển thị truy vấn/nguồn tìm kiếm giả.

Kiểm tra: `node --test cancellation.test.cjs promotions.test.cjs standardization.test.cjs`.
