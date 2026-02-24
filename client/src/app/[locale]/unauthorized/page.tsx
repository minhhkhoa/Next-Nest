"use client";

import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";
import ClientLayout from "@/components/app-layout-client";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <ClientLayout>
      <div className="flex flex-grow w-full flex-col items-center justify-center bg-background p-4 text-center min-h-[calc(100vh-200px)] gap-6">
        <div className="flex h-24 w-24 sm:h-32 sm:w-32 items-center justify-center rounded-full bg-destructive/10">
          <ShieldAlert className="h-12 w-12 sm:h-16 sm:w-16 text-destructive" />
        </div>

        <div className="space-y-4">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight md:text-4xl">
            Truy câp bị từ chối
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-[300px] sm:max-w-md mx-auto">
            Rất tiếc, bạn không có quyền truy cập vào trang này. Vui lòng đăng nhập hoặc liên hệ với quản trị viên nếu bạn nghĩ đây là một lỗi.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4 w-full max-w-xs sm:max-w-none">
          <Button
            asChild
            variant="default"
            size="lg"
            className="w-full sm:w-auto"
          >
            <Link href="/">Về Trang Chủ</Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => router.back()}
            className="w-full sm:w-auto"
          >
            Quay Lại
          </Button>
        </div>
      </div>
    </ClientLayout>
  );
}
