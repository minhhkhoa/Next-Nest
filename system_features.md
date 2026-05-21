# Tài liệu Chức năng Hệ thống Chạy nền & Tiện ích Chung (System & Common Features)

Tài liệu này mô tả các **tác vụ chạy nền (Cron Jobs/Background Tasks)**, **các tiện ích chung dành cho mọi người dùng (i18n, Theme, Security...)** và **các điểm công nghệ nổi bật** của hệ thống Next-Nest. Tài liệu được xây dựng dựa trên việc phân tích mã nguồn thực tế để phục vụ trực tiếp cho việc viết báo cáo và vẽ biểu đồ hoạt động.

---

## 1. Các tác vụ chạy nền định kỳ (Cron Jobs / Background Tasks)

Hệ thống sử dụng module `@nestjs/schedule` để quản lý các tác vụ định kỳ nhằm tự động hóa quy trình nghiệp vụ và tối ưu hóa hiệu năng cơ sở dữ liệu.

### 1.1. Đồng bộ lượt xem Job từ Redis về MongoDB (Job Views Sync)

- **Mục đích**: Tối ưu hóa hiệu năng I/O cho MongoDB. Khi ứng viên xem tin tuyển dụng, lượng view mới được lưu tạm thời vào Redis (`job_views:jobId`). Một tác vụ nền sẽ gom các lượt xem này và cập nhật hàng loạt xuống MongoDB để tránh ghi đĩa liên tục.
- **Tần suất chạy**: Mỗi 10 phút một lần (`EVERY_10_MINUTES`).
- **Cơ chế hoạt động**:
  1.  Quét các key dạng `job_views:*` trên Redis.
  2.  Trích xuất `jobId` và số lượt xem tích lũy từ value của key.
  3.  Thực hiện cập nhật tăng dần lượt xem (`$inc: { totalViews: viewsToAdd }`) vào bảng `Job` trong MongoDB.
  4.  Xóa key tương ứng trên Redis để dọn dẹp bộ nhớ.

### 1.2. Tự động đóng các tin tuyển dụng đã hết hạn (Auto-Close Expired Jobs)

- **Mục đích**: Tự động chuyển các tin tuyển dụng quá hạn nộp hồ sơ về trạng thái ngưng hoạt động.
- **Tần suất chạy**: Mỗi 1 giờ một lần (`EVERY_HOUR`).
- **Cơ chế hoạt động**:
  1.  Tìm các bài đăng tuyển dụng đang hoạt động (`status: 'active'`) có ngày hết hạn (`endDate`) nhỏ hơn thời điểm hiện tại.
  2.  Cập nhật trạng thái của các bài đăng này thành `inactive` để ẩn chúng khỏi trang tìm kiếm công khai.

### 1.3. Tự động gỡ bỏ trạng thái nổi bật (Auto-Remove HOT Status)

- **Mục đích**: Hủy trạng thái ưu tiên hiển thị (HOT) của tin tuyển dụng khi hết thời gian mua dịch vụ.
- **Tần suất chạy**: Hàng ngày lúc 00:00 (`EVERY_DAY_AT_MIDNIGHT`).
- **Cơ chế hoạt động**: Tìm các bài đăng có `isHot.isHotJob = true` nhưng thời hạn hot (`isHot.hotUntil`) nhỏ hơn thời điểm hiện tại $\rightarrow$ Cập nhật `isHotJob = false` và `hotUntil = null`.

### 1.4. Tự động dọn rác đơn đặt quảng cáo chưa thanh toán (Auto-Expire Unpaid AdBookings)

- **Mục đích**: Hủy các yêu cầu đặt quảng cáo quá hạn thanh toán để giải phóng slot cho doanh nghiệp khác.
- **Tần suất chạy**: Mỗi 1 phút một lần (`EVERY_MINUTE`).
- **Cơ chế hoạt động**:
  1.  Tìm các `AdBooking` ở trạng thái chờ thanh toán (`PENDING_PAYMENT`) được tạo trước thời điểm hiện tại hơn 15 phút.
  2.  Cập nhật trạng thái booking sang `EXPIRED`.
  3.  Cập nhật trạng thái giao dịch `AdPayment` tương ứng sang `EXPIRED`.
  4.  Bắn thông báo real-time qua socket (`NotificationsGateway`) báo cho nhà tuyển dụng biết giao dịch đặt quảng cáo đã bị hủy.

