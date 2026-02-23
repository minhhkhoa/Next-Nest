import React, { Suspense } from "react";
import PageJobs from "@/_pages/guest/jobs";
import { Spinner } from "@/components/ui/spinner";

export default function JobsPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <PageJobs />
    </Suspense>
  );
}
