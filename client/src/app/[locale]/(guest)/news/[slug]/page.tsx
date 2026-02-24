import PageNewsDetail from "@/_pages/guest/CateNews/PageNewsDetail";
import React from "react";

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <div>
      <PageNewsDetail slug={slug} />
    </div>
  );
}
