import {
  Calendar,
  Search,
  Settings,
  User2,
  FolderKanban,
  ChevronDown,
  ChartNoAxesCombined,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  BackHome,
} from "@/components/ui/sidebar";

import { Tooltip, TooltipContent } from "@/components/ui/tooltip";

import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import PopoverAdmin from "@/app/_pages/components/popoverAdmin";
import { TooltipTrigger } from "@radix-ui/react-tooltip";
import Link from "next/link";

// Menu items.
const items = [
  { title: "Thống kê", url: "/charts", icon: ChartNoAxesCombined },
  { title: "Người dùng", url: "/users", icon: User2 },
  { title: "Jobs", url: "#", icon: Calendar },
  { title: "Nhà tuyển dụng", url: "#", icon: Search },
  { title: "Resumes & CV", url: "#", icon: Settings },
];

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="flex justify-between">
        <div>
          <BackHome />

          {/* Nhóm Application */}
          <SidebarGroup>
            <SidebarGroupLabel>Application</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Nhóm Collapsible */}
          <SidebarGroup>
            <SidebarGroupLabel>Bài viết</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <Collapsible defaultOpen className="group/collapsible">
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton>
                        <FolderKanban />
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="truncate">
                              Cẩm nang nghề nghiệp
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Cẩm nang nghề nghiệp</p>
                          </TooltipContent>
                        </Tooltip>
                        <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton asChild>
                            <Link href="/admin/news">
                              <span>Tin tức </span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>

                {/* <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="#">
                      <Users />
                      <span>Teams</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem> */}
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
