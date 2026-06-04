import PageAiRecommendations from "@/_pages/ai-recommendations";
import React, { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";

export default function AiRecommendationsPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <PageAiRecommendations />
    </Suspense>
  );
}
