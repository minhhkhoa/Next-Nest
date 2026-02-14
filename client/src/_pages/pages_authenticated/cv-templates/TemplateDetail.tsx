import BasicTemplate from "@/components/cv-templates/BasicTemplate";
import ImpressiveTemplate from "@/components/cv-templates/ImpressiveTemplate";
import ModernTemplate from "@/components/cv-templates/ModernTemplate";
import SimpleTemplate from "@/components/cv-templates/SimpleTemplate";
import { CV_TEMPLATES } from "@/lib/constant";
import { apiUserForCVResType } from "@/schemasvalidation/user";
import React from "react";

export default function PageTemplateDetail({
  templateId,
  data,
}: {
  templateId: string;
  data: apiUserForCVResType;
}) {
  const templates = [
    {
      Id_template: CV_TEMPLATES.basicTemplate,
      component: <BasicTemplate data={data} />,
    },
    {
      Id_template: CV_TEMPLATES.impressiveTemplate,
      component: <ImpressiveTemplate data={data} />,
    },
    {
      Id_template: CV_TEMPLATES.simpleTemplate,
      component: <SimpleTemplate data={data} />,
    },
    {
      Id_template: CV_TEMPLATES.modernTemplate,
      component: <ModernTemplate data={data} />,
    },
  ];

  const template = templates.find((t) => t.Id_template === templateId);

  if (!template) {
    return <div>Mẫu CV không tồn tại.</div>;
  }

  return (
    <div className="flex flex-col items-center gap-4 min-h-screen">
      <div className="text-center space-y-2 max-w-3xl px-4 animate-in fade-in slide-in-from-top-4 duration-500">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Tạo CV chuyên nghiệp của bạn
        </h1>
        <p className="text-muted-foreground">
          Điền thông tin của bạn trực tiếp vào mẫu bên dưới. Chỉ cần nhấp vào bất
          kỳ văn bản nào để chỉnh sửa và nhấn nút Lưu ở cuối trang khi hoàn tất.
        </p>
      </div>

      <div className="w-full shadow-2xl rounded-sm overflow-hidden max-w-[210mm] mx-auto">
        {template.component}
      </div>
    </div>
  );
}
