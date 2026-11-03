# Quy tắc doanh số

Xác nhận trực tiếp bởi người dùng ngày 03/11/2026:

- `DocStatus` / `temp.DocStatus` bằng `9` là **đơn đã hủy**. Luôn loại khỏi doanh số, số đơn có hiệu lực, biểu đồ, bản đồ và tiến độ/thưởng của mọi chương trình, kể cả khi không chọn bộ lọc trạng thái.
- Giữ nguyên bản ghi nguồn và chi tiết đơn hủy để tra cứu, đối soát. Khi xem đơn hủy, hiển thị tiền nguồn, lý do loại và doanh số được cộng bằng 0. Không xóa hoặc sửa số tiền nguồn.
- Đối soát `WH_DongBo` dùng toàn bộ snapshot nguồn, bao gồm đơn hủy; tổng này khác với doanh số nghiệp vụ đã loại hủy. Không bỏ đơn hủy trước bước kiểm tra toàn vẹn snapshot.
- Chưa gán thêm ý nghĩa cho mã 4 hoặc các mã khác. Đơn âm chưa hủy vẫn giữ theo nguồn.

Kiểm tra quy tắc: `node --test cancellation.test.cjs`.
