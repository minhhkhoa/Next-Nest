import Footer from "./Footer";
import BreadcrumbSite from "@/components/site-breadcrumb";
import HeaderClient from "@/_pages/components/HeaderClient";
import BlockIssue from "@/components/BlockIssue";

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

      <BlockIssue />

      {/* footer */}
      <div className="md:-mx-30">
        <Footer />
      </div>
    </div>
  );
}
