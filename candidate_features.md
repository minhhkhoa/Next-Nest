# Tài liệu Chi tiết Chức năng & Tính năng - Actor: Candidate (Ứng viên)

Tài liệu này mô tả chi tiết các chức năng, luồng nghiệp vụ, API tương ứng và các quy tắc hệ thống dành cho Actor **Candidate (Ứng viên)** trong hệ thống Next-Nest. Tài liệu này được xây dựng dựa trên việc phân tích mã nguồn thực tế của dự án để phục vụ cho việc thiết kế Biểu đồ hoạt động (Activity Diagram).

---

## 1. Tổng quan về Actor Candidate

- **Mô tả**: Là người dùng cá nhân sử dụng hệ thống với mục đích tìm kiếm việc làm, tạo và quản lý hồ sơ ứng tuyển (CV), nộp đơn ứng tuyển vào các công việc, chat trao đổi trực tiếp với nhà tuyển dụng và sử dụng các công cụ hỗ trợ AI (tư vấn việc làm, chấm điểm CV, so khớp CV-JD).
- **Trạng thái tài khoản**: Cần đăng ký và đăng nhập để sử dụng hầu hết các tính năng cá nhân hóa. Các tính năng tìm kiếm việc làm, xem thông tin công ty và đọc tin tức có thể được truy cập dưới dạng Khách (Guest) mà không cần đăng nhập.

---

## 2. Danh sách các Nhóm chức năng chi tiết

### 2.1. Nhóm chức năng: Quản lý Tài khoản & Xác thực (Auth & Profile)

#### A. Đăng ký & Đăng nhập (Register & Login)

- **Mô tả**: Đăng ký tài khoản mới hoặc đăng nhập vào tài khoản hiện có.
- **Luồng hoạt động**:
  1.  Ứng viên điền thông tin đăng ký (Tên, Email, Mật khẩu) $\rightarrow$ FE gọi `POST /api/auth/register` $\rightarrow$ BE tạo tài khoản với vai trò mặc định là `CANDIDATE`.
  2.  Ứng viên đăng nhập bằng Email/Password $\rightarrow$ FE gọi `POST /api/auth/login` $\rightarrow$ BE xác thực và lưu `access_token` và `refresh_token` vào Cookie.
  3.  Đăng nhập thông qua Mạng xã hội: Ứng viên chọn đăng nhập bằng Google hoặc Facebook $\rightarrow$ BE xử lý chuyển hướng thông qua Passport Guards (`GET /api/auth/google`, `GET /api/auth/facebook`) $\rightarrow$ Nhận callback và gửi token về Client thông qua cơ chế `postMessage`.
- **Quy tắc nghiệp vụ**:
  - Tài khoản Recruiter không được phép đăng nhập hoặc liên kết qua mạng xã hội (buộc dùng Email/Password để quản lý doanh nghiệp chặt chẽ).
  - Hỗ trợ cơ chế tự động làm mới token (`GET /api/auth/refresh`) khi access token hết hạn.

#### B. Quản lý Hồ sơ cá nhân (Detail Profile)

- **Mô tả**: Thiết lập thông tin cá nhân chi tiết để làm cơ sở dữ liệu tạo CV trực tuyến và cung cấp ngữ cảnh cho AI.
- **Luồng hoạt động**:
  - Xem thông tin cá nhân: `GET /api/auth/profile`.
  - Tạo/Cập nhật thông tin chi tiết: `PATCH /api/detail-profile/:id` (Học vấn, kinh nghiệm làm việc, kỹ năng chuyên môn, dự án cá nhân, chứng chỉ...).
- **Quy tắc nghiệp vụ**:
  - Dữ liệu trong `DetailProfile` liên kết 1-1 với tài khoản `User`. Đây là nguồn dữ liệu để hệ thống tự động điền (auto-fill) khi ứng viên tạo CV hệ thống (`GET /api/user/resume-data`).

#### C. Quên mật khẩu & Đổi mật khẩu

- **Luồng hoạt động**:
  - Quên mật khẩu: Điền email $\rightarrow$ `POST /api/auth/forgot-password` $\rightarrow$ Nhận mail reset $\rightarrow$ Validate token (`GET /api/auth/validate-reset`) $\rightarrow$ Đặt mật khẩu mới (`POST /api/auth/reset-password`).
  - Đổi mật khẩu: Đăng nhập $\rightarrow$ Điền mật khẩu cũ/mới $\rightarrow$ `POST /api/auth/change-password`.

