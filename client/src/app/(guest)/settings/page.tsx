"use client";

import ChangePasswordForm from "@/app/_pages/auth/change-password/ChangePasswordForm";
import ColorThemeSelector from "@/components/ColorThemeSelector";
import { useAppStore } from "@/components/TanstackProvider";
import React from "react";
import DemoChartAreaGradient from "./DemoChartChangeColor";

export default function SettingsPage() {
  const { user } = useAppStore();

  return (
    <div className="flex flex-col md:!flex-row pt-5 justify-around gap-5">
      {/* login với social thì không cho đổi mật khẩu */}
      {!user.provider?.id && (
        <div className="w-full max-w-md">
          <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">
            Đổi mật khẩu
          </h2>
          <div className="pt-3">
            <ChangePasswordForm />
          </div>
        </div>
      )}

      <div className="w-full max-w-md md:max-w-2xl">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">
          Chọn chủ đề màu
        </h2>
        <div className="pt-3">
          <ColorThemeSelector />
          <DemoChartAreaGradient />
        </div>
      </div>
    </div>
  );
}
