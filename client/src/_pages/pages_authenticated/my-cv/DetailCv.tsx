"use client";

import BasicTemplate from "@/components/cv-templates/BasicTemplate";
import ImpressiveTemplate from "@/components/cv-templates/ImpressiveTemplate";
import ModernTemplate from "@/components/cv-templates/ModernTemplate";
import SimpleTemplate from "@/components/cv-templates/SimpleTemplate";
import CVSkeleton from "@/components/skeletons/cv-skeleton";
import { CV_TEMPLATES } from "@/lib/constant";
import { getIdFromSlugUrl } from "@/lib/utils";
import { useGetUserResumeDetail } from "@/queries/useUserResume";
import { useSearchParams } from "next/navigation";
import React from "react";

export default function PageDetailCv({ id }: { id: string }) {
  //- lấy ra biến bool edit từ query params để biết được đang ở chế độ nào
  const searchParams = useSearchParams();
  const isEdit = searchParams.get("edit") === "true";

  const idCv = getIdFromSlugUrl(id);

  const { data: detailCvFetch, isLoading } = useGetUserResumeDetail(idCv);

  if (isLoading) {
    return <CVSkeleton />;
  }

  const getTemplateComponent = (templateID: string) => {
    switch (templateID) {
      case CV_TEMPLATES.basicTemplate:
        return (
          <BasicTemplate
            data={detailCvFetch?.data?.content}
            isEdit={isEdit}
            resumeId={detailCvFetch?.data?._id}
          />
        );
      case CV_TEMPLATES.impressiveTemplate:
        return (
          <ImpressiveTemplate
            data={detailCvFetch?.data?.content}
            isEdit={isEdit}
            resumeId={detailCvFetch?.data?._id}
          />
        );
      case CV_TEMPLATES.modernTemplate:
        return (
          <ModernTemplate
            data={detailCvFetch?.data?.content}
            isEdit={isEdit}
            resumeId={detailCvFetch?.data?._id}
          />
        );
      case CV_TEMPLATES.simpleTemplate:
        return (
          <SimpleTemplate
            data={detailCvFetch?.data?.content}
            isEdit={isEdit}
            resumeId={detailCvFetch?.data?._id}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="py-3">
      {getTemplateComponent(detailCvFetch?.data?.templateID || "")}
    </div>
  );
}