---

### 2.2. Nhóm chức năng: Tìm kiếm & Khám phá (Search & Discovery)

#### A. Tìm kiếm & Lọc việc làm nâng cao

- **Mô tả**: Tìm kiếm công việc công khai theo nhiều tiêu chí.
- **Luồng hoạt động**:
  - Truy cập Trang chủ/Trang tìm việc $\rightarrow$ Nhập từ khóa, lọc theo: ngành nghề (`industry`), mức lương, kinh nghiệm, cấp bậc, địa điểm $\rightarrow$ FE gọi `GET /api/jobs/search-public` hoặc `GET /api/jobs/filter-public` $\rightarrow$ Trả về danh sách công việc phù hợp kèm phân trang.
- **Quy tắc nghiệp vụ**:
  - Chỉ hiển thị các công việc ở trạng thái đã được phê duyệt (`status: APPROVED` hoặc đã được verify bởi Recruiter Admin) và chưa hết hạn.
  - Các công việc được duyệt là HOT Job (`isHot: true`) được ưu tiên hiển thị ở vị trí nổi bật tại Trang chủ.

#### B. Xem chi tiết công việc & Công ty

- **Mô tả**: Xem thông tin chi tiết về mô tả công việc (JD), yêu cầu, quyền lợi và thông tin công ty tuyển dụng.
- **Luồng hoạt động**:
  - Nhấp chọn công việc $\rightarrow$ `GET /api/jobs/:id` (đồng thời gửi IP của ứng viên để BE ghi nhận và tăng lượt xem `views` của công việc).
  - Xem công ty: `GET /api/company/:id` $\rightarrow$ Xem thông tin doanh nghiệp và danh sách công việc đang tuyển dụng của công ty đó.
  - Gợi ý công việc liên quan: `GET /api/jobs/:id/related`.

#### C. Đọc Tin tức & Cẩm nang nghề nghiệp

- **Luồng hoạt động**:
  - Xem danh sách tin tức: `GET /api/news/news-dashboard` hoặc `GET /api/news/filter` (lọc theo danh mục `cateNewsID`).
  - Xem chi tiết bài viết tin tức: `GET /api/news/:id`.

---

### 2.3. Nhóm chức năng: Quản lý CV/Resume (Resume Management)

- **Mô tả**: Ứng viên quản lý các bản CV dùng để nộp đơn ứng tuyển.
- **Luồng hoạt động**:
  - **Tạo mới CV (`POST /api/user-resume`)**: Ứng viên có thể tạo CV theo 2 hình thức:
    1.  _Tải lên CV (Upload PDF)_: Tải file lên Cloudinary $\rightarrow$ Lưu URL file vào database (`cvUrl`).
    2.  _CV hệ thống (System CV)_: FE gọi `GET /api/user/resume-data` để lấy thông tin từ Profile tự động điền vào các CV Template mẫu $\rightarrow$ Thiết kế, chỉnh sửa $\rightarrow$ Lưu dữ liệu CV trực tuyến (`systemCvData`).
  - **Xem danh sách CV**: `GET /api/user-resume` (Chỉ lấy các CV thuộc sở hữu của ứng viên đó).
  - **Cập nhật CV**: `PATCH /api/user-resume/:id` (Sửa file hoặc sửa nội dung CV hệ thống).
  - **Xóa CV**: `DELETE /api/user-resume/:id`.

---

### 2.4. Nhóm chức năng: Ứng tuyển & Theo dõi (Job Application)

#### A. Nộp hồ sơ ứng tuyển (Apply Job)

- **Mô tả**: Ứng viên nộp hồ sơ vào một công việc cụ thể.
- **Luồng hoạt động**:
  1.  Tại trang chi tiết công việc, chọn "Ứng tuyển ngay" $\rightarrow$ Hiển thị Modal ứng tuyển.
  2.  Chọn CV nộp: Chọn từ danh sách CV đã tải lên/tạo trực tuyến hoặc tải lên file mới.
  3.  Xác nhận ứng tuyển $\rightarrow$ FE validate bằng Zod schema `createApplicationSchema` $\rightarrow$ Gọi `POST /api/application` (gửi kèm `jobId`, hình thức CV, dữ liệu CV).
  4.  BE kiểm tra: Job có tồn tại và đang mở không? CV có hợp lệ không? Ứng viên đã nộp vào Job này chưa?
  5.  Nếu hợp lệ, BE tạo đơn ứng tuyển mới với trạng thái mặc định là `PENDING`. Đồng thời, khởi tạo mảng lịch sử đơn ứng tuyển (`history`) ghi nhận mốc thời gian "Ứng viên nộp hồ sơ".
  6.  BE phát sự kiện nội bộ `APPLICATION_SUBMITTED` $\rightarrow$ Socket Gateway gửi thông báo real-time tới tất cả tài khoản Recruiter của công ty phát hành Job.

