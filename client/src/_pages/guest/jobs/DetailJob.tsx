"use client";

import { useGetJobDetail } from "@/queries/useJob";
import React from "react";
import JobDetailInfo from "./components/JobDetailInfo";
import RelatedJobs from "./components/RelatedJobs";
import { AdBannerInline } from "@/components/ads/AdSlotRenderer";
import DetailJobSkeleton from "@/components/skeletons/DetailJob";
import { useTranslations } from "next-intl";

export default function PageDetailJob({ idJob }: { idJob: string }) {
  const t = useTranslations("PageJobDetail");
  const {
    data: jobDetail,
    isLoading: isLoadingJobDetail,
    error: errorJobDetail,
  } = useGetJobDetail(idJob);

  if (isLoadingJobDetail) {
    return <DetailJobSkeleton />;
  }

  if (errorJobDetail || !jobDetail?.data) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold text-red-500">
          {t("NotFoundTitle")}
        </h1>
        <p className="text-gray-500 mt-2">
          {t("NotFoundDesc")}
        </p>
      </div>
    );
  }

  const job = jobDetail.data;

  return (
    <div className="min-h-screen pb-12">
      <div className="container mx-auto py-8">
        <JobDetailInfo job={job} />

        <div className="my-8">
          <AdBannerInline slotCode="JOB_INLINE_MID" />
        </div>

        <RelatedJobs jobId={job._id} />
      </div>
    </div>
  );
}
