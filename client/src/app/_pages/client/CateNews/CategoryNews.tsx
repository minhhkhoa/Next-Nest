"use client";

import {
  formatDateInput,
  generateSlugUrl,
  getIdFromSlugUrl,
} from "@/lib/utils";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  useGetCategoryById,
  useGetListCategories,
  useGetListNewsFilter,
} from "@/queries/useNewsCategory";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";
import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";
import { NewsResFilterType } from "@/schemasvalidation/NewsCategory";
import { Spinner } from "@/components/ui/spinner";
import { ArrowRight, PenIcon } from "lucide-react";

export default function CategoryNewsPage({ slug }: { slug?: string }) {
  const idCateNews = getIdFromSlugUrl(slug || "");
  const { data: categoryData } = useGetCategoryById(idCateNews);
  const { data } = useGetListCategories();
  const [currentPage, setCurrentPage] = React.useState(1);
  const onPageChange = (page: number) => {
    setCurrentPage(page);
  };
  const { data: listNews, isLoading: isLoadingListNews } = useGetListNewsFilter(
    {
      currentPage: currentPage,
      pageSize: 6,
      cateNewsID: idCateNews,
    }
  );

  //- do mình lười ko viết api lấy tin tức nổi bật nên call lại 1 api 2 lần tách ra để nó không bị hiện UI spin (ở tin tức nổi bật) khi change pagination của danh sách tin tức
  const { data: listNews2 } =
    useGetListNewsFilter({
      currentPage: 1, //- ko phu thuoc vao state
      pageSize: 5,
      cateNewsID: idCateNews,
    });
  const totalPages = listNews?.data?.meta?.totalPages || 1;
  const current = listNews?.data?.meta?.current || 1;
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
            {categoryData?.data?.name.vi}
          </p>
          <p className="hidden md:block text-center mt-2 font-medium max-w-[690px] mx-auto">
            {categoryData?.data?.summary.vi}
          </p>
        </div>

        <div className="block md:hidden mt-5">
          <p className="text-center text-2xl font-bold text-primary">
            {categoryData?.data?.name.vi}
          </p>
        </div>
      </div>

      {/* carousel category news */}
      <div className="mt-5 md:mt-10">
        <Carousel
          opts={{
            align: "start",
          }}
          className="w-full"
        >
          <CarouselContent>
            {restCategories?.map((cateNews) => {
              return (
                <CarouselItem
                  key={cateNews._id}
                  // basis theo mobile và desktop
                  className="basis-1/2 sm:basis-1/3 md:basis-1/5 px-2"
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href={`/cate-news/${generateSlugUrl({
                          name: cateNews.slug.vi,
                          id: cateNews._id,
                        })}`}
                        className="truncate line-clamp-1 text-center px-1 py-0.5 border border-gray-700 rounded-lg cursor-pointer hover:bg-accent-foreground/20 block"
                      >
                        {cateNews.name.vi}
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{cateNews.name.vi}</p>
                    </TooltipContent>
                  </Tooltip>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <div className="hidden md:flex">
            <CarouselPrevious />
            <CarouselNext />
          </div>
        </Carousel>
      </div>

      <div>
        <div className="mt-6">
          <span className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary text-balance">
            Tin tức nổi bật
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
        <div className="mb-6 md:mb-8">
          <span className="text-xl md:text-3xl lg:text-4xl font-bold text-primary text-balance">
            Danh sách tin tức
          </span>
          <div className="h-1 w-[165px] md:w-[248px] bg-primary rounded-full mt-2"></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {listNews?.data?.result.map((newsItem) => (
            <div key={newsItem._id} className="flex flex-col gap-2">
              <Image
                src={newsItem.image}
                alt={newsItem.title.vi}
                width={200}
                height={200}
                className="w-full h-[160px] object-cover rounded-lg"
              />

              <p className="line-clamp-2 text-base md:text-lg font-semibold">
                {newsItem.title.vi}
              </p>

              <p className="text-xs md:text-sm text-gray-500 my-1 flex items-center gap-1">
                <PenIcon className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                {newsItem.createdBy.name} •{" "}
                {formatDateInput(newsItem.createdAt.toString())}
              </p>

              <p className="line-clamp-3 text-shadow-md">
                {newsItem.summary.vi}
              </p>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="mt-8">
          {!isLoadingListNews ? (
            <Pagination className="flex justify-center">
              <PaginationContent>
                {/* Nút Trước */}
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => onPageChange(current - 1)}
                    aria-disabled={current === 1}
                    className={
                      current === 1 ? "pointer-events-none opacity-50" : ""
                    }
                  />
                </PaginationItem>

                {/* Các trang */}
                {!isLoadingListNews &&
                  Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => {
                      // Nếu tổng số trang lớn, hiển thị rút gọn với Ellipsis
                      if (totalPages > 5) {
                        const firstPage = page === 1;
                        const lastPage = page === totalPages;
                        const nearCurrent = Math.abs(current - page) <= 1;

                        if (firstPage || lastPage || nearCurrent) {
                          return (
                            <PaginationItem key={page}>
                              <PaginationLink
                                isActive={current === page}
                                onClick={() => onPageChange(page)}
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        }

                        // Dấu "..." giữa các khoảng
                        if (
                          (page === 2 && current > 3) ||
                          (page === totalPages - 1 && current < totalPages - 2)
                        ) {
                          return (
                            <PaginationItem key={page}>
                              <PaginationEllipsis />
                            </PaginationItem>
                          );
                        }

                        return null;
                      }

                      // Trường hợp ít trang
                      return (
                        <PaginationItem key={page}>
                          <PaginationLink
                            isActive={current === page}
                            onClick={() => onPageChange(page)}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    }
                  )}

                {/* Nút Sau */}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => onPageChange(current + 1)}
                    aria-disabled={current === totalPages}
                    className={
                      current === totalPages
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          ) : (
            <div className="flex items-center justify-center py-8">
              <Spinner />
            </div>
          )}
        </div>
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
    <div className="my-8 px-4 md:px-6">
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
