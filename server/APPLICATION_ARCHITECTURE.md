# Kiến trúc Luồng ứng tuyển việc làm (Application Flow)

## 1. Tổng quan (Overview)
Tài liệu này mô tả chi tiết quá trình một ứng viên (Candidate) thực hiện nộp hồ sơ ứng tuyển vào một công việc (Job) và cách mà nhà tuyển dụng (Recruiter) tiếp nhận, xem xét cũng như cập nhật trạng thái của hồ sơ đó. Hệ thống sử dụng Next.js cho phía Client và NestJS cho phía Server, kết hợp với Socket.IO để xử lý thông báo báo theo thời gian thực (Real-time).

## 2. Kiến trúc phía Client (Next.js)

### 2.1. Phía Ứng viên (Candidate)
- **Giao diện người dùng (UI):** 
  - Tệp `client/src/components/ApplicationModal.tsx` là nơi ứng viên tương tác để gửi hồ sơ vào một công việc cụ thể.
  - Ứng viên có hai lựa chọn khi nộp hồ sơ: 
    1. **Tải lên CV (UPLOAD_CV):** Upload file định dạng cho phép (thường là PDF) lên dịch vụ Cloudinary và lấy URL (`cvUrl`).
    2. **Sử dụng CV hệ thống (SYSTEM_CV):** Lấy dữ liệu hồ sơ/CV đã tạo trực tiếp thông qua hệ thống của nền tảng (`systemCvData`).
- **Xác thực dữ liệu (Validation):**
  - Dữ liệu trước khi gửi đi được đánh giá và xác thực bằng Zod schema với biến `createApplicationSchema` nằm tại `client/src/schemasvalidation/application.ts`.
- **Gọi API:**
  - Sau khi thu thập đủ thông tin hợp lệ, Client sẽ đóng gói dữ liệu bao gồm `jobId`, hình thức gửi CV (loại mẫu) và dữ liệu CV, sau đó sử dụng custom hook `useCreateApplication()` (tích hợp React Query) để gọi hàm `applicationApiRequest.create` trong `client/src/apiRequest/application.ts` tới endpoint `POST /application`.

### 2.2. Phía Nhà tuyển dụng (Recruiter)
- **Quản lý danh sách (List Applications):**
  - Sử dụng API `applicationApiRequest.findAll` (`GET /application`) để lấy danh sách các hồ sơ xin việc, kết hợp với Pagination (phân trang) và các bộ lọc (filter) trạng thái.
- **Cập nhật và Đổi trạng thái (Update Status):**
  - UI cung cấp form để cập nhật trạng thái hồ sơ của ứng viên (ví dụ như `EditApplicationDialog.tsx` hoặc các Modal Edit).
  - Các trạng thái hợp lệ trong luồng bao gồm: `PENDING` (Chờ xử lý - mặc định khi ứng viên vừa nộp), `REVIEWING` (Đang xem xét), `INTERVIEW` (Phỏng vấn), `APPROVED` (Chấp nhận), và `REJECTED` (Từ chối).
  - Xác thực đầu vào với `updateApplicationSchema` (Zod).
  - Khi nhà tuyển dụng submit thay đổi, Client gọi tới endpoint `PATCH /application/:id` thông qua hàm `applicationApiRequest.update()`.

## 3. Kiến trúc phía Server (NestJS)

