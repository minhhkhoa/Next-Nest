# Tài liệu Chi tiết Chức năng & Tính năng - Actor: Admin / Super Admin (Quản trị viên hệ thống)

Tài liệu này mô tả chi tiết các chức năng, luồng nghiệp vụ, API tương ứng và các quy tắc hệ thống dành cho Actor **Admin / Super Admin (Quản trị viên hệ thống)** trong hệ thống Next-Nest. Tài liệu này được xây dựng dựa trên việc phân tích mã nguồn thực tế của dự án để phục vụ cho việc thiết kế Biểu đồ hoạt động (Activity Diagram).

---

## 1. Tổng quan về Actor Admin / Super Admin

- **Mô tả**: Là người có quyền hạn cao nhất trong hệ thống, chịu trách nhiệm quản lý, điều phối toàn bộ hoạt động của nền tảng Next-Nest bao gồm phê duyệt doanh nghiệp, kiểm duyệt tin tuyển dụng, cấu hình quảng cáo, quản lý danh mục dữ liệu, phân quyền tài khoản, giải quyết khiếu nại của người dùng và theo dõi báo cáo thống kê hệ thống.
- **Đặc quyền Super Admin**: Một tài khoản có vai trò `role_super_admin` sẽ được hệ thống bỏ qua mọi bước kiểm tra phân quyền chi tiết (Bypass in `PermissionGuard`) và có quyền truy cập vào tất cả các API, tài nguyên trên toàn hệ thống.

---

## 2. Danh sách các Nhóm chức năng chi tiết

### 2.1. Nhóm chức năng: Báo cáo Thống kê (System Dashboard)

- **Mô tả**: Theo dõi tổng thể hiệu suất hoạt động của hệ thống tuyển dụng.
- **Luồng hoạt động**:
  - Truy cập trang Dashboard $\rightarrow$ FE gửi các yêu cầu thống kê $\rightarrow$ BE truy vấn cơ sở dữ liệu MongoDB và trả về các số liệu:
    - Tổng số lượng ứng viên (Candidates) và nhà tuyển dụng (Recruiters).
    - Số lượng công ty đã đăng ký và đang hoạt động.
    - Số lượng bài đăng tuyển dụng (Jobs) mới theo tháng/tuần.
    - Tổng số đơn ứng tuyển (Applications) được nộp và tỷ lệ duyệt đơn.
    - Thống kê doanh thu từ dịch vụ đặt quảng cáo (AdBooking) của các doanh nghiệp.

---

### 2.2. Nhóm chức năng: Quản lý Người dùng (User Management)

- **Mô tả**: Quản lý danh sách tài khoản người dùng và phân chia vai trò trong hệ thống.
- **Luồng hoạt động**:
  - **Xem danh sách người dùng**: Gọi `GET /api/user/filter` (lọc theo tên, email, địa chỉ, vai trò và hỗ trợ phân trang).
  - **Xem chi tiết thông tin người dùng**: Gọi `GET /api/user/:id` (xem thông tin tài khoản và profile chi tiết).
  - **Cập nhật vai trò (Role Change)**: Gọi `PATCH /api/user/:id/role` (gửi kèm `roleID` mới để nâng cấp hoặc hạ cấp quyền tài khoản, ví dụ: chuyển Candidate thành HR, gán quyền Admin phụ).
  - **Khóa / Xóa tài khoản**: Gọi `DELETE /api/user/:id` kèm theo tham số `newOwnerID` (đây là cơ chế xóa mềm đồng bộ - soft delete: chuyển quyền sở hữu các bài đăng tuyển dụng, đơn hàng của recruiter bị xóa sang cho recruiter khác để đảm bảo dữ liệu không bị lỗi liên kết).
  - **Khôi phục tài khoản**: Gọi `PATCH /api/user/:id/restore` để phục hồi lại tài khoản đã bị xóa mềm trước đó.

---

### 2.3. Nhóm chức năng: Kiểm duyệt Doanh nghiệp (Company Verification)

