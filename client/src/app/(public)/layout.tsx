"use client";

import { ModeToggle } from "@/components/ModeToggle";
import { useAppStore } from "@/components/TanstackProvider";
import { Button } from "@/components/ui/button";
import {
  getAccessTokenFromLocalStorage,
  removeTokensFromLocalStorage,
} from "@/lib/utils";
import { useLogoutMutation } from "@/queries/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isLogin, setLogin } = useAppStore();
  const router = useRouter();
  const { mutateAsync: mutationLogout } = useLogoutMutation();

  const handleLogout = async () => {
    const res = await mutationLogout();
    if (res.isError) return;

    //- login success
    removeTokensFromLocalStorage();
    setLogin(false);
    toast.success("Đăng xuất thành công!");
    router.push("/login");
  };

  useEffect(() => {
    setLogin(!!getAccessTokenFromLocalStorage());
  }, [setLogin]);

  console.log("isLogin: ", isLogin);
  return (
    <div>
      <header className="sticky top-0 z-50 h-12 border-b border-b-gray-200 dark:border-b-gray-800 bg-background">
        <div className="container mx-auto flex h-full items-center justify-between">
          <div className="flex items-center gap-2 mr-4">
            <ModeToggle />
          </div>

          {isLogin && (
            <Button variant="outline" onClick={handleLogout}>
              Đăng xuất
            </Button>
          )}
        </div>
      </header>
      {children}
    </div>
  );
}
