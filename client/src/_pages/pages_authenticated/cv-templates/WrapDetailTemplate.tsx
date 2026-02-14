"use client";

import CVSkeleton from "@/components/skeletons/cv-skeleton";
import { useGetResumeData } from "@/queries/useUser";
import React from "react";
import PageTemplateDetail from "./TemplateDetail";

export default function WrapDetailTemplate({
  templateId,
}: {
  templateId: string;
}) {
  const { data: resumeData, isLoading } = useGetResumeData();

  if (isLoading) return <CVSkeleton />;

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
