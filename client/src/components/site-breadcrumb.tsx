"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Link, usePathname } from "@/i18n/navigation";
import { segmentNameMap } from "@/lib/constant";
import { getSlugFromSlugUrl } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { Fragment } from "react";

export default function BreadcrumbSite() {
  const pathname = usePathname();
  
  const t = useTranslations("Header.NavigateHeader");
  const segments = pathname.split("/").filter(Boolean);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {/* Trang chủ luôn có */}
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/">{t("Home")}</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {segments.map((segment: string, index: number) => {
          const href = "/" + segments.slice(0, index + 1).join("/");
          const isLast = index === segments.length - 1;

          // Thứ tự ưu tiên hiển thị tên:
          // 1. Tên lấy từ API (dynamicTitles)
          // 2. Tên trong segmentNameMap
          // 3. Nếu là slug bài viết → dùng tên từ slug + viết hoa
          // 4. Nếu là segment thường → thay - bằng khoảng trắng + viết hoa
          const displayName =
            segmentNameMap[segment] ||
            (segment.includes("-i.")
              ? getSlugFromSlugUrl(segment)
                  .replace(/-/g, " ")
                  .replace(/\b\w/g, (c: string) => c.toUpperCase())
              : segment
                  .replace(/-/g, " ")
                  .replace(/\b\w/g, (c: string) => c.toUpperCase()));

          return (
            <Fragment key={href}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{displayName}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={href}>{displayName}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
