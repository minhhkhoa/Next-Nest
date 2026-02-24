import { AppSidebarAdmin } from "@/components/app-sidebar-admin";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <AppSidebarAdmin />
      <main className="flex-1 container mx-auto">
        <div className="flex items-center">
          <SidebarTrigger />
        </div>
        {children}
      </main>
    </SidebarProvider>
  );
}