- **Mô tả**: Phê duyệt các công ty mới đăng ký để họ có quyền đăng tuyển dụng và hoạt động chính thức.
- **Luồng hoạt động**:
  1.  Admin vào danh sách chờ duyệt $\rightarrow$ Gọi `GET /api/company/filter?status=PENDING` để xem các công ty mới đăng ký.
  2.  Kiểm tra các thông tin pháp lý của doanh nghiệp (Tên công ty, mã số thuế, địa chỉ, website, giấy phép kinh doanh...).
  3.  **Xử lý phê duyệt (Verify)**: Gọi `PATCH /api/company/admin-verify` (gửi `companyId` và trạng thái `APPROVED` hoặc `REJECTED`).
      - Nếu duyệt thành công (`APPROVED`): Trạng thái công ty chuyển sang hoạt động. Tài khoản Recruiter Admin đăng ký công ty và các HR thành viên sẽ được phép đăng bài tuyển dụng và đặt quảng cáo.
      - Nếu từ chối (`REJECTED`): Công ty sẽ không được hiển thị và không được phép hoạt động trên nền tảng.
  4.  **Xóa công ty**: Gọi `DELETE /api/company/:id` hoặc `DELETE /api/company/deleteMany` để xóa mềm công ty vi phạm quy chuẩn.
  5.  **Khôi phục công ty**: Gọi `PATCH /api/company/restore/:id` để khôi phục công ty bị xóa mềm.

---

### 2.4. Nhóm chức năng: Kiểm duyệt Tin tuyển dụng (Job Review & HOT Job)

#### A. Quản lý danh sách tin tuyển dụng toàn hệ thống

- **Luồng hoạt động**: Gọi `GET /api/jobs` để xem danh sách toàn bộ tin tuyển dụng của tất cả các doanh nghiệp trên hệ thống. Admin có quyền ẩn hoặc xóa mềm các tin tuyển dụng có nội dung vi phạm pháp luật hoặc không phù hợp thông qua API `DELETE /api/jobs/:id`. Có thể khôi phục qua `PATCH /api/jobs/restore/:id`.

#### B. Phê duyệt trạng thái nổi bật (Verify HOT Job Request)

- **Mô tả**: Phê duyệt các yêu cầu mua dịch vụ/đăng ký làm nổi bật tin tuyển dụng của nhà tuyển dụng.
- **Luồng hoạt động**:
  1.  Admin tiếp nhận danh sách yêu cầu HOT Job.
  2.  Duyệt yêu cầu: Gọi `POST /api/jobs/set-hot` (gửi `jobId` và trạng thái duyệt `isHot: true/false`).
  3.  Khi được duyệt, công việc sẽ hiển thị ở khu vực "Việc làm nổi bật" tại trang chủ của ứng viên.

---

### 2.5. Nhóm chức năng: Thiết lập & Quản lý Quảng cáo (Advertising Management)

#### A. Cấu hình Vị trí quảng cáo (AdSlot)

- **Mô tả**: Định nghĩa và thiết lập các khu vực cho thuê banner quảng cáo trong ứng dụng.
- **Luồng hoạt động**:
  - **Tạo mới vị trí quảng cáo**: Gọi `POST /api/ad-slot` (Thiết lập mã code độc nhất ví dụ `HOME_TOP`, tên vị trí, trang hiển thị, kích thước width/height chuẩn của banner, đơn giá thuê mỗi ngày `pricePerDay`, số ngày thuê tối đa `maxDurationDays`).
  - **Quản lý danh sách AdSlot**: Gọi `GET /api/ad-slot` để lấy danh sách vị trí quảng cáo kèm phân trang và lọc.
  - **Cập nhật AdSlot**: Gọi `PATCH /api/ad-slot/:id` để thay đổi đơn giá, kích thước hoặc cấu hình.
  - **Bật/Tắt AdSlot**: Gọi `PATCH /api/ad-slot/:id/toggle-active` để bật hoặc tạm tắt vị trí quảng cáo này (khi tắt, nhà tuyển dụng không thể đặt lịch mới vào slot này).
  - **Xóa vị trí quảng cáo**: Gọi `DELETE /api/ad-slot/:id` (xóa mềm).

#### B. Quản lý Đơn đặt quảng cáo (AdBooking)

- **Mô tả**: Quản lý lịch chạy quảng cáo của tất cả doanh nghiệp trên hệ thống.
- **Luồng hoạt động**:
  - **Xem danh sách đơn đặt**: Gọi `GET /api/ad-booking/admin/all` để lấy toàn bộ các đơn đặt quảng cáo kèm trạng thái thanh toán và chạy banner.
  - **Hủy đơn đặt quảng cáo**: Gọi `PATCH /api/ad-booking/admin/cancel/:id` để hủy đơn quảng cáo của doanh nghiệp trong trường hợp vi phạm bản quyền banner hoặc hình ảnh không phù hợp (hệ thống sẽ dừng hiển thị và cập nhật trạng thái đơn thành `CANCELLED`).

