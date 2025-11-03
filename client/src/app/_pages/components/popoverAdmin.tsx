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
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { Separator } from "@/components/ui/separator";
import { LogOut, Settings, User } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useLogoutMutation } from "@/queries/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

export default function PopoverAdmin() {
  const router = useRouter();
  const { user, isLogin, setLogin } = useAppStore();
  const { mutateAsync: mutationLogout } = useLogoutMutation();
  const { state } = useSidebar();
  const name = handleInitName(user.name);

  const openSidebar = state !== "collapsed";

  const handleLogout = async () => {
    const res = await mutationLogout();
    if (res.isError) return;

    //- login success
    removeTokensFromLocalStorage();
    setLogin(false);
    toast.success("Đăng xuất thành công!");
    router.push("/");
    router.refresh();
  };

  const onProfileClick = () => {
    router.push("/profile");
  };

  const onSettingsClick = () => {
    router.push("/settings");
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
          <div className="flex gap-2">
            <Avatar className="relative flex size-8 shrink-0 overflow-hidden h-9 w-9 rounded-lg">
              <AvatarImage src={user.avatar || ""} alt={name} />
              <AvatarFallback>{name}</AvatarFallback>
            </Avatar>

            {openSidebar && (
              <div className="text-left">
                <p>{name}</p>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
            )}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent side="right" className="w-60">
        <div className="flex gap-2">
          <Avatar className="relative flex size-8 shrink-0 overflow-hidden h-9 w-9 rounded-lg">
            <AvatarImage src={user.avatar || ""} alt={name} />
            <AvatarFallback>{name}</AvatarFallback>
          </Avatar>

          <div className="text-left">
            <p>{name}</p>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <Separator className="mt-2" />

        {/* trang ca nhan */}
        <div
          className="flex items-center gap-2 mt-2 rounded-xl h-8 cursor-pointer hover:bg-accent/50"
          onClick={onProfileClick}
        >
          <User className="mr-2 h-4 w-4" />
          <span>Hồ sơ cá nhân</span>
        </div>

        {/* cai dat tai khoan */}
        <div
          className="flex items-center gap-2 mt-2 rounded-xl cursor-pointer h-8 hover:bg-accent/50"
          onClick={onSettingsClick}
        >
          <Settings className="mr-2 h-4 w-4" />
          <span>Cài đặt tài khoản</span>
        </div>

        {/* logout */}
        {isLogin && (
          <div
            className="flex items-center gap-2 mt-2 rounded-xl cursor-pointer text-destructive focus:text-destructive h-8 hover:bg-accent/50"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Đăng xuất</span>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
