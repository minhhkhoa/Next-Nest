# Kiến trúc Real-time với Socket.IO trong ứng dụng Next-Nest

## 1. Tổng quan

Ứng dụng này sử dụng kiến trúc real-time để cung cấp các cập nhật tức thời cho người dùng, chủ yếu phục vụ cho tính năng thông báo (notifications). Real-time communication được triển khai bằng cách sử dụng **Socket.IO** trên cả phía backend (NestJS) và frontend (Next.js).

Kiến trúc này đảm bảo rằng khi có một sự kiện mới xảy ra ở server cần thông báo cho người dùng, thông báo đó sẽ được đẩy đến client ngay lập tức mà không cần client phải chủ động gửi yêu cầu liên tục.

## 2. Kiến trúc phía Server (NestJS)

Phía server, NestJS tích hợp với `socket.io` thông qua các module `@nestjs/websockets` và `@nestjs/platform-socket.io` để quản lý các kết nối WebSocket.

### Các thành phần chính:

*   **`src/modules/notifications/notifications.gateway.ts`**: Đây là Gateway chính chịu trách nhiệm quản lý các kết nối WebSocket và xử lý các sự kiện real-time liên quan đến thông báo.

    *   `@WebSocketGateway({ cors: { origin: '*' } })`: Decorator này đánh dấu lớp là một WebSocket Gateway và cấu hình `CORS` để cho phép kết nối từ các origin khác nhau.

    *   `@WebSocketServer() server: Server;`: Inject instance `Server` của Socket.IO vào gateway. `server` này được sử dụng để phát (emit) các sự kiện đến các client được kết nối.
    
    *   `handleConnection(client: Socket)`: Phương thức này được gọi mỗi khi một client mới kết nối đến WebSocket server.
        *   Tại đây, client được xác thực (qua JWT, chi tiết ở `ws-jwt.guard.ts`).
        *   Sau khi xác thực thành công, client được tham gia vào một "phòng" (room) cụ thể dựa trên `userId` của họ (`client.join(userId)`). Điều này cho phép server gửi thông báo đến từng người dùng cụ thể.
        *   Log `Socket joined room: ${userId}` được ghi lại để theo dõi.
    *   `handleEvent(client: Socket, data: any)`: Đây là một ví dụ về cách gateway có thể lắng nghe các sự kiện từ client. Nếu có các sự kiện client gửi lên server, chúng sẽ được xử lý ở đây.
*   **`src/common/guard/ws-jwt.guard.ts`**: Middleware này được sử dụng để xác thực người dùng trên các kết nối WebSocket. Khi một client cố gắng kết nối, guard này sẽ kiểm tra JWT token được gửi kèm để xác định danh tính của người dùng trước khi cho phép kết nối và tham gia phòng. Nếu xác thực thất bại, một `WsException` sẽ được ném ra.
*   **`src/app.module.ts`**: Cấu hình chung cho ứng dụng NestJS, bao gồm cả các cài đặt liên quan đến socket như `socketTimeoutMS` để quản lý thời gian chờ của socket.
*   **`package.json`**: Các dependencies như `socket.io`, `@nestjs/websockets`, `@nestjs/platform-socket.io` xác nhận việc sử dụng Socket.IO trong dự án.

## 3. Kiến trúc phía Client (Next.js)

Phía client, Next.js sử dụng thư viện `socket.io-client` để thiết lập và duy trì kết nối với WebSocket server NestJS.

### Các thành phần chính:

