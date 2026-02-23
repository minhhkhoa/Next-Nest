"use client";

import { getIdFromSlugUrl } from "@/lib/utils";
import { useGetJobDetail } from "@/queries/useJob";
import React from "react";
import JobDetailInfo from "./components/JobDetailInfo";
import RelatedJobs from "./components/RelatedJobs";
import { ADHorizontal } from "@/_pages/home/components/ad";
import DetailJobSkeleton from "@/components/skeletons/DetailJob";

export default function PageDetailJob({ jobId }: { jobId: string }) {
  const idJob = getIdFromSlugUrl(jobId);

  const { data: jobDetail, isLoading, error } = useGetJobDetail(idJob);

  if (isLoading) {
    return <DetailJobSkeleton />;
  }

  if (error || !jobDetail?.data) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold text-red-500">
          Không tìm thấy thông tin công việc hoặc có lỗi xảy ra.
        </h1>
        <p className="text-gray-500 mt-2">
          Vui lòng kiểm tra lại đường dẫn hoặc thử lại sau.
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
          <ADHorizontal />
        </div>

        <RelatedJobs jobId={job._id} />
      </div>
    </div>
  );
}
