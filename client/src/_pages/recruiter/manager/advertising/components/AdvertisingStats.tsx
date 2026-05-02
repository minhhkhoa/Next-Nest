"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  CreditCard,
  History,
  CheckCircle2,
  TrendingUp,
  PieChart as PieChartIcon,
  BarChart3,
} from "lucide-react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
  LineChart,
  Line,
} from "recharts";
import { AdBookingResType } from "@/schemasvalidation/adBooking";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

interface AdvertisingStatsProps {
  bookings: AdBookingResType[];
}

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export default function AdvertisingStats({ bookings }: AdvertisingStatsProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  //- 1. Card Stats
  const totalBookings = bookings.length;
  const runningCount = bookings.filter((b) => b.status === "RUNNING").length;
  const scheduledCount = bookings.filter(
    (b) => b.status === "SCHEDULED",
  ).length;
  const totalSpent = bookings.reduce((acc, curr) => {
    if (["RUNNING", "SCHEDULED", "COMPLETED"].includes(curr.status)) {
      return acc + curr.amount;
    }
    return acc;
  }, 0);

  //- 2. Prepare Data for Status Chart
  const statusData = [
    { name: "Đang chạy", value: runningCount },
    { name: "Sắp chạy", value: scheduledCount },
    {
      name: "Hoàn thành",
      value: bookings.filter((b) => b.status === "COMPLETED").length,
    },
    {
      name: "Chờ thanh toán",
      value: bookings.filter((b) => b.status === "PENDING_PAYMENT").length,
    },
    {
      name: "Hết hạn/Hủy",
      value: bookings.filter((b) => ["EXPIRED", "CANCELLED"].includes(b.status))
        .length,
    },
  ].filter((item) => item.value > 0);

  //- 3. Prepare Data for Spending Chart (Grouped by Month)
  const spendingByMonth: Record<string, number> = {};
  bookings.forEach((b) => {
    if (["RUNNING", "SCHEDULED", "COMPLETED"].includes(b.status)) {
      const month = dayjs(b.createdAt).format("MMM YYYY");
      spendingByMonth[month] = (spendingByMonth[month] || 0) + b.amount;
    }
  });

  const spendingData = Object.entries(spendingByMonth)
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => (dayjs(a.name).isAfter(dayjs(b.name)) ? 1 : -1));

  //- 4. Prepare Data for Ad Slot Distribution
  const slotDistribution: Record<string, number> = {};
  bookings.forEach((b) => {
    slotDistribution[b.slotCode] = (slotDistribution[b.slotCode] || 0) + 1;
  });

  const slotData = Object.entries(slotDistribution)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  if (!isMounted) return null;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm hover:shadow-md transition-shadow py-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng số đơn</CardTitle>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBookings}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Đơn quảng cáo đã tạo
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-green-500 py-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-600">
              Đang hoạt động
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {runningCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Đang hiển thị</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-orange-500 py-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-600">
              Sắp chạy
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {scheduledCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Đã thanh toán & chờ lịch
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow bg-primary/5 py-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng ngân sách
            </CardTitle>
            <CreditCard className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {totalSpent.toLocaleString("vi-VN")}đ
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Tổng tiền đầu tư thành công
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Spending Chart */}
        <Card className="shadow-sm py-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>Chi phí quảng cáo</CardTitle>
                <CardDescription>
                  Thống kê ngân sách đã chi theo tháng
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {spendingData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={spendingData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="colorAmount"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="var(--primary)"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="var(--primary)"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="var(--border)"
                      opacity={0.5}
                    />
                    <XAxis
                      dataKey="name"
                      fontSize={12}
                      tickLine={false}
                      axisLine={{ stroke: "var(--border)" }}
                      tick={{ fill: "var(--muted-foreground)" }}
                      dy={10}
                    />
                    <YAxis
                      fontSize={12}
                      tickLine={false}
                      axisLine={{ stroke: "var(--border)" }}
                      tick={{ fill: "var(--muted-foreground)" }}
                      tickFormatter={(value) =>
                        `${(value / 1000).toLocaleString()}k`
                      }
                    />
                    <Tooltip
                      formatter={(value: number) => [
                        `${value.toLocaleString()}đ`,
                        "Ngân sách",
                      ]}
                      contentStyle={{
                        backgroundColor: "var(--popover)",
                        color: "var(--popover-foreground)",
                        borderRadius: "12px",
                        border: "1px solid var(--border)",
                        boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                      }}
                      itemStyle={{ color: "var(--primary)", fontWeight: "600" }}
                      labelStyle={{
                        color: "var(--popover-foreground)",
                        fontWeight: "bold",
                        marginBottom: "4px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke="var(--primary)"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorAmount)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground italic">
                  Chưa có dữ liệu chi phí.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution Chart */}
        <Card className="shadow-sm py-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>Trạng thái đơn hàng</CardTitle>
                <CardDescription>
                  Phân bổ trạng thái các đơn quảng cáo
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={90}
                      paddingAngle={8}
                      dataKey="value"
                      stroke="none"
                    >
                      {statusData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--popover)",
                        color: "var(--popover-foreground)",
                        borderRadius: "12px",
                        border: "1px solid var(--border)",
                        boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                      }}
                      itemStyle={{ color: "var(--popover-foreground)" }}
                      labelStyle={{ color: "var(--popover-foreground)", fontWeight: "bold" }}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground italic">
                  Chưa có dữ liệu đơn hàng.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Ad Slot Distribution */}
        <Card className="shadow-sm md:col-span-2 py-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>Phân bổ Vị trí Quảng cáo</CardTitle>
                <CardDescription>
                  Các vị trí được đặt nhiều nhất
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {slotData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={slotData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--border)"
                      vertical={false}
                      opacity={0.5}
                    />
                    <XAxis
                      dataKey="name"
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: "var(--border)" }}
                      tick={{ fill: "var(--muted-foreground)" }}
                    />
                    <YAxis
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: "var(--border)" }}
                      tick={{ fill: "var(--muted-foreground)" }}
                      allowDecimals={false}
                    />
                    <Tooltip
                      formatter={(value: number) => [value, "Số đơn"]}
                      contentStyle={{
                        backgroundColor: "var(--popover)",
                        color: "var(--popover-foreground)",
                        borderRadius: "12px",
                        border: "1px solid var(--border)",
                        boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                      }}
                      itemStyle={{ color: "var(--primary)", fontWeight: "600" }}
                      labelStyle={{
                        color: "var(--popover-foreground)",
                        fontWeight: "bold",
                        marginBottom: "4px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="var(--primary)"
                      strokeWidth={4}
                      dot={{
                        r: 6,
                        fill: "var(--primary)",
                        strokeWidth: 2,
                        stroke: "var(--background)",
                      }}
                      activeDot={{ r: 8, strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground italic">
                  Chưa có dữ liệu vị trí.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
