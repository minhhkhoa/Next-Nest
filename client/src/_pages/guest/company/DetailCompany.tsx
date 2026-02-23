"use client";

import { getIdFromSlugUrl } from "@/lib/utils";
import { useGetCompanyDetail } from "@/queries/useCompany";
import React from "react";
import CompanyHeader from "./components/CompanyHeader";
import CompanyInfo from "./components/CompanyInfo";
import CompanyJobs from "./components/CompanyJobs";
import { Skeleton } from "@/components/ui/skeleton";

export default function PageDetailCompany({
  companyId,
}: {
  companyId: string;
}) {
  const idCompany = getIdFromSlugUrl(companyId);
  const {
    data: companyData,
    isLoading,
    error,
  } = useGetCompanyDetail(idCompany);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-8">
        <Skeleton className="w-full h-[300px] rounded-lg" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-60 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !companyData?.data) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        Không tìm thấy thông tin công ty
      </div>
    );
  }

  const company = companyData.data;

  return (
    <div className="min-h-screen bg-muted/5 pb-20 pt-5">
      <CompanyHeader company={company as any} />

      <div className="container mx-auto relative z-10">
        <CompanyInfo company={company} />

        <CompanyJobs companyId={company._id} />
      </div>
    </div>
  );
}
