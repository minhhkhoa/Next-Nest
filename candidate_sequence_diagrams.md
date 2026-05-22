# Biểu đồ Tuần tự của Actor Candidate (Ứng viên)

Tài liệu này chứa các biểu đồ tuần tự (Sequence Diagrams) mô tả dòng tương tác trực tiếp theo thời gian giữa **Candidate (Ứng viên)**, **Frontend (Client)**, **Backend Server (NestJS)**, **Database (MongoDB)** và các thành phần liên quan khác trong hệ thống Next-Nest.

---

## 1. Nhóm chức năng: Quản lý Tài khoản & Xác thực (Auth)

### A. Luồng Quên mật khẩu (Forgot Password)

```mermaid
sequenceDiagram
    actor Candidate as Ứng viên (Candidate)
    participant FE as Frontend (Client)
    participant BE as Backend Server
    participant DB as Database (MongoDB)
    participant Mail as Mail Server (Nodemailer)

    Candidate->>FE: 1. Click chọn "Quên mật khẩu"
    FE->>Candidate: 2. Hiển thị giao diện nhập Email
    
    Candidate->>FE: 3. Nhập Email & Click "Gửi yêu cầu"
    FE->>BE: 4. POST /api/auth/forgot-password { email }
    
    alt Email không tồn tại trong hệ thống
        BE-->>FE: 5. Trả về mã lỗi (Email không tồn tại)
        FE-->>Candidate: 6. Hiển thị thông báo "Email không tồn tại trên hệ thống"
    else Email hợp lệ
        BE->>Mail: 7. Tạo resetToken (có thời hạn) & Gọi hàm gửi mail
        Mail-->>Candidate: 8. Gửi mail chứa liên kết Reset (kèm token) đến hòm thư Ứng viên
        
        Candidate->>FE: 9. Click vào liên kết Reset trong Email
        FE->>BE: 10. GET /api/auth/validate-reset?token=... (Tự động gọi khi load trang)
        
        alt Token không hợp lệ hoặc đã hết hạn
            BE-->>FE: 11. Trả về mã lỗi (Token invalid/expired)
            FE-->>Candidate: 12. Hiển thị thông báo "Đường dẫn không hợp lệ hoặc đã hết hạn"
        else Token hợp lệ
            BE-->>FE: 13. Trả về trạng thái thành công (Token hợp lệ)
            FE-->>Candidate: 14. Hiển thị form nhập Mật khẩu mới
            
            Candidate->>FE: 15. Nhập Mật khẩu mới & Click "Xác nhận đặt lại"
            FE->>BE: 16. POST /api/auth/reset-password { token, password }
            BE-->>FE: 17. Mã hóa mật khẩu mới, cập nhật DB & Trả về thành công
            FE-->>Candidate: 18. Hiển thị "Đổi mật khẩu thành công" và tự động chuyển hướng sang trang Đăng nhập
        end
    end
```

---

### B. Luồng Đổi mật khẩu (Change Password - Đang đăng nhập)

```mermaid
sequenceDiagram
    actor Candidate as Ứng viên (Candidate)
    participant FE as Frontend (Client)
    participant BE as Backend Server
    participant DB as Database (MongoDB)

    Candidate->>FE: 1. Vào trang "Cài đặt tài khoản" -> Chọn "Đổi mật khẩu"
    FE->>Candidate: 2. Hiển thị form đổi mật khẩu (Mật khẩu cũ, Mật khẩu mới, Xác nhận)
    Candidate->>FE: 3. Nhập thông tin mật khẩu & Click "Cập nhật"
    FE->>BE: 4. POST /api/auth/change-password { oldPassword, newPassword } (Gửi kèm JWT token)
    
    BE->>BE: 5. Xác thực JWT Token (Auth Guard)
    alt Token không hợp lệ hoặc hết hạn
        BE-->>FE: 6a. Trả về lỗi 401 Unauthorized
        FE-->>Candidate: 7a. Yêu cầu đăng nhập lại
    else Token hợp lệ
        BE->>DB: 6b. Truy vấn thông tin mật khẩu hiện tại của User
        DB-->>BE: 7b. Trả về thông tin User
        BE->>BE: 8. So sánh oldPassword với mật khẩu đã mã hóa trong DB
        alt Mật khẩu cũ không trùng khớp
            BE-->>FE: 9a. Trả về lỗi (Mật khẩu cũ không chính xác)
            FE-->>Candidate: 10a. Hiển thị thông báo "Mật khẩu cũ không đúng"
        else Mật khẩu cũ chính xác
            BE->>BE: 9b. Mã hóa mật khẩu mới (bcrypt hash)
            BE->>DB: 10b. Cập nhật mật khẩu mới vào DB
            DB-->>BE: 11b. Xác nhận cập nhật thành công
            BE-->>FE: 12. Trả về thông báo thành công
            FE-->>Candidate: 13. Hiển thị "Đổi mật khẩu thành công!"
        end
    end
```

