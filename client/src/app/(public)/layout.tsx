"use client";

import { ModeToggle } from "@/components/ModeToggle";
import { UserAvatarMenu } from "../_pages/components/user-avatar-menu";
import { useAppStore } from "@/components/TanstackProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isLogin } = useAppStore();

  console.log("isLogin: ", isLogin)

  return (
    <div>
      <header className="sticky top-0 z-50 h-12 border-b border-b-gray-200 dark:border-b-gray-800 bg-background">
        <div className="container mx-auto flex h-full items-center justify-end">
          <div className="flex items-center gap-2 mr-4">
            <ModeToggle />
            {isLogin && <UserAvatarMenu />}
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
