import PageNews from "@/app/_pages/client/CateNews/PageNews";
import React from "react";

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <div>
      <PageNews slug={slug} />
    </div>
  );
}
