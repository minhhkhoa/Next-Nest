"use client";

import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import ClientLayout from "@/components/app-layout-client";

export default function NotFound() {
  const router = useRouter();

  return (
    <ClientLayout>
      <div className="flex flex-grow w-full flex-col items-center justify-center bg-background p-4 text-center min-h-[calc(100vh-200px)]">
        <h1 className="text-[100px] sm:text-[140px] md:text-[200px] font-black leading-none text-muted-foreground/20">
          404
        </h1>
        <div className="relative z-10 -mt-10 sm:-mt-14 md:-mt-20">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight md:text-4xl">
            Oops! Trang không tìm thấy.
          </h2>
          <p className="mt-4 text-muted-foreground text-sm sm:text-base md:text-lg max-w-[300px] sm:max-w-md mx-auto">
            Rất tiếc, chúng tôi không thể tìm thấy trang bạn đang tìm kiếm. Có
            vẻ như nó đã bị xóa hoặc bạn đã nhập sai địa chỉ. Hãy kiểm tra lại
            URL hoặc quay lại trang chủ để tiếp tục khám phá!
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4 w-full max-w-xs sm:max-w-none mx-auto">
            <Button asChild size="lg" className="w-full sm:w-auto">
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
      </div>
    </ClientLayout>
  );
}
