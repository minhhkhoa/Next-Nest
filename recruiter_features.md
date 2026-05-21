# Tài liệu Chi tiết Chức năng & Tính năng - Actor: Recruiter / Recruiter Admin (Nhà tuyển dụng)

Tài liệu này mô tả chi tiết các chức năng, luồng nghiệp vụ, API tương ứng và các quy tắc hệ thống dành cho Actor **Recruiter (Nhà tuyển dụng)** và **Recruiter Admin (Quản trị tuyển dụng doanh nghiệp)** trong hệ thống Next-Nest. Tài liệu này được xây dựng dựa trên việc phân tích mã nguồn thực tế của dự án để phục vụ cho việc thiết kế Biểu đồ hoạt động (Activity Diagram).

---

## 1. Tổng quan về Actor Recruiter & Recruiter Admin

Hệ thống phân chia nhà tuyển dụng thành hai cấp bậc chính để quản lý doanh nghiệp hiệu quả:

- **Recruiter (HR thông thường)**: Thành viên thuộc công ty. Có quyền đăng tin tuyển dụng (ở trạng thái chờ duyệt), xử lý các đơn ứng tuyển, phản hổi chat của ứng viên giải đáp thắc mắc về job.
- **Recruiter Admin (Admin công ty)**: Người đại diện/chủ tài khoản doanh nghiệp (thường là người đầu tiên đăng ký công ty trên hệ thống). Có toàn bộ quyền hạn của Recruiter thường, đồng thời có thêm các đặc quyền quản trị: cập nhật thông tin công ty, phê duyệt yêu cầu gia nhập của các HR khác, đuổi thành viên khỏi công ty, phê duyệt tin tuyển dụng của HR nội bộ để đăng công khai.

---

## 2. Danh sách các Nhóm chức năng chi tiết

### 2.1. Nhóm chức năng: Quản lý Tài khoản & Đăng ký doanh nghiệp

#### A. Đăng ký & Đăng nhập (Auth)

- **Mô tả**: Đăng ký tài khoản nhà tuyển dụng riêng biệt.
- **Luồng hoạt động**:
  - Đăng ký: FE gọi `POST /api/auth/recruiter-register` $\rightarrow$ BE tạo tài khoản với vai trò mặc định là `RECRUITER`.
  - Đăng nhập bằng Email/Password $\rightarrow$ `POST /api/auth/login` (Tương tự Candidate nhưng không hỗ trợ Social Login qua Google/Facebook để bảo mật thông tin doanh nghiệp).

#### B. Đăng ký Công ty hoặc Gia nhập Công ty (Company Registration / Join Flow)

- **Mô tả**: Nhà tuyển dụng liên kết tài khoản của mình với một thực thể doanh nghiệp.
- **Luồng hoạt động**:
  - **Trường hợp 1: Tạo mới công ty (Trở thành Recruiter Admin)**:
    1.  Nhà tuyển dụng điền thông tin doanh nghiệp. Hệ thống yêu cầu kiểm tra mã số thuế trước để tránh trùng lặp: `POST /api/company/check-tax-code`.
    2.  Nếu mã số thuế chưa tồn tại, gửi yêu cầu tạo công ty: `POST /api/company`.
    3.  BE tạo bản ghi công ty mới ở trạng thái chờ duyệt (`status: PENDING`), tự động gán user tạo làm chủ sở hữu (Recruiter Admin) và liên kết `companyID` vào thông tin `employerInfo` của user.
    4.  Yêu cầu này sẽ được gửi tới Admin hệ thống để phê duyệt.
  - **Trường hợp 2: Gia nhập công ty đã tồn tại (Trở thành Recruiter thường)**:
    1.  Nhà tuyển dụng tìm kiếm công ty trên hệ thống.
    2.  Gửi yêu cầu xin gia nhập công ty: `PATCH /api/user/join-company` (gửi kèm `companyId` muốn gia nhập).
    3.  Yêu cầu này sẽ nằm ở danh sách chờ duyệt của công ty đó và chờ `Recruiter Admin` phê duyệt.

---

### 2.2. Nhóm chức năng: Quản trị Doanh nghiệp (Dành riêng cho Recruiter Admin)

#### A. Phê duyệt thành viên gia nhập công ty

