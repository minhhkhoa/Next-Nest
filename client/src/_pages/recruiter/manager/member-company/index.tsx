"use client";

import { useAppStore } from "@/components/TanstackProvider";
import React from "react";
import PendingCompanyPage from "../info-company/components/pending-company";
import PageMemberCompany from "./member-company";

export default function PageRootMemberCompany() {
  const { user } = useAppStore();
  const employerInfo = user?.employerInfo;

  //- nếu userStatus !=='ACTIVE' thì trả về trang PendingCompanyPage
  if (employerInfo && employerInfo.userStatus !== "ACTIVE") {
    return <PendingCompanyPage user={user} />;
  }

  return (
    <div>
      <PageMemberCompany user={user} />
    </div>
  );
}