### 3.1. Controller và Service (`src/modules/application/`)
- **`application.controller.ts`**: Nơi tiếp nhận các request từ phía Client. Các endpoint được đặt sau các Guards (`JwtAuthGuard`, `RoleGuard` / UserDecorators) nhầm đảm bảo chỉ những User đã đăng nhập và có đúng quyền (Candidate / Recruiter) mới có thể thao tác.
- **`application.service.ts`**: Chứa Core Logic cốt lõi của quá trình xử lý đơn:
  - **Tạo đơn (Create):** 
    - Validate `jobId` để chắc chắn Job đang tồn tại và vẫn còn mở nhận hồ sơ.
    - Kiểm tra tính xác thực/hợp lệ của CV (Ví dụ: CV hệ thống phải khớp với dữ liệu thật trong DB của chính ứng viên đó).
    - Kiểm tra xem Ứng viên đã nộp đơn vào Job này trước đó hay chưa (Ngăn chặn việc nộp đơn nhiều lần / spam duplicates).
    - Lưu trữ dữ liệu xuống MongoDB (Sử dụng `applicationModel`) với trạng thái mặc định được set cứng là `PENDING`.
    - Khởi tạo lịch sử đơn (thuộc tính `history`): tự động ghi nhận thời điểm "Ứng viên nộp hồ sơ".
  - **Lấy danh sách và Phân quyền (FindAll):**
    - Chạy Pipeline Aggregation / Population dữ liệu từ Job, User, Company.
    - Điều kiện lọc thiết yếu (`$match`): Kiểm tra biến môi trường `filter.companyId = user.employerInfo.companyID`. Security requirement: **Nhà tuyển dụng chỉ có quyền xem được hồ sơ xin vào công ty của chính mình**.
  - **Xem chi tiết & Ghi log lượt xem (FindOne):**
    - Khi Recruiter lần đầu gọi API `GET /application/:id` để xem qua CV, server tự kiểm tra cờ (flag) `isViewed`. Nếu `isViewed == false`, nó sẽ tự động được set lên `true` để ứng viên biết rằng hồ sơ của mình "Đã được nhà tuyển dụng xem (Seen)".
  - **Cập nhật đơn (Update / Change Status):**
    - Xác minh quyền của người gửi request: Đảm bảo Recruiter cập nhật trạng thái đơn thuộc chuẩn xác công ty mình đứng tên.
    - Cập nhật trường `status` bằng trạng thái mới tương ứng.
    - Tự động đẩy (Push) một note hoặc ghi nhận về sự thay đổi trạng thái kèm thời gian vào mảng `history` trong Database. Giúp lưu lại dấu vết kiểm toán (Audit trail). Bản lưu này cực kì quan trọng đối với ứng viên để theo dõi tiến độ.

## 4. Luồng hoạt động & Thông báo theo thời gian thực (Real-time Flow)
Hệ thống tận dụng tối đa Event Emitter nội bộ kết hợp Socket.IO ở lớp Gateway để duy trì các flow thông báo giữa Ứng viên và Nhà tuyển dụng:

1. **Bước 1: Ứng viên nộp hồ sơ (Client 👉 Server)**
   - Client gửi payload HTTP đến `POST /application`.
   - Database cập nhật và lưu Application mới hoàn tất (Status = `PENDING`).
2. **Bước 2: Thông báo tới Recruiter (Server 👉 Client)**
   - `ApplicationService` phát ra một sự kiện nội bộ `APPLICATION_SUBMITTED`.
   - Socket Gateway bắt sóng sự kiện này -> Query tìm tất cả những account thuộc nhóm `recruiters` của công ty phát hành Job đó.
   - Bắn thông báo real-time: "Có một ứng viên mới nộp hồ sơ vào công việc XYZ".
3. **Bước 3: Nhà tuyển dụng xử lý đơn (Client 👉 Server)**
   - Nhà tuyển dụng click vào xem đơn chi tiết 👉 Gọi `GET /application/:id` 👉 Server đổi trạng thái `isViewed = true`.
   - Nhà tuyển dụng duyệt và chuyển trạng thái (VD: `APPROVED` hoặc `INTERVIEW`) 👉 Gọi `PATCH /application/:id`.
   - Server ghi đè trạng thái và append thêm 1 event vào `history`.
4. **Bước 4: Phản hồi tới Ứng viên (Server 👉 Client)**
   - Ngay sau khi lưu xuống file MongoDB thành công, Server kích hoạt sự kiện `APPLICATION_STATUS_CHANGED`.
   - Socket Gateway đón sự kiện, đẩy thẳng 1 thông báo Notification vào đúng socket duy nhất của Ứng viên gửi đơn: "Trạng thái hồ sơ vị trí XYZ của bạn đã được đối tác xem xét và cập nhật thành: ...".

## 5. Các tập tin quan trọng liên quan trong codebase
- **Client**:
  - `client/src/components/ApplicationModal.tsx`
  - `client/src/apiRequest/application.ts`
  - `client/src/schemasvalidation/application.ts`
  - Khu vực `client/src/lib/constant.ts` (Nơi định nghĩa các Application Status Enumeration)
- **Server**:
  - `server/src/modules/application/application.controller.ts`
  - `server/src/modules/application/application.service.ts`
  - `server/src/modules/application/schemas/application.schema.ts`
