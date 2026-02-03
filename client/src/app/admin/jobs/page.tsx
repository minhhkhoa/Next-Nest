import PageAdminJob from "@/_pages/admin/jobs";
import { Spinner } from "@/components/ui/spinner";
import React, { Suspense } from "react";

export default function JobsPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <PageAdminJob />
    </Suspense>
  );
}
