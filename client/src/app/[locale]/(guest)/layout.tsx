import Footer from "./Footer";
import BreadcrumbSite from "@/components/site-breadcrumb";
import HeaderClient from "@/components/HeaderClient";
import { FloatButton } from "@/components/FloatButton";

export default async function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="md:px-26">
      <HeaderClient />

      {/* breadcrumb */}
      <div className="mt-2">
        <BreadcrumbSite />
      </div>
      {children}

      <FloatButton />

      {/* footer */}
      <div className="md:-mx-30">
        <Footer />
      </div>
    </div>
  );
}
