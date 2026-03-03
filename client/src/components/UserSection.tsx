"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import React from "react";

export default function UserSection() {
  const router = useRouter();

  const t = useTranslations("Header");

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          className="hidden md:block"
          onClick={() => router.push("/register")}
        >
          {t("Register")}
        </Button>
        <Button onClick={() => router.push("/login")}>{t("Login")}</Button>
      </div>
    </>
  );
}
