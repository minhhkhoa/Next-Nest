import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { envConfig } from "../config";

const SECRET_KEY = new TextEncoder().encode(envConfig.NEXT_PUBLIC_JWT_SECRET);

// 1. Cấu hình nhóm Route protected
export const protectedPaths = ["/profile", "/setting"];

// 2. Cấu hình nhóm Role
const SYSTEM_ADMIN_ROLES = [
  envConfig.NEXT_PUBLIC_ROLE_SUPER_ADMIN,
  envConfig.NEXT_PUBLIC_ROLE_CONTENT_MANAGER,
];

const RECRUITER_ROLES = [
  envConfig.NEXT_PUBLIC_ROLE_RECRUITER,
  envConfig.NEXT_PUBLIC_ROLE_RECRUITER_ADMIN,
];

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;
  const path = request.nextUrl.pathname;

  //- chặn về trang login khi đã login thành công
  if (token && path === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const isAdminRoute = path.startsWith("/admin");
  const isRecruiterRoute = path.startsWith("/recruiter");
  const isProtectedRoute = protectedPaths.some((p) => path.startsWith(p));

  //- xử lý các route cần bảo vệ
  if (isAdminRoute || isRecruiterRoute || isProtectedRoute) {

    //- không có token (chưa đăng nhập) đá về login
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", path);
      return NextResponse.redirect(loginUrl);
    }

    try {
      //- tới đây thì đã login rồi
      const { payload } = await jwtVerify(token, SECRET_KEY);
      const role = payload.roleCodeName as string;

      //- bảo vệ route /admin
      if (isAdminRoute) {
        //- chỉ cho phép nhóm System Admin vào
        if (!SYSTEM_ADMIN_ROLES.includes(role)) {
          //- Nếu là Nhà tuyển dụng đi lạc vào Admin -> Đá về Dashboard của Recruiter
          if (RECRUITER_ROLES.includes(role)) {
            return NextResponse.redirect(
              new URL("/recruiter/manager/dashboard", request.url),
            );
          }
          //- các role khác (Candidate) -> Đá về Home
          return NextResponse.redirect(new URL("/", request.url));
        }
      }

      //- bảo vệ route /recruiter
      if (isRecruiterRoute) {
        //- chỉ cho phép nhóm Recruiter vào
        if (!RECRUITER_ROLES.includes(role)) {
          //- nếu Super Admin đi lạc vào trang Recruiter -> Đá về Admin Dashboard
          if (SYSTEM_ADMIN_ROLES.includes(role)) {
            return NextResponse.redirect(
              new URL("/admin/dashboard", request.url),
            );
          }

          //- các role khác (Candidate) -> Đá về Home
          return NextResponse.redirect(new URL("/", request.url));
        }
      }

      //- bảo vệ các route protected
      // Nếu đã login và verify thành công thì luôn cho phép vào profile/setting
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
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
