"use client";

import React from "react";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";


const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-primary text-popover-foreground p-3 rounded-lg shadow-lg opacity-100 z-50">
        <p className="font-bold text-sm mb-1">{label}</p>
        {payload.map((pld: any, index: number) => (
          <p key={index} className="text-xs text-muted-foreground">
            {pld.name}: <span className="font-bold text-foreground">{pld.value.toLocaleString()} tin tuyển dụng</span>
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


interface JobsTabProps {
  jobStats: {
    byIndustry: any[];
    bySkill: any[];
    topViewedJobs: any[];
    topAppliedJobs: any[];
  };
}

export default function JobsTab({ jobStats }: JobsTabProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* biểu đồ job theo industry */}
      <Card className="shadow-sm py-2">
        <CardHeader>
          <CardTitle className="text-lg">Tin Tuyển Dụng Theo Ngành Nghề</CardTitle>
          <CardDescription>Top 5 lĩnh vực, ngành nghề có nhiều nhu cầu tuyển dụng nhất</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            {jobStats.byIndustry.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={jobStats.byIndustry} margin={{ bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                  <XAxis
                    dataKey="industryName.vi"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    dy={6}
                    tick={{ textAnchor: "middle" }}
                    tickFormatter={(value) => (value && value.length > 12 ? `${value.substring(0, 10)}...` : value)}
                  />
                  <YAxis fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={<CustomBarCursor />}
                  />
                  <Bar dataKey="count" name="Số lượng" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground italic text-sm">
                Không có dữ liệu ngành nghề
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* biểu đồ job theo skill */}
      <Card className="shadow-sm py-2">
        <CardHeader>
          <CardTitle className="text-lg">Tin Tuyển Dụng Theo Kỹ Năng</CardTitle>
          <CardDescription>Top 5 kỹ năng chuyên môn được yêu cầu nhiều nhất trong tin tuyển dụng</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            {jobStats.bySkill.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={jobStats.bySkill} margin={{ bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                  <XAxis
                    dataKey="skillName.vi"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    dy={6}
                    tick={{ textAnchor: "middle" }}
                    tickFormatter={(value) => (value && value.length > 12 ? `${value.substring(0, 10)}...` : value)}
                  />
                  <YAxis fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={<CustomBarCursor />}
                  />
                  <Bar dataKey="count" name="Số lượng" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground italic text-sm">
                Không có dữ liệu kỹ năng
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* top 5 việc làm xem nhiều nhất */}
      <Card className="shadow-sm py-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Công Việc Được Xem Nhiều Nhất</CardTitle>
          <CardDescription>Thống kê số lượng lượt hiển thị và xem chi tiết từ ứng viên</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {jobStats.topViewedJobs.length > 0 ? (
            //- sử dụng scrollarea giới hạn chiều cao tối đa là 350px và hỗ trợ cuộn cho khối công việc được xem nhiều nhất
            <ScrollArea className="max-h-[350px]">
              <div className="divide-y">
                {jobStats.topViewedJobs.map((job: any) => (
                  <div
                    key={job.id}
                    className="flex items-center justify-between p-4 hover:bg-accent/50 transition-colors border-b border-border last:border-0"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-foreground">{job.title?.vi || job.title?.en || "N/A"}</p>
                      <p className="text-xs text-muted-foreground">{job.companyName}</p>
                    </div>
                    <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-none font-bold py-1 px-2.5">
                      {job.views.toLocaleString()} lượt xem
                    </Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="p-8 text-center text-muted-foreground italic text-sm">Chưa có số liệu hiển thị</div>
          )}
        </CardContent>
      </Card>

      {/* top 5 việc làm được ứng tuyển nhiều nhất */}
      <Card className="shadow-sm py-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Công Việc Được Nộp Đơn Nhiều Nhất</CardTitle>
          <CardDescription>Thống kê tỷ lệ nộp CV từ ứng viên ứng tuyển vào công việc</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {jobStats.topAppliedJobs.length > 0 ? (
            //- sử dụng scrollarea giới hạn chiều cao tối đa là 350px và hỗ trợ cuộn cho khối công việc được nộp đơn nhiều nhất
            <ScrollArea className="max-h-[350px]">
              <div className="divide-y border-border">
                {jobStats.topAppliedJobs.map((job: any) => (
                  <div
                    key={job.id}
                    className="flex items-center justify-between p-4 hover:bg-accent/50 transition-colors border-b border-border last:border-0"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-foreground">{job.title?.vi || job.title?.en || "N/A"}</p>
                      <p className="text-xs text-muted-foreground">{job.companyName}</p>
                    </div>
                    <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-none font-bold py-1 px-2.5">
                      {job.applied.toLocaleString()} đơn nộp
                    </Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="p-8 text-center text-muted-foreground italic text-sm">
              Chưa có đơn ứng tuyển nào được nộp
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
