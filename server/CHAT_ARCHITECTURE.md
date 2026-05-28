# Kiến trúc Hệ thống Chat (Chat Architecture)

Tài liệu này mô tả chi tiết kiến trúc, thiết kế cơ sở dữ liệu và luồng dữ liệu (Data Flow) của hệ thống Chat thời gian thực giữa Ứng viên (Candidate) và Nhà tuyển dụng (Company/HR) trong hệ thống JobHub.

---

## 1. Kiến trúc Cơ sở dữ liệu (Database Schema)

Hệ thống sử dụng MongoDB để quản lý dữ liệu chat, chia làm 2 Collection chính để đảm bảo hiệu suất truy vấn thay vì lồng document vào nhau:

### 1.1. Collection `Conversations` (Phòng/Cuộc trò chuyện)
Lưu trữ thông tin tổng quan của một cuộc trò chuyện giữa 2 bên, đóng vai trò như một "Phòng Chat" lưu trạng thái meta.

- `_id`: String (ObjectId)
- `candidateId`: ObjectId (Reference tới bảng User/Candidate)
- `companyId`: ObjectId (Reference tới bảng Company)
- `assignedRecruiterId` (Mở rộng): ObjectId (HR cụ thể đang theo dõi phòng chat này)
- `lastMessage`: String (Nội dung tin nhắn cuối cùng để hiển thị rút gọn ngoài Sidebar)
- `lastMessageAt`: Date (Thời gian gửi tin mới nhất để sắp xếp Conversation nào lên đầu)
- `unreadCandidate`: Number (Số tin nhắn chưa đọc đối với Candidates)
- `unreadCompany`: Number (Số tin nhắn chưa đọc đối với HR).
- `jobReferenceId` (Optional): ObjectId (Lưu lại UI context xem cuộc trò chuyện này xuất phát từ công việc nào, giúp Nhà tuyển dụng dễ định hướng support ứng viên)

### 1.2. Collection `Messages` (Tin nhắn trực tiếp)
Lưu trữ từng dòng tin nhắn rời rạc một cách phân mảnh (Flat). Giúp việc truy vấn Limit/Offset/Pagination cực kỳ mượt mà.

- `_id`: String (ObjectId)
- `conversationId`: ObjectId (Reference tới định danh phòng Conversation) - *Trường này được cấu hình Indexing để lọc dữ liệu tốc độ cao*.
- `senderId`: ObjectId (Reference tới Ai là người gửi tin này)
- `senderType`: Enum `["CANDIDATE", "RECRUITER"]`
- `type`: Enum `["TEXT", "IMAGE", "JOB_REFERENCE", "CV_SYSTEM", "CV_LINK"]` (Mở mang sau này để gửi được cả file, hình ảnh hay resume qua chat)
- `content`: String (Nội dung text/url của tin nhắn)
- `isRead`: Boolean (Đánh dấu đã đọc hay chưa)

---

## 2. Mô hình hóa Luồng chạy từ Frontend tới Backend (System Data Flow)

Hệ thống được thiết kế theo luồng xử lý đồng bộ lai ghép (REST kết hợp đệm danh WebSockets). Cụ thể như sau:

**Bước 1: Khởi tạo/Tìm phòng từ trang chi tiết (Nhà tuyển dụng / Công việc)**
1. Khi user bấm nút **"Nhắn tin/Liên hệ"** ở UI (Detail Job / Detail Company), nút này sẽ thu thập ID người nhận (Nhà tuyển dụng hoặc Ứng viên).
2. Frontend bắn một yêu cầu tới `POST /api/conversations` (REST API) - create conversations.
3. Backend kiểm tra trong Database. Nếu hai thực thể này đã từng chat với nhau, nó trả về ID phòng cũ (`_id`). Nếu chưa, nó khởi tạo `Conversation` mới và lưu DB.
4. Trả về `conversationId` cho FE, React sẽ lập tức Force URL Redirect chuyển hướng qua `http://localhost:3000/chat?conversationId=...`.

**Bước 2: Hiển thị giao diện Chat và Mồi kết nối Gateway WebSockets**
1. Giao diện Chat mở lên. Nó đọc `conversationId` từ URL và dùng `@tanstack/react-query` gọi 2 API HTTP:
   - `GET /conversations` để ráp Layout Danh sách phòng (Sidebar). 
   - `GET /messages/:conversationId` để lấy 50 tin nhắn hòm hòm hiển thị trước (Cửa sổ chat).
2. Khi dữ liệu thô đã tải xong, hook `useChatSocket` khởi chạy. Một TCP Connection được khởi tạo và chọc thẳng vào lớp `ChatGateway` (WebSockets) của BE ở nhánh logic `/chat`.
3. Client bắt đầu gửi sự kiện Socket đầu tiên `join_conversation` kèm theo string `conversationId`. Điều này nói cho BE biết "Tên tôi đây và đây là phòng tôi đang theo dõi ngay lúc này".

**Bước 3: Nhắn tin và Phát nhầm Real-time**
1. Người dùng gõ "Hello" và nhấn gửi. Frontend **không gửi tin nhắn đó trực tiếp qua WebSockets**. 
2. Thay vào đó, FE gọi `POST /messages` vào REST API. Điều này đảm bảo Request chạy qua các lớp phòng thủ chuẩn Auth Guards, Exception Filters và Class-validator Guards của NestJS.
3. Nếu text chuẩn xác, REST Controller sẽ lưu dòng "Hello" xuống `Messages Collection` đồng thời update `lastMessage` ở `Conversations`.
4. Sau khi Lưu Database thành công ở Thread HTTP, Class Service sẽ Inject Module `ChatGateway` và tiến hành bắn Broadcast nội mạng: "Có data lưu xong rồi, hãy báo cho Socket đi!". 
5. `ChatGateway` tìm tới đúng `Room` đang nắm ID đó và phát Event `receiveMessage` chính là hàm `emitMessageToConversation` ở `ChatGateWay`. Cả người gửi lẫn người nhận nếu đang mở app sẽ đều lắng nghe được Event này lập tức và State React tự đẩy UI message nổi lên.

