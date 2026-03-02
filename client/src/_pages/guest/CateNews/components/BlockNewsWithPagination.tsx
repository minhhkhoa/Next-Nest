import React from "react";
import { formatDateInput, generateSlugUrl } from "@/lib/utils";
import { NewsResFilterType } from "@/schemasvalidation/NewsCategory";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { PenIcon } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import DataTablePagination from "@/components/DataTablePagination";

export interface BlockNewsWithPaginationProps {
  listNews: NewsResFilterType[];
  meta: {
    current: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
  };
  isLoadingListNews: boolean;
  onPageChange: (page: number) => void;
  textTitle?: string;
}

export default function BlockNewsWithPagination({
  listNews,
  meta,
  isLoadingListNews,
  onPageChange,
  textTitle,
}: BlockNewsWithPaginationProps) {
  return (
    <div className="my-10">
      <div className="mb-6 md:mb-8">
        <span className="text-xl md:text-3xl lg:text-4xl font-bold text-primary text-balance">
          {textTitle || "Danh sách bài viết"}
        </span>
        <div className="h-1 w-[165px] md:w-[248px] bg-primary rounded-full mt-2"></div>
      </div>
      {!isLoadingListNews ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {listNews?.map((newsItem) => (
            <Link
              href={`/news/${generateSlugUrl({
                name: newsItem.slugNews.vi,
                id: newsItem._id,
              })}`}
              key={newsItem._id}
              className="flex flex-col gap-2"
            >
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
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center py-8">
          <Spinner />
        </div>
      )}

      <DataTablePagination meta={meta} onPageChange={onPageChange} />
    </div>
  );
}
