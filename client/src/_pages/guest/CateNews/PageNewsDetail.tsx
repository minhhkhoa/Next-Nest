"use client";

import {
  formatDateInput,
} from "@/lib/utils";
import {
  useGetListCategories,
  useGetListNewsFilter,
  useGetNewsById,
} from "@/queries/useNewsCategory";
import Image from "next/image";
import React from "react";
import SlideCateNews from "./components/SlideCateNews";
import { Spinner } from "@/components/ui/spinner";
import styles from "@/app/[locale]/bootstrap.module.css";
import BlockNewsWithPagination from "./components/BlockNewsWithPagination";
import { useGetLang } from "@/hooks/use-get-lang";

export default function PageNewsDetail({ idNews }: { idNews: string }) {
  const { getLang } = useGetLang();
  const [currentPage, setCurrentPage] = React.useState(1);

  const { data: listCategories } = useGetListCategories();
  const restCategories = listCategories?.data?.filter(
    (item) => item._id !== idNews,
  );
  const { data: news, isLoading, error } = useGetNewsById(idNews);

  const newsDetail = news?.data;

  const idCateNewsDetail = newsDetail?.cateNewsID[0]._id;

  const { data: listNews, isLoading: isLoadingListNews } = useGetListNewsFilter(
    {
      currentPage: currentPage,
      pageSize: 6,
      cateNewsID: idCateNewsDetail,
      status: "active",
    },
  );

  if (error) {
    return (
      <div className="w-full flex justify-center items-center h-[300px]">
        <p className="text-gray-500">Không tìm thấy bài viết</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full flex justify-center items-center h-[300px]">
        <Spinner />
      </div>
    );
  }

  const totalPages = listNews?.data?.meta?.totalPages || 1;
  const current = listNews?.data?.meta?.current || 1;
  const onPageChange = (page: number) => {
    setCurrentPage(page);
  };

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

      <div className="mt-10 flex justify-center flex-col items-center gap-6">
        {isLoading ? (
          <div className="w-full flex justify-center items-center">
            <Spinner />
          </div>
        ) : (
          <div className="boder rounded-2xl p-3 max-w-[850px] flex flex-col gap-3">
            <p className="text-2xl md:text-4xl font-bold text-primary">
              {getLang(newsDetail?.title)}
            </p>
            <p>{getLang(newsDetail?.cateNewsID[0].name)}</p>
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
      {/* bài viết liên quan */}
      <div>
        <BlockNewsWithPagination
          listNews={listNews?.data?.result || []}
          current={current}
          isLoadingListNews={isLoadingListNews}
          totalPages={totalPages}
          onPageChange={onPageChange}
          textTitle="Bài viết liên quan"
        />
      </div>
    </div>
  );
}
