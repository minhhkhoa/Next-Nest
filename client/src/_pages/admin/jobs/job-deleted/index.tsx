"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import React, { useState } from "react";
import { useDebounce } from "use-debounce";
import { Spinner } from "@/components/ui/spinner";
import SoftSuccessSonner from "@/components/shadcn-studio/sonner/SoftSuccessSonner";
import { Link } from "@/i18n/navigation";
import { useGetJobsFilter, useRestoreJob } from "@/queries/useJob";
import { getJobColumns } from "../jobColumn";
import TableJob from "../tableJob";
import { SearchBar } from "../../NewsCategory/components/search-bar";

export default function PageAdminJobDeleted() {
  const [filtersJob, setFiltersJob] = useState<{
    title: string;
    fieldCompany: string;
    isDeleted: string;
  }>({
    title: "",
    fieldCompany: "",
    isDeleted: "true",
  });
  const [currentPage, setCurrentPage] = React.useState(1);

  const [debouncedSearchTitle] = useDebounce(filtersJob?.title, 500);
  const [debouncedSearchFieldCompany] = useDebounce(
    filtersJob?.fieldCompany,
    500,
  );

  const { data: listJob, isLoading: isLoadingJob } = useGetJobsFilter({
    currentPage,
    pageSize: 8,
    title: debouncedSearchTitle,
    isDeleted: filtersJob.isDeleted,
    fieldCompany: debouncedSearchFieldCompany,
  });

  const { mutateAsync: restoreJobMutation } = useRestoreJob();

  const handleRestoreJob = async (jobID: string) => {
    try {
      const res = await restoreJobMutation(jobID);

      if (res?.isError) return;

      SoftSuccessSonner(res?.message);
    } catch (error) {
      console.log("error handle restorJob: ", error);
    }
  };

  const columns = getJobColumns(undefined, undefined, handleRestoreJob);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="">
        <div className="mx-auto max-w-7xl px-5 py-8">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/admin/jobs">
                <Button variant="link" className="px-0">
                  <ArrowLeft size={20} />
                  Trở về
                </Button>
              </Link>
              <p className="text-3xl font-semibold text-foreground">
                Danh sách công việc đã xóa
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6">
        {/* khối lọc */}
        <div className="flex flex-col md:flex-row gap-3 pb-4">
          <div className="flex-1">
            <SearchBar
              value={filtersJob.title}
              onChange={(value) =>
                setFiltersJob((prev) => ({ ...prev, title: value }))
              }
              placeholder="Tìm theo tên công việc"
            />
          </div>

          <div className="flex-1">
            <SearchBar
              value={filtersJob.fieldCompany}
              onChange={(value) =>
                setFiltersJob((prev) => ({ ...prev, fieldCompany: value }))
              }
              placeholder="Tìm theo tên công ty, mst"
            />
          </div>
        </div>

        {/* Table */}
        {!isLoadingJob ? (
          <TableJob
            data={listJob?.data?.result ?? []}
            columns={columns}
            meta={
              listJob?.data?.meta ?? {
                current: 0,
                pageSize: 0,
                totalPages: 0,
                totalItems: 0,
              }
            }
            setCurrentPage={setCurrentPage}
          />
        ) : (
          <div className="flex justify-center">
            <Spinner />
          </div>
        )}
      </div>
    </div>
  );
}
