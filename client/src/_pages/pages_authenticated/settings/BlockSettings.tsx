"use client";

import React from "react";
import ChangePasswordForm from "../../auth/change-password/ChangePasswordForm";
import ColorThemeSelector from "@/components/ColorThemeSelector";
import DemoChartAreaGradient from "@/app/[locale]/(authenticated)/settings/DemoChartChangeColor";
import { useGetProfile } from "@/queries/useAuth";
import { Spinner } from "@/components/ui/spinner";
import { useTranslations } from "next-intl";

export default function BlockSettings() {
  const t = useTranslations("Candidate.Settings");
  const { data, isLoading } = useGetProfile();
  const user = data?.data?.user;

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col md:!flex-row py-5 justify-around gap-5">
      {!user?.provider?.id && (
        <div className="w-full max-w-md">
          <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">
            {t("ChangePassword")}
          </h2>
          <div className="pt-3">
            <ChangePasswordForm />
          </div>
        </div>
      )}
      <div className="w-full max-w-md md:max-w-2xl">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">
          {t("SelectColorTheme")}
        </h2>
        <div className="pt-3">
          <ColorThemeSelector />
          <DemoChartAreaGradient />
        </div>
      </div>
    </div>
  );
}
