"use client";

import { Link, usePathname } from "@/i18n/navigation";
import {
  ChartNoAxesCombined,
  User2,
  Calendar,
  Search,
  Factory,
  FolderKanban,
  ChevronDown,
  DoorClosedLocked,
  Mailbox,
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
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  BackHome,
} from "@/components/ui/sidebar";

import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { useAppStore } from "./TanstackProvider";
import { envConfig } from "../../config";
import PopoverAdmin from "@/components/popoverAdmin";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";

const items = [
  { title: "Thống kê", url: "/admin/dashboard", icon: ChartNoAxesCombined },
  { title: "Người dùng", url: "/admin/user", icon: User2 },
  { title: "Công việc", url: "/admin/jobs", icon: Calendar },
  { title: "Công ty", url: "/admin/company", icon: Search },
  {
    title: "Ngành nghề & kỹ năng",
    url: "/admin/industry-skill",
    icon: Factory,
  },
];

const items2 = [
  { title: "Lỗi & Phản hồi", url: "/admin/issue", icon: Mailbox },
];

export function AppSidebarAdmin() {
  const pathname = usePathname();
  const { user } = useAppStore();

  // Sử dụng roleCodeName để đồng bộ với logic Middleware và JWT
  const roleCode = user?.roleID?.name?.vi;
  // const isRecruiter = roleCode === envConfig.NEXT_PUBLIC_ROLE_RECRUITER;
  const isContentManager =
    roleCode === envConfig.NEXT_PUBLIC_ROLE_CONTENT_MANAGER;
  const isSuperAdmin = roleCode === envConfig.NEXT_PUBLIC_ROLE_SUPER_ADMIN;

  // 1. Lọc danh sách items chính
  const filteredItems = items.filter((item) => {
    // if (isRecruiter) {
    //   //- các route mà recruiter được phép truy cập và hiển thị
    //   const recruiterAllowed = [
    //     "/admin/dashboard",
    //     "/admin/jobs",
    //     "/admin/resumes",
    //   ];
    //   return recruiterAllowed.includes(item.url);
    // }
    if (isContentManager) {
      //- các route mà content manager được phép truy cập và hiển thị
      const contentManagerAllowed = ["/admin/news"];
      return contentManagerAllowed.includes(item.url);
    }
    return true; //- admin hiện hết
  });

  if (!roleCode) {
    return <SidebarSkeleton />;
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="flex flex-col justify-between">
        <div>
          <BackHome />

          <SidebarGroup>
            <SidebarGroupLabel>Application</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredItems.map((item) => (
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

          {/* 2. Phần Bài viết*/}
          {(isSuperAdmin || isContentManager) && (
            <SidebarGroup>
              <SidebarGroupLabel>Bài viết</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <Collapsible defaultOpen>
                    <SidebarMenuItem className="mr-2.5">
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton tooltip="Cẩm nang nghề nghiệp">
                          <FolderKanban />
                          <span className="truncate">Cẩm nang nghề nghiệp</span>
                          <ChevronDown className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton
                              asChild
                              isActive={pathname === "/admin/news"}
                              className="data-[active=true]:bg-primary data-[active=true]:text-white"
                            >
                              <Link href="/admin/news">Tin tức</Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          {/* 3. Phần Phân quyền - Chỉ dành cho Super Admin */}
          {isSuperAdmin && (
            <SidebarGroup>
              <SidebarGroupLabel>Phân quyền</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <Collapsible defaultOpen>
                    <SidebarMenuItem className="mr-2.5">
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton tooltip="Phân quyền">
                          <DoorClosedLocked />
                          <span className="truncate">Phân quyền</span>
                          <ChevronDown className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton
                              asChild
                              isActive={pathname === "/admin/role"}
                              className="data-[active=true]:bg-primary data-[active=true]:text-white"
                            >
                              <Link href="/admin/role">Vai trò</Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        </SidebarMenuSub>

                        <SidebarMenuSub>
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton
                              asChild
                              isActive={pathname === "/admin/permission"}
                              className="data-[active=true]:bg-primary data-[active=true]:text-white"
                            >
                              <Link href="/admin/permission">Quyền hạn</Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          {/* 4. Phần Lỗi & Phản hồi - dùng items2 */}
          {isSuperAdmin && (
            <SidebarGroup>
              <SidebarGroupLabel>issue</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items2.map((item) => (
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
          )}
        </div>

        <div className="mb-2">
          <PopoverAdmin />
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
