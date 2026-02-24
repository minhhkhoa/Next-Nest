import PageDetailJob from "@/_pages/guest/jobs/DetailJob";
import { getIdFromSlugUrl, isValidObjectId } from "@/lib/utils";
import { notFound } from "next/navigation";
import React from "react";

export default async function DetailJobPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;

  const idJob = getIdFromSlugUrl(jobId || "");

  //- check idJob is valid ObjectId
  const isIdValid = isValidObjectId(idJob);

  if (!isIdValid) {
    notFound();
  }
  return (
    <div>
      <PageDetailJob idJob={idJob} />
    </div>
  );
}
