"use client";

import React from "react";
import AppLogo from "./AppLogo";
import UserSection from "./UserSection";
import { UserAvatarMenu } from "./user-avatar-menu";
import { ModeToggle } from "@/components/ModeToggle";
import NavigationHeaderMenu from "@/components/NavigationHeader";
import SheetMobile from "./SheetMobile";
import NotificationBell from "@/components/NotificationBell";
import SectionRecruiter from "./section-recruiter";
import { useAppStore } from "@/components/TanstackProvider";
import AppHeaderSkeleton from "@/components/skeletons/AppHeader";

export default function HeaderClient() {
  const { isLogin } = useAppStore();


  if (!isLogin) {
    return <AppHeaderSkeleton />;
  }

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
          {isLogin && <NotificationBell />}
          {!isLogin && <UserSection />}
          {isLogin && <UserAvatarMenu />}
          <ModeToggle />

          {isLogin && <SectionRecruiter />}
        </div>
      </div>
    </div>
  );
}
