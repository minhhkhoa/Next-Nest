import PageNewsDetail from "@/_pages/guest/CateNews/PageNewsDetail";
import { getIdFromSlugUrl, isValidObjectId } from "@/lib/utils";
import { notFound } from "next/navigation";
import React from "react";

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const idNews = getIdFromSlugUrl(slug || "");

  //- check idNews is valid ObjectId
  const isIdValid = isValidObjectId(idNews);
  if (!isIdValid) {
    notFound();
  }

  return (
    <div>
      <PageNewsDetail idNews={idNews} />
    </div>
  );
}
