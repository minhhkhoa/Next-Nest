import PageIssueAdmin from "@/_pages/admin/issue";
import { Spinner } from "@/components/ui/spinner";
import React, { Suspense } from "react";

export default function IssueAdminPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <PageIssueAdmin />
    </Suspense>
  );
}
