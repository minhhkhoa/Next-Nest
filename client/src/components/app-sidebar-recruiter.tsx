"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  ChartNoAxesCombined,
  Calendar,
  FileUser,
  FolderKanban,
  ChevronDown,
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
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";

import PopoverAdmin from "@/_pages/components/popoverAdmin";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import { useAppStore } from "./TanstackProvider";
import { getRoleRecruiterAdmin } from "@/lib/utils";

const items = [
  {
    title: "Thống kê",
    url: "/recruiter/manager/dashboard",
    icon: ChartNoAxesCombined,
    isAdmin: true, //- chi recruiter_admin moi dc xem
  },
  // {
  //   title: "Bài tuyển dụng",
  //   url: "/recruiter/jobs",
  //   icon: Calendar,
  //   isAdmin: false,
  // },
  {
    title: "Hồ sơ ứng viên",
    url: "/recruiter/manager/resumes",
    icon: FileUser,
    isAdmin: false,
  },
];

export function AppSidebarRecruiter() {
  const { user } = useAppStore();
  const pathname = usePathname();

  const roleCodeName = user?.roleCodeName;
  const roleRecruiterAdmin = getRoleRecruiterAdmin();

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="flex flex-col justify-between">
        <div>
          <BackHome />

          <SidebarGroup>
            <SidebarGroupLabel>Application</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map(
                  (item) =>
                    (!item.isAdmin || roleCodeName === roleRecruiterAdmin) && (
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
                    ),
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* thong tin cong viec cho recruiter_admin*/}
          {/* {roleCodeName === roleRecruiterAdmin && ( */}
          <SidebarGroup>
            <SidebarGroupLabel>Công việc</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <Collapsible defaultOpen>
                  <SidebarMenuItem className="mr-2.5">
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton tooltip="Chiến dịch tuyển dụng">
                        <Calendar />
                        <span className="truncate">Chiến dịch tuyển dụng</span>
                        <ChevronDown className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            asChild
                            isActive={pathname === "/recruiter/manager/jobs"}
                            className="data-[active=true]:bg-primary data-[active=true]:text-white"
                          >
                            <Link href="/recruiter/manager/jobs">
                              Bài tuyển dụng
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </CollapsibleContent>
                    {roleCodeName === roleRecruiterAdmin && (
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton
                              asChild
                              isActive={
                                pathname === "/recruiter/manager/jobs/get-hot"
                              }
                              className="data-[active=true]:bg-primary data-[active=true]:text-white"
                            >
                              <Link href="/recruiter/manager/jobs/get-hot">
                                Xin Hot
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    )}
                  </SidebarMenuItem>
                </Collapsible>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          {/* )} */}

          {/* thong tin cong ty */}
          <SidebarGroup>
            <SidebarGroupLabel>Công ty</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <Collapsible defaultOpen>
                  <SidebarMenuItem className="mr-2.5">
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton tooltip="Thông tin công ty">
                        <FolderKanban />
                        <span className="truncate">Thông tin công ty</span>
                        <ChevronDown className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            asChild
                            isActive={
                              pathname === "/recruiter/manager/info-company"
                            }
                            className="data-[active=true]:bg-primary data-[active=true]:text-white"
                          >
                            <Link href="/recruiter/manager/info-company">
                              Hồ sơ công ty
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </CollapsibleContent>
                    {roleCodeName === roleRecruiterAdmin && (
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton
                              asChild
                              isActive={
                                pathname === "/recruiter/manager/member-company"
                              }
                              className="data-[active=true]:bg-primary data-[active=true]:text-white"
                            >
                              <Link href="/recruiter/manager/member-company">
                                Thành viên
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    )}
                  </SidebarMenuItem>
                </Collapsible>
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
