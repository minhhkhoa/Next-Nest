"use client";

import React, { useState } from "react";
import { useGetJobsFilterPublic } from "@/queries/useJob";
import JobCard from "./JobCard";
import DataTablePagination from "@/components/DataTablePagination";
import ListJobSkeleton from "@/components/skeletons/list-job";

export default function HotJobsSection() {
  const [page, setPage] = useState(1);
  const { data: listJobs, isLoading } = useGetJobsFilterPublic({
    currentPage: page,
    pageSize: 8,
    isHot: "true",
  });

  const jobs = listJobs?.data?.result || [];
  const meta = listJobs?.data?.meta || {
    current: 1,
    pageSize: 8,
    totalPages: 1,
    totalItems: 0,
  };

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto">
        <div className="flex flex-col gap-3 mb-10">
          <h2 className="text-3xl font-bold text-primary relative pl-4 border-l-4 border-primary">
            Công việc nổi bật
          </h2>
          <p className="text-muted-foreground">
            Những cơ hội nghề nghiệp hấp dẫn đang chờ đón bạn
          </p>
        </div>

        {isLoading ? (
          <ListJobSkeleton />
        ) : jobs.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {jobs.map((job: any) => (
                <JobCard key={job._id} job={job} />
              ))}
            </div>

            <div className="mt-8 flex justify-center">
              <DataTablePagination
                meta={meta}
                onPageChange={(p) => setPage(p)}
              />
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            Không tìm thấy công việc nổi bật nào.
          </div>
        )}
      </div>
    </section>
  );
}
