import PageAdminCompany from "@/_pages/admin/company";
import { Spinner } from "@/components/ui/spinner";
import React, { Suspense } from "react";

export default function AdminCompanyPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <PageAdminCompany />
    </Suspense>
  );
}
