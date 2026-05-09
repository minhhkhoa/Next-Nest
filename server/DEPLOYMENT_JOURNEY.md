# 🚀 Fullstack Deployment & DevOps Journey: Next-Nest Integration

Tài liệu này ghi chép lại quá trình triển khai hệ thống Fullstack (Next.js & NestJS) lên môi trường Production, tập trung vào việc thiết lập hạ tầng CI/CD, đóng gói Docker và cấu hình Reverse Proxy(hiểu đơn giản thì nó là người gác cổng cho cả hệ thống).

---

## 🏗️ Giai đoạn 1: Cơ sở hạ tầng và Tự động hóa (Infrastructure & CI/CD)

Mục tiêu là xây dựng một quy trình khép kín: **Code -> Git -> Build -> Deploy**

-> Để đạt được điều đó mình đã áp dụng CI/CD bằng GitLab CI.

### 1. Chiến lược đóng gói Docker

Hệ thống sử dụng Docker Compose để quản lý 3 service chính: `frontend`, `backend`, và `nginx-proxy`.

#### 🔹 Frontend (Next.js) - Multi-stage Build

- **Vấn đề:** Next.js in-line các biến môi trường `NEXT_PUBLIC_` vào bundle JS ngay lúc build. Nếu build xong mới đưa vào container thì các biến này sẽ bị undefined.
- **Giải pháp:** Sử dụng `ARG` trong Dockerfile để nhận biến từ GitLab CI và chuyển thành `ENV` trong quá trình `npm run build`.
- **Chú ý:** Cần lên Gitlab để nạp biến môi trường mà Client đang dùng.
- **Dockerfile Snippet:**
  ```dockerfile
  ARG NEXT_PUBLIC_API_URL_SERVER
  ENV NEXT_PUBLIC_API_URL_SERVER=$NEXT_PUBLIC_API_URL_SERVER
  RUN npm run build
  ```

#### 🔹 Backend (NestJS)

- **Cấu hình:** Đóng gói mã nguồn TypeScript, biên dịch sang `dist`.
- **Kết nối:** Sử dụng mạng nội bộ Docker (`jobhub-network`) để giao tiếp với Redis và MongoDB mà không cần mở cổng ra ngoài, tăng tính bảo mật.

### 2. Tự động hóa Pipeline (`.gitlab-ci.yml`)

Quy trình CI/CD được thiết kế để tối ưu hóa việc cập nhật cấu hình mà không làm gián đoạn hệ thống.

- **Artifacts Management:** Toàn bộ file `.env.prod` và thư mục `.next` được quản lý dưới dạng Artifacts để chuyển giao giữa Stage Build và Stage Deploy.
- **Force Restart Logic:** Thêm lệnh `docker compose restart nginx-proxy` sau lệnh `up -d`. Vì Nginx load file cấu hình qua volume map nên lệnh up -d mặc định sẽ không khởi động lại Nginx nếu chỉ có file config thay đổi.

---

## 🌐 Giai đoạn 2: Mạng và Bảo mật (Networking & Reverse Proxy)

Mục tiêu là tạo ra một cửa ngõ duy nhất (Entry Point) an toàn và hỗ trợ các tính năng thời gian thực.

Vì khum cóa nhìu tiềng nên mình chỉ dùng đồ free mà free thì có nhìu hạn chế ví dụ như thằng ngrok này chả hạn, nó chỉ cho phép mình sử dụng 1 public url duy nhất. Nhưng dự án của mình thì có 2 service là frontend và backend nên mình phải dùng thêm 1 service là reverse proxy nữa để điều phối traffic giữa 2 service đó. Và mình đã chọn nginx-proxy.

### 1. Cấu hình Nginx Reverse Proxy

Nginx chạy trên cổng `8080` (Host), đóng vai trò điều phối traffic giữa các container.

#### 🔹 Phân luồng dữ liệu (Routing)

- `/api`: Chuyển tiếp đến Backend NestJS (cổng 2302).
- `/socket.io`: Chuyển tiếp Websocket, giữ kết cho Chat và Thông báo (Upgrade Header).
- `/`: Chuyển tiếp đến Frontend Next.js (cổng 3000).

#### 🔹 Cấu hình Header quan trọng

Để hệ thống hoạt động được qua các lớp Proxy phức tạp (như Ngrok), các Header sau là bắt buộc:

- `Host $host`: Giữ nguyên domain gốc để ứng dụng xử lý đúng định danh.
- `X-Forwarded-Proto $scheme`: Báo cho Next.js biết đang dùng HTTP hay HTTPS. Thiếu cái này sẽ dẫn đến lỗi Redirect vòng lặp hoặc không thể lưu Secure Cookie.
- `Upgrade & Connection`: Thiết lập bắt buộc để giao thức Websocket (Socket.io) hoạt động xuyên qua Nginx.

### 2. Đường hầm công khai (Ngrok Tunneling)

- **Vai trò:** Ngrok ánh xạ cổng cục bộ `8080` của Server lên một Public URL ngẫu nhiên (hoặc cố định).
- **Ứng dụng:** Đây là "cầu nối" duy nhất để **SePay Webhook** có thể gửi thông báo thanh toán từ internet về server nội bộ đang nằm sau Firewall. Sau này cũng cần sửa thêm để login được với fb or gg.

---

## 🛠️ Nhật ký giải quyết vấn đề (Issue Log)

| Vấn đề                          | Nguyên nhân                                                        | Giải pháp                                                   |
| :------------------------------ | :----------------------------------------------------------------- | :---------------------------------------------------------- |
| **413 Payload Too Large**       | Nginx chặn upload file > 1MB mặc định.                             | Thêm `client_max_body_size 50M;` vào nginx.conf.            |
| **Redirect Login liên tục**     | Next.js Middleware không nhận diện được HTTPS từ Proxy Ngrok.      | Cấu hình `X-Forwarded-Proto` để báo tín hiệu HTTPS.         |
| **404 Not Found API Upload**    | Lỗi nối đúp tiền tố `/api/api` trong code client/src/lib/utils.ts. | Xóa bỏ biến env lặp lại khi gọi chữ ký Cloudinary.          |
| **Socket Connection Error**     | Client cố gắng gọi IP nội bộ `192.168.x.x` từ internet.            | Dùng `window.location.origin` để tự nhận diện domain Ngrok. |
| **Nginx không cập nhật config** | Docker Compose không restart container khi volume file thay đổi.   | Thêm lệnh `restart nginx-proxy` thủ công vào Pipeline CI.   |
| **Chat Socket thất bại**        | Namespace `/chat` chưa được đồng bộ logic URL động.                | Cập nhật URL trong useChatSocket tương tự Socket chính.     |

---

## 💡 Đôi lời

1. **Trải nghiệm deeploy:** Hơi phê, lần đầu mình thử deeploy 1 dự án monorepo fullstack nên nhìu cái chưa rõ lắm.
2. **Về dự án:** Đẩy lên prod là cả 1 vấn đề phức tạp, khi chạy dưới local thì ngon nhưng lên prod thì phát sinh các lỗi "không tên" nhưng mà tin vui là có AI giúp sức nên cũng không quá khó khăn :>>. Mình sẽ fix dần cho tới khi báo cáo. Và cả UI trên mobile nhiều màn cũng vỡ xíu xíu.
3. **Chú ý:** Login google + facebook khi đẩy lên prod thì chưa dùng được vì callback về server đã thay đổi rồi nên cần vào Google Console + Facebook Console để cập nhật lại.

---
