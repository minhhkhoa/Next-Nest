import PageAdminJob from "@/_pages/admin/jobs";
import React, { Suspense } from "react";

export default function JobsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PageAdminJob />
    </Suspense>
  );
}
