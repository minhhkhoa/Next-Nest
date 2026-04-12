"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import DataTablePagination from "@/components/DataTablePagination";
import ListJobSkeleton from "@/components/skeletons/list-job";
import JobCard from "@/_pages/home/components/JobCard";
import { useGetTreeIndustry } from "@/queries/useIndustry";
import { useSearchJobsPublicAdvanced } from "@/queries/useJob";
import {
  EMPLOYEE_TYPE_OPTIONS,
  EXPERIENCE_OPTIONS,
  LEVEL_OPTIONS,
} from "@/lib/constant";
import FindJobsSearchBar from "./components/FindJobsSearchBar";
import AdvancedFilterPanel, { FindJobsAdvancedFilters } from "./components/AdvancedFilterPanel";
import AppliedFilterChips, { AppliedChip } from "./components/AppliedFilterChips";

interface FindJobsFilterState {
  keyword: string;
  location: string;
  industryId: string;
  advanced: FindJobsAdvancedFilters;
}

const DEFAULT_ADVANCED_FILTERS: FindJobsAdvancedFilters = {
  company: "",
  level: "",
  employeeType: "",
  experience: "",
  minSalary: "",
  maxSalary: "",
  currency: "",
  skillIDs: [],
  isHot: false,
};

const DEFAULT_FILTER_STATE: FindJobsFilterState = {
  keyword: "",
  location: "",
  industryId: "",
  advanced: DEFAULT_ADVANCED_FILTERS,
};

const parseFiltersFromSearchParams = (
  searchParams: URLSearchParams,
): FindJobsFilterState => {
  const skills = [
    ...searchParams.getAll("skill"),
    ...searchParams.getAll("skillIDs"),
  ].filter(Boolean);

  return {
    keyword:
      searchParams.get("keyword") ||
      searchParams.get("title") ||
      "",
    location:
      searchParams.get("location") ||
      searchParams.get("address") ||
      "",
    industryId:
      searchParams.get("industry") ||
      searchParams.get("industryIDs") ||
      "",
    advanced: {
      company: searchParams.get("company") || searchParams.get("fieldCompany") || "",
      level: searchParams.get("level") || "",
      employeeType: searchParams.get("employeeType") || "",
      experience: searchParams.get("experience") || "",
      minSalary: searchParams.get("minSalary") || "",
      maxSalary: searchParams.get("maxSalary") || "",
      currency: searchParams.get("currency") || "",
      skillIDs: Array.from(new Set(skills)),
      isHot: searchParams.get("isHot") === "true",
    },
  };
};

const parsePageFromSearchParams = (searchParams: URLSearchParams) => {
  const page = Number(searchParams.get("page") || 1);
  return Number.isFinite(page) && page > 0 ? page : 1;
};

const buildSearchParams = (filters: FindJobsFilterState, page: number) => {
  const params = new URLSearchParams();

  if (filters.keyword) params.set("keyword", filters.keyword);
  if (filters.location) params.set("location", filters.location);
  if (filters.industryId) params.set("industry", filters.industryId);

  if (filters.advanced.company) params.set("company", filters.advanced.company);
  if (filters.advanced.level) params.set("level", filters.advanced.level);
  if (filters.advanced.employeeType)
    params.set("employeeType", filters.advanced.employeeType);
  if (filters.advanced.experience)
    params.set("experience", filters.advanced.experience);
  if (filters.advanced.minSalary)
    params.set("minSalary", filters.advanced.minSalary);
  if (filters.advanced.maxSalary)
    params.set("maxSalary", filters.advanced.maxSalary);
  if (filters.advanced.currency)
    params.set("currency", filters.advanced.currency);

  filters.advanced.skillIDs.forEach((id) => params.append("skill", id));

  if (filters.advanced.isHot) params.set("isHot", "true");
  if (page > 1) params.set("page", String(page));

  return params;
};

