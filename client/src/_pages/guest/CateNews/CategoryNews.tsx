"use client";

import { generateSlugUrl } from "@/lib/utils";
import {
  useGetCategoryById,
  useGetListCategories,
  useGetListNewsFilter,
} from "@/queries/useNewsCategory";
import Image from "next/image";
import React from "react";
import { Link } from "@/i18n/navigation";
import { NewsResFilterType } from "@/schemasvalidation/NewsCategory";
import { Spinner } from "@/components/ui/spinner";
import { ArrowRight, PenIcon, Sparkles } from "lucide-react";
import SlideCateNews from "./components/SlideCateNews";
import BlockNewsWithPagination from "./components/BlockNewsWithPagination";
import { useTranslations } from "next-intl";
import { useGetLang } from "@/hooks/use-get-lang";

export default function CategoryNewsPage({
  idCateNews,
}: {
  idCateNews: string;
}) {
  const t = useTranslations("PageNews");
  const { getLang } = useGetLang();

  const {
    data: categoryData,
    isLoading: isLoadingCategoryData,
    error: errorCategoryData,
  } = useGetCategoryById(idCateNews);
  const {
    data,
    isLoading: isLoadingListCategories,
    error: errorListCategories,
  } = useGetListCategories();
  const [currentPage, setCurrentPage] = React.useState(1);
  const onPageChange = (page: number) => {
    setCurrentPage(page);
  };
  const {
    data: listNews,
    isLoading: isLoadingListNews,
    error: errorListNews,
  } = useGetListNewsFilter({
    currentPage: currentPage,
    pageSize: 6,
    cateNewsID: idCateNews,
    status: "active",
  });

  //- do mình lười ko viết api lấy tin tức nổi bật nên call lại 1 api 2 lần tách ra để nó không bị hiện UI spin (ở tin tức nổi bật) khi change pagination của danh sách tin tức
  const {
    data: listNews2,
    isLoading,
    error,
  } = useGetListNewsFilter({
    currentPage: 1, //- ko phu thuoc vao state
    pageSize: 5,
    cateNewsID: idCateNews,
    status: "active",
  });

  if (error || errorListNews || errorCategoryData || errorListCategories) {
    return (
      <div className="w-full flex justify-center items-center h-[300px]">
        <p className="text-gray-500">{t("NoArticles")}</p>
      </div>
    );
  }

  if (isLoading || isLoadingCategoryData || isLoadingListCategories) {
    return (
      <div className="w-full flex justify-center items-center h-[300px]">
        <Spinner />
      </div>
    );
  }
  
  const restCategories = data?.data?.filter((item) => item._id !== idCateNews);
  const listNewsHot = listNews2?.data?.result.slice(0, 4);

  return (
    <div>
      <div className="relative -mx-5 md:-mx-30 z-0">
        <Image
          src="/banner.png"
          alt="logo"
          width={900}
          height={100}
          className="md:!w-[100vw] md:h-[350px] h-[200px] mt-3 object-cover"
        ></Image>

        <div className="hidden md:block absolute top-[84%] left-1/2 -translate-x-1/2 -translate-y-1/2">
          <p className="text-center text-2xl font-bold text-primary">
            {categoryData?.data && getLang(categoryData.data.name)}
          </p>
          <p className="hidden md:block text-center mt-2 font-medium max-w-[690px] mx-auto">
            {categoryData?.data && getLang(categoryData.data.summary)}
          </p>
        </div>

        <div className="block md:hidden mt-5">
          <p className="text-center text-2xl font-bold text-primary">
            {categoryData?.data && getLang(categoryData.data.name)}
          </p>
        </div>
      </div>

      {/* carousel category news */}
      <SlideCateNews cateNews={restCategories || []} />

      <div>
        <div className="mt-6">
          <span className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary text-balance">
            {t("FeaturedNews")}
          </span>
          <div className="h-1 w-[165px] md:w-[248px] bg-primary rounded-full mt-2"></div>
        </div>
        {listNewsHot ? (
          <BlockNewsNice data={listNewsHot} isLoadingListNews={false} />
        ) : (
          <div className="flex items-center justify-center py-8">
            <Spinner />
          </div>
        )}
      </div>

      {/* Block list news */}
      <div className="my-10">
        <BlockNewsWithPagination
          listNews={listNews?.data?.result || []}
          meta={
            listNews?.data?.meta || {
              current: 1,
              pageSize: 6,
              totalPages: 1,
              totalItems: 0,
            }
          }
          isLoadingListNews={isLoadingListNews}
          onPageChange={onPageChange}
          textTitle={t("NewsList")}
        />
      </div>
    </div>
  );
}

