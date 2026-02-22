"use client";

import React, { useState } from "react";
import { useGetJobsFilterPublic } from "@/queries/useJob";
import JobCard from "./JobCard";
import DataTablePagination from "@/components/DataTablePagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function JobsWithFilterSection() {
  const [page, setPage] = useState(1);
  const pageSize = 12;
  
  // Filter states
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("all"); 
  const [level, setLevel] = useState("all");

  // Fetch logic with debounce could be better, but direct binding for now
  const { data, isLoading } = useGetJobsFilterPublic({
    currentPage: page,
    pageSize,
    title: keyword,
  });

  const jobs = data?.data?.result || [];
  const meta = data?.data?.meta || { 
      current: 1, pageSize: 8, totalPages: 1, totalItems: 0 
  };
  
  const handleSearch = () => {
      setPage(1); // Reset to page 1 on search
      // Trigger refetch automatically by changing Query Key dependencies?
      // Yes, keyword is in params if I include it.
      // But wait, useGetJobsFilter takes params argument.
      // I need to update the hook usage.
  };

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 gap-4">
             <div>
                <h2 className="text-3xl font-bold text-primary relative pl-4 border-l-4 border-primary mb-2">
                    Việc làm mới nhất
                </h2>
                <p className="text-muted-foreground pl-4">Cập nhật liên tục các cơ hội nghề nghiệp mới nhất</p>
            </div>
            
            {/* Filter Bar */}
            <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                <div className="relative min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                        placeholder="Tìm theo tên..." 
                        className="pl-9 bg-background" 
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && setPage(1)}
                    />
                </div>
                 <Select value={location} onValueChange={(val) => {setLocation(val); setPage(1)}}>
                    <SelectTrigger className="w-[180px] bg-background">
                        <SelectValue placeholder="Địa điểm" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả địa điểm</SelectItem>
                        <SelectItem value="ha-noi">Hà Nội</SelectItem>
                        <SelectItem value="ho-chi-minh">Hồ Chí Minh</SelectItem>
                    </SelectContent>
                </Select>
                 <Select value={level} onValueChange={(val) => {setLevel(val); setPage(1)}}>
                    <SelectTrigger className="w-[180px] bg-background">
                        <SelectValue placeholder="Cấp bậc" />
                    </SelectTrigger>
                    <SelectContent>
                         <SelectItem value="all">Tất cả cấp bậc</SelectItem>
                        <SelectItem value="Intern">Intern</SelectItem>
                        <SelectItem value="Fresher">Fresher</SelectItem>
                        <SelectItem value="Junior">Junior</SelectItem>
                        <SelectItem value="Middle">Middle</SelectItem>
                        <SelectItem value="Senior">Senior</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex flex-col space-y-3">
                <Skeleton className="h-[125px] w-full rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))}
          </div>
        ) : jobs.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
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
          <div className="text-center py-12 text-muted-foreground bg-background rounded-lg border border-dashed">
            Không tìm thấy công việc phù hợp.
          </div>
        )}
      </div>
    </section>
  );
}
