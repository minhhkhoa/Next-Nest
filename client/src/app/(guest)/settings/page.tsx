"use client";

import ChangePasswordForm from "@/app/_pages/auth/change-password/ChangePasswordForm";
import { useAppStore } from "@/components/TanstackProvider";
import React from "react";

export default function SettingsPage() {
  const { user } = useAppStore();

  return (
    <div className="pt-5">
      {/* login với social thì không cho đổi mật khẩu */}
      {!user.provider?.id && (
        <>
          <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">
            Đổi mật khẩu
          </h2>
          <div className="pt-3">
            <ChangePasswordForm />
          </div>
        </>
      )}
    </div>
  );
}
