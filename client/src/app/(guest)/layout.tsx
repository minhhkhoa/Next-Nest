import BlockWrap from "./BlockWrap";
import { cookies } from "next/headers";
import HeaderClient from "../_pages/components/HeaderClient";

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
      <HeaderClient isLoginSSR={isLoginSSR} />
      {children}
    </BlockWrap>
  );
}
