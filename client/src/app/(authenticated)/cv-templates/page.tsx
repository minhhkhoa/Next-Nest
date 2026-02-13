import ListTemplate from "@/_pages/pages_authenticated/cv-templates/ListTemplate";
import React from "react";

export default function TemplateResumePage() {
  // const { data: resumeData, isLoading } = useGetResumeData();

  // if (isLoading) return <CVSkeleton />;

  // if (!isLoading && !resumeData?.data)
  //   return <div>Không có dữ liệu để hiển thị</div>;

  return (
    // <div className="p-4">
    //   {!isLoading && resumeData?.data && (
    //     <BasicTemplate data={resumeData?.data} />
    //   )}
    // </div>
    <div>
      <ListTemplate />
    </div>
  );
}
