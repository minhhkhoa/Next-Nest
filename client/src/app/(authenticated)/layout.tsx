import HeaderClient from "@/_pages/components/HeaderClient";
import BreadcrumbSite from "@/components/site-breadcrumb";
import Footer from "../(guest)/Footer";
import BlockIssue from "@/components/BlockIssue";

export default async function AuthenticatedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="md:px-26 min-h-screen flex flex-col">
      {/* Giữ nguyên Header vì cần dùng chung User Menu/Thông báo */}
      <HeaderClient />

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
