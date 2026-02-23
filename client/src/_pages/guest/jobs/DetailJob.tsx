import { getIdFromSlugUrl } from "@/lib/utils";
import React from "react";

export default function PageDetailJob({ jobId }: { jobId: string }) {
  const idJob = getIdFromSlugUrl(jobId);
  return <div>PageDetailJob with jobId: {idJob}</div>;
}
