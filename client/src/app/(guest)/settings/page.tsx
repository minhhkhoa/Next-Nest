import ChangePasswordForm from "@/app/_pages/auth/change-password/ChangePasswordForm";
import React from "react";

export default function SettingsPage() {
  return (
    <div className="pt-5">
      <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">
        Đổi mật khẩu
      </h2>
      <div className="pt-3">
        <ChangePasswordForm />
      </div>
    </div>
  );
}
