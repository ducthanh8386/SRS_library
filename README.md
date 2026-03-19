# SRS_library

# 📚 LibManager Pro - Hệ Thống Quản Lý Thư Viện Web

Chào mừng bạn đến với **LibManager Pro**, đồ án website quản lý thư viện được xây dựng hoàn toàn bằng HTML, CSS và JavaScript thuần (Vanilla JS). Dự án mô phỏng một hệ thống thực tế với đầy đủ các nghiệp vụ quản lý thư viện theo Tài liệu đặc tả yêu cầu phần mềm (SRS).

## 🚀 Các Tính Năng Nổi Bật

Hệ thống hỗ trợ 3 vai trò người dùng riêng biệt với phân quyền rõ ràng:

### 1. 👤 Độc Giả (Reader)
- **Xem & Tìm kiếm sách:** Lọc sách theo tên và thể loại.
- **Mượn sách:** Đặt lịch mượn sách tiện lợi.
- **Quản lý cá nhân:** Xem lịch sử mượn trả, cập nhật thông tin cá nhân (Tên, Email).
- **Bảo mật:** Đổi mật khẩu tài khoản.

### 2. 🔖 Thủ Thư (Librarian)
- **Quản lý Kho sách:** Thêm, Sửa, Xóa thông tin sách trong thư viện.
- **Quản lý Thể loại:** Thêm, Xóa các danh mục loại sách.
- **Duyệt mượn & Nhận trả:** Xử lý các yêu cầu mượn sách từ độc giả, cập nhật số lượng sách trong kho tự động.
- **🔔 Bảng Thông Báo:** Tự động tính toán hạn trả (14 ngày), nhắc nhở các đơn mượn **"Chưa trả"** hoặc **"Quá thời hạn"**.

### 3. 🛡️ Quản Trị Viên (Admin)
- **Quản lý Tài khoản (CRUD):** Thêm, sửa, xóa, cấp quyền cho Thủ thư và Độc giả.
- **📊 Bảng Thống Kê (Dashboard):** Xem báo cáo trực quan về tổng số sách mượn, doanh thu tiền phạt và chi phí nhập sách theo tháng.

---

## 🛠️ Công Nghệ Sử Dụng
- **Giao diện (Frontend):** HTML5, CSS3 (Thiết kế Dark/Light mode hiện đại, Responsive cơ bản).
- **Xử lý Logic (Backend logic):** JavaScript (ES6+), mô hình Single Page Application (SPA).
- **Cơ sở dữ liệu:** Trình duyệt `localStorage` (Giả lập Database lưu trữ dữ liệu vĩnh viễn trên trình duyệt mà không cần cài đặt Server).

---

## 📂 Cấu Trúc Thư Mục Dự Án
Dự án được tối ưu hóa thành các tệp độc lập, dễ dàng bảo trì và phát triển:
```text
📦 SRS_library
 ┣ 📜 index.html    # Giao diện chính và cấu trúc xương của toàn bộ ứng dụng
 ┣ 📜 style.css     # Định dạng giao diện, hiệu ứng, màu sắc
 ┣ 📜 script.js     # Xử lý toàn bộ logic nghiệp vụ (Auth, CRUD, Routing)
 ┣ 📜 database.js   # Khởi tạo và quản lý dữ liệu mẫu vào LocalStorage
 ┣ 📜 logo.svg      # Logo vector của ứng dụng
 ┗ 📜 README.md     # Tài liệu hướng dẫn sử dụng