"use client";

import React, { useState } from "react";
import { useGetBookmarks } from "@/queries/useBookmark";
import JobCard from "@/_pages/home/components/JobCard";
import DataTablePagination from "@/components/DataTablePagination";
import ListJobSkeleton from "@/components/skeletons/list-job";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BriefcaseBusiness, Building2, MapPin } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { generateSlugUrl } from "@/lib/utils";

export default function PageSavedJobs() {
  const [pageJobs, setPageJobs] = useState(1);
  const [pageCompanies, setPageCompanies] = useState(1);
  const pageSize = 8;

  const { data: listBookmarksJobs, isLoading: isLoadingJobs } = useGetBookmarks(
    {
      currentPage: pageJobs,
      pageSize,
      itemType: "job",
    },
  );

  const { data: listBookmarksCompanies, isLoading: isLoadingCompanies } =
    useGetBookmarks({
      currentPage: pageCompanies,
      pageSize,
      itemType: "company",
    });

  const savedJobs = listBookmarksJobs?.data?.result || [];
  const metaJobs = listBookmarksJobs?.data?.meta;

  const followCompanies = listBookmarksCompanies?.data?.result || [];
  const metaCompanies = listBookmarksCompanies?.data?.meta;

  console.log("followCompanies: ", followCompanies);

  const handlePageJobsChange = (page: number) => {
    setPageJobs(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePageCompaniesChange = (page: number) => {
    setPageCompanies(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="container py-8 mx-auto space-y-8 min-h-[70vh]">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Mục đã lưu</h1>
        <p className="text-muted-foreground">
          Quản lý việc làm bạn đã lưu và các công ty bạn đang theo dõi.
        </p>
      </div>

      <Tabs defaultValue="jobs" className="w-full">
        <TabsList className="!h-12 mb-8 w-full max-w-sm grid grid-cols-2 rounded-lg bg-muted/50">
          <TabsTrigger
            value="jobs"
            className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm flex items-center justify-center gap-2 py-2"
          >
            <BriefcaseBusiness className="w-4 h-4" />
            Việc làm
            {metaJobs?.totalItems !== undefined && (
              <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                {metaJobs.totalItems}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="companies"
            className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm flex items-center justify-center gap-2 py-2"
          >
            <Building2 className="w-4 h-4" />
            Công ty
            {metaCompanies?.totalItems !== undefined && (
              <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                {metaCompanies.totalItems}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="jobs"
          className="space-y-6 focus-visible:outline-none focus-visible:ring-0"
        >
          {isLoadingJobs ? (
            <div className="my-5">
              <ListJobSkeleton />
            </div>
          ) : savedJobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center my-10 py-16 text-center border-2 border-dashed rounded-xl bg-card">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <BriefcaseBusiness className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-medium mb-2">
                Chưa lưu việc làm nào
              </h3>
              <p className="text-muted-foreground mb-6 max-w-sm">
                Bạn chưa lưu việc làm nào. Hãy tìm kiếm việc làm và ấn lưu để
                xem lại sau nhé.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {savedJobs.map(
                  (bookmark: any) =>
                    bookmark.job && (
                      <JobCard key={bookmark._id} job={bookmark.job} />
                    ),
                )}
              </div>

              {metaJobs && metaJobs.totalPages > 1 && (
                <div className="flex justify-center mt-8">
                  <DataTablePagination
                    meta={metaJobs}
                    onPageChange={handlePageJobsChange}
                  />
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent
          value="companies"
          className="space-y-6 focus-visible:outline-none focus-visible:ring-0"
        >
          {isLoadingCompanies ? (
            <div className="my-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-48 rounded-xl bg-muted animate-pulse"
                ></div>
              ))}
            </div>
          ) : followCompanies.length === 0 ? (
            <div className="flex flex-col items-center justify-center my-10 py-16 text-center border-2 border-dashed rounded-xl bg-card">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Building2 className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-medium mb-2">
                Chưa theo dõi công ty nào
              </h3>
              <p className="text-muted-foreground mb-6 max-w-sm">
                Bạn chưa theo dõi công ty nào. Cập nhật các nhà tuyển dụng hàng
                đầu để không bỏ lỡ cơ hội.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {followCompanies.map(
                  (company) =>
                    company?.companyDetail && (
                      <Link
                        key={company?._id}
                        href={`/company/${generateSlugUrl({
                          name: company.companyDetail.slug!,
                          id: company.companyDetail._id,
                        })}`}
                        className="group flex flex-col items-center text-center bg-card border hover:border-primary/50 rounded-xl p-6 transition-all hover:shadow-md cursor-pointer"
                      >
                        <div className="w-20 h-20 mb-4 p-2 bg-white rounded-lg border shadow-sm group-hover:scale-105 transition-transform">
                          <Image
                            width={80}
                            height={80}
                            src={
                              company?.companyDetail?.logo || "/placeholder.png"
                            }
                            alt={company?.companyDetail?.name || "Company Logo"}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <h3 className="text-lg font-semibold line-clamp-2 min-h-[3.5rem] flex items-center group-hover:text-primary transition-colors">
                          {company?.companyDetail?.name}
                        </h3>
                        {company?.companyDetail?.address && (
                          <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mt-2 w-full">
                            <MapPin className="w-3.5 h-3.5 shrink-0" />
                            <p className="line-clamp-1 truncate">
                              {company?.companyDetail?.address}
                            </p>
                          </div>
                        )}
                      </Link>
                    ),
                )}
              </div>

              {metaCompanies && metaCompanies.totalPages > 1 && (
                <div className="flex justify-center mt-8">
                  <DataTablePagination
                    meta={metaCompanies}
                    onPageChange={handlePageCompaniesChange}
                  />
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
