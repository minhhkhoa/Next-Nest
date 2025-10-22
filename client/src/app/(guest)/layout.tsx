"use client";

import { ModeToggle } from "@/components/ModeToggle";
import { UserAvatarMenu } from "../_pages/components/user-avatar-menu";
import { useAppStore } from "@/components/TanstackProvider";
import { useRouter } from "next/navigation";
import { useGetProfile } from "@/queries/useAuth";
import { Button } from "@/components/ui/button";
import { UserResponseType } from "@/schemasvalidation/user";
import { useEffect } from "react";

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const { isLogin, setUser } = useAppStore();
  const { data } = useGetProfile(isLogin); //- chỉ call khi đã login

  useEffect(() => {
    if (data?.data?.user) {
      setUser(data.data.user as UserResponseType);
    }
  }, [data, setUser]);

  return (
    <div>
      <div className="sticky top-0 z-50 h-12 border-b border-b-gray-200 dark:border-b-gray-800 bg-background -mx-26">
        <div className="container mx-auto flex h-full items-center justify-between">
          <div className="pl-10">
            <h1
              className="font-bold cursor-pointer"
              onClick={() => router.push("/")}
            >
              Logo
            </h1>
          </div>
          <div className="flex items-center gap-2 mr-10">
            {!isLogin && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => router.push("/register")}
                >
                  Đăng ký
                </Button>
                <Button onClick={() => router.push("/login")}>Đăng nhập</Button>
              </div>
            )}

            <ModeToggle />
            {isLogin && <UserAvatarMenu />}
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}
