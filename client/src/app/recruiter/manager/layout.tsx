import { AppSidebarRecruiter } from "@/components/app-sidebar-recruiter";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default async function RecruiterLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <AppSidebarRecruiter />
      <main className="flex-1 container mx-auto">
        <div className="flex items-center">
          <SidebarTrigger />
        </div>
        {children}
      </main>
    </SidebarProvider>
  );
}
