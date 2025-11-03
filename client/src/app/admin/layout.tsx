import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import BlockWrap from "../(guest)/BlockWrap";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <BlockWrap>
      <SidebarProvider>
        <AppSidebar />
        <main className="flex-1 container mx-auto">
          <div className="flex items-center">
            <SidebarTrigger />
          </div>
          {children}
        </main>
      </SidebarProvider>
    </BlockWrap>
  );
}
