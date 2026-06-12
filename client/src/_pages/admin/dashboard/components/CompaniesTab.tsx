"use client";

import React from "react";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-primary text-popover-foreground p-3 rounded-lg shadow-lg opacity-100 z-50">
        <p className="font-bold text-sm mb-1">{label}</p>
        {payload.map((pld: any, index: number) => (
          <p key={index} className="text-xs text-muted-foreground">
            {pld.name}: <span className="font-bold text-foreground">{pld.value.toLocaleString()}</span>
          </p>
        ))}
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


interface CompaniesTabProps {
  companyStats: {
    topCompaniesByJobs: any[];
    topCompaniesByBookings: any[];
  };
  companyStatusChartData: any[];
}

export default function CompaniesTab({ companyStats, companyStatusChartData }: CompaniesTabProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* biểu đồ cột top công ty đăng job */}
      <Card className="shadow-sm py-2">
        <CardHeader>
          <CardTitle className="text-lg">Top 5 Công Ty Đăng Job Nhiều Nhất</CardTitle>
          <CardDescription>Thống kê số lượng tin tuyển dụng được tạo theo doanh nghiệp</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            {companyStats.topCompaniesByJobs.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={companyStats.topCompaniesByJobs} layout="vertical" margin={{ left: 20, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" opacity={0.5} />
                  <XAxis type="number" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="companyName" fontSize={11} tickLine={false} axisLine={false} width={100} />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={<CustomBarCursor />}
                  />
                  <Bar dataKey="jobCount" name="Số lượng Job" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground italic text-sm">
                Không có dữ liệu thống kê
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* biểu đồ top chi tiêu quảng cáo */}
      <Card className="shadow-sm py-2">
        <CardHeader>
          <CardTitle className="text-lg">Top 5 Công Ty Chi Tiêu Nhiều Nhất</CardTitle>
          <CardDescription>Xếp hạng doanh nghiệp chi tiêu ngân sách quảng cáo banner</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            {companyStats.topCompaniesByBookings.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={companyStats.topCompaniesByBookings} layout="vertical" margin={{ left: 20, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" opacity={0.5} />
                  <XAxis type="number" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="companyName" fontSize={11} tickLine={false} axisLine={false} width={100} />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={<CustomBarCursor />}
                  />
                  <Bar dataKey="totalSpent" name="Tổng chi tiêu" fill="#10b981" radius={[0, 4, 4, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground italic text-sm">
                Không có dữ liệu chi tiêu
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* biểu đồ tròn phân bố trạng thái công ty */}
      <Card className="shadow-sm md:col-span-2 py-2">
        <CardHeader>
          <CardTitle className="text-lg">Phân Bố Trạng Thế Xác Minh Công Ty</CardTitle>
          <CardDescription>Cơ cấu tỷ lệ các doanh nghiệp đã xác minh thành công và đang chờ duyệt</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row items-center justify-around gap-6 py-8">
          <div className="h-[200px] w-[200px] relative shrink-0">
            {companyStatusChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={companyStatusChartData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                  >
                    {companyStatusChartData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.name === "Đã duyệt" ? "#10b981" : "#f59e0b"} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={<CustomTooltip />}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground italic text-sm">
                Chưa có dữ liệu
              </div>
            )}
          </div>

          <div className="space-y-4 w-full max-w-sm">
            {companyStatusChartData.map((item: any) => (
              <div key={item.name} className="flex items-center justify-between border-b border-border pb-2">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: item.name === "Đã duyệt" ? "#10b981" : "#f59e0b" }}
                  ></span>
                  <span className="font-semibold text-muted-foreground">{item.name}</span>
                </div>
                <span className="text-foreground font-bold text-base">{item.value} công ty</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
