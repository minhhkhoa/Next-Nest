"use client";

import React from "react";
import { format } from "date-fns";
import {
  Users,
  Briefcase,
  FileText,
  DollarSign,
  TrendingUp,
  Building,
  AlertCircle,
} from "lucide-react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";


const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    let title = label;
    if (label && !isNaN(Date.parse(label)) && label.includes("-")) {
      title = format(new Date(label), "dd/MM/yyyy");
    }
    return (
      <div className="bg-popover border border-primary text-popover-foreground p-3 rounded-lg shadow-lg opacity-100 z-50">
        {title && <p className="font-bold text-sm mb-1">{title}</p>}
        {payload.map((pld: any, index: number) => {
          const name = pld.name;
          const formattedValue = `${pld.value.toLocaleString()} tài khoản`;
          return (
            <p key={index} className="text-xs text-muted-foreground">
              {name}: <span className="font-bold text-foreground">{formattedValue}</span>
            </p>
          );
        })}
      </div>
    );
  }
  return null;
};

interface OverviewTabProps {
  kpis: {
    totalCandidates: number;
    totalRecruiters: number;
    totalCompanies: number;
    pendingCompanies: number;
    activeCompanies: number;
    totalJobs: number;
    activeJobs: number;
    totalApplications: number;
    totalRevenue: number;
  };
  registrationTrends: any[];
  quickApprovals: {
    pendingCompanies: any[];
    pendingIssues: any[];
  };
  handleVerifyCompany: (id: string, action: "ACCEPT" | "REJECT") => void;
  handleResolveIssue: (id: string) => void;
}

