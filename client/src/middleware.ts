import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { envConfig } from "../config";

//- Vì Middleware chạy trên Edge Runtime, dùng jose thay vì jwt-decode (do jwt-decode không hỗ trợ xác thực chữ ký ở Edge
const SECRET_KEY = new TextEncoder().encode(envConfig.NEXT_PUBLIC_JWT_SECRET);

//- các route bắt buộc phải login mới được vào (CANDIDATE, RECRUITER, ADMIN...)
export const protectedPaths = [
  "/profile",
  "/setting",
];

//- các role được phép vào trang quản trị
export const allowedRoles = [
  envConfig.NEXT_PUBLIC_ROLE_SUPER_ADMIN,
  envConfig.NEXT_PUBLIC_ROLE_RECRUITER,
  envConfig.NEXT_PUBLIC_ROLE_RECRUITER_ADMIN,
  envConfig.NEXT_PUBLIC_ROLE_CONTENT_MANAGER,
];

//- các route bị cấm vào với RECRUITER
export const forbiddenPathsForRecruiter = [
  "/admin/user",
  "/admin/recruiter",
  "/admin/industry-skill",
  "/admin/news",
  "/admin/role",
  "/admin/permission",
];

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;
  const path = request.nextUrl.pathname;

  // 1. Nếu đã có token, không cho vào lại trang login
  if (token && path === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 2. KIỂM TRA ROUTE BẢO VỆ CHUNG (Profile, Setting, Admin...)
  const isAdminRoute = path.startsWith("/admin");
  const isProtectedRoute = protectedPaths.some((p) => path.startsWith(p));

  // Nếu truy cập vào trang Admin HOẶC các trang cần bảo vệ mà chưa login
  if (isAdminRoute || isProtectedRoute) {
    if (!token) {
      // Lưu lại URL hiện tại để sau khi login có thể redirect quay lại
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", path);
      return NextResponse.redirect(loginUrl);
    }

    try {
      // Xác thực token
      const { payload } = await jwtVerify(token, SECRET_KEY);
      const role = payload.roleCodeName as string;

      // Logic dành riêng cho ADMIN ROUTE
      if (isAdminRoute) {
        //- Nếu là CANDIDATE mà cố vào /admin thì đá về trang chủ
        if (!allowedRoles.includes(role)) {
          return NextResponse.redirect(new URL("/", request.url));
        }

        // PHÂN QUYỀN CHO RECRUITER TRONG ADMIN
        if (role === envConfig.NEXT_PUBLIC_ROLE_RECRUITER) {
          const isForbidden = forbiddenPathsForRecruiter.some((p) =>
            path.startsWith(p),
          );
          if (isForbidden) {
            return NextResponse.redirect(
              new URL("/admin/dashboard", request.url),
            );
          }
        }
      }

      // Đối với isProtectedRoute (profile/setting), nếu đã có token và verify xong thì cho qua
      return NextResponse.next();
    } catch (error) {
      console.error("Middleware JWT Error:", error);
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("access_token");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  // Loại bỏ các file tĩnh và các folder đặc biệt của Next.js
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
