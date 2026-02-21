"use client";

import React from "react";
import HeaderClient from "@/_pages/components/HeaderClient";
import Footer from "@/app/(guest)/Footer";

//- file này có tác dụng là bọc ngoài header và footer vì khi tạo chức năng ở commit trước đó với layout(tổng) thì header và footer không được hiển thị (vì mình không đặt nó vào), nên tạm thời tạo file này để bọc ngoài header và footer.

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="md:px-26 min-h-screen flex flex-col">
      <HeaderClient />
      <main className="flex-grow flex flex-col">{children}</main>
      <div className="md:-mx-30">
        <Footer />
      </div>
    </div>
  );
}
