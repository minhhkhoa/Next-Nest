import WrapDetailTemplate from "@/_pages/pages_authenticated/cv-templates/WrapDetailTemplate";
import React from "react";

export default async function CvTemplatePage({
  params,
}: {
  params: Promise<{ templateId: string }>;
}) {
  const { templateId } = await params;

  return <WrapDetailTemplate templateId={templateId} />;
}
