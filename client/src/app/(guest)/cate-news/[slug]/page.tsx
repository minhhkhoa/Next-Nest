import CategoryNewsPage from "@/app/_pages/client/CateNews/CategoryNews";
import React from "react";

export default function CateNewsPage({ params }: { params: { slug: string } }) {
  //- get slug from params
  const { slug } = params;

  return (
    <div>
      <CategoryNewsPage slug={slug} />
    </div>
  );
}