export default function OverviewTab({
  kpis,
  registrationTrends,
  quickApprovals,
  handleVerifyCompany,
  handleResolveIssue,
}: OverviewTabProps) {
  return (
    <div className="space-y-6">
      {/* hàng thẻ kpi tổng quan */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm hover:shadow-md transition-all border-l-4 border-l-blue-500 py-2 bg-card/70 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
              Ứng Viên
            </CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {kpis.totalCandidates.toLocaleString()}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Tài khoản đang hoạt động
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-all border-l-4 border-l-teal-500 py-2 bg-card/70 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
              Nhà Tuyển Dụng
            </CardTitle>
            <Briefcase className="h-4 w-4 text-teal-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {kpis.totalRecruiters.toLocaleString()}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              HR & HR Admin hệ thống
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-all border-l-4 border-l-indigo-500 py-2 bg-card/70 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
              Tin Tuyển Dụng
            </CardTitle>
            <FileText className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {kpis.activeJobs.toLocaleString()} /{" "}
              {kpis.totalJobs.toLocaleString()}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Tin tuyển dụng đang hoạt động
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-all border-l-4 border-l-amber-500 py-2 bg-card/70 backdrop-blur-sm bg-gradient-to-br from-amber-500/5 to-transparent">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase">
              Doanh Thu Ads
            </CardTitle>
            <DollarSign className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {kpis.totalRevenue.toLocaleString("vi-VN")}đ
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Đặt lịch quảng cáo AdBooking
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* biểu đồ xu hướng đăng ký người dùng mới */}
        <Card className="md:col-span-2 shadow-sm py-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Xu Hướng Đăng Ký Mới</CardTitle>
                <CardDescription>
                  Số lượng ứng viên, nhà tuyển dụng và công ty đăng ký mới
                </CardDescription>
              </div>
              <TrendingUp className="h-5 w-5 text-indigo-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[320px] w-full">
              {registrationTrends.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={registrationTrends}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="colorCandidates"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#3b82f6"
                          stopOpacity={0.2}
                        />
                        <stop
                          offset="95%"
                          stopColor="#3b82f6"
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient
                        id="colorRecruiters"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#10b981"
                          stopOpacity={0.2}
                        />
                        <stop
                          offset="95%"
                          stopColor="#10b981"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="var(--border)"
                      opacity={0.6}
                    />
                    <XAxis
                      dataKey="date"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) =>
                        format(new Date(value), "dd/MM")
                      }
                    />
                    <YAxis
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      content={<CustomTooltip />}
                      cursor={{ stroke: "hsl(var(--primary))", strokeWidth: 1, strokeDasharray: "4 4" }}
                    />
                    <Legend verticalAlign="top" height={36} iconType="circle" />
                    <Area
                      name="Ứng viên"
                      type="monotone"
                      dataKey="candidates"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorCandidates)"
                    />
                    <Area
                      name="Nhà tuyển dụng"
                      type="monotone"
                      dataKey="recruiters"
                      stroke="#10b981"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorRecruiters)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground italic text-sm">
                  Không có dữ liệu trong khoảng thời gian này
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* thống kê tỷ lệ chờ duyệt */}
        <Card className="shadow-sm py-2">
          <CardHeader>
            <CardTitle className="text-lg">Tỷ Lệ Chờ Duyệt</CardTitle>
            <CardDescription>Tình trạng kiểm duyệt hệ thống</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-2">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-muted-foreground">
                  Doanh nghiệp chờ duyệt
                </span>
                <span className="font-bold text-amber-600 dark:text-amber-400">
                  {kpis.pendingCompanies}
                </span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 transition-all"
                  style={{
                    width: `${
                      kpis.totalCompanies > 0
                        ? (kpis.pendingCompanies / kpis.totalCompanies) * 100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-muted-foreground">
                  Công ty đang hoạt động
                </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {kpis.activeCompanies}
                </span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all"
                  style={{
                    width: `${
                      kpis.totalCompanies > 0
                        ? (kpis.activeCompanies / kpis.totalCompanies) * 100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="border-t border-border pt-4 space-y-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Tổng đơn ứng tuyển đã nộp:</span>
                <span className="font-bold text-foreground text-sm">
                  {kpis.totalApplications}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Tổng số công ty đăng ký:</span>
                <span className="font-bold text-foreground text-sm">
                  {kpis.totalCompanies}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* khu vực duyệt nhanh (quick approvals) */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* doanh nghiệp chờ duyệt */}
        <Card className="shadow-sm py-2">
          <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5 text-amber-500" />
              <div>
                <CardTitle className="text-base font-semibold">
                  Doanh Nghiệp Chờ Duyệt Mới
                </CardTitle>
                <CardDescription>
                  Yêu cầu xác minh công ty cần xử lý gấp
                </CardDescription>
              </div>
            </div>
            <Link href="/admin/company?statusFilterCompany=PENDING">
              <Button variant="ghost" size="sm" className="text-xs text-primary hover:text-primary/80 h-8">
                Xem tất cả
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {quickApprovals.pendingCompanies.length > 0 ? (
              //- sử dụng scrollarea giới hạn chiều cao tối đa là 350px và hỗ trợ cuộn cho khối doanh nghiệp chờ duyệt
              <ScrollArea className="max-h-[350px]">
                <div className="divide-y">
                  {quickApprovals.pendingCompanies.map((company: any) => (
                    <div
                      key={company.id}
                      className="flex items-center justify-between p-4 hover:bg-accent/50 transition-colors border-b border-border last:border-0"
                    >
                      <div className="space-y-1">
                        <Link href="/admin/company?statusFilterCompany=PENDING" className="hover:underline hover:text-primary">
                          <p className="text-sm font-semibold">
                            {company.name}
                          </p>
                        </Link>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>MST: {company.taxCode}</span>
                          <span>•</span>
                          <span>
                            {format(
                              new Date(company.createdAt),
                              "dd/MM/yyyy HH:mm",
                            )}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-500 hover:text-red-600 hover:bg-red-500/10 text-xs px-2.5 h-8 border-destructive/30"
                          onClick={() =>
                            handleVerifyCompany(company.id, "REJECT")
                          }
                        >
                          Từ chối
                        </Button>
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-2.5 h-8"
                          onClick={() =>
                            handleVerifyCompany(company.id, "ACCEPT")
                          }
                        >
                          Duyệt
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="p-8 text-center text-muted-foreground italic text-sm">
                Không có doanh nghiệp nào đang chờ duyệt
              </div>
            )}
          </CardContent>
        </Card>

        {/* yêu cầu hỗ trợ (issue) chưa giải quyết */}
        <Card className="shadow-sm py-2">
          <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <div>
                <CardTitle className="text-base font-semibold">
                  Báo Cáo Sự Cố Mới Nhất
                </CardTitle>
                <CardDescription>
                  Khiếu nại và yêu cầu hỗ trợ kỹ thuật từ người dùng
                </CardDescription>
              </div>
            </div>
            <Link href="/admin/issue?statusFilterIssue=PENDING">
              <Button variant="ghost" size="sm" className="text-xs text-primary hover:text-primary/80 h-8">
                Xem tất cả
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {quickApprovals.pendingIssues.length > 0 ? (
              //- sử dụng scrollarea giới hạn chiều cao tối đa là 350px và hỗ trợ cuộn cho khối báo cáo sự cố mới nhất
              <ScrollArea className="max-h-[350px]">
                <div className="divide-y border-border">
                  {quickApprovals.pendingIssues.map((issue: any) => (
                    <div
                      key={issue.id}
                      className="flex items-center justify-between p-4 hover:bg-accent/50 transition-colors border-b border-border last:border-0"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Link href="/admin/issue?statusFilterIssue=PENDING" className="hover:underline hover:text-primary">
                            <p className="text-sm font-semibold">
                              {issue.title?.vi || issue.title?.en || "N/A"}
                            </p>
                          </Link>
                          <Badge
                            variant="outline"
                            className="text-[10px] py-0 px-1.5 uppercase font-semibold text-red-500 border-red-500/30 bg-red-500/10"
                          >
                            {issue.type}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>Người gửi: {issue.createdBy}</span>
                          <span>•</span>
                          <span>
                            {format(
                              new Date(issue.createdAt),
                              "dd/MM/yyyy HH:mm",
                            )}
                          </span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-primary/30 text-primary hover:bg-primary/10 text-xs px-3 h-8"
                        onClick={() => handleResolveIssue(issue.id)}
                      >
                        Giải quyết nhanh
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="p-8 text-center text-muted-foreground italic text-sm">
                Không có báo cáo sự cố nào cần xử lý
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