- **Mô tả**: Duyệt hoặc từ chối các yêu cầu xin gia nhập công ty từ các HR khác.
- **Luồng hoạt động**:
  1.  Lấy danh sách yêu cầu gia nhập công ty: `GET /api/company/join-requests`.
  2.  Duyệt yêu cầu: Gọi `PATCH /api/user/approve-join-request` (gửi kèm `userId` và trạng thái `APPROVED` hoặc `REJECTED`).
  3.  Nếu duyệt thành công, BE cập nhật trường `employerInfo.companyID` của user xin gia nhập bằng ID công ty, và chuyển vai trò của họ thành `RECRUITER` chính thức của công ty.

#### B. Quản lý danh sách thành viên công ty (HR Members)

- **Mô tả**: Xem danh sách các HR thuộc công ty và quản lý nhân sự.
- **Luồng hoạt động**:
  - Xem danh sách thành viên công ty: `GET /api/company/get-member-company`.
  - Mời thành viên rời khỏi công ty (Đuổi HR): Gọi `DELETE /api/company/members/:id` (xóa liên kết công ty trong `employerInfo` của user đó, chuyển họ về trạng thái tự do).

#### C. Cập nhật thông tin công ty

- **Mô tả**: Chỉnh sửa mô tả, quy mô, địa chỉ, logo, website của công ty.
- **Luồng hoạt động**: `PATCH /api/company/:id` (chỉ Recruiter Admin của công ty đó mới được thực hiện).

---

### 2.3. Nhóm chức năng: Quản lý Tin tuyển dụng (Job Management)

#### A. Đăng tin tuyển dụng mới

- **Mô tả**: Soạn thảo và đăng tải thông tin tuyển dụng công việc mới.
- **Luồng hoạt động**:
  1.  Nhà tuyển dụng điền thông tin công việc (Tiêu đề, mô tả JD, yêu cầu kỹ năng, mức lương, kinh nghiệm, địa điểm, ngành nghề...).
  2.  Gửi yêu cầu tạo tin: `POST /api/jobs`.
  3.  BE kiểm tra trạng thái hoạt động của công ty (thông qua `CompanyStatusGuard` - công ty phải được Admin hệ thống duyệt và đang hoạt động mới được đăng tin).
  4.  Tạo tin tuyển dụng:
      - Nếu người tạo là `Recruiter` thường: Tin tuyển dụng ở trạng thái chờ duyệt nội bộ.
      - Nếu người tạo là `Recruiter Admin`: Tin tuyển dụng được đăng công khai ngay lập tức.

#### B. Phê duyệt tin tuyển dụng nội bộ (Dành riêng cho Recruiter Admin)

- **Mô tả**: Duyệt các tin tuyển dụng do các HR thành viên của công ty mình tạo ra để đăng công khai lên hệ thống.
- **Luồng hoạt động**:
  - Gọi `PATCH /api/jobs/verify-job` (gửi `jobId` và trạng thái phê duyệt).
  - Bảo mật: Chỉ Recruiter Admin của công ty sở hữu tin tuyển dụng đó mới được quyền thực hiện duyệt.

#### C. Cập nhật, Ẩn/Hiện, Xóa tin tuyển dụng

- **Luồng hoạt động**:
  - Cập nhật tin: `PATCH /api/jobs/:id`.
  - Xóa tin tuyển dụng: `DELETE /api/jobs/:id` (xóa mềm).
  - Quản lý danh sách tin của công ty: `GET /api/jobs/filter` (lấy danh sách công việc thuộc `companyId` của nhà tuyển dụng đăng nhập, hiển thị cả tin nháp, tin chờ duyệt và tin đã đăng).

#### D. Yêu cầu đưa tin tuyển dụng lên nổi bật (Request HOT Job)

- **Mô tả**: Gửi yêu cầu làm nổi bật công việc tại trang chủ để tăng lượt tiếp cận ứng viên.
- **Luồng hoạt động**:
  1.  Chọn tin tuyển dụng muốn làm nổi bật $\rightarrow$ Gửi yêu cầu `POST /api/jobs/request-hot` (chứa `jobId`).
  2.  Trạng thái yêu cầu HOT Job sẽ được gửi tới Admin hệ thống để phê duyệt.

---

### 2.4. Nhóm chức năng: Quản lý Đơn ứng tuyển (Application Management)

