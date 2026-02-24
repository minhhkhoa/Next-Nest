import { usePathname, useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Hook dùng để "bắt" một param từ URL, thực hiện hành động nào đó
 * và xóa sạch param đó khỏi URL ngay lập tức.
 */
export const useQueryFilter = (
  key: string,
  onFound: (value: string) => void
) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Dùng ref để đảm bảo logic xử lý chỉ chạy 1 lần duy nhất cho mỗi giá trị param
  const processedRef = useRef<string | null>(null);

  useEffect(() => {
    const value = searchParams.get(key);

    if (value && processedRef.current !== value) {
      // 1. Thực hiện hành động (ví dụ: setStatusFilter)
      onFound(value);

      // 2. Đánh dấu đã xử lý giá trị này
      processedRef.current = value;

      // 3. Xóa param khỏi URL
      const params = new URLSearchParams(searchParams.toString());
      params.delete(key);

      const newUrl = params.toString()
        ? `${pathname}?${params.toString()}`
        : pathname;

      router.replace(newUrl, { scroll: false });
    }
  }, [key, onFound, pathname, router, searchParams]);
};
