import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { envConfig } from "../config";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const SECRET_KEY = new TextEncoder().encode(envConfig.NEXT_PUBLIC_JWT_SECRET);

const intlMiddleware = createMiddleware(routing);

// 1. Cấu hình nhóm Route protected
const protectedPaths = ["/profile", "/setting", "/change-password"];

// 2. Cấu hình nhóm Role
const SYSTEM_ADMIN_ROLES = [
  envConfig.NEXT_PUBLIC_ROLE_SUPER_ADMIN,
  envConfig.NEXT_PUBLIC_ROLE_CONTENT_MANAGER,
];

const RECRUITER_ROLES = [
  envConfig.NEXT_PUBLIC_ROLE_RECRUITER,
  envConfig.NEXT_PUBLIC_ROLE_RECRUITER_ADMIN,
];

//- các path mà nhà tuyển dụng được phép truy cập dù chưa có role
const RECRUITER_BYPASS_PATHS = ["/recruiter/welcome", "/recruiter/register"];

const FORBIDDEN_PATH = "/unauthorized";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;
  const path = request.nextUrl.pathname;

  /**
 *Xử lý i18n trước
    - Nếu path không có locale, intlMiddleware sẽ redirect (ví dụ / -> /vi)
    - Tuy nhiên, ta cần phối hợp với logic auth bên dưới.
   - Cách đơn giản nhất là chạy intlMiddleware để lấy response,
   - sau đó kiểm tra auth, nếu cần redirect auth thì override response,
  - nếu không thì trả về response của intlMiddleware.
 */

  const intlResponse = intlMiddleware(request);

  // Nếu intlMiddleware trả về redirect (ví dụ / -> /vi), ta return luôn để client redirect theo
  if (intlResponse.headers.get("location")) {
    return intlResponse;
  }

  //- không cho hiển thị vào trang /unauthorized
  if (path === FORBIDDEN_PATH) {
    return NextResponse.redirect(new URL("/", request.url));
  }

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

      //- cho phép nhà tuyển dụng vào trang welcome dù chưa có role
      if (RECRUITER_BYPASS_PATHS.includes(path)) {
        return NextResponse.next();
      }

      //- bảo vệ route /admin
      if (isAdminRoute) {
        //- chỉ cho phép nhóm System Admin vào
        if (!SYSTEM_ADMIN_ROLES.includes(role)) {
          return NextResponse.rewrite(new URL(FORBIDDEN_PATH, request.url));
        }
      }

      //- bảo vệ route /recruiter
      if (isRecruiterRoute) {
        //- chỉ cho phép nhóm Recruiter vào
        if (!RECRUITER_ROLES.includes(role)) {
          return NextResponse.rewrite(new URL(FORBIDDEN_PATH, request.url));
        }
      }

      //- bảo vệ các route protected
      // Nếu đã login và verify thành công thì luôn cho phép vào profile/setting
      return intlResponse;
    } catch (error) {
      console.error("Middleware JWT Error:", error);
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("access_token");
      return response;
    }
  }

  return intlResponse;
}

export const config = {
  // Matcher ignoring `/_next/` and `/api/`
  matcher: [
    "/((?!api|trpc|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|pdf|txt|xml|json|js|css)).*)",
  ],
};
