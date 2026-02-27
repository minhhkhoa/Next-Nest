"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useGetJobsFilterPublic } from "@/queries/useJob";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, DollarSign, Briefcase } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import DataTablePagination from "@/components/DataTablePagination";
import ListJobSkeleton from "@/components/skeletons/list-job";
import { generateSlugUrl } from "@/lib/utils";
import { useGetLang } from "@/hooks/use-get-lang";
import BookmarkJobButton from "@/components/BookmarkJobButton";

interface CompanyJobsProps {
  companyId: string;
}

export default function CompanyJobs({ companyId }: CompanyJobsProps) {
  const { getLang } = useGetLang();
  const [currentPage, setCurrentPage] = useState(1);
  const { data: jobsData, isLoading } = useGetJobsFilterPublic({
    currentPage: currentPage,
    pageSize: 6,
    fieldCompany: companyId,
  });

  const result = jobsData?.data;
  const jobs = result?.result || [];
  const meta = result?.meta;

  if (isLoading) {
    return <ListJobSkeleton />;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Briefcase className="text-primary" />
        Vị trí đang tuyển dụng
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2  gap-6">
        {jobs.map((job) => (
          <div key={job._id} className="relative group block">
            <Link
              href={`/jobs/${generateSlugUrl({
                name: getLang(job.slug),
                id: job._id,
              })}`}
              className="block group h-full"
            >
              <Card className="hover:shadow-md transition-all duration-300 border-l-4 border-l-transparent hover:border-l-primary cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Logo Container */}
                    <div className="relative w-16 h-16 md:w-20 md:h-20 shrink-0 border rounded-lg overflow-hidden bg-white">
                      <Image
                        src={
                          job.company?.logo ||
                          "/image_template/default-logo.png"
                        }
                        alt={`${job.company?.name} logo`}
                        fill
                        className="object-contain p-1"
                      />
                    </div>

                    <div className="flex-1 flex flex-col md:flex-row justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <h3 className="text-xl font-bold group-hover:text-primary transition-colors line-clamp-1">
                          {getLang(job.title)}
                        </h3>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <DollarSign size={16} className="text-green-600" />
                            <span className="font-medium text-green-700 dark:text-green-400">
                              {job.salary?.min} - {job.salary?.max}{" "}
                              {job.salary?.currency}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin size={16} />
                            <span>{job.location}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock size={16} />
                            <span>
                              {job.endDate
                                ? format(new Date(job.endDate), "dd/MM/yyyy", {
                                    locale: vi,
                                  })
                                : "Không thời hạn"}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-2">
                          {job.level && (
                            <Badge variant="outline" className="bg-muted/50">
                              {job.level}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col justify-end items-end gap-2 shrink-0">
                        <Button className="w-full md:w-auto">
                          Ứng tuyển ngay
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <div className="absolute top-2 right-2 z-20">
              <BookmarkJobButton jobId={job._id} />
            </div>
          </div>
        ))}
      </div>

      <div className="pt-4 flex justify-end">
        {meta && (
          <DataTablePagination meta={meta} onPageChange={setCurrentPage} />
        )}
      </div>
    </div>
  );
}
