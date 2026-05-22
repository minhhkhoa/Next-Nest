# Biểu đồ Tuần tự của Actor Recruiter / Recruiter Admin (Nhà tuyển dụng)

Tài liệu này chứa các biểu đồ tuần tự (Sequence Diagrams) mô tả dòng tương tác trực tiếp theo thời gian giữa **Recruiter / Recruiter Admin (Nhà tuyển dụng)**, **Frontend (Client)**, **Backend Server (NestJS)**, **Database (MongoDB)** và các thành phần liên quan khác trong hệ thống Next-Nest.

---

## 1. Nhóm chức năng: Quản lý Tài khoản & Đăng ký doanh nghiệp

Luồng này bao gồm hai sự lựa chọn liên kết doanh nghiệp: **Tạo mới công ty** (để trở thành Recruiter Admin) hoặc **Gia nhập công ty đã tồn tại** (trở thành HR thành viên).

### A. Luồng Đăng ký thành lập Công ty mới (Trở thành Recruiter Admin)

```mermaid
sequenceDiagram
    actor Recruiter as Nhà tuyển dụng (Recruiter)
    participant FE as Frontend (Client)
    participant BE as Backend Server
    participant DB as Database (MongoDB)
    actor Admin as Admin hệ thống (System Admin)

    Recruiter->>FE: 1. Click chọn "Đăng ký thành lập công ty"
    FE->>Recruiter: 2. Hiển thị form điền thông tin (MST, Tên công ty, Website, Logo...)

    Recruiter->>FE: 3. Nhập Mã số thuế & click kiểm tra trùng
    FE->>BE: 4. POST /api/company/check-tax-code { taxCode }
    BE->>DB: 5. Tìm kiếm mã số thuế trong DB
    DB-->>BE: 6. Trả về kết quả truy vấn

    alt Mã số thuế đã được đăng ký trước đó
        BE-->>FE: 7a. Trả về lỗi 400 (Mã số thuế đã tồn tại)
        FE-->>Recruiter: 8a. Hiển thị thông báo "Công ty đã được đăng ký trên hệ thống"
    else Mã số thuế hợp lệ (Chưa tồn tại)
        BE-->>FE: 7b. Trả về trạng thái hợp lệ
        FE-->>Recruiter: 8b. Cho phép tiếp tục điền các thông tin khác

        Recruiter->>FE: 9. Hoàn tất form & Click "Đăng ký công ty"
        FE->>BE: 10. POST /api/company { taxCode, name, ... } (kèm JWT token)
        BE->>BE: 11. Xác thực Recruiter Role
        BE->>DB: 12. Tạo Company mới (status: PENDING), gán user tạo làm Owner (Recruiter Admin)
        DB-->>BE: 13. Xác nhận lưu công ty & Cập nhật employerInfo.companyID của User
        BE-->>FE: 14. Trả về thành công (Đang chờ duyệt doanh nghiệp)
        FE-->>Recruiter: 15. Hiển thị thông báo "Yêu cầu đăng ký công ty của bạn đã được gửi, vui lòng chờ Admin duyệt"

        Note over BE, Admin: Admin hệ thống duyệt công ty
        Admin->>BE: 16. Phê duyệt công ty (PATCH /api/company/admin-verify) { companyId, status: APPROVED }
        BE->>DB: 17. Cập nhật status của Company thành APPROVED
        DB-->>BE: 18. Xác nhận cập nhật thành công
        BE-->>Admin: 19. Trả về thành công
    end
```

---

### B. Luồng Gia nhập công ty đã tồn tại (Trở thành Recruiter thành viên)

