import PageAdminCompany from "@/_pages/admin/company";
import React, { Suspense } from "react";

export default function AdminCompanyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PageAdminCompany />
    </Suspense>
  );
}
