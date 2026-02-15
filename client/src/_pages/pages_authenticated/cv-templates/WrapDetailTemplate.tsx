"use client";

import CVSkeleton from "@/components/skeletons/cv-skeleton";
import { useGetResumeData } from "@/queries/useUser";
import React from "react";
import PageTemplateDetail from "./TemplateDetail";
import { Skeleton } from "@/components/ui/skeleton";

export default function WrapDetailTemplate({
  templateId,
}: {
  templateId: string;
}) {
  const { data: resumeData, isLoading } = useGetResumeData();

  if (isLoading)
    return (
      <div className="pt-5">
        <div className="flex flex-col items-center">
          <Skeleton className="h-4 w-[200px] md:w-[400px] mb-4" />
          <Skeleton className="h-3 w-[150px] md:w-[300px] mb-2" />
          <Skeleton className="h-3 w-[100px] md:w-[200px] mb-2" />
        </div>
        <CVSkeleton />
      </div>
    );

  if (!isLoading && !resumeData?.data)
    return <div>Không có dữ liệu để hiển thị</div>;

  return (
    <div className="p-4">
      {!isLoading && resumeData?.data && (
        <PageTemplateDetail templateId={templateId} data={resumeData.data} />
      )}
    </div>
  );
}