```mermaid
sequenceDiagram
    actor HR as HR tự do (Muốn gia nhập)
    participant FE as Frontend (HR Client)
    participant BE as Backend Server
    participant DB as Database (MongoDB)
    actor RecAdmin as Recruiter Admin (Chủ công ty)
    participant Gateway as Socket Gateway

    HR->>FE: 1. Tìm kiếm công ty trên hệ thống
    FE->>HR: 2. Hiển thị thông tin công ty & Nút "Gia nhập công ty"
    HR->>FE: 3. Click "Gia nhập công ty"
    FE->>BE: 4. PATCH /api/user/join-company { companyId } (kèm JWT token)

    BE->>DB: 5. Tạo yêu cầu gia nhập trong bảng Company (danh sách joinRequests)
    DB-->>BE: 6. Xác nhận lưu yêu cầu thành công
    BE-->>FE: 7. Trả về thông báo đã gửi yêu cầu gia nhập
    FE-->>HR: 8. Hiển thị "Yêu cầu của bạn đang chờ Admin công ty duyệt"

    Note over HR, RecAdmin: Quá trình Recruiter Admin phê duyệt thành viên
    RecAdmin->>FE: 9. Vào mục "Quản lý nhân sự" -> Xem các yêu cầu gia nhập công ty
    FE->>BE: 10. GET /api/company/join-requests
    BE->>DB: 11. Truy vấn các joinRequests có status: PENDING của công ty
    DB-->>BE: 12. Trả về danh sách ứng tuyển gia nhập
    BE-->>FE: 13. Trả về dữ liệu
    FE-->>RecAdmin: 14. Hiển thị danh sách các HR xin gia nhập

    RecAdmin->>FE: 15. Click "Phê duyệt" một HR
    FE->>BE: 16. PATCH /api/user/approve-join-request { userId, status: APPROVED } (JWT token của RecAdmin)
    BE->>BE: 17. Xác thực quyền sở hữu công ty của RecAdmin

    BE->>DB: 18. Cập nhật employerInfo.companyID của HR = companyID & đổi vai trò thành RECRUITER
    DB-->>BE: 19. Xác nhận cập nhật thành công
    BE->>Gateway: 20. Phát sự kiện WebSocket báo HR được duyệt gia nhập
    Gateway-->>FE: 21. Gửi thông báo real-time tới Client của HR xin gia nhập
    FE-->>HR: 22. Hiển thị thông báo "Bạn đã trở thành thành viên chính thức của công ty..."
    BE-->>FE: 23. Trả về kết quả phê duyệt thành công cho RecAdmin
    FE-->>RecAdmin: 24. Cập nhật danh sách nhân sự của công ty
```

---

## 2. Nhóm chức năng: Quản lý Tin tuyển dụng (Job Management)

### Luồng Đăng tin tuyển dụng & Phê duyệt nội bộ

```mermaid
sequenceDiagram
    actor HR as Nhà tuyển dụng (HR/RecAdmin)
    participant FE as Frontend (HR Client)
    participant BE as Backend Server
    participant DB as Database (MongoDB)
    actor RecAdmin as Recruiter Admin (Chủ công ty)

    HR->>FE: 1. Click "Đăng tin tuyển dụng" -> Điền thông tin (JD, Mức lương, Skills, Cấp bậc...)
    HR->>FE: 2. Click "Xác nhận đăng tin"
    FE->>BE: 3. POST /api/jobs { jobData } (kèm JWT token)

    BE->>BE: 4. Chạy CompanyStatusGuard (Kiểm tra công ty của HR có hoạt động - APPROVED không?)
    alt Công ty chưa được duyệt / đang bị khóa
        BE-->>FE: 5a. Trả về lỗi 403 Forbidden (Công ty chưa hoạt động)
        FE-->>HR: 6a. Hiển thị "Công ty của bạn chưa được phê duyệt để đăng tin tuyển dụng"
    else Công ty đang hoạt động hợp lệ
        BE->>BE: 5b. Kiểm tra quyền hạn/vai trò của người tạo tin

        alt Trường hợp 1: Người tạo tin là HR thành viên thường
            BE->>DB: 6c. Lưu tin tuyển dụng ở trạng thái chờ duyệt nội bộ (status: PENDING_INTERNAL)
            DB-->>BE: 7c. Xác nhận lưu thành công
            BE-->>FE: 8c. Trả về thông tin tin đăng kèm thông báo chờ duyệt
            FE-->>HR: 9c. Hiển thị "Đăng tin thành công! Tin tuyển dụng đang chờ Admin công ty của bạn duyệt trước khi công khai"

            Note over DB, RecAdmin: Recruiter Admin duyệt tin nội bộ để công khai
            RecAdmin->>FE: 10. Vào mục "Duyệt tin nội bộ" -> Xem tin tuyển dụng đang chờ duyệt
            FE->>BE: 11. GET /api/jobs/filter?status=PENDING_INTERNAL
            BE->>DB: 12. Truy vấn tin chờ duyệt của công ty
            DB-->>BE: 13. Trả về danh sách
            BE-->>FE: 14. Trả về dữ liệu
            FE-->>RecAdmin: 15. Hiển thị danh sách tin tuyển dụng chờ duyệt

            RecAdmin->>FE: 16. Click "Phê duyệt công khai"
            FE->>BE: 17. PATCH /api/jobs/verify-job { jobId, status: APPROVED }
            BE->>BE: 18. Xác thực RecAdmin sở hữu tin tuyển dụng này
            BE->>DB: 19. Cập nhật trạng thái Job thành APPROVED (Công khai)
            DB-->>BE: 20. Xác nhận cập nhật
            BE-->>FE: 21. Trả về thành công
            FE-->>RecAdmin: 22. Thông báo duyệt thành công & cập nhật UI

        else Trường hợp 2: Người tạo tin là Recruiter Admin (Chủ sở hữu)
            BE->>DB: 6d. Lưu tin tuyển dụng trực tiếp ở trạng thái công khai (status: APPROVED)
            DB-->>BE: 7d. Xác nhận lưu thành công
            BE-->>FE: 8d. Trả về thông tin tin đăng thành công
            FE-->>HR: 9d. Hiển thị "Tin tuyển dụng của bạn đã được đăng công khai trên hệ thống!"
        end
    end
```

