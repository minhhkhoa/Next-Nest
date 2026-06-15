"use client";

import React, { useState } from "react";
import { format, subDays } from "date-fns";
import { vi } from "date-fns/locale";
import { Calendar as CalendarIcon, RefreshCw } from "lucide-react";
import { DateRange } from "react-day-picker";

import { useGetRecruiterStats } from "@/queries/useRecruiterDashboard";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";

//- import các component tab con
import OverviewTab from "./components/OverviewTab";
import JobsPerformanceTab from "./components/JobsPerformanceTab";

export default function PageRecruiterDashboard() {
  //- bộ lọc khoảng ngày mặc định 30 ngày gần đây
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  //- định dạng ngày để làm query params gửi lên api
  const startDateStr = date?.from ? format(date.from, "yyyy-MM-dd") : undefined;
  const endDateStr = date?.to ? format(date.to, "yyyy-MM-dd") : undefined;

  //- gọi api lấy dữ liệu thống kê từ server dành cho recruiter
  const {
    data: statsData,
    isLoading,
    refetch,
    isFetching,
  } = useGetRecruiterStats(startDateStr, endDateStr);

  //- định nghĩa fallback cho các trường dữ liệu kpi
  const kpis = statsData?.data?.kpis || {
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    pendingApplications: 0,
    totalSpent: 0,
  };

  const applicationsTrend = statsData?.data?.applicationsTrend || [];
  const applicationsStatusDistribution =
    statsData?.data?.applicationsStatusDistribution || [];
  const jobsPerformance = statsData?.data?.jobsPerformance || [];
  const recentApplications = statsData?.data?.recentApplications || [];

  //- giao diện chờ tải dữ liệu lần đầu
  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="text-center space-y-4">
          <Spinner className="w-10 h-10 mx-auto text-primary" />
          <p className="text-muted-foreground font-medium animate-pulse">
            Đang tải số liệu thống kê tuyển dụng...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 space-y-6">
      {/* phần tiêu đề chính & date filter */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Thống Kê Tuyển Dụng
          </h1>
          <p className="text-muted-foreground mt-1">
            Theo dõi hiệu suất tin tuyển dụng và xu hướng ứng tuyển của doanh
            nghiệp.
          </p>
        </div>

        {/* bộ lọc khoảng ngày chọn trực quan */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[260px] justify-start text-left font-normal border-indigo-200/60 shadow-sm hover:bg-indigo-50/50 hover:text-indigo-600 transition-colors",
                  !date && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 text-indigo-500" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "dd/MM/yyyy")} -{" "}
                      {format(date.to, "dd/MM/yyyy")}
                    </>
                  ) : (
                    format(date.from, "dd/MM/yyyy")
                  )
                ) : (
                  <span>Chọn khoảng ngày</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
                locale={vi}
              />
            </PopoverContent>
          </Popover>

          <Button
            size="icon"
            variant="outline"
            onClick={() => refetch()}
            disabled={isFetching}
            className="border-indigo-200/60 text-indigo-600 shadow-sm"
          >
            <RefreshCw
              className={cn("h-4 w-4", isFetching && "animate-spin")}
            />
          </Button>
        </div>
      </div>

      {/* thanh tab chuyển đổi giữa các màn hình chi tiết */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-2 bg-muted/80 p-1 rounded-xl h-auto md:h-11">
          <TabsTrigger
            value="overview"
            className="rounded-lg font-medium py-2 md:py-0"
          >
            Tổng Quan Hoạt Động
          </TabsTrigger>
          <TabsTrigger
            value="jobsPerformance"
            className="rounded-lg font-medium py-2 md:py-0"
          >
            Hiệu Quả Tin Tuyển Dụng
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Tổng quan */}
        <TabsContent value="overview" className="outline-none">
          <OverviewTab
            kpis={kpis}
            applicationsTrend={applicationsTrend}
            applicationsStatusDistribution={applicationsStatusDistribution}
            recentApplications={recentApplications}
          />
        </TabsContent>

        {/* Tab 2: Hiệu quả tin tuyển dụng */}
        <TabsContent value="jobsPerformance" className="outline-none">
          <JobsPerformanceTab jobsPerformance={jobsPerformance} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
