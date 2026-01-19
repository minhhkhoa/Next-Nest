import NewsCate from "@/_pages/admin/NewsCategory";
import React, { Suspense } from "react";

export default function NewsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewsCate />
    </Suspense>
  );
}
