import PublicLayout from "../(public)/layout";

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return <PublicLayout>{children}</PublicLayout>;
}
