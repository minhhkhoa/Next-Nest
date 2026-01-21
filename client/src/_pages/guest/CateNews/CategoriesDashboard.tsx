"use client";

import {
  useGetListCategories,
  useGetListNewsDashboard,
} from "@/queries/useNewsCategory";
import Image from "next/image";
import Link from "next/link";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  NewsHotType,
  ResultListNewsType,
} from "@/schemasvalidation/NewsCategory";
import { formatDateInput, generateSlugUrl } from "@/lib/utils";
import { ArrowRight, PenIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import SlideCateNews from "./components/SlideCateNews";

export default function CategoriesPage() {
  const { data: listCateNews } = useGetListCategories();
  const { data: listNewsDashboard, isLoading: isLoadingListNews } =
    useGetListNewsDashboard();
  const dataNews1 = listNewsDashboard?.data?.result[0];
  const dataNews2 = listNewsDashboard?.data?.result[1];
  const dataNewsRest = listNewsDashboard?.data?.result.slice(2);

  return (
    <div>
      {/* header */}
      <div className="relative -mx-5 md:-mx-30 z-0">
        <Image
          src="/banner_CateNewsDashboard.webp"
          alt="logo"
          width={900}
          height={100}
          className="md:!w-[100vw] md:h-[350px] h-[200px] mt-3 object-cover"
        ></Image>

        <div className="absolute top-[84%] left-1/2 -translate-x-1/2 -translate-y-1/2">
          <p className="text-center text-2xl font-bold text-primary">
            Hành trang nghề nghiệp
          </p>
          <p className="hidden md:block text-center mt-2 text-gray-700 font-medium max-w-[690px] mx-auto">
            Khám phá thông tin hữu ích liên quan tới nghề nghiệp bạn quan tâm.
            Chia sẻ kinh nghiệm, kiến thức chuyên môn giúp bạn tìm được công
            việc phù hợp và phát triển bản thân.
          </p>
        </div>
      </div>

      {/* carousel category news */}
      {listCateNews?.data && (
        <SlideCateNews cateNews={listCateNews.data || []} />
      )}

      <div>
        {listNewsDashboard?.data && (
          <BlockNewsHot
            data={listNewsDashboard?.data?.NewsHot}
            isLoadingListNews={isLoadingListNews}
          />
        )}
      </div>

      <div>{dataNews1 && <BlockStyle1 data={dataNews1} />}</div>

      <div className="my-20">
        {dataNewsRest && <BlockStyle2 data={dataNewsRest} />}
      </div>

      <div className="mb-10">
        {dataNews2 && <BlockStyle1 data={dataNews2} />}
      </div>
    </div>
  );
}

function BlockNewsHot({
  data,
  isLoadingListNews,
}: {
  data: NewsHotType[];
  isLoadingListNews: boolean;
}) {
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
    return new Date(date).toLocaleDateString("vi-VN");
  };

  return (
    <div className="my-8 md:my-12 lg:my-16 px-4 md:px-6">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <span className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary text-balance">
          Tin tức nổi bật
        </span>
        <div className="h-1 w-[165px] md:w-[248px] bg-primary rounded-full mt-2"></div>
      </div>

      {/* Main Container - Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
        {/* Block Left - Featured News */}
        <div className="flex flex-col rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300">
          <Link
            href={`/news/${generateSlugUrl({
              name: firstNews.slugNews.vi,
              id: firstNews._id,
            })}`}
            className="flex-1 flex flex-col"
          >
            <div className="relative overflow-hidden bg-slate-200 h-64 md:h-72 lg:h-80">
              <Image
                src={firstNews.image || "/placeholder.svg"}
                alt={firstNews.title.vi}
                fill
                className="object-cover w-full h-full transform transition-transform duration-300 hover:scale-110"
              />
            </div>

            {/* Content Section */}
            <div className="p-4 md:p-6 flex flex-col flex-1 bg-slate-50">
              <p className="text-xs md:text-sm font-semibold text-primary uppercase tracking-wide mb-2">
                {firstNews.cateNewsID[0]?.name.vi || "News"}
              </p>
              <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 line-clamp-3 mb-3 hover:text-primary transition-colors">
                {firstNews.title.vi}
              </h3>

              <p className="text-xs md:text-sm text-gray-500 mb-3 flex items-center gap-1">
                <PenIcon className="inline-block w-3 h-3 md:w-4 md:h-4 mr-1 mb-0.5" />
                {firstNews.createdBy.name} •{" "}
                {formatDateInput(firstNews.createdAt)}
              </p>

              <p className="text-sm md:text-base text-gray-700 line-clamp-2 mb-4 flex-1">
                {firstNews.summary.vi}
              </p>

              <div className="flex items-center gap-1 text-primary font-semibold hover:gap-2 transition-all text-sm md:text-base">
                Đọc thêm
                <ArrowRight size={16} className="md:w-5 md:h-5" />
              </div>
            </div>
          </Link>
        </div>

        {/* Block Right - News List */}
        <div className="flex flex-col gap-3 md:gap-4">
          {restNews.map((newsItem) => (
            <Link
              key={newsItem._id}
              href={`/news/${generateSlugUrl({
                name: newsItem.slugNews.vi,
                id: newsItem._id,
              })}`}
              className="group bg-gray-300 rounded-xl p-4 md:p-5 shadow-md hover:shadow-lg hover:bg-slate-50 transition-all duration-300 border border-slate-100 hover:border-primary/20 flex gap-4"
            >
              {/* Text Content */}
              <div className="flex-1 flex flex-col min-w-0">
                <p className="text-xs md:text-sm font-semibold text-primary uppercase tracking-wide mb-1">
                  {newsItem.cateNewsID[0]?.name.vi || "News"}
                </p>
                <h4 className="text-base md:text-lg font-bold text-gray-900 line-clamp-2 mb-2 transition-colors">
                  {newsItem.title.vi}
                </h4>

                <p className="text-xs md:text-sm text-gray-500 mb-2 flex items-center gap-1">
                  <PenIcon className="inline-block w-3 h-3 md:w-4 md:h-4 mr-1 mb-0.5" />
                  {newsItem.createdBy.name} •{" "}
                  {formatDateInput(newsItem.createdAt)}
                </p>

                <p className="text-sm text-gray-600 line-clamp-2 mb-3 flex-1">
                  {newsItem.summary.vi}
                </p>

                <div className="flex items-center gap-1 text-black font-semibold text-xs md:text-sm group-hover:gap-2 transition-all">
                  Đọc thêm
                  <ArrowRight size={14} className="md:w-4 md:h-4" />
                </div>
              </div>

              {/* Image */}
              <div className="relative w-24 md:w-28 lg:w-32 h-24 md:h-28 lg:h-32 flex-shrink-0 rounded-lg overflow-hidden bg-slate-200">
                <Image
                  src={newsItem.image || "/placeholder.svg"}
                  alt={newsItem.title.vi}
                  fill
                  className="object-cover w-full h-full transform transition-transform duration-300 group-hover:scale-110"
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function BlockStyle1({ data }: { data: ResultListNewsType }) {
  const isMobile = useIsMobile();
  return (
    <div className="">
      <div className="flex justify-between items-center">
        <div className="mb-6 md:mb-8">
          <span className="text-xl md:text-3xl lg:text-4xl font-bold text-primary text-balance">
            {data.nameCate.title.vi}
          </span>
          <div className="h-1 w-[165px] md:w-[248px] bg-primary rounded-full mt-2"></div>
        </div>
        <Link
          href={`/cate-news/${generateSlugUrl({
            name: data.nameCate.vi,
            id: data.listNews[0].cateNewsID[0]._id,
          })}`}
        >
          Xem tất cả
          <ArrowRight size={16} className="inline-block ml-1 mb-0.5" />
        </Link>
      </div>

      <div className="flex gap-5 flex-col md:flex-wrap md:flex-row">
        {data.listNews.slice(0, 4).map((news) => (
          <Link
            className="block flex-1"
            href={`/news/${generateSlugUrl({
              name: news.slugNews.vi,
              id: news._id,
            })}`}
            key={news._id}
          >
            <div>
              <Image
                src={news.image}
                alt={news.title.vi}
                width={200}
                height={200}
                className="w-full h-[160px] object-cover rounded-lg"
              />
            </div>

            <p className="line-clamp-2 text-base md:text-lg font-semibold">
              {news.title.vi}
            </p>

            <p className="text-xs md:text-sm text-gray-500 my-1 flex items-center gap-1">
              <PenIcon className="inline-block w-3 h-3 md:w-4 md:h-4 mr-1 mb-0.5" />
              {news.createdBy.name} •{" "}
              {formatDateInput(news.createdAt.toString())}
            </p>

            <p className="line-clamp-3 text-shadow-md">{news.summary.vi}</p>

            {isMobile && <Separator className="my-2" />}
          </Link>
        ))}
      </div>
    </div>
  );
}

function BlockStyle2({ data }: { data: ResultListNewsType[] }) {
  return (
    <div className="flex flex-col lg:flex-row gap-4 md:gap-6 lg:gap-8 items-stretch">
      {/* block left */}
      <div className="flex-1 lg:flex-[3] flex flex-col min-h-0">
        <div className="flex mb-6 md:mb-8">
          <div>
            <span className="text-lg md:text-2xl lg:text-3xl xl:text-4xl font-bold text-primary text-balance">
              {data[0].nameCate.title.vi}
            </span>
            <div className="h-1 w-[120px] md:w-[165px] lg:w-[200px] bg-primary rounded-full mt-2"></div>
          </div>
        </div>

        <div className="flex flex-col justify-between flex-1 min-h-0">
          <div className="flex flex-col gap-2 md:gap-3 lg:gap-4 overflow-y-auto">
            {data[0].listNews.slice(0, 5).map((news) => (
              <Link
                key={news._id}
                href={`/news/${generateSlugUrl({
                  name: news.slugNews.vi,
                  id: news._id,
                })}`}
                className="group rounded-lg md:rounded-xl p-3 md:p-4 lg:p-5 shadow-sm hover:shadow-md transition-all duration-300 border flex gap-3 md:gap-4 flex-shrink-0"
              >
                {/* Text Content */}
                <div className="flex-1 flex flex-col min-w-0">
                  <h4 className="text-sm md:text-base lg:text-lg font-bold line-clamp-1 mb-1 md:mb-2 transition-colors">
                    {news.title.vi}
                  </h4>

                  <p className="text-xs md:text-sm text-gray-500 mb-1 md:mb-2 flex items-center gap-1">
                    <PenIcon className="inline-block w-3 h-3 md:w-4 md:h-4 mr-1 mb-0.5 flex-shrink-0" />
                    <span className="truncate">
                      {news.createdBy.name} •{" "}
                      {formatDateInput(news.createdAt.toString())}
                    </span>
                  </p>

                  <p className="text-xs md:text-sm line-clamp-3 flex-1">
                    {news.summary.vi}
                  </p>
                </div>

                {/* Image */}
                <div className="relative w-20 md:w-24 lg:w-28 h-20 md:h-24 lg:h-28 flex-shrink-0 rounded-lg overflow-hidden bg-slate-200">
                  <Image
                    src={news.image || "/placeholder.svg"}
                    alt={news.title.vi}
                    fill
                    className="object-cover w-full h-full transform transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
              </Link>
            ))}
          </div>

          <Link
            className="w-full border text-center rounded-xl md:rounded-2xl py-1.5 px-4 mt-3 md:mt-4 flex-shrink-0 text-sm md:text-base hover:bg-accent-foreground/20 transition-colors"
            href={`/cate-news/${generateSlugUrl({
              name: data[0].nameCate.vi,
              id: data[0].listNews[0].cateNewsID[0]._id,
            })}`}
          >
            Xem tất cả
            <ArrowRight size={16} className="inline-block ml-1 mb-0.5" />
          </Link>
        </div>
      </div>

      {/* block right */}
      <div className="flex-1 lg:flex-[2] flex flex-col min-h-0">
        <div className="flex justify-between items-center mb-6 md:mb-8">
          <div>
            <span className="text-lg md:text-2xl lg:text-3xl xl:text-4xl font-bold text-primary text-balance">
              {data[1].nameCate.title.vi}
            </span>
            <div className="h-1 w-[120px] md:w-[165px] lg:w-[200px] bg-primary rounded-full mt-2"></div>
          </div>
        </div>

        <div className="flex flex-col justify-between flex-1 min-h-0">
          <div className="flex flex-col gap-2 md:gap-3 lg:gap-4 overflow-y-auto">
            {data[1].listNews.slice(0, 5).map((news) => (
              <Link
                key={news._id}
                href={`/news/${generateSlugUrl({
                  name: news.slugNews.vi,
                  id: news._id,
                })}`}
                className="group rounded-lg md:rounded-xl p-3 md:p-4 lg:p-5 shadow-sm hover:shadow-md transition-all duration-300 border flex gap-3 md:gap-4 flex-shrink-0"
              >
                {/* Text Content */}
                <div className="flex-1 flex flex-col min-w-0">
                  <h4 className="text-sm md:text-base lg:text-lg font-bold line-clamp-2 mb-1 md:mb-2 transition-colors">
                    {news.title.vi}
                  </h4>

                  <p className="text-xs md:text-sm text-gray-500 mb-1 md:mb-2 flex items-center gap-1">
                    <PenIcon className="inline-block w-3 h-3 md:w-4 md:h-4 mr-1 mb-0.5 flex-shrink-0" />
                    <span className="truncate">
                      {news.createdBy.name} •{" "}
                      {formatDateInput(news.createdAt.toString())}
                    </span>
                  </p>

                  <p className="text-xs md:text-sm line-clamp-2 flex-1">
                    {news.summary.vi}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          <Link
            className="w-full border text-center rounded-xl md:rounded-2xl py-1.5 px-4 mt-3 md:mt-4 flex-shrink-0 text-sm md:text-base hover:bg-accent-foreground/20 transition-colors"
            href={`/cate-news/${generateSlugUrl({
              name: data[1].nameCate.vi,
              id: data[1].listNews[0].cateNewsID[0]._id,
            })}`}
          >
            Xem tất cả
            <ArrowRight size={16} className="inline-block ml-1 mb-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
