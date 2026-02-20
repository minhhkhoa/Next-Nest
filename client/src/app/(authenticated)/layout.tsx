import { cookies } from "next/headers";
import HeaderClient from "@/_pages/components/HeaderClient";
import BreadcrumbSite from "@/components/site-breadcrumb";
import Footer from "../(guest)/Footer";
import BlockIssue from "@/components/BlockIssue";

export default async function AuthenticatedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");
  const isLoginSSR = !!accessToken;

  return (
    <div className="md:px-26 min-h-screen flex flex-col">
      {/* Giữ nguyên Header vì cần dùng chung User Menu/Thông báo */}
      <HeaderClient isLoginSSR={isLoginSSR} />

      <div className="mt-2 container mx-auto flex-grow">
        <BreadcrumbSite />
      </div>
      {children}

      <BlockIssue />

      {/* Có thể giữ hoặc bỏ Footer tùy UX Khoa muốn */}
      <div className="md:-mx-30 mt-auto">
        <Footer />
      </div>
    </div>
  );
}
