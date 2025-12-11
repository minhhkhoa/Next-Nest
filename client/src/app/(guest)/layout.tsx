import BlockWrap from "./BlockWrap";
import { cookies } from "next/headers";
import HeaderClient from "../_pages/components/HeaderClient";
import Footer from "./Footer";
import BreadcrumbSite from "@/components/site-breadcrumb";

export default async function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");
  const isLoginSSR = !!accessToken;

  return (
    <BlockWrap>
      <div className="md:px-26">
        <HeaderClient isLoginSSR={isLoginSSR} />

        {/* breadcrumb */}
        <div className="mt-2">
          <BreadcrumbSite />
        </div>
        {children}

        {/* footer */}
        <div className="md:-mx-30">
          <Footer />
        </div>
      </div>
    </BlockWrap>
  );
}