const toNumberOrUndefined = (value: string) => {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const findIndustryNameById = (
  nodes: any[],
  id: string,
): string | undefined => {
  for (const node of nodes || []) {
    if (node._id === id) return node.name?.vi || node.name?.en;
    if (node.children?.length) {
      const found = findIndustryNameById(node.children, id);
      if (found) return found;
    }
  }

  return undefined;
};

export default function PageFindJobs() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<FindJobsFilterState>(() =>
    parseFiltersFromSearchParams(searchParams),
  );
  const [appliedFilters, setAppliedFilters] = useState<FindJobsFilterState>(() =>
    parseFiltersFromSearchParams(searchParams),
  );
  const [page, setPage] = useState(() => parsePageFromSearchParams(searchParams));
  const [openMobileFilter, setOpenMobileFilter] = useState(false);

  const searchParamsText = searchParams.toString();

  useEffect(() => {
    const nextFilters = parseFiltersFromSearchParams(searchParams);
    const nextPage = parsePageFromSearchParams(searchParams);

    setFilters(nextFilters);
    setAppliedFilters(nextFilters);
    setPage(nextPage);
  }, [searchParams, searchParamsText]);

  const { data: industryTreeData, isLoading: isLoadingIndustry } = useGetTreeIndustry({});

  const queryParams = useMemo(
    () => ({
      currentPage: page,
      pageSize: 12,
      title: appliedFilters.keyword || undefined,
      fieldCompany: appliedFilters.advanced.company || undefined,
      address: appliedFilters.location || undefined,
      level: appliedFilters.advanced.level || undefined,
      employeeType: appliedFilters.advanced.employeeType || undefined,
      experience: appliedFilters.advanced.experience || undefined,
      isHot: appliedFilters.advanced.isHot ? "true" : undefined,
      minSalary: toNumberOrUndefined(appliedFilters.advanced.minSalary),
      maxSalary: toNumberOrUndefined(appliedFilters.advanced.maxSalary),
      currency: appliedFilters.advanced.currency || undefined,
      industryIDs: appliedFilters.industryId ? [appliedFilters.industryId] : undefined,
      skillIDs:
        appliedFilters.advanced.skillIDs.length > 0
          ? appliedFilters.advanced.skillIDs
          : undefined,
    }),
    [appliedFilters, page],
  );

  const { data: jobsData, isLoading } = useSearchJobsPublicAdvanced(queryParams);

  const jobs = jobsData?.data?.result || [];
  const meta = jobsData?.data?.meta || {
    current: 1,
    pageSize: 12,
    totalPages: 1,
    totalItems: 0,
  };

  const updateUrl = useCallback((nextFilters: FindJobsFilterState, targetPage: number) => {
    const params = buildSearchParams(nextFilters, targetPage);
    const query = params.toString();
    router.replace(`/find-jobs${query ? `?${query}` : ""}`);
  }, [router]);

  const applyFiltersAndSyncUrl = useCallback((nextFilters: FindJobsFilterState) => {
    setFilters(nextFilters);
    setAppliedFilters(nextFilters);
    setPage(1);
    updateUrl(nextFilters, 1);
  }, [updateUrl]);

  const handleApplyFilters = () => {
    setAppliedFilters(filters);
    setPage(1);
    updateUrl(filters, 1);
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTER_STATE);
    setAppliedFilters(DEFAULT_FILTER_STATE);
    setPage(1);
    router.replace("/find-jobs");
  };

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage);
    updateUrl(appliedFilters, nextPage);
  };

  const industryLabel =
    appliedFilters.industryId && industryTreeData?.data
      ? findIndustryNameById(industryTreeData.data, appliedFilters.industryId)
      : undefined;

  const levelLabel = LEVEL_OPTIONS.find(
    (item) => item.value === appliedFilters.advanced.level,
  )?.label;
  const employeeTypeLabel = EMPLOYEE_TYPE_OPTIONS.find(
    (item) => item.value === appliedFilters.advanced.employeeType,
  )?.label;
  const experienceLabel = EXPERIENCE_OPTIONS.find(
    (item) => item.value === appliedFilters.advanced.experience,
  )?.label;

  const chips = useMemo<AppliedChip[]>(() => {
    const result: AppliedChip[] = [];

    if (appliedFilters.keyword) {
      result.push({
        key: "keyword",
        label: `Từ khóa: ${appliedFilters.keyword}`,
        onRemove: () =>
          applyFiltersAndSyncUrl({
            ...appliedFilters,
            keyword: "",
          }),
      });
    }

    if (appliedFilters.location) {
      result.push({
        key: "location",
        label: `Địa điểm: ${appliedFilters.location}`,
        onRemove: () =>
          applyFiltersAndSyncUrl({
            ...appliedFilters,
            location: "",
          }),
      });
    }

    if (appliedFilters.industryId && industryLabel) {
      result.push({
        key: "industry",
        label: `Ngành: ${industryLabel}`,
        onRemove: () =>
          applyFiltersAndSyncUrl({
            ...appliedFilters,
            industryId: "",
            advanced: {
              ...appliedFilters.advanced,
              skillIDs: [],
            },
          }),
      });
    }

    if (appliedFilters.advanced.company) {
      result.push({
        key: "company",
        label: `Công ty: ${appliedFilters.advanced.company}`,
        onRemove: () =>
          applyFiltersAndSyncUrl({
            ...appliedFilters,
            advanced: { ...appliedFilters.advanced, company: "" },
          }),
      });
    }

    if (appliedFilters.advanced.level && levelLabel) {
      result.push({
        key: "level",
        label: `Cấp bậc: ${levelLabel}`,
        onRemove: () =>
          applyFiltersAndSyncUrl({
            ...appliedFilters,
            advanced: { ...appliedFilters.advanced, level: "" },
          }),
      });
    }

    if (appliedFilters.advanced.employeeType && employeeTypeLabel) {
      result.push({
        key: "employeeType",
        label: `Loại hình: ${employeeTypeLabel}`,
        onRemove: () =>
          applyFiltersAndSyncUrl({
            ...appliedFilters,
            advanced: { ...appliedFilters.advanced, employeeType: "" },
          }),
      });
    }

    if (appliedFilters.advanced.experience && experienceLabel) {
      result.push({
        key: "experience",
        label: `Kinh nghiệm: ${experienceLabel}`,
        onRemove: () =>
          applyFiltersAndSyncUrl({
            ...appliedFilters,
            advanced: { ...appliedFilters.advanced, experience: "" },
          }),
      });
    }

    if (
      appliedFilters.advanced.minSalary ||
      appliedFilters.advanced.maxSalary
    ) {
      result.push({
        key: "salary",
        label: `Lương: ${appliedFilters.advanced.minSalary || 0} - ${appliedFilters.advanced.maxSalary || "..."}`,
        onRemove: () =>
          applyFiltersAndSyncUrl({
            ...appliedFilters,
            advanced: {
              ...appliedFilters.advanced,
              minSalary: "",
              maxSalary: "",
            },
          }),
      });
    }

    if (appliedFilters.advanced.currency) {
      result.push({
        key: "currency",
        label: `Tiền tệ: ${appliedFilters.advanced.currency}`,
        onRemove: () =>
          applyFiltersAndSyncUrl({
            ...appliedFilters,
            advanced: { ...appliedFilters.advanced, currency: "" },
          }),
      });
    }

    if (appliedFilters.advanced.skillIDs.length > 0) {
      result.push({
        key: "skills",
        label: `Kỹ năng: ${appliedFilters.advanced.skillIDs.length}`,
        onRemove: () =>
          applyFiltersAndSyncUrl({
            ...appliedFilters,
            advanced: { ...appliedFilters.advanced, skillIDs: [] },
          }),
      });
    }

    if (appliedFilters.advanced.isHot) {
      result.push({
        key: "isHot",
        label: "Việc làm Hot",
        onRemove: () =>
          applyFiltersAndSyncUrl({
            ...appliedFilters,
            advanced: { ...appliedFilters.advanced, isHot: false },
          }),
      });
    }

    return result;
  }, [
    appliedFilters,
    industryLabel,
    levelLabel,
    employeeTypeLabel,
    experienceLabel,
    applyFiltersAndSyncUrl,
  ]);

  return (
    <div className="bg-background py-8">
      <div className="container mx-auto space-y-6 px-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-primary md:text-3xl">Tìm việc làm</h1>
          <p className="text-sm text-muted-foreground md:text-base">
            Bộ lọc tìm kiếm linh hoạt: hệ thống sẽ ưu tiên công việc khớp nhiều tiêu chí,
            nhưng vẫn giữ kết quả phù hợp khi bạn kết hợp nhiều điều kiện.
          </p>
        </div>

        <FindJobsSearchBar
          keyword={filters.keyword}
          location={filters.location}
          industryId={filters.industryId}
          industries={industryTreeData?.data || []}
          isLoadingIndustry={isLoadingIndustry}
          onKeywordChange={(value) =>
            setFilters((prev) => ({ ...prev, keyword: value }))
          }
          onLocationChange={(value) =>
            setFilters((prev) => ({ ...prev, location: value }))
          }
          onIndustryChange={(value) =>
            setFilters((prev) => ({ ...prev, industryId: value, advanced: { ...prev.advanced, skillIDs: [] } }))
          }
          onSearch={handleApplyFilters}
        />

        <AppliedFilterChips
          chips={chips}
          onClearAll={handleResetFilters}
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="hidden self-start h-fit rounded-2xl border border-border bg-card p-4 lg:block">
            <AdvancedFilterPanel
              value={filters.advanced}
              industryIDs={filters.industryId ? [filters.industryId] : []}
              onChange={(next) =>
                setFilters((prev) => ({ ...prev, advanced: next }))
              }
              onApply={handleApplyFilters}
              onReset={handleResetFilters}
            />
          </aside>

          <section className="space-y-4">
            <div className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
              <p className="text-sm text-muted-foreground">
                Tìm thấy <span className="font-semibold text-foreground">{meta.totalItems}</span> công việc phù hợp
              </p>

              <div className="lg:hidden">
                <Sheet open={openMobileFilter} onOpenChange={setOpenMobileFilter}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <SlidersHorizontal className="h-4 w-4" />
                      Bộ lọc
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[92vw] overflow-y-auto sm:w-[420px]">
                    <SheetHeader>
                      <SheetTitle>Bộ lọc nâng cao</SheetTitle>
                    </SheetHeader>

                    <div className="mt-5 px-3">
                      <AdvancedFilterPanel
                        value={filters.advanced}
                        industryIDs={filters.industryId ? [filters.industryId] : []}
                        onChange={(next) =>
                          setFilters((prev) => ({ ...prev, advanced: next }))
                        }
                        onApply={() => {
                          handleApplyFilters();
                          setOpenMobileFilter(false);
                        }}
                        onReset={() => {
                          handleResetFilters();
                          setOpenMobileFilter(false);
                        }}
                      />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>

            {isLoading ? (
              <ListJobSkeleton />
            ) : jobs.length > 0 ? (
              <>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {jobs.map((job: any) => (
                    <JobCard key={job._id} job={job} />
                  ))}
                </div>

                <div className="pt-2">
                  <DataTablePagination meta={meta} onPageChange={handlePageChange} />
                </div>
              </>
            ) : (
              <div className="rounded-xl border border-dashed py-14 text-center text-muted-foreground">
                Không có công việc phù hợp với bộ lọc hiện tại.
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
