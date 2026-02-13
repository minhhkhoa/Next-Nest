"use client";

import BasicTemplate from "@/components/cv-templates/BasicTemplate";
import ImpressiveTemplate from "@/components/cv-templates/ImpressiveTemplate";
import ModernTemplate from "@/components/cv-templates/ModernTemplate";
import CVSkeleton from "@/components/skeletons/cv-skeleton";
import { useGetResumeData } from "@/queries/useUser";
import React from "react";

export default function TemplateResumePage() {
  const { data: resumeData, isLoading } = useGetResumeData();

  if (isLoading) return <CVSkeleton />;

  if (!isLoading && !resumeData?.data)
    return <div>Không có dữ liệu để hiển thị</div>;

  return (
    <div className="p-4">
      {!isLoading && resumeData?.data && (
        <ImpressiveTemplate data={resumeData?.data} />
      )}
    </div>
  );
}