#### B. Theo dõi trạng thái Ứng tuyển (Application Tracking)

- **Mô tả**: Xem danh sách các công việc đã ứng tuyển và tiến trình xử lý hồ sơ.
- **Luồng hoạt động**:
  - Ứng viên vào mục "Công việc đã ứng tuyển" $\rightarrow$ `GET /api/application` (lọc theo `candidateId` của ứng viên đăng nhập).
  - Xem lịch sử chi tiết đổi trạng thái của đơn: Xem mảng `history` trong đơn ứng tuyển (biết được thời điểm nhà tuyển dụng đã xem CV, thời điểm đổi sang Trạng thái mới: `REVIEWING` (Đang xem xét), `INTERVIEW` (Phỏng vấn), `APPROVED` (Chấp nhận), `REJECTED` (Từ chối)).
  - Nhận thông báo real-time: Khi nhà tuyển dụng xem đơn lần đầu (làm đổi `isViewed` sang `true`) hoặc cập nhật trạng thái đơn (BE phát sự kiện `APPLICATION_STATUS_CHANGED`) $\rightarrow$ Socket Gateway bắn thông báo trực tiếp qua kết nối socket của ứng viên để hiển thị Notification ngay trên màn hình.

---

### 2.5. Nhóm chức năng: Tương tác & Trò chuyện (Real-time Chat)

- **Mô tả**: Trao đổi trực tiếp với nhà tuyển dụng của công ty sở hữu bài đăng.
- **Luồng hoạt động**:
  1.  Tại trang chi tiết công việc hoặc chi tiết công ty, nhấp "Nhắn tin" $\rightarrow$ Gọi REST API `POST /api/chat/conversations` (gửi `companyId` và `jobReferenceId` nếu có) để tìm phòng chat cũ hoặc tạo phòng mới.
  2.  Hệ thống chuyển hướng ứng viên về trang Chat `/chat?conversationId=...`.
  3.  FE gọi API `GET /api/chat/conversations` (tải Sidebar danh sách phòng chat) và `GET /api/chat/messages/:conversationId` (tải lịch sử tin nhắn của phòng hiện tại).
  4.  FE thiết lập kết nối WebSocket tới namespace `/chat` và emit sự kiện `join_conversation` kèm theo `conversationId` để tham gia phòng chat ảo.
  5.  Khi nhắn tin: Ứng viên gõ tin nhắn $\rightarrow$ FE gọi REST API `POST /api/chat/messages` $\rightarrow$ BE lưu vào Database $\rightarrow$ BE kích hoạt sự kiện phát tin nhắn của `ChatGateway` $\rightarrow$ WebSocket phát sự kiện `receiveMessage` tới tất cả các thành viên trong phòng chat ảo để hiển thị tin nhắn real-time.
- **Quy tắc nghiệp vụ**:
  - Ứng viên có thể gửi tin nhắn dạng văn bản (`TEXT`), hình ảnh (`IMAGE`), thông tin công việc tham chiếu (`JOB_REFERENCE`), CV hệ thống (`CV_SYSTEM`) hoặc link CV (`CV_LINK`).
  - Khi ứng viên ở ngoài phòng chat, tin nhắn mới từ HR sẽ làm tăng số lượng tin nhắn chưa đọc của ứng viên (`unreadCandidate`). Khi ứng viên join phòng chat, số lượng tin nhắn chưa đọc sẽ được reset về 0.

---

### 2.6. Nhóm chức năng: Tương tác AI (AI Features)

#### A. Trò chuyện tư vấn công việc với AI (AI Chatbot)

