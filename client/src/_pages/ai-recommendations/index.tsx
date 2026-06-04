"use client";

import React, { useMemo, useState } from "react";
import {
  Brain,
  Search,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link } from "@/i18n/navigation";
import { useAppStore } from "@/components/TanstackProvider";
import DataTablePagination from "@/components/DataTablePagination";
import ListJobSkeleton from "@/components/skeletons/list-job";
import JobCard from "@/_pages/home/components/JobCard";
import {
  useGetRecommendJobs,
  useForceRecommendJobsMutation,
} from "@/queries/useAi";
import { LEVEL_OPTIONS, ADDRESS_OPTIONS } from "@/lib/constant";

export default function PageAiRecommendations() {
  const { isLogin } = useAppStore();

  //- các bộ lọc tìm kiếm cơ bản
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("all");
  const [level, setLevel] = useState("all");

  //- trang hiện tại phục vụ phân trang client
  const [page, setPage] = useState(1);
  const pageSize = 6;

  //- gọi api lấy dữ liệu gợi ý của ai (chỉ gọi khi đã đăng nhập)
  const {
    data: recommendJobsData,
    isLoading,
    refetch,
  } = useGetRecommendJobs(isLogin);

  const forceMutation = useForceRecommendJobsMutation();

  const handleRefresh = async () => {
    try {
      await forceMutation.mutateAsync();
      refetch();
    } catch (e) {
      console.error("Lỗi khi tải lại gợi ý AI:", e);
    }
  };

  const responseData = recommendJobsData?.data;
  const hasProfile = responseData?.hasProfile ?? false;
  const message = responseData?.message ?? "";
  const recommendations = responseData?.recommendations ?? [];

  //- xử lý lọc danh sách job trên client
  const filteredJobs = useMemo(() => {
    return recommendations.filter((job: any) => {
      //- lọc theo từ khóa (tiêu đề công việc hoặc tên công ty)
      if (keyword.trim()) {
        const query = keyword.toLowerCase();
        const titleVi = job.title?.vi?.toLowerCase() || "";
        const titleEn = job.title?.en?.toLowerCase() || "";
        const titleStr =
          typeof job.title === "string" ? job.title.toLowerCase() : "";
        const companyName =
          job.company?.name?.toLowerCase() ||
          job.companyID?.name?.toLowerCase() ||
          "";

        const matchTitle =
          titleVi.includes(query) ||
          titleEn.includes(query) ||
          titleStr.includes(query);
        const matchCompany = companyName.includes(query);

        if (!matchTitle && !matchCompany) {
          return false;
        }
      }

      //- lọc theo địa điểm
      if (location && location !== "all") {
        const jobLoc = job.location?.toLowerCase() || "";
        if (!jobLoc.includes(location.toLowerCase())) {
          return false;
        }
      }

      //- lọc theo cấp bậc mong muốn
      if (level && level !== "all") {
        const jobLevel = job.level?.toLowerCase() || "";
        if (jobLevel !== level.toLowerCase()) {
          return false;
        }
      }

      return true;
    });
  }, [recommendations, keyword, location, level]);

  //- tổng số trang sau khi lọc
  const totalPages = Math.ceil(filteredJobs.length / pageSize) || 1;

  //- reset page khi lọc thay đổi để tránh tràn trang
  React.useEffect(() => {
    setPage(1);
  }, [keyword, location, level]);

  //- lấy danh sách job hiển thị trên trang hiện tại
  const paginatedJobs = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredJobs.slice(start, start + pageSize);
  }, [filteredJobs, page]);

  //- meta thông tin phân trang cho datatablepagination
  const paginationMeta = {
    current: page,
    pageSize: pageSize,
    totalPages: totalPages,
    totalItems: filteredJobs.length,
  };

  const handleResetFilters = () => {
    setKeyword("");
    setLocation("all");
    setLevel("all");
    setPage(1);
  };

  //- trường hợp người dùng chưa đăng nhập hệ thống
  if (!isLogin) {
    return (
      <div className="bg-background py-16 min-h-[70vh] flex items-center justify-center">
        <div className="container max-w-md mx-auto px-4 text-center space-y-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
            <Brain className="w-8 h-8 text-violet-600 dark:text-violet-400" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">
              Đăng nhập để sử dụng AI
            </h2>
            <p className="text-sm text-muted-foreground">
              Vui lòng đăng nhập tài khoản ứng viên để sử dụng tính năng gợi ý
              việc làm thông minh bằng công nghệ AI.
            </p>
          </div>
          <Button
            asChild
            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-md"
          >
            <Link href="/login">Đăng nhập ngay</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background py-8 min-h-screen">
      <div className="container mx-auto space-y-8">
        {/* Banner tiêu đề trang được thiết kế sang trọng với gradient và hiệu ứng kính */}
        <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-r from-violet-600/10 via-indigo-600/5 to-transparent p-6 md:p-8 shadow-sm backdrop-blur-md">
          <div className="absolute right-10 top-0 -mr-6 -mt-6 h-32 w-32 rounded-full bg-indigo-500/10 blur-3xl"></div>
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600/20 text-violet-600 dark:text-violet-400">
                  <Brain className="h-6 w-6" />
                </span>
                <h1 className="text-2xl font-extrabold  md:text-3xl tracking-tight bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                  AI Gợi ý việc làm của bạn
                </h1>
              </div>
              <p className="text-sm text-muted-foreground max-w-3xl leading-relaxed">
                Hệ thống AI đã tự động phân tích hồ sơ chi tiết và các tệp CV
                của bạn để đối chiếu, chọn lọc ra những cơ hội nghề nghiệp tương
                thích cao nhất trên toàn hệ thống.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleRefresh}
              className="gap-2 self-start md:self-center border-violet-500/30 hover:bg-violet-500/10 text-violet-600 dark:text-violet-400"
              disabled={isLoading || forceMutation.isPending}
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading || forceMutation.isPending ? "animate-spin" : ""}`}
              />
              Cập nhật gợi ý
            </Button>
          </div>
        </div>

        {/* Trạng thái dữ liệu hồ sơ cá nhân và cảnh báo */}
        {!isLoading && (
          <div
            className={`flex items-start gap-3 p-4 rounded-2xl border ${
              hasProfile
                ? "bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-300"
                : "bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/20 text-amber-800 dark:text-amber-300"
            }`}
          >
            {hasProfile ? (
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
            )}
            <div className="space-y-1">
              <p className="text-sm font-semibold">
                {hasProfile
                  ? "Hồ sơ phân tích hoàn chỉnh"
                  : "Hồ sơ của bạn hiện chưa đầy đủ thông tin hoặc thiếu CV"}
              </p>
              <p className="text-xs text-muted-foreground leading-normal">
                {message}
                {!hasProfile && (
                  <span className="block mt-1">
                    👉 Cập nhật ngay tại{" "}
                    <Link
                      href="/profile"
                      className="font-bold underline text-primary hover:opacity-85"
                    >
                      Hồ sơ cá nhân
                    </Link>{" "}
                    hoặc tải CV lên để nhận kết quả khớp chuẩn nhất.
                  </span>
                )}
              </p>
            </div>
          </div>
        )}

        {/* Thanh công cụ lọc cơ bản phía trên danh sách */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Tìm kiếm theo từ khóa */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tên công việc, công ty, kỹ năng..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="pl-9 bg-background border-border focus-visible:ring-violet-500"
              />
            </div>

            {/* Bộ lọc địa điểm */}
            <Select value={location} onValueChange={(val) => setLocation(val)}>
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder="Chọn địa điểm" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả địa điểm</SelectItem>
                {ADDRESS_OPTIONS.map((addr) => (
                  <SelectItem key={addr} value={addr}>
                    {addr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Bộ lọc cấp bậc */}
            <Select value={level} onValueChange={(val) => setLevel(val)}>
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder="Chọn cấp bậc" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả cấp bậc</SelectItem>
                {LEVEL_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-border text-xs">
            <span className="text-muted-foreground">
              Tìm thấy{" "}
              <strong className="text-foreground">{filteredJobs.length}</strong>{" "}
              việc làm phù hợp với tiêu chí lọc hiện tại
            </span>
            {(keyword || location !== "all" || level !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="text-violet-600 hover:text-violet-700 hover:bg-violet-500/5 h-8 gap-1"
              >
                <RefreshCw className="h-3 w-3" />
                Xóa bộ lọc
              </Button>
            )}
          </div>
        </div>

        {/* Danh sách các công việc gợi ý */}
        <div>
          {isLoading ? (
            <ListJobSkeleton />
          ) : paginatedJobs.length > 0 ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {paginatedJobs.map((job: any) => (
                  <div
                    key={job._id}
                    className="flex flex-col h-full group/card"
                  >
                    {/* Render thẻ Job chuẩn */}
                    <div className="flex-1">
                      <JobCard job={job} />
                    </div>
                    {/* //- tạm thời ẩn đánh giá từ ai dưới mỗi thẻ theo yêu cầu */}
                    {/* 
                    <div className="mt-2.5 rounded-2xl bg-gradient-to-br from-violet-500/5 via-indigo-500/5 to-transparent border border-violet-500/20 p-4 shadow-sm transition-all duration-300 group-hover/card:border-violet-500/40 group-hover/card:from-violet-500/10">
                      <div className="flex items-center gap-1.5 mb-1.5 text-violet-700 dark:text-violet-300 font-bold text-xs uppercase tracking-wider">
                        <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400 animate-pulse" />
                        <span>Đánh giá từ AI</span>
                      </div>
                      <p className="text-[13px] text-muted-foreground leading-relaxed">
                        {job.aiExplanation}
                      </p>
                    </div>
                    */}
                  </div>
                ))}
              </div>

              {/* Phân trang */}
              <div className="pt-4 border-t border-border">
                <DataTablePagination
                  meta={paginationMeta}
                  onPageChange={(p) => setPage(p)}
                />
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-border py-16 text-center text-muted-foreground bg-card shadow-sm space-y-2">
              <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <Search className="w-5 h-5" />
              </div>
              <p className="font-semibold text-foreground text-sm">
                Không tìm thấy công việc phù hợp
              </p>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                Không tìm thấy kết quả phù hợp với các bộ lọc hiện tại. Thử thay
                đổi từ khóa hoặc bộ lọc của bạn.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
