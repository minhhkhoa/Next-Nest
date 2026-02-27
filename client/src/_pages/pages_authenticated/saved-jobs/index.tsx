"use client";

import React, { useState } from "react";
import { useGetBookmarks } from "@/queries/useBookmark";
import JobCard from "@/_pages/home/components/JobCard";
import DataTablePagination from "@/components/DataTablePagination";
import ListJobSkeleton from "@/components/skeletons/list-job";

export default function PageSavedJobs() {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const { data: listBookmarks, isLoading } = useGetBookmarks({
    currentPage,
    pageSize,
    itemType: "job",
  });

  const savedJobs = listBookmarks?.data?.result || [];
  const meta = listBookmarks?.data?.meta;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isLoading) {
    return (
      <div className="my-5">
        <ListJobSkeleton />
      </div>
    );
  }

  if (savedJobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center my-5 py-16 text-center border rounded-lg bg-muted/20">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-8 h-8 text-muted-foreground"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-medium mb-2">Chưa có việc làm nào</h3>
        <p className="text-muted-foreground mb-6 max-w-sm">
          Bạn chưa lưu việc làm nào. Hãy tìm kiếm việc làm và lưu lại để xem
          sau.
        </p>
      </div>
    );
  }

  return (
    <div className="container py-8 mx-auto space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Việc làm đã lưu</h1>
        <p className="text-muted-foreground">
          Danh sách các công việc bạn đã đánh dấu quan tâm.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {savedJobs &&
          savedJobs.map(
            (bookmark) =>
              bookmark.job && <JobCard key={bookmark._id} job={bookmark.job} />,
          )}
      </div>

      <div className="flex justify-center mt-8">
        {meta && (
          <DataTablePagination meta={meta} onPageChange={handlePageChange} />
        )}
      </div>
    </div>
  );
}