#### A. Quản lý danh sách đơn ứng tuyển

- **Mô tả**: Xem danh sách các ứng viên đã nộp đơn vào các công việc của công ty mình.
- **Luồng hoạt động**:
  - Gọi API: `GET /api/application` (BE tự động match `employerInfo.companyID` của nhà tuyển dụng để đảm bảo chỉ trả về đơn ứng tuyển của công ty đó, hỗ trợ phân trang và lọc theo trạng thái đơn).

#### B. Xem chi tiết hồ sơ & Ghi nhận lượt xem CV

- **Mô tả**: Xem thông tin chi tiết và file CV của ứng viên nộp đơn.
- **Luồng hoạt động**:
  1.  Nhấp xem chi tiết đơn ứng tuyển $\rightarrow$ Gọi API `GET /api/application/:id`.
  2.  BE kiểm tra cờ `isViewed` (Đã xem) của đơn ứng tuyển. Nếu đây là lần đầu tiên nhà tuyển dụng xem đơn này (`isViewed: false`), BE sẽ cập nhật `isViewed = true` và tự động ghi nhận log vào mảng `history`.
  3.  BE phát sự kiện real-time `APPLICATION_STATUS_CHANGED` thông qua Socket Gateway để gửi thông báo tức thời tới ứng viên: "Nhà tuyển dụng đã xem hồ sơ của bạn".

#### C. Thay đổi trạng thái ứng tuyển (Duyệt/Từ chối đơn)

- **Mô tả**: Cập nhật trạng thái xử lý đơn ứng tuyển và thông báo cho ứng viên.
- **Luồng hoạt động**:
  1.  Nhà tuyển dụng chọn trạng thái mới cho đơn ứng tuyển: `REVIEWING` (Đang xem xét), `INTERVIEW` (Hẹn phỏng vấn), `APPROVED` (Chấp nhận nhận việc), hoặc `REJECTED` (Từ chối).
  2.  Gửi yêu cầu cập nhật: `PATCH /api/application/:id`.
  3.  BE kiểm tra quyền sở hữu công ty của nhà tuyển dụng đối với đơn này, cập nhật trường `status` và ghi nhận một log cập nhật vào mảng `history`.
  4.  BE phát sự kiện real-time `APPLICATION_STATUS_CHANGED` $\rightarrow$ Socket Gateway bắn thông báo trực tiếp qua socket của ứng viên để họ cập nhật trạng thái đơn ngay tức thì.

#### D. Đánh giá độ khớp CV ứng viên với JD bằng AI (AI JD Match)

- **Mô tả**: Sử dụng trí tuệ nhân tạo (Gemini LLM) để so khớp và đánh giá mức độ tương thích giữa nội dung CV của ứng viên nộp đơn với mô tả công việc (JD) của tin tuyển dụng đó.
- **Luồng hoạt động**:
  1.  Từ giao diện quản lý đơn ứng tuyển, nhà tuyển dụng nhấp nút "So khớp AI" tại phần chi tiết hồ sơ ứng viên $\rightarrow$ Mở modal `AiMatchModal`.
  2.  Frontend gửi yêu cầu `POST /api/ai/jd-match` với payload `{ cvId, jobId }`.
  3.  Backend nhận yêu cầu, truy xuất nội dung chi tiết của CV (kỹ năng, kinh nghiệm, thông tin dự án) và thông tin của công việc (yêu cầu kỹ năng, mô tả công việc, cấp bậc, kinh nghiệm).
  4.  Backend tổng hợp thành dữ liệu ngữ cảnh (CV Context & Job Context), định dạng qua Template Prompt `jdMatchPromptTemplate` và gửi sang Gemini LLM qua LangChain.
  5.  Gemini LLM phân tích, chấm điểm và trả về kết quả định dạng JSON gồm:
      - Điểm tương thích (`match_score` từ 0 đến 100).
      - Danh sách các kỹ năng đáp ứng (`matched_skills`).
      - Danh sách các kỹ năng còn thiếu hoặc cần bổ sung (`missing_skills`).
      - Nhận xét đánh giá chi tiết tổng quan (`notes`).
  6.  Frontend nhận phản hồi và hiển thị trực quan thông qua biểu đồ phần trăm điểm số, khung nhận xét chi tiết và các thẻ kỹ năng (đáp ứng / thiếu) giúp nhà tuyển dụng đưa ra quyết định duyệt đơn nhanh chóng.

