import NewsCate from "@/_pages/admin/NewsCategory";
import { Spinner } from "@/components/ui/spinner";
import React, { Suspense } from "react";

export default function NewsPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <NewsCate />
    </Suspense>
  );
}
