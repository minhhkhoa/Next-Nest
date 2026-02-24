import PageDetailJob from "@/_pages/guest/jobs/DetailJob";
import React from "react";

export default async function DetailJobPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;
  return (
    <div>
      <PageDetailJob jobId={jobId} />
    </div>
  );
}