---

## 2. Nhóm chức năng: Ứng tuyển & Theo dõi đơn ứng tuyển

### A. Luồng Nộp hồ sơ ứng tuyển (Apply Job)

```mermaid
sequenceDiagram
    actor Candidate as Ứng viên (Candidate)
    participant FE as Frontend (Client)
    participant BE as Backend Server
    participant DB as Database (MongoDB)
    participant Recruiter as Socket Gateway (Recruiter)

    Candidate->>FE: 1. Tại trang chi tiết công việc, Click "Ứng tuyển ngay"
    FE->>Candidate: 2. Hiển thị Modal ứng tuyển (Chọn CV có sẵn / Tải lên CV mới / Nhập tin nhắn)
    Candidate->>FE: 3. Chọn CV & Click "Xác nhận ứng tuyển"
    
    FE->>FE: 4. Validate thông tin bằng Zod Schema (createApplicationSchema)
    alt Dữ liệu không hợp lệ
        FE-->>Candidate: 5a. Hiển thị lỗi validate (Ví dụ: chưa chọn CV)
    else Dữ liệu hợp lệ
        FE->>BE: 5b. POST /api/application { jobId, cvType, cvData, message } (JWT token)
        BE->>BE: 6. Xác thực người dùng (Candidate Guard)
        BE->>DB: 7. Kiểm tra Job có mở & Ứng viên đã nộp đơn cho Job này chưa?
        DB-->>BE: 8. Trả về kết quả
        
        alt Đã nộp đơn trước đó hoặc Job đã đóng
            BE-->>FE: 9a. Trả về lỗi (Bạn đã ứng tuyển công việc này hoặc Công việc không còn nhận hồ sơ)
            FE-->>Candidate: 10a. Hiển thị thông báo lỗi tương ứng
        else Hợp lệ
            BE->>DB: 9b. Tạo bản ghi đơn ứng tuyển mới (status: PENDING) & Khởi tạo history ['Ứng viên nộp hồ sơ']
            DB-->>BE: 10b. Xác nhận lưu thành công
            BE->>Recruiter: 11. Phát sự kiện WebSocket 'APPLICATION_SUBMITTED' (real-time)
            Recruiter-->>Recruiter: 12. Gửi thông báo real-time tới Recruiter của công ty sở hữu Job
            BE-->>FE: 13. Trả về thành công
            FE-->>Candidate: 14. Hiển thị thông báo "Ứng tuyển thành công!"
        end
    end
```

### B. Luồng Theo dõi đơn ứng tuyển (Application Tracking)

