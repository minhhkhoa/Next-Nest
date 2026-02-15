"use client";

import BasicTemplate from "@/components/cv-templates/BasicTemplate";
import ImpressiveTemplate from "@/components/cv-templates/ImpressiveTemplate";
import ModernTemplate from "@/components/cv-templates/ModernTemplate";
import SimpleTemplate from "@/components/cv-templates/SimpleTemplate";
import CVSkeleton from "@/components/skeletons/cv-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
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
      <div className="flex flex-col text-center mb-12 space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">
          Chi tiết CV của bạn
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Dưới đây là chi tiết CV của bạn. Bạn có thể xem trước và chỉnh sửa nội
          dung CV để đảm bảo nó phản ánh chính xác kỹ năng và kinh nghiệm của
          bạn. Hãy chắc chắn rằng CV của bạn nổi bật và thu hút sự chú ý của nhà
          tuyển dụng!
        </p>
      </div>
      {getTemplateComponent(detailCvFetch?.data?.templateID || "")}
    </div>
  );
}
