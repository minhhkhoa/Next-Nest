import CategoryNewsPage from "@/app/_pages/client/CateNews/CategoryNews";
import React from "react";

export default async function CateNewsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  //- get slug from params
  const { slug } = await params;

  return (
    <div>
      <CategoryNewsPage slug={slug} />
    </div>
  );
}
