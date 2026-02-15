import PageDetailCv from "@/_pages/pages_authenticated/my-cv/DetailCv";
import React from "react";

export default async function DetailCvPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <PageDetailCv id={id} />;
}