- **Mô tả**: Chat trực tiếp với AI để hỏi về thông tin công việc hiện tại (yêu cầu, mức lương, môi trường, chuẩn bị phỏng vấn...).
- **Luồng hoạt động**:
  1.  Tại trang chi tiết công việc, nhấp chọn biểu tượng AI Chatbot $\rightarrow$ Mở khung chat AI.
  2.  Ứng viên gửi câu hỏi $\rightarrow$ FE gọi kết nối SSE (Server Sent Events) tới `GET /api/ai/chat/stream?jobId=...&question=...`.
  3.  BE lấy thông tin tóm tắt công việc (Job Context), kiểm tra `jobId` với session chat hiện tại. Nếu đổi sang job mới, BE thực hiện xóa bộ nhớ tạm (`memory.clear()`) để tránh lẫn lộn ngữ cảnh.
  4.  BE gọi Gemini API thông qua LangChain với System Prompt + Job Context + Lịch sử chat (tối đa 6 tin nhắn gần nhất) + Câu hỏi mới.
  5.  Gemini trả về câu trả lời dạng stream $\rightarrow$ BE đẩy dữ liệu từng phần về FE theo thời gian thực để hiển thị hiệu ứng gõ chữ cho ứng viên.
  6.  Xem lịch sử chat AI: Gọi `GET /api/ai/chat/history`.

#### B. Chấm điểm chất lượng CV (AI CV Score)

- **Mô tả**: Nhờ AI đánh giá chất lượng CV hệ thống mà ứng viên đã thiết kế.
- **Luồng hoạt động**:
  1.  Tại mục quản lý CV, chọn "Chấm điểm CV" $\rightarrow$ Gửi yêu cầu `POST /api/ai/cv-score` kèm `cvId`.
  2.  BE lấy dữ liệu chi tiết của CV (kỹ năng, kinh nghiệm, dự án...), gửi tới Gemini LLM yêu cầu đánh giá.
  3.  Gemini trả về kết quả định dạng JSON chuẩn gồm: Điểm số (0-100), Danh sách điểm mạnh (strengths), Danh sách điểm yếu cần khắc phục (weaknesses) và Các đề xuất cải thiện (suggestions) $\rightarrow$ FE hiển thị báo cáo chi tiết.

#### C. Gợi ý công việc bằng AI (AI Job Recommendation)

- **Mô tả**: Sử dụng AI phân tích hồ sơ và CV để gợi ý việc làm tương thích, tối ưu tốc độ phản hồi bằng Redis cache và chạy nền.
- **Luồng hoạt động**:
  1.  Tại trang Tìm việc (`/find-jobs`), hệ thống kiểm tra trạng thái đăng nhập. Nếu chưa đăng nhập, nút/thẻ giới thiệu tính năng AI sẽ bị ẩn.
  2.  Khi ứng viên đã đăng nhập và nhấn "AI gợi ý công việc", FE điều hướng tới trang `/ai-recommendations` (hỗ trợ hiển thị đầy đủ giao diện, có responsive).
  3.  Tại trang `/ai-recommendations`, FE gọi API `GET /api/ai/recommend-jobs` để lấy dữ liệu.
  4.  BE kiểm tra trong Redis cache:
      - **Trường hợp đã có cache**: Trả về dữ liệu lập tức (<10ms), đảm bảo trải nghiệm tức thời.
      - **Trường hợp chưa có cache (hoặc cache hết hạn)**: Thực hiện tính toán đồng bộ lập tức và lưu vào Redis.
  5.  Tại FE, người dùng xem danh sách gợi ý kèm theo:
      - **Lý do phù hợp từ AI**: Mỗi công việc có đính kèm phần giải thích chi tiết (`aiExplanation`) được sinh bởi Gemini.
      - **Bộ lọc cơ bản**: Lọc nhanh trên client theo Từ khóa (Tên job/Công ty), Địa điểm (Tỉnh/Thành phố), Cấp bậc.
      - **Phân trang client**: Phân trang mượt mà (6 jobs/trang) sử dụng component `DataTablePagination`.
- **Cơ chế tính toán và cập nhật cache chạy nền (Pre-warming & Background Compute)**:
  - Khi đăng nhập thành công hoặc tải thông tin profile ứng viên, BE kích hoạt sự kiện `candidate.profile.warmup` chạy nền để tính toán sẵn cache trước khi ứng viên click nút.
  - Khi ứng viên thêm/sửa/xóa CV hoặc cập nhật thông tin hồ sơ chi tiết, hệ thống phát ra sự kiện `candidate.cv.updated` hoặc `candidate.profile.updated` để tính toán lại gợi ý mới và cập nhật cache Redis hoàn toàn bất đồng bộ, không gây nghẽn luồng xử lý API chính của người dùng.
