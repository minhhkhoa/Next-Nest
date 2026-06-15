"use client";

import React, { useState } from "react";
import {
  Search,
  MapPin,
  Users,
  Briefcase,
  Globe,
  Building2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { useGetCompaniesFilter } from "@/queries/useCompany";
import DataTablePagination from "@/components/DataTablePagination";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { useParams } from "next/navigation";
import { generateSlugUrl } from "@/lib/utils";

//- component hiển thị skeleton khi đang tải danh sách công ty
const CompanySkeleton = () => (
  <Card className="overflow-hidden border border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xs">
    <Skeleton className="h-28 w-full" />
    <CardContent className="p-5 relative pt-10">
      <Skeleton className="h-16 w-16 rounded-full border-2 border-background absolute -top-8 left-5" />
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2 mb-3" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-2/3 mb-4" />
      <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
    </CardContent>
  </Card>
);

export default function PageCompany() {
  const params = useParams();
  const locale = params?.locale || "vi";
  const isVi = locale === "vi";

  //- các chuỗi chữ hỗ trợ đa ngôn ngữ vi/en tự động
  const text = {
    title: isVi ? "Khám phá Doanh nghiệp Nổi bật" : "Discover Top Companies",
    subtitle: isVi
      ? "Tìm hiểu môi trường làm việc chuyên nghiệp, quy mô nhân sự và đón nhận các cơ hội việc làm tốt nhất từ những nhà tuyển dụng hàng đầu."
      : "Explore professional work environments, company scales, and secure the best career opportunities from industry leaders.",
    searchPlaceholder: isVi ? "Nhập tên công ty..." : "Enter company name...",
    addressPlaceholder: isVi ? "Nhập địa điểm..." : "Enter location...",
    searchBtn: isVi ? "Tìm kiếm" : "Search",
    activeJobs: isVi ? "việc làm đang tuyển" : "open jobs",
    size: isVi ? "Quy mô" : "Size",
    viewDetail: isVi ? "Xem chi tiết" : "View Details",
    noData: isVi
      ? "Không tìm thấy công ty nào phù hợp."
      : "No companies found.",
    loading: isVi ? "Đang tải dữ liệu..." : "Loading data...",
    totalResult: isVi ? "Tìm thấy" : "Found",
    companiesUnit: isVi ? "công ty" : "companies",
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchAddress, setSearchAddress] = useState("");

  //- state lưu giá trị gõ tạm thời trong input trước khi bấm search
  const [inputName, setInputName] = useState("");
  const [inputAddress, setInputAddress] = useState("");

  //- gọi api lấy danh sách công ty đã duyệt (status: accept, chưa bị xóa)
  const { data, isLoading } = useGetCompaniesFilter({
    currentPage,
    pageSize: 9,
    name: searchTerm || undefined,
    address: searchAddress || undefined,
    status: "ACCEPT",
    isDeleted: "false",
  });

  const companies = data?.data?.result || [];
  const meta = data?.data?.meta || {
    current: 1,
    pageSize: 9,
    totalPages: 1,
    totalItems: 0,
  };

  //- xử lý khi submit form tìm kiếm
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(inputName);
    setSearchAddress(inputAddress);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-slate-50/30 dark:bg-transparent pb-16">
      {/*- phần hero header được thiết kế với gradient mượt mà sang trọng */}
      <section className="relative py-12 sm:py-16 bg-gradient-to-br from-primary/10 via-primary/5 to-indigo-50/10 dark:from-primary/5 dark:via-transparent dark:to-indigo-950/5 border-b border-primary/5 rounded-2xl overflow-hidden mb-10">
        <div className="container mx-auto relative z-10 text-center max-w-4xl">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight  dark:text-slate-100 mb-4 bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent dark:from-slate-100 dark:to-slate-300">
            {text.title}
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed mb-8">
            {text.subtitle}
          </p>

          {/*- form tìm kiếm tích hợp thanh nhập và nút hành động bo góc tròn */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex flex-col md:flex-row gap-2 max-w-3xl mx-auto bg-white dark:bg-slate-900 p-2 rounded-2xl shadow-md border border-slate-100 dark:border-slate-800"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="text"
                placeholder={text.searchPlaceholder}
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                className="pl-10 h-11 border-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent text-sm"
              />
            </div>
            <div className="w-full md:w-px h-px md:h-8 bg-slate-100 dark:bg-slate-800 self-center" />
            <div className="relative flex-1">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="text"
                placeholder={text.addressPlaceholder}
                value={inputAddress}
                onChange={(e) => setInputAddress(e.target.value)}
                className="pl-10 h-11 border-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent text-sm"
              />
            </div>
            <Button
              type="submit"
              className="h-11 px-6 rounded-xl font-medium shrink-0 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {text.searchBtn}
            </Button>
          </form>
        </div>
      </section>

      <div className="container mx-auto max-w-7xl">
        {/*- tiêu đề danh sách hiển thị tổng số kết quả */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-slate-500 dark:text-slate-400">
            {text.totalResult}{" "}
            <span className="font-semibold text-primary">
              {meta.totalItems}
            </span>{" "}
            {text.companiesUnit}
          </div>
        </div>

        {/*- danh sách dạng grid 3 cột trên màn lớn và 1 cột trên mobile */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <CompanySkeleton key={idx} />
            ))}
          </div>
        ) : companies.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {companies.map((company) => {
                const desc = isVi
                  ? company.description?.vi
                  : company.description?.en || company.description?.vi;
                const bannerSrc =
                  company.banner ||
                  "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80";
                const logoSrc =
                  company.logo ||
                  "https://cdn-icons-png.flaticon.com/512/1040/1040216.png";

                return (
                  <Card
                    key={company._id}
                    className="group overflow-hidden border border-slate-100 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:shadow-md hover:border-primary/20 flex flex-col"
                  >
                    {/*- ảnh banner công ty có zoom nhẹ khi di chuột vào card */}
                    <div className="h-28 w-full relative overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                      <Image
                        src={bannerSrc}
                        alt={company.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
                    </div>

                    {/*- phần thông tin chi tiết */}
                    <CardContent className="p-5 relative pt-10 flex flex-col flex-1">
                      {/*- logo công ty được đặt nhô lên đè trên banner */}
                      <div className="absolute -top-8 left-5 h-16 w-16 rounded-full border-2 border-white dark:border-slate-900 bg-white dark:bg-slate-800 overflow-hidden shadow-md shrink-0">
                        <Image
                          src={logoSrc}
                          alt={`${company.name} logo`}
                          width={64}
                          height={64}
                          className="object-contain h-full w-full p-1 bg-white"
                        />
                      </div>

                      {/*- tên công ty hiển thị in đậm đổi màu khi hover */}
                      <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg line-clamp-1 group-hover:text-primary transition-colors mb-1">
                        {company.name}
                      </h3>

                      {/*- đường dẫn website */}
                      {company.website ? (
                        <a
                          href={
                            company.website.startsWith("http")
                              ? company.website
                              : `https://${company.website}`
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-primary hover:underline flex items-center gap-1 mb-3 shrink-0"
                        >
                          <Globe className="h-3.5 w-3.5" />
                          <span className="truncate max-w-[200px]">
                            {company.website}
                          </span>
                        </a>
                      ) : (
                        <div className="h-4 mb-3 shrink-0" />
                      )}

                      {/*- mô tả sơ lược */}
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 min-h-[32px]">
                        {desc ||
                          (isVi
                            ? "Chưa có mô tả công ty"
                            : "No description available")}
                      </p>

                      {/*- thông tin quy mô và địa chỉ */}
                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400 mb-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 mt-auto">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                          <span className="truncate">
                            {company.address ||
                              (isVi ? "Chưa cập nhật" : "N/A")}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Users className="h-4 w-4 text-slate-400 shrink-0" />
                          <span className="truncate">
                            {text.size}:{" "}
                            {company.totalMember || (isVi ? "Chưa rõ" : "N/A")}
                          </span>
                        </div>
                      </div>

                      {/*- số lượng job đang tuyển dụng và nút chi tiết */}
                      <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/50 shrink-0">
                        <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-500">
                          <Briefcase className="h-4 w-4" />
                          <span>
                            {company.totalJob || 0} {text.activeJobs}
                          </span>
                        </div>

                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="rounded-xl group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-300 font-medium"
                        >
                          <Link
                            href={`/company/${generateSlugUrl({
                              name: company.slug || company.name,
                              id: company._id,
                            })}`}
                          >
                            {text.viewDetail}
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/*- bộ phân trang đồng bộ từ component có sẵn */}
            {meta.totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <DataTablePagination
                  meta={meta}
                  onPageChange={(page) => {
                    setCurrentPage(page);
                    //- tự động cuộn nhẹ lên đầu danh sách để dễ theo dõi
                    window.scrollTo({ top: 200, behavior: "smooth" });
                  }}
                />
              </div>
            )}
          </>
        ) : (
          //- màn hình thông báo khi tìm kiếm không có dữ liệu
          <div className="text-center py-20 bg-white/40 dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
            <Building2 className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">
              {text.noData}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