---

## 3. Nhóm chức năng: Quản lý Đơn ứng tuyển (Application Management)

### Luồng Xử lý Đơn ứng tuyển & So khớp hồ sơ bằng AI (AI JD Match)

```mermaid
sequenceDiagram
    actor HR as Nhà tuyển dụng (HR/RecAdmin)
    participant FE as Frontend (HR Client)
    participant BE as Backend Server
    participant DB as Database (MongoDB)
    participant Gemini as Gemini AI (LangChain)
    participant Gateway as Socket Gateway
    participant CandFE as Frontend (Candidate Client)

    HR->>FE: 1. Vào danh sách "Đơn ứng tuyển" -> Chọn một Đơn ứng tuyển của Ứng viên
    FE->>BE: 2. GET /api/application/:id
    BE->>DB: 3. Lấy thông tin đơn ứng tuyển, thông tin Job liên quan và dữ liệu CV ứng viên
    DB-->>BE: 4. Trả về thông tin chi tiết

    alt Đây là lần đầu tiên Nhà tuyển dụng mở xem đơn (isViewed: false)
        BE->>DB: 5a. Cập nhật isViewed = true & ghi nhận lịch sử vào history
        DB-->>BE: 6a. Xác nhận cập nhật
        BE->>Gateway: 7a. Phát sự kiện APPLICATION_STATUS_CHANGED (Socket)
        Gateway-->>CandFE: 8a. Đẩy thông báo real-time tới Ứng viên "HR đã xem hồ sơ của bạn"
    end

    BE-->>FE: 9. Trả dữ liệu đơn ứng tuyển về Client
    FE-->>HR: 10. Hiển thị chi tiết hồ sơ ứng viên & file CV đính kèm

    Note over HR, Gemini: Nhà tuyển dụng sử dụng AI để so khớp nhanh CV và JD
    HR->>FE: 11. Click nút "So khớp AI" (AI JD Match)
    FE->>BE: 12. POST /api/ai/jd-match { cvId, jobId }
    BE->>DB: 13. Truy vấn chi tiết nội dung CV và mô tả công việc (JD) của Job
    DB-->>BE: 14. Trả về dữ liệu CV Context & Job Context
    BE->>BE: 15. Định dạng dữ liệu thành prompt template so khớp
    BE->>Gemini: 16. Gửi prompt yêu cầu đánh giá chi tiết
    Gemini-->>BE: 17. Trả về kết quả JSON (match_score, matched_skills, missing_skills, notes)
    BE-->>FE: 18. Trả về dữ liệu đánh giá của AI
    FE-->>HR: 19. Hiển thị chi tiết điểm số %, kỹ năng còn thiếu & nhận xét đánh giá CV-JD của AI

    Note over HR, CandFE: Cập nhật trạng thái đơn ứng tuyển (Duyệt nhận việc / Hẹn phỏng vấn)
    HR->>FE: 20. Chọn trạng thái mới (Ví dụ: INTERVIEW) & Click "Cập nhật trạng thái"
    FE->>BE: 21. PATCH /api/application/:id { status: INTERVIEW }
    BE->>BE: 22. Kiểm tra quyền sở hữu công ty của HR đối với đơn này
    BE->>DB: 23. Cập nhật status của đơn thành INTERVIEW & ghi nhận lịch sử mới vào history
    DB-->>BE: 24. Xác nhận cập nhật
    BE->>Gateway: 25. Phát sự kiện APPLICATION_STATUS_CHANGED (Socket)
    Gateway-->>CandFE: 26. Gửi thông báo real-time tới Ứng viên: "Bạn có lịch hẹn phỏng vấn..."
    BE-->>FE: 27. Trả về thành công
    FE-->>HR: 28. Cập nhật trạng thái đơn ứng tuyển trên màn hình quản lý
```

---

## 4. Nhóm chức năng: Đặt Banner Quảng cáo (Advertising Booking)

