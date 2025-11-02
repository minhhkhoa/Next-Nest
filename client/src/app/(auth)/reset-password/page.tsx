import ResetPasswordForm from "@/app/_pages/auth/reset-password/ResetPasswordForm";
import React from "react";

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[90vh] flex items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-background p-4">
      <ResetPasswordForm />
    </div>
  );
}