---

### 2.6. Nhóm chức năng: Quản lý Phân quyền hệ thống (RBAC & PBAC Management)

- **Mô tả**: Thiết lập cơ chế bảo mật chi tiết cho toàn bộ hệ thống bằng vai trò và quyền hạn.
- **Luồng hoạt động**:
  - **Quản lý Quyền hạn (Permission)**:
    - Tự động khám phá các module nghiệp vụ trong NestJS qua `DiscoveryService` (`GET /api/permission/modules`).
    - Tạo mới quyền hạn: Gọi `POST /api/permission` (định nghĩa tên, mã code ví dụ `users.create`, API Path `/api/user`, HTTP Method `POST` và Nhóm module nghiệp vụ tương ứng).
    - Xem danh sách quyền hạn được nhóm theo Module nghiệp vụ: `GET /api/permission/get-group-module` (dùng để hiển thị sơ đồ tích chọn quyền trên giao diện Admin).
  - **Quản lý Vai trò (Role)**:
    - Tạo mới vai trò: Gọi `POST /api/role` (ví dụ tạo vai trò `SUPPORT_ADMIN`, hỗ trợ đa ngôn ngữ tên và mô tả vai trò).
    - Gán quyền cho vai trò: Khi tạo hoặc cập nhật vai trò (`PATCH /api/role/:id`), Admin gửi kèm danh sách mảng các `ObjectId` của các Permission được phép truy cập $\rightarrow$ Vai trò sẽ liên kết với các quyền tương ứng.

---

### 2.7. Nhóm chức năng: Quản lý Danh mục chuẩn (Industry & Skill)

- **Mô tả**: Quản lý dữ liệu chuẩn về kỹ năng chuyên môn và ngành nghề để người dùng lựa chọn đồng bộ trên toàn hệ thống.
- **Luồng hoạt động**:
  - Thực hiện các thao tác CRUD đối với danh mục **Ngành nghề (Industry)**: `POST /api/industry`, `GET /api/industry`, `PATCH /api/industry/:id`, `DELETE /api/industry/:id`.
  - Thực hiện các thao tác CRUD đối với danh mục **Kỹ năng (Skill)**: `POST /api/skill`, `GET /api/skill`, `PATCH /api/skill/:id`, `DELETE /api/skill/:id`.

---

### 2.8. Nhóm chức năng: Quản lý Tin tức (News & CateNews)

- **Mô tả**: Đăng tải các bài viết chia sẻ cẩm nang xin việc, bí quyết tuyển dụng.
- **Luồng hoạt động**:
  - Tạo mới/Cập nhật/Xóa danh mục tin tức: Gọi các API tương ứng trong module `cate-news`.
  - Viết bài viết mới: Gọi `POST /api/news` (tiêu đề, ảnh cover, nội dung HTML, liên kết danh mục `cateNewsID`).
  - Chỉnh sửa/Xóa bài viết tin tức: `PATCH /api/news/:id` hoặc `DELETE /api/news/:id`.

---

### 2.9. Nhóm chức năng: Hỗ trợ & Giải quyết khiếu nại (Issue Handling)

- **Mô tả**: Phản hồi các yêu cầu báo cáo lỗi, khiếu nại thanh toán từ phía Candidate và Recruiter.
- **Luồng hoạt động**:
  1.  Lấy danh sách yêu cầu hỗ trợ: Gọi `GET /api/issue/filter` (lọc theo trạng thái `PENDING`, `PROCESSING`, `RESOLVED`).
  2.  Xem chi tiết vấn đề: `GET /api/issue/:id` (đọc nội dung khiếu nại và xem ảnh đính kèm nếu có).
  3.  **Xử lý phản hồi (Reply & Resolve)**: Gọi `PATCH /api/issue/admin-reply` (gửi `issueId`, nội dung phản hồi `feedback` và trạng thái mới). Hệ thống cập nhật trạng thái yêu cầu và gửi phản hồi để người dùng kiểm tra ở trang cá nhân của họ.

---
