"use client";

import Link from "next/link";

export default function GlobalNotFound() {
  return (
    <html lang="vi">
      <body>
        <div
          style={{
            textAlign: "center",
            marginTop: "50px",
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          <h1>404 - Trang không tồn tại</h1>
          <p>Đường dẫn hoặc ngôn ngữ bạn truy cập không hợp lệ.</p>
          <Link href="/" style={{ color: "#0070f3", textDecoration: "none" }}>
            Quay lại trang chủ
          </Link>
        </div>
      </body>
    </html>
  );
}
