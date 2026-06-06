import PageAiScore from "@/_pages/pages_authenticated/my-cv/AiScore";
import React from "react";

export default async function AiScorePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <PageAiScore id={id} />;
}
