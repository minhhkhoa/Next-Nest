"use client";

import { Settings, LogOut, LayoutDashboard, User } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/components/TanstackProvider";
import { useGetProfile, useLogoutMutation } from "@/queries/useAuth";
import {
  getAccessTokenFromLocalStorage,
  handleInitName,
  removeTokensFromLocalStorage,
} from "@/lib/utils";
import { toast } from "sonner";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function UserAvatarMenu() {
  const { isLogin, setLogin } = useAppStore();
  const router = useRouter();
  const { mutateAsync: mutationLogout } = useLogoutMutation();
  const { data } = useGetProfile();

  const name = data?.data?.user.name && handleInitName(data?.data?.user.name);

  const handleLogout = async () => {
    const res = await mutationLogout();
    console.log("res: ", res);
    if (res.isError) return;

    //- login success
    removeTokensFromLocalStorage();
    setLogin(false);
    toast.success("Đăng xuất thành công!");
    router.push("/login");
  };

  const onProfileClick = () => {
    alert("onProfileClick");
  };

  const onManageClick = () => {
    alert("onManageClick");
  };

  const onSettingsClick = () => {
    alert("onSettingsClick");
  };

  useEffect(() => {
    setLogin(!!getAccessTokenFromLocalStorage());
  }, [setLogin]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-full p-0 border hover:border-primary"
        >
          <Avatar className="h-9 w-9 select-none">
            <AvatarImage src={data?.data?.user.avatar || ""} alt={name} />
            <AvatarFallback>{name}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {/* Thông tin người dùng */}
        <div className="flex items-center gap-2 px-2 py-1.5">
          <Avatar className="h-8 w-8">
            <AvatarImage src={data?.data?.user.avatar || ""} alt={name} />
            <AvatarFallback>{name}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col space-y-0.5">
            <p className="text-sm font-medium leading-none">
              {data?.data?.user.name}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {data?.data?.user.email}
            </p>
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Phần Quản lý */}
        <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
          Quản lý
        </DropdownMenuLabel>
        <DropdownMenuItem onClick={onProfileClick} className="cursor-pointer">
          <User className="mr-2 h-4 w-4" />
          <span>Hồ sơ cá nhân</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onManageClick} className="cursor-pointer">
          <LayoutDashboard className="mr-2 h-4 w-4" />
          <span>Trang quản lý</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Phần Cài đặt */}
        <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
          Cài đặt
        </DropdownMenuLabel>
        <DropdownMenuItem onClick={onSettingsClick} className="cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          <span>Cài đặt tài khoản</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Phần Đăng xuất */}
        {isLogin && (
          <DropdownMenuItem
            onClick={handleLogout}
            className="cursor-pointer text-destructive focus:text-destructive"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Đăng xuất</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
