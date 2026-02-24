"use client";

import { Settings, LogOut, LayoutDashboard, User, Folder } from "lucide-react";
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
import { useLogoutMutation } from "@/queries/useAuth";
import { handleInitName, removeTokensFromLocalStorage } from "@/lib/utils";
import SoftSuccessSonner from "@/components/shadcn-studio/sonner/SoftSuccessSonner";
import { envConfig } from "../../config";
import { allowedRoles } from "@/lib/constant";
import { Link, useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export function UserAvatarMenu() {
  const t = useTranslations("Header.AvatarNavigate");

  const { isLogin, setLogin, user } = useAppStore();
  const router = useRouter();
  const { mutateAsync: mutationLogout } = useLogoutMutation();

  const name = handleInitName(user.name);
  const roleName = user?.roleID?.name?.vi;

  //- check role
  const isRoleAdmin = roleName === envConfig.NEXT_PUBLIC_ROLE_SUPER_ADMIN;

  const handleLogout = async () => {
    const res = await mutationLogout();
    if (res.isError) return;

    //- login success
    removeTokensFromLocalStorage();
    setLogin(false);
    SoftSuccessSonner("Đăng xuất thành công!");
    router.push("/");
    router.refresh();
  };

  const onManageClick = () => {
    router.push(`/${isRoleAdmin ? "admin" : "recruiter/manager"}/dashboard`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-full p-0 border hover:border-primary"
        >
          <Avatar className="h-8 w-8 select-none ">
            <AvatarImage
              src={user?.avatar || "avatar-default.webp"}
              alt={name}
            />
            <AvatarFallback>{name}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {/* Thông tin người dùng */}
        <div className="flex items-center gap-2 px-2 py-1.5">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={user.avatar || "avatar-default.webp"}
              alt={name}
            />
            <AvatarFallback>{name}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col space-y-0.5">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Phần Quản lý */}
        <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
          {t("Manager.Title")}
        </DropdownMenuLabel>
        {allowedRoles.includes(roleName) && (
          <DropdownMenuItem onClick={onManageClick} className="cursor-pointer">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>{t("Manager.PageManager")}</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem className="cursor-pointer">
          <User className="mr-2 h-4 w-4" />
          <Link href="/profile">{t("Manager.MyProfile")}</Link>
        </DropdownMenuItem>

        <DropdownMenuItem className="cursor-pointer">
          <Folder className="mr-2 h-4 w-4" />
          <Link href="/my-cv">{t("Manager.MyCv")}</Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Phần Cài đặt */}
        <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
          {t("Setting.Title")}
        </DropdownMenuLabel>
        <DropdownMenuItem className="cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          <Link href={"/settings"}>{t("Setting.AccountSetting")}</Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Phần Đăng xuất */}
        {isLogin && (
          <DropdownMenuItem
            onClick={handleLogout}
            className="cursor-pointer text-destructive focus:text-destructive"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>{t("Logout")}</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