```mermaid
sequenceDiagram
    actor Candidate as Ứng viên (Candidate)
    participant FE as Frontend (Client)
    participant BE as Backend Server
    participant DB as Database (MongoDB)
    actor Recruiter as Nhà tuyển dụng (Recruiter)
    participant Gateway as Socket Gateway

    Candidate->>FE: 1. Vào mục "Công việc đã ứng tuyển"
    FE->>BE: 2. GET /api/application (lọc theo candidateId của user đăng nhập)
    BE->>DB: 3. Lấy danh sách đơn ứng tuyển kèm thông tin Job & Company
    DB-->>BE: 4. Trả về danh sách
    BE-->>FE: 5. Trả về dữ liệu
    FE-->>Candidate: 6. Hiển thị danh sách đơn kèm Trạng thái (PENDING, REVIEWING...)
    
    Note over Candidate, Recruiter: Trường hợp 1: Nhà tuyển dụng xem CV lần đầu
    Recruiter->>BE: 7a. Xem chi tiết đơn ứng tuyển của ứng viên (GET /api/application/:id)
    BE->>DB: 8a. Cập nhật cờ isViewed = true & Thêm log vào mảng history
    DB-->>BE: 9a. Xác nhận cập nhật
    BE->>Gateway: 10a. Phát sự kiện WebSocket 'APPLICATION_STATUS_CHANGED'
    Gateway-->>FE: 11a. Gửi thông báo real-time tới client của Candidate
    FE-->>Candidate: 12a. Hiển thị thông báo "Nhà tuyển dụng đã xem hồ sơ của bạn" & Cập nhật UI
    
    Note over Candidate, Recruiter: Trường hợp 2: Nhà tuyển dụng cập nhật trạng thái đơn
    Recruiter->>BE: 7b. Đổi trạng thái đơn (PATCH /api/application/:id) { status: REVIEWING/INTERVIEW/APPROVED/REJECTED }
    BE->>DB: 8b. Cập nhật status & Thêm log tương ứng vào mảng history
    DB-->>BE: 9b. Xác nhận cập nhật
    BE->>Gateway: 10b. Phát sự kiện WebSocket 'APPLICATION_STATUS_CHANGED'
    Gateway-->>FE: 11b. Gửi thông báo real-time tới client của Candidate
    FE-->>Candidate: 12b. Hiển thị thông báo "Đơn ứng tuyển của bạn đã được cập nhật trạng thái..." & Cập nhật UI
```

---

## 3. Nhóm chức năng: Tương tác AI (AI Features)

### A. Luồng Chấm điểm chất lượng CV (AI CV Score)

```mermaid
sequenceDiagram
    actor Candidate as Ứng viên (Candidate)
    participant FE as Frontend (Client)
    participant BE as Backend Server
    participant DB as Database (MongoDB)
    participant Gemini as Gemini AI Service (LangChain)

    Candidate->>FE: 1. Tại trang Quản lý CV, Click nút "Chấm điểm CV"
    FE->>BE: 2. POST /api/ai/cv-score { cvId } (kèm JWT token)
    BE->>DB: 3. Lấy dữ liệu chi tiết của CV (kỹ năng, kinh nghiệm, dự án,...)
    DB-->>BE: 4. Trả về dữ liệu CV
    BE->>BE: 5. Xây dựng Prompt đánh giá chi tiết theo tiêu chuẩn
    BE->>Gemini: 6. Gửi dữ liệu CV & Prompt qua LangChain (Gemini LLM)
    Gemini-->>BE: 7. Trả về kết quả đánh giá dạng JSON (score, strengths, weaknesses, suggestions)
    BE-->>FE: 8. Trả về dữ liệu JSON
    FE-->>Candidate: 9. Hiển thị báo cáo chi tiết (Biểu đồ điểm số, gợi ý chỉnh sửa trực quan)
```

### B. Luồng Trò chuyện tư vấn công việc với AI (AI Chatbot Stream)

```mermaid
sequenceDiagram
    actor Candidate as Ứng viên (Candidate)
    participant FE as Frontend (Client)
    participant BE as Backend Server
    participant DB as Database (MongoDB)
    participant Gemini as Gemini AI Service (LangChain)

    Candidate->>FE: 1. Tại chi tiết công việc, Click mở "AI Chatbot"
    FE->>Candidate: 2. Hiển thị khung chat AI
    Candidate->>FE: 3. Nhập câu hỏi tư vấn & Click "Gửi"
    FE->>BE: 4. Kết nối SSE: GET /api/ai/chat/stream?jobId=...&question=...
    
    BE->>BE: 5. Kiểm tra jobId với session chat hiện tại
    alt Đổi sang Job mới
        BE->>BE: 6a. Xóa bộ nhớ đệm hội thoại cũ (memory.clear())
    else Cùng Job cũ
        BE->>BE: 6b. Giữ nguyên bộ nhớ đệm (lấy lịch sử tối đa 6 tin nhắn gần nhất)
    end
    
    BE->>DB: 7. Truy vấn nội dung chi tiết của Job hiện tại (JD, yêu cầu, kỹ năng)
    DB-->>BE: 8. Trả về Job Context
    BE->>BE: 9. Xây dựng Prompt tích hợp (System Prompt + Job Context + Memory + Câu hỏi mới)
    BE->>Gemini: 10. Gửi Prompt & Yêu cầu Stream phản hồi
    
    loop Gemini Stream phản hồi từng phần
        Gemini-->>BE: 11. Trả về chunk văn bản tiếp theo
        BE-->>FE: 12. Chuyển tiếp chunk văn bản qua kết nối SSE đang mở
        FE-->>Candidate: 13. Hiển thị chữ chạy real-time trên khung chat
    end
    
    BE->>DB: 14. Lưu nội dung câu hỏi và câu trả lời hoàn chỉnh vào bảng AiChatHistory
    DB-->>BE: 15. Xác nhận lưu thành công
```

