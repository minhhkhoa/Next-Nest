import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuItem } from "../ui/sidebar";
import { Skeleton } from "../ui/skeleton";

export default function SidebarSkeleton() {
  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <div className="flex flex-col justify-between p-4 h-full">
          <div>
            <Skeleton className="h-10 w-full mb-6" /> {/* Chỗ của BackHome */}
            <SidebarGroup>
              <SidebarGroupLabel>
                <Skeleton className="h-4 w-24" />
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <SidebarMenuItem key={i} className="mb-2">
                      <div className="flex items-center gap-3 px-2 py-2">
                        <Skeleton className="h-5 w-5 rounded-md" /> {/* Icon */}
                        <Skeleton className="h-4 w-full" /> {/* Title */}
                      </div>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </div>

          {/* skeleton cho block ng dung */}
          <div className="px-4">
            <Skeleton className="w-full h-12" />
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
