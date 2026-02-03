import ResetPasswordForm from "@/_pages/auth/reset-password/ResetPasswordForm";
import { Spinner } from "@/components/ui/spinner";
import React, { Suspense } from "react";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <div className="min-h-[90vh] flex items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-background p-4">
        <ResetPasswordForm />
      </div>
    </Suspense>
  );
}
