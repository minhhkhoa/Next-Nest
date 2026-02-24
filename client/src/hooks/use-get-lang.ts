import { useLocale } from "next-intl";
import { useCallback } from "react";

export type MultiLang = {
  vi?: string | null;
  en?: string | null;
};

/**
 * Dùng cho Server Components hoặc các hàm tiện ích thường (nơi không dùng được hook).
 * Logic: Nhận vào object đa ngữ và mã locale. Nếu locale là en thì ưu tiên lấy field .en, nếu không có thì fallback (dự phòng) về .vi và ngược lại. Điều này giúp tránh lỗi hiển thị nếu dữ liệu bị thiếu một ngôn ngữ.
 */
export const getLang = (obj: MultiLang | null | undefined, locale: string) => {
  if (!obj) return "";
  if (locale === "en") return obj.en || obj.vi || "";
  return obj.vi || obj.en || "";
};

/**
 * Dùng cho Client Components.
 * Tự động lấy locale hiện tại từ next-intl.
 * Trả về hàm getLang đã được cấu hình sẵn locale, bạn chỉ cần truyền data vào là xong.
 */
export const useGetLang = () => {
  const locale = useLocale();

  const getLangWrapped = useCallback(
    (data?: MultiLang | null) => {
      return getLang(data, locale);
    },
    [locale]
  );

  return { getLang: getLangWrapped, locale };
};