*   **`src/components/socket-provider.tsx`**: Đây là trung tâm quản lý kết nối socket phía client.
    *   `import { io, Socket } from "socket.io-client";`: Import các hàm và kiểu dữ liệu cần thiết từ thư viện.
    *   `let socket: Socket | null = null;`: Biến toàn cục để lưu trữ instance socket, đảm bảo chỉ có một kết nối duy nhất.
    *   `SocketListener = () => { ... }`: Đây là một React Component (hoặc custom hook) được sử dụng để khởi tạo và lắng nghe các sự kiện socket.
        *   `const { isLogin, user, setSocket } = useAppStore();`: Sử dụng Zustand để lấy trạng thái đăng nhập, thông tin người dùng và hàm `setSocket` để cập nhật instance socket vào global state.
        *   **Thiết lập kết nối**: `socket = io(envConfig.NEXT_PUBLIC_API_URL_SERVER_BASE, { transports: ["websocket"], auth: { token: "your_jwt_token" } });`
            *   Sử dụng biến môi trường `NEXT_PUBLIC_API_URL_SERVER_BASE` để lấy địa chỉ server.
            *   Cấu hình `transports: ["websocket"]` để ưu tiên WebSocket.
            *   Gửi `auth: { token: "your_jwt_token" }` để server xác thực (guard `ws-jwt.guard.ts` ở server sẽ xử lý).
        *   **Lắng nghe sự kiện**:
            *   `socket.on("connect", () => { ... });`: Khi client kết nối thành công với server.
            *   `socket.on("new-notification", (data) => { ... });`: Lắng nghe sự kiện `new-notification` từ server và xử lý dữ liệu thông báo nhận được (ví dụ: cập nhật UI, hiển thị toast).
            *   `socket.on("connect_error", (err) => { ... });`: Xử lý các lỗi kết nối.
        *   **Ngắt kết nối**: `socket.disconnect();`: Khi người dùng logout hoặc component bị unmount, kết nối sẽ được ngắt và instance socket được xóa khỏi global state.
*   **`src/components/TanstackProvider.tsx`**: Component này có thể sử dụng `SocketListener` hoặc nhận instance socket đã được khởi tạo để thực hiện các tác vụ real-time khác nếu cần, đảm bảo rằng socket instance có sẵn cho toàn bộ cây component thông qua Context API hoặc Zustand.
*   **`package.json`**: Dependency `socket.io-client` xác nhận việc sử dụng thư viện này.

## 4. Luồng hoạt động (Ví dụ: Thông báo mới)

1.  **Người dùng đăng nhập (Client)**:
    *   Khi người dùng đăng nhập thành công vào Next.js frontend, thông tin `isLogin` và `user` được cập nhật trong `useAppStore`.
    *   Component `SocketListener` (`src/components/socket-provider.tsx`) phát hiện trạng thái đăng nhập và khởi tạo một kết nối Socket.IO đến địa chỉ `envConfig.NEXT_PUBLIC_API_URL_SERVER_BASE`. Kèm theo đó là `access token` để xác thực.

2.  **Xác thực kết nối (Server)**:
    *   NestJS `NotificationsGateway` nhận được yêu cầu kết nối.
    *   `ws-jwt.guard.ts` chặn yêu cầu, xác thực `access token` được gửi từ client.
    *   Nếu token hợp lệ, `handleConnection` trong `NotificationsGateway` được gọi.
    *   Gateway trích xuất `userId` từ token và cho client tham gia vào một phòng có tên là `userId` (`client.join(userId)`).

3.  **Tạo thông báo (Server)**:
    *   Một hành động nào đó ở backend (ví dụ: admin tạo thông báo mới, người dùng khác gửi tin nhắn, v.v.) kích hoạt một service (ví dụ: `NotificationsService`).
    *   Service này gọi đến `NotificationsGateway` và yêu cầu phát một sự kiện (ví dụ: `this.server.to(targetUserId).emit('new-notification', notificationData);`).

4.  **Nhận và hiển thị thông báo (Client)**:
    *   Tất cả các client trong phòng `targetUserId` (tức là người dùng đó) nhận được sự kiện `new-notification`.
    *   `SocketListener` ở client đã đăng ký lắng nghe sự kiện này: `socket.on("new-notification", (data) => { ... });`.
    *   Hàm callback được thực thi, xử lý `data` (dữ liệu thông báo) và cập nhật UI (ví dụ: hiển thị một icon chuông thông báo có số lượng mới, hiển thị toast thông báo).

5.  **Ngắt kết nối (Client)**:
    *   Nếu người dùng logout hoặc tab trình duyệt bị đóng, `SocketListener` sẽ gọi `socket.disconnect()` để đóng kết nối WebSocket một cách an toàn và dọn dẹp tài nguyên.

Kiến trúc này đảm bảo trải nghiệm người dùng liền mạch và tức thời cho các tính năng yêu cầu cập nhật dữ liệu nhanh chóng.
