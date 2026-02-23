import PageDetailCompany from "@/_pages/guest/company/DetailCompany";
import React from "react";

export default async function DetailCompanyPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = await params;
  return (
    <div>
      <PageDetailCompany companyId={companyId} />
    </div>
  );
}
