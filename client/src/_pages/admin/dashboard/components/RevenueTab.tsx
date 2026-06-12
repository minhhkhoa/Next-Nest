"use client";

import React from "react";
import { format } from "date-fns";
import { DollarSign } from "lucide-react";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
          const name = pld.payload?.provider || pld.name || "Doanh thu";
          const formattedValue = `${pld.value.toLocaleString()}đ`;
          return (
            <p key={index} className="text-xs text-muted-foreground">
              {name.toUpperCase()}: <span className="font-bold text-foreground">{formattedValue}</span>
            </p>
          );
        })}
      </div>
    );
  }
  return null;
};

interface RevenueTabProps {
  revenueTrends: any[];
  revenueByProvider: any[];
  chartColors: string[];
}

export default function RevenueTab({ revenueTrends, revenueByProvider, chartColors }: RevenueTabProps) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* biểu đồ vùng doanh thu */}
      <Card className="md:col-span-2 shadow-sm py-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Xu Hướng Doanh Thu</CardTitle>
              <CardDescription>Thống kê số tiền thu được từ dịch vụ banner quảng cáo</CardDescription>
            </div>
            <DollarSign className="h-5 w-5 text-amber-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[320px] w-full">
            {revenueTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueTrends} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.6} />
                  <XAxis
                    dataKey="date"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => format(new Date(value), "dd/MM")}
                  />
                  <YAxis
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${(value / 1000).toLocaleString()}k`}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ stroke: "hsl(var(--primary))", strokeWidth: 1, strokeDasharray: "4 4" }}
                  />
                  <Area type="monotone" dataKey="amount" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground italic text-sm">
                Không có doanh thu quảng cáo phát sinh trong khoảng thời gian này
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* tỷ lệ cổng thanh toán */}
      <Card className="shadow-sm py-2">
        <CardHeader>
          <CardTitle className="text-lg">Cổng Thanh Toán</CardTitle>
          <CardDescription>Cơ cấu doanh thu theo phương thức giao dịch</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center pt-2">
          <div className="h-[220px] w-full relative">
            {revenueByProvider.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={revenueByProvider}
                    nameKey="provider"
                    dataKey="amount"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    stroke="none"
                  >
                    {revenueByProvider.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Pie>
                   <Tooltip
                    content={<CustomTooltip />}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground italic text-sm">
                Không có dữ liệu thanh toán
              </div>
            )}
          </div>

          {/* legend tùy chỉnh */}
          <div className="w-full space-y-2 mt-4">
            {revenueByProvider.map((item: any, index: number) => (
              <div key={item.provider} className="flex items-center justify-between text-sm border-b border-border last:border-0 pb-2">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: chartColors[index % chartColors.length] }}
                  ></span>
                  <span className="font-semibold text-muted-foreground uppercase">{item.provider}</span>
                </div>
                <span className="text-foreground font-bold">{item.amount.toLocaleString()}đ</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
