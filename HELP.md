# Help Guide - Next-Nest Project

## 🌟 Project Overview

This is a **Next-Nest** full-stack application - a job recruitment platform built with:
- **Client (Frontend)**: Next.js 15 + React 19 + TypeScript + TailwindCSS
- **Server (Backend)**: NestJS + MongoDB + Socket.IO + JWT Authentication

## 📂 Project Structure

```
Next-Nest/
├── client/          # Next.js frontend application
│   ├── src/
│   │   ├── app/             # App Router (Next.js 15)
│   │   ├── components/      # React components
│   │   ├── queries/         # TanStack Query hooks
│   │   ├── types/           # TypeScript types
│   │   └── middleware.ts    # Next.js middleware
│   └── package.json
│
└── server/          # NestJS backend application
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

## 🛠️ What I Can Help You With:

### 1. **Backend Development (NestJS)**
- ✅ Create new API endpoints (CRUD operations)
- ✅ Design and implement MongoDB schemas
- ✅ Build authentication & authorization
- ✅ Integrate WebSocket/Socket.IO for real-time features
- ✅ Implement validation with class-validator
- ✅ Create middleware and guards
- ✅ Email service with Nodemailer
- ✅ File upload with Cloudinary
- ✅ Role-based access control (RBAC)

### 2. **Frontend Development (Next.js)**
- ✅ Create new pages and components
- ✅ Implement forms with React Hook Form + Zod
- ✅ Data fetching with TanStack Query
- ✅ State management with Zustand
- ✅ UI components with Radix UI
- ✅ Styling with TailwindCSS
- ✅ Real-time updates with Socket.IO client
- ✅ Authentication flow & protected routes

### 3. **Testing & Quality**
- ✅ Write unit tests (Jest)
- ✅ Write e2e tests
- ✅ Setup linting & formatting
- ✅ Code review and optimization

### 4. **DevOps & Deployment**
- ✅ Docker configuration
- ✅ Environment configuration
- ✅ Database setup (MongoDB)
- ✅ CI/CD pipeline

### 5. **System-Specific Features**
- ✅ Company management
- ✅ Job posting
- ✅ Candidate management
- ✅ Notifications system
- ✅ News & articles
- ✅ Skills catalog
- ✅ Detailed user profiles

## 🚀 Getting Started

### Server (Backend)
```bash
cd server
npm install
npm run dev           # Run in development mode
npm run build         # Build for production
npm run test          # Run tests
npm run lint          # Check code style
```

### Client (Frontend)
```bash
cd client
npm install
npm run dev           # Run in development mode (http://localhost:3000)
npm run build         # Build for production
npm run lint          # Check code style
```

## 💡 Example Requests You Can Make:

1. **"Create a new API endpoint to manage job categories"**
2. **"Add job search feature by location"**
3. **"Implement company profile image upload"**
4. **"Create analytics dashboard for recruiters"**
5. **"Fix bug in login system"**
6. **"Add validation for registration form"**
7. **"Optimize performance for job listing page"**
8. **"Create email template for application notifications"**
9. **"Implement real-time chat between recruiters and candidates"**
10. **"Add job filtering and sorting functionality"**

## 📝 How to Request Help Effectively:

1. **Be Specific**: Clearly describe the feature or problem to solve
2. **Provide Context**: Mention which part of the application is involved
3. **State Requirements**: Clearly define expected outcomes
4. **Include Examples**: Provide mockups, screenshots, or examples if available

### Good Request Example:
> "I want to add functionality that allows recruiters to kick (remove) members from a company.
> Need to create a DELETE endpoint at /company/:companyId/members/:memberId in the backend
> and a 'Remove Member' button in the company management page on the frontend."

### Request That Needs Improvement:
> "Add delete function"

## 🔧 Technology Stack

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

## 📞 Get in Touch

Ask your specific questions and I'll help you with:
- Code examples
- Best practices
- Bug fixes
- Feature implementation
- Architecture advice
- Performance optimization

**I'm ready to help you develop the Next-Nest project! Let me know what you need. 🚀**