---

### 2.5. Nhóm chức năng: Chat thời gian thực (Real-time Chat)

- **Mô tả**: Nhắn tin trực tiếp với ứng viên để trao đổi, phỏng vấn sơ bộ.
- **Luồng hoạt động**:
  1.  Từ trang chi tiết đơn ứng tuyển hoặc sidebar chat, nhấp chọn ứng viên $\rightarrow$ Gọi REST API `POST /api/chat/conversations` (gửi `candidateId` và `jobReferenceId` nếu có) để lấy phòng chat.
  2.  Các thao tác nhắn tin, nhận tin real-time và hiển thị Sidebar tương tự Candidate, sử dụng REST API `/api/chat/messages` và namespace `/chat` websocket.
- **Quy tắc nghiệp vụ**:
  - Tin nhắn mới từ ứng viên khi HR đang offline sẽ làm tăng số lượng tin nhắn chưa đọc của công ty (`unreadCompany`).
  - Có thể gán một HR cụ thể (`assignedRecruiterId`) theo dõi cuộc trò chuyện này để phân chia công việc trong công ty.

---

### 2.6. Nhóm chức năng: Đặt Banner Quảng cáo (Advertising Booking)

#### A. Xem lịch trống vị trí quảng cáo

- **Mô tả**: Xem danh sách các ngày đã có công ty khác thuê quảng cáo của từng vị trí (AdSlot) để chọn ngày trống.
- **Luồng hoạt động**: Gọi `GET /api/ad-booking/busy-dates/:slotCode` $\rightarrow$ Trả về danh sách các khoảng ngày đã bị đặt trước của vị trí quảng cáo đó.

#### B. Đặt quảng cáo mới & Thanh toán tự động (SePay Webhook)

- **Mô tả**: Thuê vị trí quảng cáo, upload banner và tiến hành thanh toán chuyển khoản.
- **Luồng hoạt động**:
  1.  Nhà tuyển dụng vào trang quảng cáo, xem các vị trí đang hoạt động (`GET /api/ad-slot/public`).
  2.  Chọn vị trí, nhập thời gian thuê (bắt đầu, kết thúc), upload ảnh banner lên Cloudinary, nhập link điều hướng khi click banner (`targetUrl`).
  3.  Hệ thống tính toán tổng tiền dựa trên đơn giá của Slot đó.
  4.  Nhấp "Đặt quảng cáo" $\rightarrow$ FE gọi `POST /api/ad-booking` $\rightarrow$ BE tạo đơn đặt quảng cáo ở trạng thái `PENDING_PAYMENT` và tạo một giao dịch thanh toán trong bảng `AdPayment` với nội dung chuyển khoản duy nhất (`transferContent`, ví dụ: `NNEST 12345`).
  5.  Hệ thống hiển thị mã QR thanh toán (QR chứa đúng nội dung chuyển khoản và số tiền cần chuyển).
  6.  Nhà tuyển dụng quét mã QR và thực hiện chuyển khoản qua ngân hàng.
  7.  Khi ngân hàng nhận tiền, SePay gửi Webhook callback tới API của hệ thống: `POST /api/ad-payment/webhook` (kèm theo dữ liệu giao dịch và header authorization bảo mật).
  8.  BE tiếp nhận webhook, xác thực token, tìm giao dịch thanh toán theo `transferContent`. Nếu khớp số tiền, cập nhật trạng thái thanh toán thành `PAID` và cập nhật trạng thái Booking quảng cáo:
      - Nếu slot đó đang trống trong khoảng thời gian đã đặt: Chuyển booking sang `SCHEDULED` (Đã lên lịch).
      - Nếu slot đang bị chiếm bởi quảng cáo khác cùng thời điểm (do xếp trùng): Đưa booking vào trạng thái chờ `WAITING_SLOT` và gán số thứ tự xếp hàng `queueNo` để hệ thống tự động chạy khi slot trống.
  9.  Quảng cáo sẽ tự động chuyển trạng thái `RUNNING` khi đến ngày chạy và `COMPLETED` khi hết hạn thông qua các tác vụ nền (Cron Job) của hệ thống.

