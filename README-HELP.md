# Hướng dẫn Hỗ trợ - Next-Nest Project

## 🌟 Giới thiệu về dự án

Đây là một ứng dụng full-stack **Next-Nest** - một nền tảng tuyển dụng việc làm được xây dựng với:
- **Client (Frontend)**: Next.js 15 + React 19 + TypeScript + TailwindCSS
- **Server (Backend)**: NestJS + MongoDB + Socket.IO + JWT Authentication

## 📂 Cấu trúc dự án

```
Next-Nest/
├── client/          # Ứng dụng Next.js frontend
│   ├── src/
│   │   ├── app/             # App Router (Next.js 15)
│   │   ├── components/      # React components
│   │   ├── queries/         # TanStack Query hooks
│   │   ├── types/           # TypeScript types
│   │   └── middleware.ts    # Next.js middleware
│   └── package.json
│
└── server/          # Ứng dụng NestJS backend
    ├── src/
    │   ├── modules/         # Feature modules
    │   │   ├── auth/        # Authentication & Authorization
    │   │   ├── user/        # User management
    │   │   ├── company/     # Company profiles
    │   │   ├── jobs/        # Job postings
    │   │   ├── news/        # News articles
    │   │   ├── skill/       # Skills catalog
    │   │   ├── roles/       # Role management
    │   │   └── permissions/ # Permission system
    │   ├── common/          # Shared utilities
    │   └── main.ts
    └── package.json
```

## 🛠️ Tôi có thể giúp bạn với:

### 1. **Phát triển Backend (NestJS)**
- ✅ Tạo endpoints API mới (CRUD operations)
- ✅ Thiết kế và implement schemas MongoDB
- ✅ Xây dựng authentication & authorization
- ✅ Tích hợp WebSocket/Socket.IO cho real-time features
- ✅ Implement validation với class-validator
- ✅ Tạo middleware và guards
- ✅ Email service với Nodemailer
- ✅ File upload với Cloudinary
- ✅ Role-based access control (RBAC)

### 2. **Phát triển Frontend (Next.js)**
- ✅ Tạo pages và components mới
- ✅ Implement forms với React Hook Form + Zod
- ✅ Data fetching với TanStack Query
- ✅ State management với Zustand
- ✅ UI components với Radix UI
- ✅ Styling với TailwindCSS
- ✅ Real-time updates với Socket.IO client
- ✅ Authentication flow & protected routes

### 3. **Testing & Quality**
- ✅ Viết unit tests (Jest)
- ✅ Viết e2e tests
- ✅ Setup linting & formatting
- ✅ Code review và optimization

### 4. **DevOps & Deployment**
- ✅ Docker configuration
- ✅ Environment configuration
- ✅ Database setup (MongoDB)
- ✅ CI/CD pipeline

### 5. **Tính năng cụ thể của hệ thống**
- ✅ Quản lý công ty (Company management)
- ✅ Đăng tin tuyển dụng (Job posting)
- ✅ Quản lý ứng viên (Candidate management)
- ✅ Hệ thống thông báo (Notifications)
- ✅ Tin tức & bài viết (News articles)
- ✅ Quản lý kỹ năng (Skills catalog)
- ✅ Hồ sơ chi tiết người dùng (Detailed profiles)

## 🚀 Hướng dẫn Khởi động

### Server (Backend)
```bash
cd server
npm install
npm run dev           # Chạy development mode
npm run build         # Build cho production
npm run test          # Chạy tests
npm run lint          # Kiểm tra code style
```

### Client (Frontend)
```bash
cd client
npm install
npm run dev           # Chạy development mode (http://localhost:3000)
npm run build         # Build cho production
npm run lint          # Kiểm tra code style
```

## 💡 Ví dụ các yêu cầu bạn có thể đưa ra:

1. **"Tạo endpoint API mới để quản lý danh mục công việc"**
2. **"Thêm tính năng tìm kiếm việc làm theo địa điểm"**
3. **"Implement upload ảnh đại diện cho hồ sơ công ty"**
4. **"Tạo dashboard thống kê cho nhà tuyển dụng"**
5. **"Fix bug trong hệ thống đăng nhập"**
6. **"Thêm validation cho form đăng ký"**
7. **"Optimize performance cho trang danh sách công việc"**
8. **"Tạo email template cho thông báo ứng tuyển"**
9. **"Implement real-time chat giữa nhà tuyển dụng và ứng viên"**
10. **"Thêm chức năng lọc và sắp xếp công việc"**

## 📝 Cách yêu cầu hỗ trợ hiệu quả:

1. **Mô tả rõ ràng**: Giải thích chi tiết tính năng hoặc vấn đề cần giải quyết
2. **Cung cấp context**: Cho biết phần nào của ứng dụng liên quan
3. **Yêu cầu cụ thể**: Nêu rõ kết quả mong đợi
4. **Ví dụ**: Cung cấp mockup, screenshot hoặc ví dụ nếu có

### Ví dụ yêu cầu tốt:
> "Tôi muốn thêm chức năng cho phép nhà tuyển dụng kick (xóa) thành viên khỏi công ty. 
> Cần tạo endpoint DELETE /company/:companyId/members/:memberId ở backend 
> và button 'Xóa thành viên' trong trang quản lý công ty ở frontend."

### Ví dụ yêu cầu cần cải thiện:
> "Thêm chức năng xóa"

## 🔧 Technologies Stack

### Backend
- NestJS 11
- MongoDB + Mongoose
- Passport (JWT, Local, Google, Facebook)
- Socket.IO
- Cloudinary (file upload)
- Nodemailer (email)
- Class Validator & Transformer
- Swagger (API documentation)

### Frontend
- Next.js 15 (App Router)
- React 19
- TypeScript
- TailwindCSS 4
- TanStack Query (data fetching)
- React Hook Form + Zod (forms)
- Zustand (state management)
- Radix UI (components)
- Socket.IO Client
- Framer Motion (animations)

## 📞 Liên hệ

Hãy đặt câu hỏi cụ thể của bạn và tôi sẽ giúp bạn với:
- Code examples
- Best practices
- Bug fixes
- Feature implementation
- Architecture advice
- Performance optimization

**Tôi sẵn sàng giúp bạn phát triển dự án Next-Nest! Hãy cho tôi biết bạn cần hỗ trợ gì. 🚀**