---

## 4. Nhóm chức năng: Hỗ trợ & Báo cáo (Issue)

```mermaid
sequenceDiagram
    actor Candidate as Ứng viên (Candidate)
    participant FE as Frontend (Client)
    participant Cloudinary as Cloudinary Cloud
    participant BE as Backend Server
    participant DB as Database (MongoDB)
    actor Admin as Quản trị viên (Admin)

    Candidate->>FE: 1. Vào form "Hỗ trợ & Báo cáo", điền thông tin & đính kèm ảnh
    Candidate->>FE: 2. Click "Gửi yêu cầu"
    
    alt Có hình ảnh đính kèm
        FE->>Cloudinary: 3a. Upload hình ảnh lên Cloudinary
        Cloudinary-->>FE: 4a. Trả về URL hình ảnh (imageUrl)
    end
    
    FE->>BE: 5. POST /api/issue { title, description, imageUrl } (kèm JWT token)
    BE->>DB: 6. Lưu bản ghi Issue mới (status: PENDING)
    DB-->>BE: 7. Xác nhận lưu thành công
    BE-->>FE: 8. Trả về kết quả thành công
    FE-->>Candidate: 9. Hiển thị thông báo "Gửi báo cáo thành công"
    
    Note over Candidate, Admin: Theo dõi và giải quyết yêu cầu hỗ trợ
    Candidate->>FE: 10. Truy cập trang "Lịch sử hỗ trợ"
    FE->>BE: 11. GET /api/issue/me
    BE->>DB: 12. Truy vấn danh sách issue của ứng viên
    DB-->>BE: 13. Trả về danh sách issue
    BE-->>FE: 14. Trả về dữ liệu
    FE-->>Candidate: 15. Hiển thị danh sách issue (Trạng thái: PENDING/PROCESSING)
    
    Admin->>BE: 16. Admin xử lý issue & phản hồi (PATCH /api/issue/admin-reply) { feedback, status: RESOLVED }
    BE->>DB: 17. Cập nhật nội dung phản hồi & trạng thái mới của Issue
    DB-->>BE: 18. Xác nhận lưu thành công
    
    Candidate->>FE: 19. Xem chi tiết issue đã được phản hồi
    FE->>Candidate: 20. Hiển thị nội dung feedback của Admin & trạng thái RESOLVED
    
    alt Ứng viên đóng yêu cầu hỗ trợ
        Candidate->>FE: 21a. Click "Đóng yêu cầu"
        FE->>BE: 22a. PATCH /api/issue/:id { status: CLOSED }
        BE->>DB: 23a. Cập nhật status thành CLOSED
        DB-->>BE: 24a. Xác nhận cập nhật
        BE-->>FE: 25a. Trả về thành công
        FE-->>Candidate: 26a. Cập nhật trạng thái hiển thị trên giao diện thành Đóng
    else Ứng viên hủy yêu cầu (xóa đơn)
        Candidate->>FE: 21b. Click "Hủy yêu cầu"
        FE->>BE: 22b. DELETE /api/issue/:id
        BE->>DB: 23b. Xóa mềm bản ghi Issue trong DB
        DB-->>BE: 24b. Xác nhận xóa
        BE-->>FE: 25b. Trả về thành công
        FE-->>Candidate: 26b. Xóa issue khỏi danh sách của ứng viên
    end
```
