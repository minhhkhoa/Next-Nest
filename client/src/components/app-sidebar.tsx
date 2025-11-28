"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  ChartNoAxesCombined,
  User2,
  Calendar,
  Search,
  Settings,
  Factory,
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
import PopoverAdmin from "@/app/_pages/components/popoverAdmin";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

const items = [
  { title: "Thống kê", url: "/charts", icon: ChartNoAxesCombined },
  { title: "Người dùng", url: "/users", icon: User2 },
  { title: "Jobs", url: "/jobs", icon: Calendar },
  { title: "Nhà tuyển dụng", url: "/employers", icon: Search },
  { title: "Resumes & CV", url: "/resumes", icon: Settings },
  {
    title: "Ngành nghề & kỹ năng",
    url: "/admin/industry-skill",
    icon: Factory,
  },
];

export function AppSidebar() {
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

          {/* Phần collapsible */}
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
        </div>

        <div className="mb-2">
          <PopoverAdmin />
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
