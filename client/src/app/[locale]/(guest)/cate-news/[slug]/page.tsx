import CategoryNewsPage from "@/_pages/guest/CateNews/CategoryNews";
import { getIdFromSlugUrl, isValidObjectId } from "@/lib/utils";
import { notFound } from "next/navigation";
import React from "react";

export default async function CateNewsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  //- get slug from params
  const { slug } = await params;

  const idCateNews = getIdFromSlugUrl(slug || "");

  //- check idCateNews is valid ObjectId
  const isIdValid = isValidObjectId(idCateNews);

  if (!isIdValid) {
    return notFound();
  }

  return (
    <div>
      <CategoryNewsPage idCateNews={idCateNews} />
    </div>
  );
}
