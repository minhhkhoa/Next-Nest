"use client";

import React from "react";
import { BarChart3, HelpCircle } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

//- custom tooltip hiển thị chi tiết chỉ số tương tác và tỷ lệ chuyển đổi
const CustomTooltipJobs = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const views =
      payload.find((pld: any) => pld.dataKey === "views")?.value || 0;
    const applied =
      payload.find((pld: any) => pld.dataKey === "applied")?.value || 0;
    const conversionRate =
      views > 0 ? ((applied / views) * 100).toFixed(1) : "0.0";

    return (
      <div className="bg-popover border border-primary text-popover-foreground p-3 rounded-lg shadow-lg opacity-100 z-50">
        <p className="font-bold text-sm mb-2">{label}</p>
        <p className="text-xs text-muted-foreground">
          Lượt xem:{" "}
          <span className="font-bold text-blue-500">
            {views.toLocaleString()}
          </span>
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Lượt nộp CV:{" "}
          <span className="font-bold text-violet-500">
            {applied.toLocaleString()}
          </span>
        </p>
        <p className="text-xs text-muted-foreground mt-1.5 pt-1.5 border-t border-muted">
          Tỷ lệ nộp CV:{" "}
          <span className="font-bold text-emerald-500">{conversionRate}%</span>
        </p>
      </div>
    );
  }
  return null;
};

//- custom cursor cho biểu đồ cột tránh lỗi nền hover đen đục do Recharts parse màu không chuẩn
const CustomBarCursor = (props: any) => {
  const { x, y, width, height } = props;
  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill="hsl(var(--primary))"
      opacity={0.1}
    />
  );
};

interface JobsPerformanceTabProps {
  jobsPerformance: any[];
}

export default function JobsPerformanceTab({
  jobsPerformance,
}: JobsPerformanceTabProps) {
  return (
    <div className="space-y-6">
      {/* biểu đồ so sánh tương tác */}
      <Card className="shadow-sm py-2 bg-card/50">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">
                Hiệu Quả Tương Tác Tin Tuyển Dụng
              </CardTitle>
              <CardDescription>
                So sánh số lượt xem và số đơn ứng tuyển của top 5 công việc có
                tương tác cao nhất
              </CardDescription>
            </div>
            <BarChart3 className="h-5 w-5 text-indigo-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[380px] w-full mt-4">
            {jobsPerformance.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={jobsPerformance}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted"
                  />
                  <XAxis
                    dataKey="title"
                    className="text-xs text-muted-foreground"
                    tickFormatter={(value) => {
                      if (value && value.length > 18) {
                        return `${value.substring(0, 15)}...`;
                      }
                      return value;
                    }}
                  />
                  <YAxis
                    className="text-xs text-muted-foreground"
                    allowDecimals={false}
                  />
                  <Tooltip
                    content={<CustomTooltipJobs />}
                    cursor={<CustomBarCursor />}
                  />
                  <Legend
                    align="center"
                    verticalAlign="bottom"
                    wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
                    formatter={(value) => {
                      if (value === "views") return "Lượt xem tin";
                      if (value === "applied") return "Lượt nộp CV";
                      return value;
                    }}
                  />
                  <Bar
                    dataKey="views"
                    name="views"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="applied"
                    name="applied"
                    fill="#8b5cf6"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                Không có dữ liệu hiệu quả tin đăng. Hãy đăng tuyển thêm công
                việc để xem thống kê.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* bảng chi tiết hiệu quả chuyển đổi */}
      <Card className="shadow-sm py-2 bg-card/50">
        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-lg">
              Bảng Chuyển Đổi Tin Tuyển Dụng
            </CardTitle>
            <CardDescription>
              Chi tiết các chỉ số lượt xem, lượt nộp và tỷ lệ chuyển đổi tương
              ứng của từng tin tuyển dụng.
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            asChild
            className="border-indigo-100 shadow-sm hover:text-indigo-600"
          >
            <Link href="/recruiter/manager/job">Quản lý tin đăng</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            {jobsPerformance.length > 0 ? (
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-muted text-muted-foreground text-xs font-semibold uppercase">
                    <th className="py-3 px-4">Tên Tin Tuyển Dụng</th>
                    <th className="py-3 px-4 text-center">Lượt Xem (Views)</th>
                    <th className="py-3 px-4 text-center">
                      Lượt Nộp CV (Applied)
                    </th>
                    <th className="py-3 px-4 text-center">
                      Tỷ Lệ Chuyển Đổi (CV/Views)
                    </th>
                    <th className="py-3 px-4 text-center">Hiệu Suất</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-muted/60">
                  {jobsPerformance.map((job) => {
                    const conversionRate =
                      job.views > 0 ? (job.applied / job.views) * 100 : 0;

                    //- phân cấp hiệu suất chuyển đổi của tin tuyển dụng
                    let performanceText = "Khá";
                    let performanceColor =
                      "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";

                    if (conversionRate >= 15) {
                      performanceText = "Xuất sắc";
                      performanceColor =
                        "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
                    } else if (conversionRate < 5) {
                      performanceText = "Cần cải thiện";
                      performanceColor =
                        "text-red-500 bg-red-500/10 border-red-500/20";
                    }

                    return (
                      <tr
                        key={job.id}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <td className="py-3.5 px-4 font-semibold text-foreground">
                          {job.title}
                        </td>
                        <td className="py-3.5 px-4 text-center font-medium text-blue-500">
                          {job.views.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-center font-medium text-violet-500">
                          {job.applied.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-foreground">
                          {conversionRate.toFixed(1)}%
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full border ${performanceColor}`}
                          >
                            {performanceText}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 space-y-2 text-muted-foreground">
                <HelpCircle className="h-10 w-10 text-muted-foreground/50" />
                <p className="text-sm font-medium">
                  Chưa có dữ liệu thống kê chuyển đổi tin tuyển dụng.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
