"use client";

import { useAppStore } from "@/components/TanstackProvider";
import React from "react";
import CompanySetupPage from "./register-company";

export default function PageInfoCompany() {
  const { user } = useAppStore();
  const employerInfo = user?.employerInfo;

  //- Trường hợp 1: employerInfo chưa tồn tại(undefine)
  if (!employerInfo)
    return (
      <div>
        <CompanySetupPage />
      </div>
    );

  //- Trường hợp 2: Có employerInfo nhưng userStatus === 'PENDING'
  if (employerInfo && employerInfo.userStatus === "PENDING")
    return <div>PendingCompanyPage</div>;

  //- Trường hợp 3: Có employerInfo và userStatus === 'ACTIVE'
  if (employerInfo && employerInfo.userStatus === "ACTIVE")
    return <div>ActiveCompanyPage</div>;
}
