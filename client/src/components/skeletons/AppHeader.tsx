import React from "react";
import { Skeleton } from "../ui/skeleton";

export default function AppHeaderSkeleton() {
  return (
    <div className="z-50 h-12 border-b border-b-gray-200 dark:border-b-gray-800 bg-background md:-mx-26">
      <div className="container mx-auto flex h-full items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-6">
          <div className="pl-3 md:pl-10">
            <Skeleton className="h-5 w-16 rounded-sm" />
          </div>

          {/* NavigationHeaderMenu */}
          <div className="hidden md:flex  md:items-center md:gap-6">
            <Skeleton className="h-5 w-[100px] rounded-sm" />
            <Skeleton className="h-5 w-[100px] rounded-sm" />
            <Skeleton className="h-5 w-[100px] rounded-sm" />
          </div>
        </div>

        {/* Nút và avatar */}
        <div className="flex items-center gap-2 mr-3 md:mr-10">
          <Skeleton className="h-8 w-20 rounded-md hidden md:block" />{" "}
          {/* Đăng ký */}
          <Skeleton className="h-8 w-20 rounded-md" /> {/* Đăng nhập */}
          <Skeleton className="h-8 w-8 rounded-md" /> {/* ModeToggle */}
          <Skeleton className="h-8 w-8 rounded-full" /> {/* Avatar */}
        </div>
      </div>
    </div>
  );
}
