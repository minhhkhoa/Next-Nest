import { getIdFromSlugUrl } from "@/lib/utils";
import React from "react";

export default function PageDetailCompany({
  companyId,
}: {
  companyId: string;
}) {
  console.log("CompanyID: ", companyId);
  const idCompany = getIdFromSlugUrl(companyId);
  return <div>PageDetailCompany: {idCompany}</div>;
}