### 1.5. Kích hoạt và Kết thúc lịch chạy quảng cáo (Ad Lifecycle Management)

- **Mục đích**: Tự động cập nhật trạng thái hiển thị banner quảng cáo theo thời gian đặt lịch.
- **Tần suất chạy**: Mỗi 1 giờ một lần (`EVERY_HOUR`).
- **Cơ chế hoạt động**:
  - **Kích hoạt**: Tìm các booking đã thanh toán thành công và đang chờ chạy (`status: 'SCHEDULED'`) có ngày bắt đầu chạy `startAt <= hôm nay` $\rightarrow$ Chuyển trạng thái sang `RUNNING` để đưa banner lên giao diện ngoài.
  - **Kết thúc**: Tìm các booking đang chạy (`status: 'RUNNING'`) có ngày kết thúc `endAt < hôm nay` $\rightarrow$ Chuyển trạng thái sang `COMPLETED` để ẩn banner.

---

## 2. Các tính năng và Tiện ích chung hệ thống (Common Features)

### 2.1. Hỗ trợ đa ngôn ngữ toàn diện (Internationalization - i18n)

- **Phía Client (Next.js)**: Sử dụng thư viện `next-intl` để quản lý đa ngôn ngữ. Toàn bộ các route được đặt dưới thư mục nhóm ngôn ngữ `[locale]` (ví dụ: `/vi/find-jobs`, `/en/find-jobs`). Người dùng có thể nhấp chọn chuyển đổi ngôn ngữ Việt - Anh trực tiếp trên thanh điều hướng (Navbar).
- **Phía Server (NestJS)**: Các trường thông tin có tính chất tĩnh hoặc mô tả dài như Tên và Mô tả vai trò (`Role`), hiển thị của Quyền hạn (`Permission`) được thiết kế theo cấu trúc `MultiLang` (chứa các thuộc tính con `vi` và `en`). BE sử dụng `TranslationService` để dịch dữ liệu dựa trên ngôn ngữ yêu cầu gửi kèm từ Header của API.

### 2.2. Chế độ giao diện Sáng / Tối (Light / Dark Theme)

- **Mô tả**: Hỗ trợ người dùng thay đổi giao diện theo sở thích, giảm mỏi mắt khi sử dụng hệ thống vào ban đêm.
- **Triển khai**: Frontend sử dụng thư viện `next-themes` kết hợp với hệ thống biến màu của CSS variables trong Tailwind/Shadcn UI. Trạng thái theme được lưu vào `localStorage` của trình duyệt để giữ nguyên giao diện trong các phiên làm việc tiếp theo.

### 2.3. Hệ thống thông báo thời gian thực (Real-time Notification Gateway)

- **Mô tả**: Gửi thông báo tức thời tới người dùng mà không cần tải lại trang.
- **Công nghệ**: Sử dụng WebSockets thông qua thư viện Socket.IO tích hợp trong NestJS Gateway.
- **Các luồng thông báo chính**:
  - _Ứng tuyển_: Khi ứng viên nộp đơn $\rightarrow$ Gửi thông báo tức thời cho HR.
  - _Xem đơn & Đổi trạng thái_: Khi HR xem CV hoặc cập nhật trạng thái đơn tuyển dụng $\rightarrow$ Gửi thông báo tức thời cho Ứng viên.
  - _Quảng cáo quá hạn_: Khi đơn đặt quảng cáo bị hủy do quá 15 phút chưa chuyển khoản $\rightarrow$ Báo cho nhà tuyển dụng.

### 2.4. Xác thực bảo mật nâng cao (Security & Token Lifecycle)

- **Cơ chế lưu trữ**: Access Token và Refresh Token được lưu trữ trực tiếp trong Cookies dưới dạng `HttpOnly` và `Secure`. Tránh việc bị đánh cắp token qua các cuộc tấn công mã độc XSS.
- **Bảo vệ API**: Sự phối hợp giữa `JwtAuthGuard` (xác thực danh tính) và `PermissionGuard` (kiểm tra quyền hạn chi tiết dựa trên HTTP Method và API Path).
- **Bỏ qua xác thực linh hoạt**:
  - `@Public()`: Cho phép truy cập không cần đăng nhập (Trang chủ, Tìm việc, Đọc tin tức).
  - `@PublicPermission()`: Yêu cầu đăng nhập nhưng không kiểm tra quyền hạn cụ thể (Trang cá nhân, Cài đặt, Tạo CV).

