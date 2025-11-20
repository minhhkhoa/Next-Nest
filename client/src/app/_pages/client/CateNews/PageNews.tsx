"use client";

import { formatDateInput, getIdFromSlugUrl } from "@/lib/utils";
import {
  useGetListCategories,
  useGetNewsById,
} from "@/queries/useNewsCategory";
import Image from "next/image";
import React from "react";
import SlideCateNews from "./components/SlideCateNews";
import { Spinner } from "@/components/ui/spinner";
import styles from "@/app/bootstrap.module.css";

export default function PageNews({ slug }: { slug?: string }) {
  const idNews = getIdFromSlugUrl(slug || "");

  const { data } = useGetListCategories();
  const restCategories = data?.data?.filter((item) => item._id !== idNews);
  const { data: news, isLoading } = useGetNewsById(idNews);
  const newsDetail = news?.data;

  return (
    <div>
      <div className="relative -mx-5 md:-mx-30 z-0">
        <Image
          src="/bannerPageNews.jpeg"
          alt="logo"
          width={900}
          height={100}
          className="md:!w-[100vw] md:h-[350px] h-[200px] mt-3 object-cover"
        ></Image>
      </div>
      {/* carousel category news */}
      <SlideCateNews cateNews={restCategories || []} />

      <div className="mt-10 flex justify-center">
        {isLoading ? (
          <div className="w-full flex justify-center items-center">
            <Spinner />
          </div>
        ) : (
          <div className="boder rounded-2xl p-3 max-w-[850px] flex flex-col gap-3">
            <p className="text-2xl md:text-4xl font-bold text-primary">
              {newsDetail?.title.vi}
            </p>
            <p>{newsDetail?.cateNewsID[0].name.vi}</p>
            <p className="text-xs md:text-sm text-gray-500 mb-3 flex items-center gap-1">
              Tác giả: {newsDetail?.createdBy.name} •{" "}
              {formatDateInput(newsDetail?.createdAt.toString() || "")}
            </p>
            <div
              className={styles.wrapperBoostrap}
              dangerouslySetInnerHTML={{
                __html: newsDetail?.description || "",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
