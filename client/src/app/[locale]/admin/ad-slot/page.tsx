import PageAdminAdSlot from "@/_pages/admin/ad-slot";
import { Spinner } from "@/components/ui/spinner";
import React, { Suspense } from "react";

export default function AdSlotPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <PageAdminAdSlot />
    </Suspense>
  );
}