function BlockNewsNice({
  data,
  isLoadingListNews,
}: {
  data: NewsResFilterType[];
  isLoadingListNews: boolean;
}) {
  const t = useTranslations("PageNews");
  const { getLang, locale } = useGetLang();

  if (isLoadingListNews) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner />
      </div>
    );
  }

  const firstNews = data[0];
  const restNews = data.slice(1);

  const formatDateInput = (date: string | Date) => {
    return new Date(date).toLocaleDateString(locale === "en" ? "en-US" : "vi-VN");
  };

  return (
    <div className="my-8 px-5 py-6 md:p-8 rounded-3xl bg-gradient-to-br from-primary/50 via-primary/20 to-indigo-50/30 border border-primary/20 shadow-sm">
      {/*- bố cục chia đôi tin tiêu điểm bên trái và danh sách bên phải */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/*- khối tin tức nổi bật lớn ở bên trái */}
        <div className="flex flex-col rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-slate-950/60 hover:bg-slate-950/80 backdrop-blur-sm border border-white/10 hover:border-indigo-500/30">
          <Link
            href={`/news/${generateSlugUrl({
              name: getLang(firstNews?.slugNews),
              id: firstNews?._id,
            })}`}
            className="flex-1 flex flex-col group"
          >
            <div className="relative overflow-hidden bg-slate-200 h-64 md:h-72 lg:h-80">
              <Image
                src={firstNews?.image || "/placeholder.svg"}
                alt={getLang(firstNews?.title) || t("Highlight")}
                fill
                className="object-cover w-full h-full transform transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute top-4 left-4 z-10 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg shadow-indigo-500/20 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 fill-white animate-pulse" />
                {t("Highlight")}
              </div>
            </div>

            {/*- nội dung tin tiêu điểm */}
            <div className="p-5 md:p-6 flex flex-col flex-1">
              <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-white line-clamp-2 mb-3 group-hover:text-indigo-300 transition-colors leading-snug">
                {getLang(firstNews?.title)}
              </h3>

              <p className="text-xs md:text-sm text-slate-400 mb-3 flex items-center gap-1.5">
                <PenIcon className="inline-block w-3.5 h-3.5 mr-0.5 text-slate-500" />
                <span className="font-medium text-slate-300">{firstNews?.createdBy.name}</span>
                <span className="text-slate-500">•</span>
                <span>{formatDateInput(firstNews?.createdAt)}</span>
              </p>

              <p className="text-sm md:text-base text-slate-300 line-clamp-3 mb-4 flex-1 leading-relaxed">
                {getLang(firstNews?.summary)}
              </p>

              <div className="flex items-center gap-1 text-indigo-400 font-bold text-sm md:text-base group-hover:text-indigo-300 transition-all">
                {t("ReadArticle")}
                <ArrowRight size={16} className="md:w-5 md:h-5 transition-transform" />
              </div>
            </div>
          </Link>
        </div>

        {/*- danh sách các tin tức phụ ở bên phải */}
        <div className="flex flex-col gap-4">
          {restNews?.map((newsItem) => (
            <Link
              key={newsItem._id}
              href={`/news/${generateSlugUrl({
                name: getLang(newsItem.slugNews),
                id: newsItem._id,
              })}`}
              className="group bg-slate-950/60 hover:bg-slate-950/80 backdrop-blur-sm rounded-2xl p-4 md:p-5 shadow-sm hover:shadow-xl hover:border-indigo-500/30 hover:-translate-y-1 transition-all duration-300 border border-white/10 flex gap-4"
            >
              {/*- nội dung tin tức phụ */}
              <div className="flex-1 flex flex-col min-w-0 justify-between">
                <div>
                  <h4 className="text-base md:text-lg font-bold text-white line-clamp-2 mb-2 group-hover:text-indigo-300 transition-colors leading-snug">
                    {getLang(newsItem.title)}
                  </h4>

                  <p className="text-xs md:text-sm text-slate-400 mb-2.5 flex items-center gap-1.5">
                    <PenIcon className="inline-block w-3 h-3 text-slate-555" />
                    <span className="font-medium text-slate-300">{newsItem.createdBy.name}</span>
                    <span className="text-slate-500">•</span>
                    <span>{formatDateInput(newsItem.createdAt)}</span>
                  </p>

                  <p className="text-sm text-slate-300 line-clamp-2 mb-3 leading-relaxed">
                    {getLang(newsItem.summary)}
                  </p>
                </div>

                <div className="flex items-center gap-1 text-indigo-400 font-bold text-xs md:text-sm group-hover:text-indigo-300 transition-all">
                  {t("ReadMore")}
                  <ArrowRight size={14} className="md:w-4 md:h-4" />
                </div>
              </div>

              {/*- hình ảnh tin tức phụ */}
              <div className="relative w-24 md:w-28 lg:w-32 h-24 md:h-28 lg:h-32 flex-shrink-0 rounded-xl overflow-hidden bg-slate-200 shadow-inner">
                <Image
                  src={newsItem.image || "/placeholder.svg"}
                  alt={getLang(newsItem.title)}
                  fill
                  className="object-cover w-full h-full transform transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
