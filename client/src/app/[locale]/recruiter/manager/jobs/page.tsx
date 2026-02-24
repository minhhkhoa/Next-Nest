import RecruiterAdminJobsPage from "@/_pages/recruiter/manager/job";
import { Spinner } from "@/components/ui/spinner";
import React, { Suspense } from "react";

export default function PageRecruiterAdminJobs() {
  return (
    <Suspense fallback={<Spinner />}>
      <RecruiterAdminJobsPage />
    </Suspense>
  );
}
