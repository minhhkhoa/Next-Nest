import PageDetailCompany from "@/_pages/guest/company/DetailCompany";
import { getIdFromSlugUrl, isValidObjectId } from "@/lib/utils";
import { notFound } from "next/navigation";
import React from "react";

export default async function DetailCompanyPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = await params;

  const idCompany = getIdFromSlugUrl(companyId || "");

  //- check idCompany is valid ObjectId
  const isIdValid = isValidObjectId(idCompany);

  if (!isIdValid) {
    notFound();
  }

  return (
    <div>
      <PageDetailCompany idCompany={idCompany} />
    </div>
  );
}