### Luồng Đặt Quảng cáo & Thanh toán tự động qua Webhook ngân hàng

```mermaid
sequenceDiagram
    actor HR as Nhà tuyển dụng (HR/RecAdmin)
    participant Phone as App Ngân hàng (HR Phone)
    participant FE as Frontend (HR Client)
    participant Cloud as Cloudinary Cloud
    participant BE as Backend Server (NestJS)
    participant DB as Database (MongoDB)
    participant Bank as Ngân hàng Thụ hưởng
    participant SePay as Dịch vụ SePay
    participant Gateway as Socket Gateway

    %% ==========================================
    %% GIAI ĐOẠN 1: THIẾT LẬP QUẢNG CÁO & TẠO QR ĐỐI SOÁT
    %% ==========================================
    rect rgb(230, 245, 255)
        Note over HR, FE: Giai đoạn 1: Chọn vị trí, kiểm tra lịch & Tạo VietQR đối soát tự động
        HR->>FE: 1. Vào mục "Đặt Quảng cáo" -> Chọn Vị trí (AdSlot) muốn đặt
        FE->>BE: 2. GET /api/ad-booking/busy-dates/:slotCode
        BE->>DB: 3. Lấy các khoảng ngày đã được đặt/bận của AdSlot này
        DB-->>BE: 4. Trả về danh sách ngày đã bận
        BE-->>FE: 5. Trả về mảng các khoảng ngày bận [startAt, endAt]
        FE-->>HR: 6. Hiển thị Lịch đặt (Làm mờ/Disable các ngày đã bận để tránh chọn trùng)

        HR->>FE: 7. Chọn khoảng ngày trống, tải ảnh Banner & nhập Link điều hướng (targetUrl)
        FE->>Cloud: 8. Upload tệp ảnh Banner lên Cloudinary
        Cloud-->>FE: 9. Trả về liên kết ảnh bảo mật (bannerUrl)

        HR->>FE: 10. Bấm "Xác nhận & Thanh toán" (FE tính toán tổng chi phí ước tính dựa trên số ngày chạy)
        FE->>BE: 11. POST /api/ad-booking { slotCode, startAt, endAt, bannerUrl, targetUrl } (kèm JWT token)

        BE->>BE: 12. Sinh mã đối soát duy nhất (transferContent, ví dụ: "NNEST1205") để gán cho giao dịch này
        BE->>DB: 13. Tạo AdBooking (status: PENDING_PAYMENT) & AdPayment (status: PENDING, content: "NNEST1205", amount: 5000000)
        DB-->>BE: 14. Xác nhận lưu dữ liệu thành công vào DB

        BE->>BE: 15. Tạo VietQR động tích hợp: Số TK thụ hưởng, Mã ngân hàng, Số tiền & Nội dung chuyển khoản "NNEST1205"
        BE-->>FE: 16. Trả về thông tin thanh toán (VietQR URL, transferContent, amount)
        FE-->>HR: 17. Hiển thị VietQR, số tiền và nội dung chuyển khoản bắt buộc. Khởi động kết nối Socket lắng nghe phản hồi.
    end

    %% ==========================================
    %% GIAI ĐOẠN 2: THANH TOÁN QUA APP NGÂN HÀNG (OFFLINE & CHUYỂN TIỀN LIÊN NGÂN HÀNG)
    %% ==========================================
    rect rgb(255, 250, 240)
        Note over HR, Bank: Giai đoạn 2: Quét mã VietQR và thực hiện Chuyển tiền liên ngân hàng
        HR->>Phone: 18. Mở App ngân hàng cá nhân trên điện thoại & Quét mã VietQR hiển thị trên FE
        Phone->>Phone: 19. Tự động điền: Số tiền (5.000.000đ), Số tài khoản nhận & Nội dung chuyển khoản chính xác "NNEST1205"
        HR->>Phone: 20. Xác nhận chuyển tiền (Xác thực sinh trắc học FaceID / Vân tay / mã OTP)
        Phone->>Bank: 21. Thực hiện chuyển tiền nhanh Napas 247 tới Ngân hàng Thụ hưởng của hệ thống Next-Nest
        Bank-->>Phone: 22. Thông báo chuyển tiền thành công qua màn hình ứng dụng ngân hàng
        Phone-->>HR: 23. Hiển thị biên lai chuyển khoản thành công trên điện thoại của HR
    end

    %% ==========================================
    %% GIAI ĐOẠN 3: LẮNG NGHE BIẾN ĐỘNG SỐ DƯ & GỬI WEBHOOK
    %% ==========================================
    rect rgb(255, 240, 245)
        Note over Bank, SePay: Giai đoạn 3: Phát hiện biến động số dư và kích hoạt Webhook SePay
        Bank->>Bank: 24. Tài khoản thụ hưởng của hệ thống Next-Nest ghi nhận biến động số dư tăng 5.000.000đ
        SePay->>Bank: 25. Quét biến động số dư định kỳ qua API Ngân hàng / App Ngân hàng liên kết (Real-time polling)
        Bank-->>SePay: 26. Trả về thông tin giao dịch mới: Số tiền: 5.000.000đ, Nội dung: "NNEST1205"

        SePay->>BE: 27. POST /api/ad-payment/webhook (Payload giao dịch kèm X-SePay-Token ở Header để xác thực bảo mật)
    end

    %% ==========================================
    %% GIAI ĐOẠN 4: ĐỐI SOÁT TỰ ĐỘNG, CẬP NHẬT TRẠNG THÁI & THÔNG BÁO REAL-TIME
    %% ==========================================
    rect rgb(240, 255, 240)
        Note over BE, Gateway: Giai đoạn 4: Xác thực webhook, đối soát thông tin và cập nhật trạng thái
        BE->>BE: 28. Kiểm tra và xác thực token X-SePay-Token ở Header để bảo mật, chống request giả mạo

        alt Webhook hợp lệ (Token chính xác)
            BE->>DB: 29. Tìm AdPayment trong Database có content = "NNEST1205" và status = PENDING
            DB-->>BE: 30. Trả về thông tin giao dịch AdPayment

            alt Tìm thấy giao dịch tương ứng
                BE->>BE: 31. Đối chiếu số tiền nhận từ webhook với số tiền cần thanh toán trong AdPayment (5.000.000đ)

                alt Khớp số tiền thanh toán
                    BE->>DB: 32a. Cập nhật AdPayment (status: PAID)

                    %% Kiểm tra tranh chấp lịch khi có 2 người thanh toán cùng lúc cho cùng 1 slot (Race Condition)
                    BE->>DB: 33a. Kiểm tra lại một lần nữa xem khoảng ngày [startAt, endAt] của AdSlot còn trống hay không
                    DB-->>BE: 34a. Trả về kết quả kiểm tra lịch

                    alt Lịch vẫn còn trống (Người dùng này giữ chỗ thành công)
                        BE->>DB: 35a. Cập nhật AdBooking (status: SCHEDULED - Đã lên lịch hiển thị)
                    else Lịch đã bị chiếm mất (Đã có giao dịch khác thanh toán trước đó)
                        BE->>DB: 35b. Cập nhật AdBooking (status: WAITING_SLOT - Chờ liên hệ đổi ngày chạy hoặc hoàn tiền)
                    end

                    DB-->>BE: 36. Xác nhận cập nhật trạng thái trong DB thành công
                    BE->>Gateway: 37. Phát sự kiện payment-success { paymentId }
                    Gateway-->>FE: 38. Đẩy thông báo Real-time cho Frontend: "Thanh toán thành công!"
                    FE-->>HR: 39. Tự động chuyển hướng màn hình sang trang chi tiết quảng cáo đã đặt (Trạng thái SCHEDULED/WAITING_SLOT)
                    BE-->>SePay: 40a. Trả về HTTP 200 OK {"status": "success", "message": "Payment processed"}

                else Sai lệch số tiền (Chuyển khoản thiếu hoặc thừa tiền so với hóa đơn)
                    BE->>DB: 32b. Cập nhật AdPayment (status: FAILED)
                    BE->>DB: 33b. Cập nhật AdBooking (status: CANCELLED)
                    DB-->>BE: 34b. Xác nhận cập nhật DB thành công
                    BE->>Gateway: 35b. Phát sự kiện payment-cancelled { paymentId }
                    Gateway-->>FE: 36b. Hiển thị thông báo: "Đơn hàng đã bị hủy hoặc hết hạn thanh toán!" (Do sai số tiền)
                    BE-->>SePay: 37b. Trả về HTTP 200 OK {"status": "error", "message": "Amount mismatch"}
                end

            else Không tìm thấy mã đối soát trong DB (Chuyển khoản sai nội dung)
                BE->>BE: 31b. Ghi log giao dịch lỗi chuyển khoản sai nội dung để Admin xử lý thủ công
                BE-->>SePay: 32c. Trả về HTTP 200 OK {"status": "unmatched", "message": "Transaction content not found"}
            end

        else Webhook không hợp lệ (Sai Token bảo mật)
            BE-->>SePay: 29b. Trả về HTTP 401 Unauthorized (Từ chối xử lý, SePay sẽ tự động thử lại sau)
        end
    end
```
