import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  //- Định nghĩa hệ thống chỉ chấp nhận 2 mã ngôn ngữ
  locales: ["vi", "en"],

  defaultLocale: "vi",

  localePrefix: "always",
});
