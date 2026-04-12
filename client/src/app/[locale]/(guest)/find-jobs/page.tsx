import PageFindJobs from "@/_pages/find-jobs";
import React, { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";

export default function FindJobsPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <PageFindJobs />
    </Suspense>
  );
}