- **Quy tắc nghiệp vụ**:
  - Ẩn toàn bộ giao diện giới thiệu/sử dụng đối với người dùng chưa đăng nhập.
  - Nếu ứng viên đã đăng nhập nhưng hồ sơ trống/chưa có CV: Hệ thống hiển thị cảnh báo hướng dẫn và nút dẫn tới `/profile`, đồng thời đề xuất danh sách các công việc HOT / được ứng tuyển nhiều nhất làm phương án dự phòng.
  - Thời gian tồn tại của dữ liệu (TTL cache) là 24 giờ đối với hồ sơ đầy đủ thông tin và 1 giờ đối với hồ sơ trống thông tin.

### 2.7. Nhóm chức năng: Bookmark (Lưu trữ nhanh)

- **Mô tả**: Lưu lại công việc để ứng tuyển sau, hoặc lưu tin tức để đọc lại.
- **Luồng hoạt động**:
  - Lưu item: Nhấp nút "Lưu tin" $\rightarrow$ `POST /api/bookmarks` (truyền `jobId` hoặc `newsId`).
  - Bỏ lưu: Nhấp lại nút đó $\rightarrow$ `DELETE /api/bookmarks/item/:itemId`.
  - Xem danh sách đã lưu: Vào mục "Công việc đã lưu" $\rightarrow$ `GET /api/bookmarks` (lọc theo loại `job`).

---

### 2.8. Nhóm chức năng: Hỗ trợ & Báo cáo (Issue)

- **Mô tả**: Gửi khiếu nại, báo cáo lỗi hệ thống hoặc yêu cầu hỗ trợ kỹ thuật đến Admin.
- **Luồng hoạt động**:
  - Gửi yêu cầu: Điền form (Tiêu đề, mô tả, hình ảnh đính kèm nếu có) $\rightarrow$ `POST /api/issue` $\rightarrow$ Tạo yêu cầu ở trạng thái `PENDING`.
  - Xem lịch sử hỗ trợ: `GET /api/issue/me` để xem tiến độ xử lý và phản hồi từ Admin.
  - Đóng/Hủy yêu cầu: `PATCH /api/issue/:id` hoặc `DELETE /api/issue/:id` khi vấn đề đã được giải quyết.

---

<!-- ## 3. Các kịch bản nghiệp vụ chính phục vụ vẽ Activity Diagram

### Kịch bản 1: Luồng Ứng tuyển công việc (Job Application Flow)

```mermaid
activity-diagram
Start -> Xem chi tiết công việc -> Click "Ứng tuyển ngay"
-> Hệ thống hiển thị Modal ứng tuyển -> Hệ thống kiểm tra xem đã nộp đơn cho công việc này chưa
Nếu "Đã nộp trước đó":
    -> Hiển thị thông báo lỗi "Bạn đã nộp đơn ứng tuyển cho công việc này" -> End
Nếu "Chưa nộp":
    -> Chọn nguồn CV (Tải lên file PDF mới / Chọn CV có sẵn trên hệ thống)
    -> Nhấp "Gửi hồ sơ"
    -> Hệ thống lưu đơn ứng tuyển vào DB (Trạng thái mặc định: PENDING)
    -> Hệ thống tạo bản ghi lịch sử ứng tuyển (history log: "Nộp hồ sơ")
    -> Hệ thống kích hoạt Event real-time báo cho Recruiter của công ty
    -> Hiển thị thông báo "Ứng tuyển thành công" -> End
```

### Kịch bản 2: Luồng Chat AI Stream tư vấn công việc (AI Chat Flow)

```mermaid
activity-diagram
Start -> Mở khung chat AI tại trang chi tiết công việc -> Nhập câu hỏi tư vấn -> Click Gửi
-> FE mở kết nối Server Sent Events (SSE) tới API chat/stream
-> BE kiểm tra xem câu hỏi có thuộc Job cũ hay không
Nếu "Đổi sang công việc mới":
    -> Xóa bộ nhớ đệm hội thoại AI (memory.clear())
    -> Nạp context của công việc mới vào hệ thống
Nếu "Cùng công việc cũ":
    -> Giữ nguyên bộ nhớ đệm
-> BE xây dựng prompt tích hợp (System Prompt + Job Context + Lịch sử chat + Câu hỏi mới)
-> BE gửi prompt sang Gemini API
-> Gemini trả kết quả về dạng Stream (từng chunk chữ)
-> BE chuyển tiếp từng chunk về FE qua SSE kết nối đang mở
-> FE hiển thị text chạy real-time trên màn hình chat
-> Kết thúc luồng stream (Done) -> Lưu hội thoại vào DB AiChatHistory -> End
``` -->