---

### 2.7. Nhóm chức năng: Hỗ trợ & Báo cáo (Issue)

- **Mô tả**: Gửi khiếu nại về thanh toán quảng cáo, báo cáo lỗi hệ thống hoặc yêu cầu hỗ trợ kỹ thuật đến Admin hệ thống.
- **Luồng hoạt động**: Tương tự Candidate, sử dụng các API `POST /api/issue`, `GET /api/issue/me`, `PATCH /api/issue/:id` và `DELETE /api/issue/:id`.

---

<!-- ## 3. Các kịch bản nghiệp vụ chính phục vụ vẽ Activity Diagram

### Kịch bản 1: Luồng Đăng ký Công ty / Gia nhập Công ty (Company Affiliation Flow)

```mermaid
activity-diagram
Start -> Nhà tuyển dụng đăng nhập tài khoản Recruiter
-> Nhấp chọn mục "Quản lý Công ty"
-> Hệ thống kiểm tra xem tài khoản đã liên kết với công ty nào chưa
Nếu "Đã liên kết công ty":
    -> Hiển thị trang quản lý thông tin công ty/thành viên -> End
Nếu "Chưa liên kết công ty":
    -> Hệ thống hiển thị hai lựa chọn: [Tạo mới công ty] hoặc [Gia nhập công ty có sẵn]

    Lựa chọn 1: [Gia nhập công ty có sẵn]
        -> Tìm kiếm công ty theo tên
        -> Gửi yêu cầu gia nhập (join-company)
        -> Yêu cầu ở trạng thái Chờ duyệt
        -> Recruiter Admin của công ty đó phê duyệt yêu cầu (approve-join-request)
        -> Hệ thống cập nhật công ty cho User và đổi vai trò thành RECRUITER -> End

    Lựa chọn 2: [Tạo mới công ty]
        -> Nhập thông tin công ty và Mã số thuế (MST)
        -> Hệ thống kiểm tra MST trong DB (check-tax-code)
        Nếu "Mã số thuế đã tồn tại":
            -> Báo lỗi "Công ty đã được đăng ký trên hệ thống" -> Nhập lại
        Nếu "Mã số thuế hợp lệ":
            -> Hệ thống tạo công ty mới với trạng thái PENDING
            -> Tự động gán User làm Recruiter Admin (chủ doanh nghiệp)
            -> Chờ Admin hệ thống phê duyệt công ty (admin-verify) -> End
```

### Kịch bản 2: Luồng Đặt quảng cáo và Thanh toán tự động (Ad Booking & Payment Webhook Flow)

```mermaid
activity-diagram
Start -> Xem danh sách vị trí quảng cáo (ad-slot/public) -> Chọn vị trí
-> Xem lịch bận của vị trí đó (ad-booking/busy-dates/:slotCode)
-> Chọn khoảng thời gian thuê (startAt, endAt), upload banner, điền link điều hướng
-> Click "Đặt quảng cáo"
-> Hệ thống tạo AdBooking (status: PENDING_PAYMENT)
-> Hệ thống tạo AdPayment (status: PENDING) kèm transferContent duy nhất
-> Hệ thống hiển thị QR Code chuyển khoản kèm số tiền và nội dung chuyển khoản
-> Nhà tuyển dụng thực hiện chuyển khoản ngân hàng
-> Ngân hàng nhận tiền -> Gửi tín hiệu sang SePay -> SePay gọi Webhook POST /ad-payment/webhook
-> Hệ thống xác thực Webhook và tìm AdPayment dựa trên transferContent nhận được
Nếu "Không khớp số tiền hoặc sai thông tin":
    -> Cập nhật AdPayment thành FAILED -> End
Nếu "Thanh toán chính xác":
    -> Cập nhật AdPayment thành PAID
    -> Hệ thống kiểm tra lịch trống của vị trí quảng cáo trong thời gian đặt
    Nếu "Slot trống":
        -> Cập nhật AdBooking sang SCHEDULED (Chờ ngày chạy)
    Nếu "Slot đã bị đặt trùng":
        -> Cập nhật AdBooking sang WAITING_SLOT và xếp hàng (gán queueNo)
    -> Gửi thông báo "Thanh toán thành công" cho Nhà tuyển dụng -> End
``` -->
