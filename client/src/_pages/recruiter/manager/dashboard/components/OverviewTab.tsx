"use client";

import React, { useMemo } from "react";
import { format } from "date-fns";
import {
  Briefcase,
  FileText,
  Clock,
  TrendingUp,
  BarChart3,
  ChevronRight,
  User,
} from "lucide-react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

//- custom tooltip cho biểu đồ xu hướng nhận đơn ứng tuyển
const CustomTooltipTrend = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    let title = label;
    if (label && !isNaN(Date.parse(label)) && label.includes("-")) {
      title = format(new Date(label), "dd/MM/yyyy");
    }
    return (
      <div className="bg-popover border border-primary text-popover-foreground p-3 rounded-lg shadow-lg opacity-100 z-50">
        {title && <p className="font-bold text-sm mb-1">{title}</p>}
        {payload.map((pld: any, index: number) => (
          <p key={index} className="text-xs text-muted-foreground">
            Số hồ sơ nhận được: <span className="font-bold text-foreground">{pld.value.toLocaleString()}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

//- custom tooltip cho biểu đồ phân bố trạng thái cv
const CustomTooltipStatus = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-popover border border-primary text-popover-foreground p-3 rounded-lg shadow-lg opacity-100 z-50">
        <p className="font-bold text-sm mb-1">{data.name}</p>
        <p className="text-xs text-muted-foreground">
          Số lượng: <span className="font-bold text-foreground">{data.value.toLocaleString()} hồ sơ</span>
        </p>
      </div>
    );
  }
  return null;
};

//- định nghĩa màu sắc tương ứng cho từng trạng thái của biểu đồ tròn
const getStatusPieColor = (name: string) => {
  switch (name) {
    case "Chờ duyệt":
      return "#f59e0b";
    case "Đã duyệt":
      return "#10b981";
    case "Từ chối":
      return "#ef4444";
    case "Phỏng vấn":
      return "#3b82f6";
    default:
      return "#64748b";
  }
};


//- định dạng nhãn trạng thái từ tiếng anh sang tiếng việt
const getStatusLabelAndColor = (status: string) => {
  switch (status.toUpperCase()) {
    case "PENDING":
      return { label: "Chờ duyệt", color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" };
    case "APPROVED":
      return { label: "Đã duyệt", color: "bg-green-500/10 text-green-500 border-green-500/20" };
    case "REJECTED":
      return { label: "Từ chối", color: "bg-red-500/10 text-red-500 border-red-500/20" };
    case "INTERVIEWING":
      return { label: "Phỏng vấn", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" };
    default:
      return { label: status, color: "bg-slate-500/10 text-slate-500 border-slate-500/20" };
  }
};

interface OverviewTabProps {
  kpis: {
    totalJobs: number;
    activeJobs: number;
    totalApplications: number;
    pendingApplications: number;
    totalSpent: number;
  };
  applicationsTrend: any[];
  applicationsStatusDistribution: any[];
  recentApplications: any[];
}

export default function OverviewTab({
  kpis,
  applicationsTrend,
  applicationsStatusDistribution,
  recentApplications,
}: OverviewTabProps) {
  //- tính toán dữ liệu hiển thị trạng thái phục vụ biểu đồ tròn
  const statusChartData = useMemo(() => {
    return applicationsStatusDistribution.map((item: any) => {
      const { label } = getStatusLabelAndColor(item.status);
      return {
        name: label,
        value: item.count,
        status: item.status,
      };
    });
  }, [applicationsStatusDistribution]);

  return (
    <div className="space-y-6">
      {/* hàng thẻ kpi tổng quan */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* tin tuyển dụng */}
        <Card className="shadow-sm hover:shadow-md transition-all border-l-4 border-l-blue-500 py-2 bg-card/70 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
              Tin Tuyển Dụng
            </CardTitle>
            <Briefcase className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {kpis.activeJobs.toLocaleString()} / {kpis.totalJobs.toLocaleString()}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Tin tuyển dụng đang hoạt động
            </p>
          </CardContent>
        </Card>

        {/* tổng đơn ứng tuyển */}
        <Card className="shadow-sm hover:shadow-md transition-all border-l-4 border-l-teal-500 py-2 bg-card/70 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
              Tổng CV Nhận Được
            </CardTitle>
            <FileText className="h-4 w-4 text-teal-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {kpis.totalApplications.toLocaleString()}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Hồ sơ ứng viên đã nộp
            </p>
          </CardContent>
        </Card>

        {/* đơn ứng tuyển chờ xử lý */}
        <Card className="shadow-sm hover:shadow-md transition-all border-l-4 border-l-indigo-500 py-2 bg-card/70 backdrop-blur-sm bg-gradient-to-br from-indigo-500/5 to-transparent">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
              Hồ Sơ Chờ Duyệt
            </CardTitle>
            <Clock className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {kpis.pendingApplications.toLocaleString()}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Hồ sơ cần duyệt khẩn cấp
            </p>
          </CardContent>
        </Card>
      </div>

      {/* hàng biểu đồ phân tích */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* biểu đồ xu hướng ứng tuyển */}
        <Card className="md:col-span-2 shadow-sm py-2 bg-card/50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Xu Hướng Nộp Hồ Sơ</CardTitle>
                <CardDescription>
                  Số lượng đơn ứng tuyển nhận được theo ngày trong khoảng thời gian đã chọn
                </CardDescription>
              </div>
              <TrendingUp className="h-5 w-5 text-indigo-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[320px] w-full mt-4">
              {applicationsTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={applicationsTrend}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="colorApps"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="hsl(var(--primary))"
                          stopOpacity={0.2}
                        />
                        <stop
                          offset="95%"
                          stopColor="hsl(var(--primary))"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="date"
                      className="text-xs text-muted-foreground"
                      tickFormatter={(value) => {
                        if (value && value.includes("-")) {
                          const parts = value.split("-");
                          return `${parts[2]}/${parts[1]}`;
                        }
                        return value;
                      }}
                    />
                    <YAxis className="text-xs text-muted-foreground" allowDecimals={false} />
                    <Tooltip
                      content={<CustomTooltipTrend />}
                      cursor={{ stroke: "hsl(var(--primary))", strokeWidth: 1, strokeDasharray: "4 4" }}
                    />
                    <Area
                      name="Hồ sơ ứng tuyển"
                      type="monotone"
                      dataKey="count"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorApps)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                  Không có dữ liệu xu hướng nộp hồ sơ trong khoảng thời gian này.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* biểu đồ tròn phân bố trạng thái cv */}
        <Card className="shadow-sm py-2 bg-card/50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Trạng Thái Hồ Sơ</CardTitle>
                <CardDescription>
                  Phân bố trạng thái của các CV nộp vào doanh nghiệp
                </CardDescription>
              </div>
              <BarChart3 className="h-5 w-5 text-teal-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-4">
              {/* phần vẽ biểu đồ tròn */}
              <div className="h-[200px] w-[200px] relative shrink-0">
                {statusChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusChartData}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={8}
                        dataKey="value"
                        stroke="none"
                      >
                        {statusChartData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={getStatusPieColor(entry.name)} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltipStatus />} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                    Không có dữ liệu phân bố trạng thái.
                  </div>
                )}
              </div>

              {/* phần chú thích chi tiết */}
              <div className="space-y-3 w-full max-w-xs">
                {statusChartData.map((item: any) => (
                  <div key={item.name} className="flex items-center justify-between border-b border-muted pb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: getStatusPieColor(item.name) }} />
                      <span className="font-medium text-sm text-foreground">{item.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-muted-foreground">{item.value} hồ sơ</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* danh sách CV mới nộp cần duyệt gấp */}
      <Card className="shadow-sm py-2 bg-card/50">
        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-lg">Hồ Sơ Ứng Tuyển Mới</CardTitle>
            <CardDescription>
              Danh sách 5 đơn ứng tuyển mới nộp gần đây nhất của doanh nghiệp.
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild className="border-indigo-100 shadow-sm hover:text-indigo-600">
            <Link href="/recruiter/manager/application">
              Quản lý CV <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            {recentApplications.length > 0 ? (
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-muted text-muted-foreground text-xs font-semibold uppercase">
                    <th className="py-3 px-4">Ứng Viên</th>
                    <th className="py-3 px-4">Vị Trí Ứng Tuyển</th>
                    <th className="py-3 px-4">Thời Gian Nộp</th>
                    <th className="py-3 px-4">Trạng Thái</th>
                    <th className="py-3 px-4 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-muted/60">
                  {recentApplications.map((app) => {
                    const statusInfo = getStatusLabelAndColor(app.status);
                    return (
                      <tr key={app.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3.5 px-4 flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={app.candidateAvatar} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {app.candidateName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold text-foreground">{app.candidateName}</div>
                            <div className="text-xs text-muted-foreground">{app.candidateEmail}</div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-foreground">
                          {app.jobTitle}
                        </td>
                        <td className="py-3.5 px-4 text-muted-foreground">
                          {format(new Date(app.createdAt), "dd/MM/yyyy HH:mm")}
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge className={`${statusInfo.color} font-medium border`}>
                            {statusInfo.label}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Button size="sm" variant="ghost" className="hover:text-indigo-600 hover:bg-indigo-50/50" asChild>
                            <Link href="/recruiter/manager/application">
                              Xem CV
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 space-y-2 text-muted-foreground">
                <User className="h-10 w-10 text-muted-foreground/50" />
                <p className="text-sm font-medium">Chưa nhận được hồ sơ ứng tuyển nào.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
