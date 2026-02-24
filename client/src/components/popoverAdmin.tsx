"use client";

import { useAppStore } from "@/components/TanstackProvider";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useSidebar } from "@/components/ui/sidebar";
import { handleInitName, removeTokensFromLocalStorage } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { LogOut, Settings, User } from "lucide-react";
import { useLogoutMutation } from "@/queries/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import { useIsMobile } from "@/hooks/use-mobile";
import SoftSuccessSonner from "@/components/shadcn-studio/sonner/SoftSuccessSonner";
import { Link, useRouter } from "@/i18n/navigation";

export default function PopoverAdmin() {
  const router = useRouter();
  const { user, isLogin, setLogin } = useAppStore();
  const { mutateAsync: mutationLogout } = useLogoutMutation();
  const queryClient = useQueryClient();
  const { state } = useSidebar();
  const sortName = handleInitName(user.name);
  const isMobile = useIsMobile();

  const openSidebar = state !== "collapsed";

  const handleLogout = async () => {
    const res = await mutationLogout();
    if (res.isError) return;

    //- login success
    removeTokensFromLocalStorage();
    setLogin(false);

    queryClient.removeQueries({ queryKey: ["profile"] });

    SoftSuccessSonner("Đăng xuất thành công!");
    router.push("/");
    router.refresh();
  };

  if (!isLogin) {
    return (
      <div className="px-4">
        <Skeleton className="w-full h-12" />
      </div>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="w-full h-12">
          <div className="flex gap-2 max-w-[200px]">
            <Avatar className="relative flex size-8 shrink-0 overflow-hidden h-9 w-9 rounded-lg">
              <AvatarImage src={user.avatar || ""} alt={sortName} />
              <AvatarFallback>{sortName}</AvatarFallback>
            </Avatar>

            {openSidebar && (
              <div className="text-left">
                <p>{user.name}</p>
                <p className="text-muted-foreground truncate w-[150px]">
                  {user.email}
                </p>
              </div>
            )}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent side={isMobile ? "top" : "right"} className="w-60">
        <Link
          href="/profile"
          className="flex gap-2 items-center rounded-xl pl-3 cursor-pointer hover:bg-accent/50"
        >
          <Avatar className="relative flex size-8 shrink-0 overflow-hidden h-10 w-10 rounded-lg">
            <AvatarImage src={user.avatar || ""} alt={sortName} />
            <AvatarFallback>{sortName}</AvatarFallback>
          </Avatar>

          <div className="text-left">
            <p>{user.name}</p>
            <p className="text-muted-foreground max-w-[150px] truncate">
              {user.email}
            </p>
          </div>
        </Link>

        <Separator className="mt-2" />

        <div>
          {/* trang ca nhan */}
          <Link
            href="/profile"
            className="flex items-center gap-2 mt-2 rounded-xl pl-3 h-8 cursor-pointer hover:bg-accent/50"
          >
            <User className="mr-2 h-4 w-4" />
            <span>Hồ sơ cá nhân</span>
          </Link>

          {/* cai dat tai khoan */}
          <Link
            href="/settings"
            className="flex items-center gap-2 mt-2 pl-3 rounded-xl cursor-pointer h-8 hover:bg-accent/50"
          >
            <Settings className="mr-2 h-4 w-4" />
            <span>Cài đặt tài khoản</span>
          </Link>

          {/* logout */}
          {isLogin && (
            <div
              className="flex items-center gap-2 mt-2 pl-3 rounded-xl cursor-pointer text-destructive focus:text-destructive h-8 hover:bg-accent/50"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Đăng xuất</span>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
