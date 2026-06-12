"use client";

import React, { useState, useMemo } from "react";
import { format, subDays } from "date-fns";
import { vi } from "date-fns/locale";
import { Calendar as CalendarIcon, RefreshCw } from "lucide-react";
import { DateRange } from "react-day-picker";

import { useGetAdminStats } from "@/queries/useDashboard";
import { useAdminVerifyCompany } from "@/queries/useCompany";
import { useAdminReplyIssue } from "@/queries/useIssue";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import SoftSuccessSonner from "@/components/shadcn-studio/sonner/SoftSuccessSonner";
import SoftDestructiveSonner from "@/components/shadcn-studio/sonner/SoftDestructiveSonner";
import { Spinner } from "@/components/ui/spinner";

//- import các component tab con đã được cắt nhỏ
import OverviewTab from "./components/OverviewTab";
import RevenueTab from "./components/RevenueTab";
import CompaniesTab from "./components/CompaniesTab";
import JobsTab from "./components/JobsTab";

//- danh sách màu sắc đồng bộ cho biểu đồ hình tròn
const CHART_COLORS = [
  "#3b82f6", //- màu xanh dương
  "#10b981", //- màu xanh lá
  "#f59e0b", //- màu vàng cam
  "#ef4444", //- màu đỏ
  "#8b5cf6", //- màu tím
];

export default function PageAdminDashboard() {
  //- bộ lọc khoảng ngày mặc định 30 ngày gần đây
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  //- định dạng ngày để làm query params
  const startDateStr = date?.from ? format(date.from, "yyyy-MM-dd") : undefined;
  const endDateStr = date?.to ? format(date.to, "yyyy-MM-dd") : undefined;

  //- gọi api lấy dữ liệu thống kê từ server
  const { data: statsData, isLoading, refetch, isFetching } = useGetAdminStats(startDateStr, endDateStr);

  //- các mutations phê duyệt nhanh
  const { mutateAsync: verifyCompany } = useAdminVerifyCompany();
  const { mutateAsync: replyIssue } = useAdminReplyIssue();

  //- duyệt công ty nhanh
  const handleVerifyCompany = async (companyId: string, action: "ACCEPT" | "REJECT") => {
    try {
      const res = await verifyCompany({ companyID: companyId, action });
      if (res.isError) {
        SoftDestructiveSonner(res.message || "Xử lý duyệt công ty thất bại");
      } else {
        SoftSuccessSonner(action === "ACCEPT" ? "Phê duyệt công ty thành công!" : "Từ chối công ty thành công!");
        refetch();
      }
    } catch (err) {
      console.error(err);
      SoftDestructiveSonner("Đã xảy ra lỗi khi duyệt công ty");
    }
  };

  //- giải quyết sự cố báo cáo nhanh
  const handleResolveIssue = async (issueId: string) => {
    try {
      await replyIssue({
        id: issueId,
        status: "RESOLVED",
        adminReply: "Yêu cầu đã được xử lý và giải quyết trực tiếp từ trang Dashboard Admin.",
      });
      SoftSuccessSonner("Giải quyết yêu cầu hỗ trợ thành công!");
      refetch();
    } catch (err) {
      console.error(err);
      SoftDestructiveSonner("Đã xảy ra lỗi khi giải quyết yêu cầu hỗ trợ");
    }
  };

  //- định nghĩa fallback cho các trường dữ liệu
  const kpis = statsData?.data?.kpis || {
    totalCandidates: 0,
    totalRecruiters: 0,
    totalCompanies: 0,
    pendingCompanies: 0,
    activeCompanies: 0,
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    totalRevenue: 0,
  };

  const registrationTrends = statsData?.data?.registrationTrends || [];
  const revenueTrends = statsData?.data?.revenueTrends?.trends || [];
  const revenueByProvider = statsData?.data?.revenueTrends?.byProvider || [];
  
  const companyStats = statsData?.data?.companyStats || {
    statusDistribution: [],
    topCompaniesByJobs: [],
    topCompaniesByBookings: [],
  };
  
  const jobStats = statsData?.data?.jobStats || {
    statusDistribution: [],
    byIndustry: [],
    bySkill: [],
    topViewedJobs: [],
    topAppliedJobs: [],
  };
  
  const quickApprovals = statsData?.data?.quickApprovals || {
    pendingCompanies: [],
    pendingIssues: [],
  };

  //- định dạng phân bổ trạng thái công ty phục vụ biểu đồ tròn
  const companyStatusChartData = useMemo(() => {
    return companyStats.statusDistribution.map((item: any) => ({
      name: item.status === "ACCEPT" ? "Đã duyệt" : "Chờ duyệt",
      value: item.count,
    }));
  }, [companyStats.statusDistribution]);

  //- giao diện chờ tải dữ liệu lần đầu
  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="text-center space-y-4">
          <Spinner className="w-10 h-10 mx-auto text-primary" />
          <p className="text-muted-foreground font-medium animate-pulse">Đang tải số liệu dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* phần tiêu đề chính & date filter */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Dashboard Quản Trị
          </h1>
          <p className="text-muted-foreground mt-1">
            Theo dõi hiệu suất hệ thống, doanh thu quảng cáo và các phê duyệt khẩn cấp.
          </p>
        </div>

        {/* date range picker */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[260px] justify-start text-left font-normal border-indigo-200/60 shadow-sm hover:bg-indigo-50/50 hover:text-indigo-600 transition-colors",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 text-indigo-500" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "dd/MM/yyyy")} - {format(date.to, "dd/MM/yyyy")}
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
            <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* tab list phân chia khu vực */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 bg-muted/80 p-1 rounded-xl h-11">
          <TabsTrigger value="overview" className="rounded-lg font-medium">Tổng Quan</TabsTrigger>
          <TabsTrigger value="revenue" className="rounded-lg font-medium">Doanh Thu Quảng Cáo</TabsTrigger>
          <TabsTrigger value="companies" className="rounded-lg font-medium">Thống Kê Doanh Nghiệp</TabsTrigger>
          <TabsTrigger value="jobs" className="rounded-lg font-medium">Thống Kê Việc Làm</TabsTrigger>
        </TabsList>

        {/* Tab 1: Tổng quan */}
        <TabsContent value="overview" className="outline-none">
          <OverviewTab
            kpis={kpis}
            registrationTrends={registrationTrends}
            quickApprovals={quickApprovals}
            handleVerifyCompany={handleVerifyCompany}
            handleResolveIssue={handleResolveIssue}
          />
        </TabsContent>

        {/* Tab 2: Doanh thu */}
        <TabsContent value="revenue" className="outline-none">
          <RevenueTab
            revenueTrends={revenueTrends}
            revenueByProvider={revenueByProvider}
            chartColors={CHART_COLORS}
          />
        </TabsContent>

        {/* Tab 3: Doanh nghiệp */}
        <TabsContent value="companies" className="outline-none">
          <CompaniesTab
            companyStats={companyStats}
            companyStatusChartData={companyStatusChartData}
          />
        </TabsContent>

        {/* Tab 4: Việc làm */}
        <TabsContent value="jobs" className="outline-none">
          <JobsTab jobStats={jobStats} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
