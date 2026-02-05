"use client";

import PendingCompanyPage from "@/_pages/recruiter/manager/info-company/components/pending-company";
import CompanySetupPage from "@/_pages/recruiter/manager/info-company/register-company";
import { AppSidebarRecruiter } from "@/components/app-sidebar-recruiter";
import { useAppStore } from "@/components/TanstackProvider";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

//- SEO đếch gì mấy page con này.

export default function RecruiterLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user } = useAppStore();

  //- nếu không có employerInfo thì bắt nó gia nhập công ty
  if (!user?.employerInfo) {
    return <CompanySetupPage />;
  }

  //- chạy tới đây là có employerInfo rồi
  //- check xem nếu là pending thì hiển thị trang chờ phê duyệt
  if (user.employerInfo.userStatus === "PENDING") {
    return <PendingCompanyPage user={user} />;
  }

  //- trước khi chạy vào các route con thì check xem employerInfo.status có bị khóa ko
  //- Nếu bị khóa thì thông báo
  if (user?.employerInfo?.userStatus === "INACTIVE") {
    return <PendingCompanyPage user={user} />;
  }

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

/**
 * Ghi chú này đang dành cho case xóa công ty thì bị cập nhật lại field employerInfo.status trong JWT:
 * Mình không thể check employerInfo.status ở middleware được vì khi mình xóa công ty thì employerInfo vân còn tồn tại trong JWT nó không hề bị ghi đè mới nên mình chỉ có thể check ở layout này thôi.
 */
