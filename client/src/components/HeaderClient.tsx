"use client";

import React from "react";
import AppLogo from "./AppLogo";
import UserSection from "./UserSection";
import { UserAvatarMenu } from "./user-avatar-menu";
import { ModeToggle } from "@/components/ModeToggle";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import NavigationHeaderMenu from "@/components/NavigationHeader";
import NotificationBell from "@/components/NotificationBell";
import SectionRecruiter from "../_pages/components/section-recruiter";
import { useAppStore } from "@/components/TanstackProvider";
import AppHeaderSkeleton from "@/components/skeletons/AppHeader";
import { getAccessTokenFromLocalStorage } from "@/lib/utils";
import SheetMobile from "./SheetMobile";
import { Link } from "@/i18n/navigation";
import { MessageCircleMoreIcon } from "lucide-react";
import { useGetUnreadMessagesCount } from "@/queries/useChat";

export default function HeaderClient() {
  const { isLogin } = useAppStore();
  const { data: unreadCountData } = useGetUnreadMessagesCount(isLogin);
  const unreadCount = unreadCountData?.data?.count || 0;

  const token = React.useMemo(
    () =>
      typeof window !== "undefined" ? getAccessTokenFromLocalStorage() : null,
    [isLogin], //- khi logout thì isLogin sẽ đổi thành false, lúc này token cũng sẽ được lấy lại (lúc này sẽ là null) -> logic check hiện <AppHeaderSkeleton /> sẽ hoạt động chính xác
  );

  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  //- Nếu chưa hydrat hóa xong (isClient = false)
  //- HOẶC có token (đã từng đăng nhập) nhưng state isLogin chưa cập nhật kịp -> hiện Skeleton
  //- Tránh việc nháy nút "Đăng nhập" (UserSection) khi user thực tế đã login rồi
  if (!isClient || (token && !isLogin)) {
    return <AppHeaderSkeleton />;
  }

  return (
    <div className="z-50 h-12 border-b border-b-gray-200 dark:border-b-gray-800 bg-background md:-mx-26">
      <div className="container mx-auto flex h-full items-center justify-between">
        {/* dung tailwind de check mobile ko dung hook useIsMobile nua */}
        <div className="flex items-center gap-6">
          <div className="md:hidden">
            <SheetMobile />
          </div>
          <div className="hidden md:flex pl-3 md:pl-10">
            <AppLogo />
          </div>
          <div className="hidden md:block">
            <NavigationHeaderMenu />
          </div>
        </div>

        <div className="flex items-center gap-2 mr-3 md:mr-10">
          {isLogin && <NotificationBell />}
          {isLogin && (
            <Link href="/chat" className="relative cursor-pointer p-2 hover:bg-secondary rounded-full transition-all flex items-center justify-center">
              <MessageCircleMoreIcon className="w-5 h-5 text-foreground" />
              {/*- hiển thị số tin nhắn chưa đọc giống như quả chuông */}
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white ring-2 ring-background">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Link>
          )}
          {!isLogin && <UserSection />}
          {isLogin && <UserAvatarMenu />}

          <LanguageSwitcher />
          <ModeToggle />

          {isLogin && <SectionRecruiter />}
        </div>
      </div>
    </div>
  );
}
