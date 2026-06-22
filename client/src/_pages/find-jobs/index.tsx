"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, Sparkles, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Link, useRouter } from "@/i18n/navigation";
import { useAppStore } from "@/components/TanstackProvider";
import DataTablePagination from "@/components/DataTablePagination";
import ListJobSkeleton from "@/components/skeletons/list-job";
import JobCard from "@/_pages/home/components/JobCard";
import { useGetTreeIndustry } from "@/queries/useIndustry";
import { useSearchJobsPublicAdvanced } from "@/queries/useJob";
import FindJobsSearchBar from "./components/FindJobsSearchBar";
import AdvancedFilterPanel, {
  FindJobsAdvancedFilters,
} from "./components/AdvancedFilterPanel";
import AppliedFilterChips, {
  AppliedChip,
} from "./components/AppliedFilterChips";
import { useTranslations } from "next-intl";
import { useGetLang } from "@/hooks/use-get-lang";

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
    keyword: searchParams.get("keyword") || searchParams.get("title") || "",
    location: searchParams.get("location") || searchParams.get("address") || "",
    industryId:
      searchParams.get("industry") || searchParams.get("industryIDs") || "",
    advanced: {
      company:
        searchParams.get("company") || searchParams.get("fieldCompany") || "",
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
  getLang: (data?: any) => string,
): string | undefined => {
  for (const node of nodes || []) {
    if (node._id === id) return getLang(node.name);
    if (node.children?.length) {
      const found = findIndustryNameById(node.children, id, getLang);
      if (found) return found;
    }
  }

  return undefined;
};

