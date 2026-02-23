import React, { Suspense } from "react";
import Home from "@/_pages/home/pageHome";
import { Spinner } from "@/components/ui/spinner";

export default function HomePage() {
  return (
    <Suspense fallback={<Spinner />}>
      <Home />
    </Suspense>
  );
}
