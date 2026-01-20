"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { removeTokensFromLocalStorage } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/components/TanstackProvider";
import { useLogoutMutation } from "@/queries/useAuth";
import { useQueryClient } from "@tanstack/react-query";

interface NavigationProps {
  onAboutClick: () => void;
  onEcosystemClick: () => void;
  onVerificationClick: () => void;
  onPricingClick: () => void;
}

export default function Navigation({
  onAboutClick,
  onEcosystemClick,
  onVerificationClick,
  onPricingClick,
}: NavigationProps) {
  const router = useRouter();
  const { setLogin } = useAppStore();
  const { mutateAsync: mutationLogout } = useLogoutMutation();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    try {
      const res = await mutationLogout();
      if (res.isError) return;

      removeTokensFromLocalStorage();
      setLogin(false);

      queryClient.removeQueries({ queryKey: ["profile"] });

      router.push("/login");
      router.refresh();
    } catch (error) {
      console.log("error logout: ", error);
    }
  };

  return (
    <>
      {/* Main Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      >
        <div className="flex h-16 items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <span className="text-lg font-bold">K</span>
            </div>
            <span className="hidden text-lg font-semibold md:inline">
              JobHub Recruiter
            </span>
          </div>
          <div className="flex gap-4">
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <Link href={"/login"}>Đăng nhập</Link>
            </Button>
            <Button size="sm">
              <Link href={"/recruiter/register"}>Đăng ký</Link>
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Sticky Navigation Bar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="sticky top-16 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-8 px-4 py-4 md:px-8">
          <button
            onClick={onAboutClick}
            className="text-sm font-medium text-foreground transition-colors hover:text-primary md:text-base"
          >
            Về chúng tôi
          </button>
          <button
            onClick={onEcosystemClick}
            className="text-sm font-medium text-foreground transition-colors hover:text-primary md:text-base"
          >
            Hệ sinh thái
          </button>
          <button
            onClick={onVerificationClick}
            className="text-sm font-medium text-foreground transition-colors hover:text-primary md:text-base"
          >
            Quy trình xác thực
          </button>
          <button
            onClick={onPricingClick}
            className="text-sm font-medium text-foreground transition-colors hover:text-primary md:text-base"
          >
            Bảng giá
          </button>
        </div>
      </motion.nav>
    </>
  );
}
