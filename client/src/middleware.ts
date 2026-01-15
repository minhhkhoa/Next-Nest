import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { envConfig } from "../config";

//- Vì Middleware chạy trên Edge Runtime, dùng jose thay vì jwt-decode (do jwt-decode không hỗ trợ xác thực chữ ký ở Edge
const SECRET_KEY = new TextEncoder().encode(envConfig.NEXT_PUBLIC_JWT_SECRET);

export const allowedRoles = ["SUPER_ADMIN", "RECRUITER"];

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;
  const path = request.nextUrl.pathname;

  // 1. Nếu đã có token, không cho vào lại trang login
  if (token && path === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 2. Kiểm tra Route Admin (Dùng cho cả SUPER_ADMIN, ADMIN và RECRUITER)
  const isAdminRoute = path.startsWith("/admin");

  if (isAdminRoute) {
    // Trường hợp chưa đăng nhập mà đòi vào /admin
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
      // Xác thực token bằng jose
      const { payload } = await jwtVerify(token, SECRET_KEY);
      const role = payload.roleCodeName as string;

      // Nếu là CANDIDATE hoặc GUEST mà cố vào /admin thì đá về trang chủ
      if (!allowedRoles.includes(role)) {
        return NextResponse.redirect(new URL("/", request.url));
      }

      // Nếu đúng role (SUPER_ADMIN hoặc RECRUITER), cho phép đi tiếp (NextResponse.next())
    } catch (error) {
      // Token lỗi hoặc hết hạn -> Xóa cookie để tránh loop và đá về login
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
