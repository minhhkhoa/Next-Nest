"use client";

import ModernTemplate from "@/components/cv-templates/ModernTemplate";
import { useGetResumeData } from "@/queries/useUser";
import React from "react";

export default function TemplateResumePage() {
  const { data: resumeData, isLoading } = useGetResumeData();

  if (!isLoading && !resumeData?.data)
    return <div>Không có dữ liệu để hiển thị</div>;

  return (
    <div className="p-4">
      {!isLoading && resumeData?.data && (
        <ModernTemplate data={resumeData?.data} />
      )}
    </div>
  );
}
