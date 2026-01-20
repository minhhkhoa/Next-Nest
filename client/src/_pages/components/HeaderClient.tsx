import React from "react";
import AppLogo from "./AppLogo";
import UserSection from "./UserSection";
import { UserAvatarMenu } from "./user-avatar-menu";
import { ModeToggle } from "@/components/ModeToggle";
import NavigationHeaderMenu from "@/components/NavigationHeader";
import SheetMobile from "./SheetMobile";
import NotificationBell from "@/components/NotificationBell";
import { ArrowRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HeaderClient({
  isLoginSSR,
}: Readonly<{ isLoginSSR: boolean }>) {
  return (
    <div className="z-50 h-12 border-b border-b-gray-200 dark:border-b-gray-800 bg-background md:-mx-26">
      <div className="container mx-auto flex h-full items-center justify-between">
        {/* dung tailwind de check mobile ko dung hook useIsMobile nua */}
        <>
          <div className="md:hidden">
            <SheetMobile />
          </div>
          <div className="hidden md:flex pl-3 md:pl-10">
            <AppLogo />
          </div>
        </>

        <div className="hidden md:block">
          <NavigationHeaderMenu />
        </div>

        <div className="flex items-center gap-2 mr-3 md:mr-10">
          <NotificationBell />
          {!isLoginSSR && <UserSection />}
          {isLoginSSR && <UserAvatarMenu />}
          <ModeToggle />

          {/* vách ngăn thêm màu xám cho nó */}
          <Separator orientation="vertical" className="hidden md:block !h-8" />

          <div className="hidden md:flex flex-col">
            <span className="text-xs">Bạn là nhà tuyển dụng?</span>
            <div className="flex items-center gap-1 text-[15px] hover:text-primary cursor-pointer hover:translate-x-1 transition-all duration-100 ease-out">
              <Link href="/recruiter/welcome">Đăng tuyển ngay</Link>
              <ArrowRight size={15} className="mt-1" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