export default function PageFindJobs() {
  const t = useTranslations("PageFindJobs");
  const tCommon = useTranslations("Common");
  const { getLang } = useGetLang();

  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLogin } = useAppStore();

  const [filters, setFilters] = useState<FindJobsFilterState>(() =>
    parseFiltersFromSearchParams(searchParams),
  );
  const [appliedFilters, setAppliedFilters] = useState<FindJobsFilterState>(
    () => parseFiltersFromSearchParams(searchParams),
  );
  const [page, setPage] = useState(() =>
    parsePageFromSearchParams(searchParams),
  );
  const [openMobileFilter, setOpenMobileFilter] = useState(false);

  const searchParamsText = searchParams.toString();

  useEffect(() => {
    const nextFilters = parseFiltersFromSearchParams(searchParams);
    const nextPage = parsePageFromSearchParams(searchParams);

    setFilters(nextFilters);
    setAppliedFilters(nextFilters);
    setPage(nextPage);
  }, [searchParams, searchParamsText]);

  const { data: industryTreeData, isLoading: isLoadingIndustry } =
    useGetTreeIndustry({});

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
      industryIDs: appliedFilters.industryId
        ? [appliedFilters.industryId]
        : undefined,
      skillIDs:
        appliedFilters.advanced.skillIDs.length > 0
          ? appliedFilters.advanced.skillIDs
          : undefined,
    }),
    [appliedFilters, page],
  );

  const { data: jobsData, isLoading } =
    useSearchJobsPublicAdvanced(queryParams);

  const jobs = jobsData?.data?.result || [];
  const meta = jobsData?.data?.meta || {
    current: 1,
    pageSize: 12,
    totalPages: 1,
    totalItems: 0,
  };

  const updateUrl = useCallback(
    (nextFilters: FindJobsFilterState, targetPage: number) => {
      const params = buildSearchParams(nextFilters, targetPage);
      const query = params.toString();
      router.replace(`/find-jobs${query ? `?${query}` : ""}`);
    },
    [router],
  );

  const applyFiltersAndSyncUrl = useCallback(
    (nextFilters: FindJobsFilterState) => {
      setFilters(nextFilters);
      setAppliedFilters(nextFilters);
      setPage(1);
      updateUrl(nextFilters, 1);
    },
    [updateUrl],
  );

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
      ? findIndustryNameById(
          industryTreeData.data,
          appliedFilters.industryId,
          getLang,
        )
      : undefined;

  const levelLabel = appliedFilters.advanced.level
    ? tCommon(`Level.${appliedFilters.advanced.level}` as any)
    : undefined;
  const employeeTypeLabel = appliedFilters.advanced.employeeType
    ? tCommon(`EmployeeType.${appliedFilters.advanced.employeeType}` as any)
    : undefined;
  const experienceLabel = appliedFilters.advanced.experience
    ? tCommon(`Experience.${appliedFilters.advanced.experience}` as any)
    : undefined;

  const chips = useMemo<AppliedChip[]>(() => {
    const result: AppliedChip[] = [];

    if (appliedFilters.keyword) {
      result.push({
        key: "keyword",
        label: t("Chips.keyword", { val: appliedFilters.keyword }),
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
        label: t("Chips.location", { val: appliedFilters.location }),
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
        label: t("Chips.industry", { val: industryLabel }),
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
        label: t("Chips.company", { val: appliedFilters.advanced.company }),
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
        label: t("Chips.level", { val: levelLabel }),
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
        label: t("Chips.employeeType", { val: employeeTypeLabel }),
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
        label: t("Chips.experience", { val: experienceLabel }),
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
        label: t("Chips.salary", {
          min: appliedFilters.advanced.minSalary || 0,
          max: appliedFilters.advanced.maxSalary || "...",
        }),
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
        label: t("Chips.currency", { val: appliedFilters.advanced.currency }),
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
        label: t("Chips.skills", {
          count: appliedFilters.advanced.skillIDs.length,
        }),
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
        label: t("Chips.isHot"),
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
    t,
  ]);

  return (
    <div className="bg-background py-8">
      <div className="container mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-primary md:text-3xl">
            {t("Title")}
          </h1>
          <p className="text-sm text-muted-foreground md:text-base">
            {t("Description")}
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
            setFilters((prev) => ({
              ...prev,
              industryId: value,
              advanced: { ...prev.advanced, skillIDs: [] },
            }))
          }
          onSearch={handleApplyFilters}
        />

        <AppliedFilterChips chips={chips} onClearAll={handleResetFilters} />

        {/* Card AI gợi ý công việc - chỉ hiện khi đã đăng nhập */}
        {isLogin && (
          <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-r from-violet-500/10 via-indigo-500/10 to-blue-500/10 p-5 md:p-6 shadow-sm backdrop-blur-sm">
            <div className="absolute right-0 top-0 -mr-6 -mt-6 h-24 w-24 rounded-full bg-primary/10 blur-2xl"></div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-primary">
                    <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </span>
                  <h3 className="text-lg font-bold text-foreground">
                    {t("AiRecommendTitle")}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground max-w-2xl">
                  {t("AiRecommendDesc")}
                  <span className="block mt-1 text-xs text-muted-foreground/80">
                    {t("AiRecommendNote")}
                    <Link
                      href="/profile"
                      className="font-semibold text-primary underline hover:text-primary/80"
                    >
                      {" "}
                    </Link>{" "}
                  </span>
                </p>
              </div>
              <Button
                onClick={() => router.push("/ai-recommendations")}
                className="h-11 px-6 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-medium shadow-md shadow-indigo-500/10 transition-all hover:scale-[1.02] active:scale-[0.98] gap-2 shrink-0 self-start sm:self-center"
              >
                <Brain className="h-5 w-5" />
                {t("AiRecommendBtn")}
              </Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
          {/*- giữ bộ lọc dính cố định khi cuộn trang trên màn hình lớn */}
          <aside className="hidden lg:block lg:sticky lg:top-6 self-start h-fit rounded-2xl border border-border bg-card p-4">
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
                {t("FoundJobs", { count: meta.totalItems })}
              </p>

              <div className="lg:hidden">
                <Sheet
                  open={openMobileFilter}
                  onOpenChange={setOpenMobileFilter}
                >
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <SlidersHorizontal className="h-4 w-4" />
                      {t("FilterMobile")}
                    </Button>
                  </SheetTrigger>
                  <SheetContent
                    side="right"
                    className="w-[92vw] overflow-y-auto sm:w-[420px]"
                  >
                    <SheetHeader>
                      <SheetTitle>{t("AdvancedFilter")}</SheetTitle>
                    </SheetHeader>

                    <div className="mt-5 px-3">
                      <AdvancedFilterPanel
                        value={filters.advanced}
                        industryIDs={
                          filters.industryId ? [filters.industryId] : []
                        }
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
                  <DataTablePagination
                    meta={meta}
                    onPageChange={handlePageChange}
                  />
                </div>
              </>
            ) : (
              <div className="rounded-xl border border-dashed py-14 text-center text-muted-foreground">
                {t("NoJobs")}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
