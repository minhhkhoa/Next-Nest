"use client";

import { useAppStore } from "@/components/TanstackProvider";
import React from "react";
import CompanySetupPage from "./register-company";
import PendingCompanyPage from "./components/pending-company";
import ActiveCompanyPage from "./components/active-company";
import { Loader } from "lucide-react";

export default function PageInfoCompany() {
  const { user } = useAppStore();
  const employerInfo = user?.employerInfo;

  if (!user && employerInfo === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="animate-spin mx-auto mt-20" />
      </div>
    );
  }

  //- Trường hợp 1: employerInfo chưa tồn tại(undefine)
  if (!employerInfo)
    return (
      <div>
        <CompanySetupPage />
      </div>
    );

  //- Trường hợp 2: Có employerInfo nhưng userStatus === 'PENDING'
  if (employerInfo && employerInfo.userStatus === "PENDING")
    return (
      <div>
        <PendingCompanyPage user={user} />
      </div>
    );

  //- Trường hợp 3: Có employerInfo và userStatus === 'ACTIVE'
  if (employerInfo && employerInfo.userStatus === "ACTIVE")
    return (
      <div>
        <ActiveCompanyPage companyId={employerInfo.companyID} />
      </div>
    );
}
