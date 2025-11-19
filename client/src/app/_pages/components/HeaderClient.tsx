"use client";

import React from "react";
import AppLogo from "./AppLogo";
import UserSection from "./UserSection";
import { UserAvatarMenu } from "./user-avatar-menu";
import { ModeToggle } from "@/components/ModeToggle";
import NavigationHeaderMenu from "@/components/NavigationHeader";
import { useIsMobile } from "@/hooks/use-mobile";
import SheetMobile from "./SheetMobile";

export default function HeaderClient({
  isLoginSSR,
}: Readonly<{ isLoginSSR: boolean }>) {
  const isMobile = useIsMobile();

  return (
    <div className="z-50 h-12 border-b border-b-gray-200 dark:border-b-gray-800 bg-background md:-mx-26">
      <div className="container mx-auto flex h-full items-center justify-between">
        {isMobile ? (
          <SheetMobile />
        ) : (
          <div className="pl-3 md:pl-10">
            <AppLogo />
          </div>
        )}

        <div>
          <NavigationHeaderMenu/>
        </div>
        <div className="flex items-center gap-2 mr-3 md:mr-10">
          {!isLoginSSR && <UserSection />}
          <ModeToggle />
          {isLoginSSR && <UserAvatarMenu />}
        </div>
      </div>
    </div>
  );
}