### 2.5. Cơ chế xóa mềm đồng bộ (Soft Delete & Restore)

- **Mô tả**: Mọi hành động xóa (Người dùng, Công ty, Tin tuyển dụng, Quảng cáo, Yêu cầu hỗ trợ) đều sử dụng cơ chế xóa mềm (Soft Delete).
- **Triển khai**: Sử dụng mongoose plugin `soft-delete-plugin-mongoose`.
- **Lợi ích**:
  - Tránh mất mát dữ liệu lịch sử hoặc dữ liệu liên kết (ví dụ: Xóa một công ty thì không làm lỗi cơ sở dữ liệu của các đơn ứng tuyển cũ thuộc công ty đó).
  - Cho phép Super Admin dễ dàng khôi phục (`restore`) dữ liệu bị xóa nhầm hoặc do vi phạm quy chế sau khi đã xử lý.

### 2.6. Hệ thống gửi Email tự động (Mailer Service)

- **Công nghệ**: Tích hợp `@nestjs-modules/mailer` kết hợp với Handlebars (`.hbs`) templates.
- **Các loại mail gửi tự động**:
  - Mail chứa link khôi phục mật khẩu (kèm mã token bảo mật hết hạn sau 15 phút).
  - Mail xác nhận đã tiếp nhận yêu cầu hỗ trợ (chứa mã ticket rút gọn dạng `#XXXXXX`).
  - Mail thông báo khi Admin đã phản hồi khiếu nại/yêu cầu hỗ trợ (gửi kèm link xem chi tiết phản hồi).

---

## 3. Điểm nổi bật & Công nghệ nổi trội của Dự án (Project Highlights)

### 3.1. Tự động hóa thanh toán đặt quảng cáo (SePay Webhook Automation)

- **Điểm nổi bật**: Đây là tính năng đột phá giúp tự động hóa 100% luồng thuê quảng cáo của doanh nghiệp mà không cần nhân viên duyệt thủ công.
- **Cơ chế đối soát**: Hệ thống tạo ra một nội dung chuyển khoản duy nhất (`transferContent`) cho mỗi giao dịch. QR Code hiển thị trên màn hình chứa đúng nội dung này. Khi nhà tuyển dụng chuyển khoản, SePay Webhook lập tức gửi callback kèm payload giao dịch ngân hàng $\rightarrow$ BE tìm đúng `AdPayment` và kích hoạt tự động lịch quảng cáo (`SCHEDULED`) hoặc xếp hàng (`WAITING_SLOT`) chỉ trong vài giây.

### 3.2. Trò chuyện AI Stream qua Server-Sent Events (SSE)

- **Điểm nổi bật**: Tính năng tư vấn việc làm tích hợp AI mang lại trải nghiệm mượt mà nhờ công nghệ Server-Sent Events (SSE), giúp phản hồi của AI được hiển thị dưới dạng gõ chữ thời gian thực thay vì bắt người dùng chờ đợi phản hồi dài.
- **Tối ưu hóa chi phí & Token**: Hệ thống tự động làm sạch ngữ cảnh (`memory.clear()`) khi người dùng chuyển sang xem và hỏi đáp ở một công việc khác, giúp tiết kiệm dung lượng token gửi lên Gemini API (sử dụng phiên bản miễn phí tối ưu).

### 3.3. Khám phá Module nghiệp vụ động (Dynamic Module Discovery)

- **Điểm nổi bật**: Phía Server sử dụng `DiscoveryService` từ `@nestjs/core` để quét toàn bộ mã nguồn khi khởi chạy, tìm các class được đánh dấu `@BusinessModule()`.
- **Lợi ích**: Giúp Admin quản lý phân quyền cực kỳ linh hoạt. Khi lập trình viên thêm một chức năng mới phía Backend, hệ thống tự động nhận diện và hiển thị quyền hạn đó trên giao diện quản trị của Admin mà không cần viết code cấu hình thủ công trong cơ sở dữ liệu.

---