---

## 3. Chuyên sâu về Chat Gateway trong NestJS (WebSockets / Socket.IO)

Trong kiến trúc của chúng ta, REST API xử lý "Business Logic" - còn WebSockets xử lý "Real-Time BroadCasting". Gateway của Chat được dựng bằng decorator `@WebSocketGateway()` từ `@nestjs/websockets`.

**1. Tách biệt đường truyền (Namespace `/chat`)**
Thay vì để tất cả socket đùn chung một kết nối gốc `ws://domain/` (đang sử dụng cho notification), ta tách ra `ws://domain/chat`. Cơ chế Namespace này giúp Code không giẫm chân lên nhau, sau này có Gateway khác hay Tracking Gateway cũng không lẫn lộn Authentication của Chat.

**2. Quản lý phân khu bộ nhớ bằng Rooms (`join_conversation` và `leave_conversation`)**
Nguyên lý của hệ thống **KHÔNG DUYỆT TẤT CẢ USER ĐANG ONLINE** để vứt tin nhắn vì sẽ tốn tài nguyên. 
- Ngay khi người dùng kích chuột vào 1 phòng chat ở Sidebar, một sự kiện tên `joinRoom` được emit qua WebSockets. Ở backend `chat.gateway.ts`, hàm `@SubscribeMessage('join_conversation')` sẽ ghi danh cái kết nối Socket này (ví dụ `socket.id: ABC-123`) vào tập hợp `conversation_ID` bằng lệnh Native của thư viện Socket.io: `client.join(conversationId)`.
- Khi user click sang phòng chat khác, FE đá sự kiện `leave_conversation` cái ID cũ để dọn rác memory trước rồi mới Join lại phòng mới.
-> Cách setup Room này giống việc chia lớp học ảo cho các User vậy.

**3. Khả năng gánh tải của vòng đời Emit**
Vì `ChatGateway` (ở cổng Websocket) được khai báo là một `@Injectable()` có Export ở File `MessageModule`, thành ra một dịch vụ HTTP bình thường tên là `MessageService` cũng có thể yêu cầu truy xuất Gateway này.
- Khi API báo Lưu tin vào DB xong, `MessageService` gọi thằng Gateway: `emitMessageToConversation()`. 
- Hàm `.to(conversationId)` trong đó chứng minh điểm ăn tiền của Room: Thay vì phát tán toàn server, Socket engine chỉ quét trong bộ nhớ RAM những TCP Connections nào đã được đánh dấu vào `conversationId` đó là nó quăng data qua. Vừa tiết kiệm băng thông vừa bảo mật 100%.

---

## 4. Các API REST Tương thích cốt lõi

1. **`POST /api/chat/conversations`**: API thông minh giúp thiết lập phòng trò truyện ban đầu (Nếu chưa có thì nó tự Make 1 Document cho 2 bên, nếu có rồi nó móc Record đó ra). Yêu cầu gửi `candidateId` nếu nhà tuyển dụng tạo đoạn chat hoặc `companyId` nếu người dùng tạo đoạn chat.
2. **`GET /api/chat/conversations`**: Tải Sidebar chat. Dựa vào JWT Token server biết là ai để chọc DB kéo ra phòng đúng quyền hạn dựa vào companyId hoặc candidateId tuỳ theo role của user trong req.user.roleCodeName.
3. **`GET /api/chat/messages/:conversationId`**: Kéo lịch sử tin nhắn dạng Pagination cho khung Chat Window. Giúp UI cuộn tới đâu Load thêm tới đó mà không làm đầy RAM điện thoại ở lần F5 đầu.
4. **`POST /api/chat/messages`**: API nhận nội dung Payload `{ type: 'đa dạng như bên trên đã trình bày', content: '...', conversationId: '...' }` để bọc gói ném vào DB và giật trigger cho ChatGateway.

---

## 5. Chiến lược Kết hợp State tại Frontend

Chìa khoá xử lý giật lag và mượt mà giao diện cho Frontend khi kết hợp React Query và Sockets:

Array tổng để Map lên màn hình sẽ luôn là mảng giao thoa: `displayMessages = [...messages(Tĩnh), ...realtime(Động)]`.
- **`messages(Tĩnh)`**: Là kết quả từ REST API `useGetMessages`. Giữ vững vị trí và bị Cache cứng tại Session đó bởi Tanstack Query. Nó chứng minh Data thực nằm ở MongoDB.
- **`realtime(Động)`**: Mỗi khi Hook `useChatSocket` lắng nghe Event `receiveMessage` rơi xuống từ đường dây Gateway, nó tự động `.push()` vào State cục bộ `realtimeMessages` này.
- Khi người dùng `F5`, State Realtime biến thành rỗng `[]`, nhưng API tự động tìm DB và kéo thêm tin Cũ lên thế chỗ. => Mô hình đảm bảo Không Rơi Rụng một tin nhắn nào kể cả khi rớt mạng Socket mà Frontend gửi Data qua HTTP REST vẫn lỡ lọt vào mảng DB.
