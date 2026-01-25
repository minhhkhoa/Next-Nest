"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  ChartNoAxesCombined,
  Calendar,
  FileUser,
  Factory,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  BackHome,
} from "@/components/ui/sidebar";

import PopoverAdmin from "@/_pages/components/popoverAdmin";

const items = [
  {
    title: "Thống kê",
    url: "/recruiter/manager/dashboard",
    icon: ChartNoAxesCombined,
  },
  {
    title: "Chiến dịch tuyển dụng",
    url: "/recruiter/manager/jobs",
    icon: Calendar,
  },
  {
    title: "Thông tin công ty",
    url: "/recruiter/manager/info-company",
    icon: Factory,
  },
  { title: "Resumes & CV", url: "/recruiter/manager/resumes", icon: FileUser },
];

export function AppSidebarRecruiter() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="flex flex-col justify-between">
        <div>
          <BackHome />

          <SidebarGroup>
            <SidebarGroupLabel>Application</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem className="mr-2.5" key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname.startsWith(item.url)}
                      tooltip={item.title}
                      className="data-[active=true]:bg-primary data-[active=true]:text-white"
                    >
                      <Link href={item.url}>
                        <item.icon />
                        <span className="truncate">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>

        <div className="mb-2">
          <PopoverAdmin />
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
