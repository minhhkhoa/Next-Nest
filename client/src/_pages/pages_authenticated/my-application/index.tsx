"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";
import { ApplicationResType } from "@/schemasvalidation/application";
import applicationApiRequest from "@/apiRequest/application";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DataTablePagination from "@/components/DataTablePagination";
import { APPLICATION_STATUS } from "@/lib/constant";
import ApplicationCard from "./components/ApplicationCard";
import { SearchBar } from "@/_pages/admin/NewsCategory/components/search-bar";

import { useTranslations } from "next-intl";

export default function PageMyApplication() {
  const t = useTranslations("Candidate.MyApplication");
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearch] = useDebounce(searchTerm, 500);
  const [page, setPage] = useState<number>(1);
  const pageSize = 10;

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, activeTab]);

  const fetchApplications = async () => {
    const q: any = {
      currentPage: page,
      pageSize,
    };
    if (activeTab !== "ALL") {
      q.status = activeTab;
    }
    if (debouncedSearch) {
      q.keyword = debouncedSearch;
    }
    const res = await applicationApiRequest.findMyApplications(q);
    return res.data;
  };

  const { data, isLoading } = useQuery({
    queryKey: ["my-applications", activeTab, debouncedSearch, page, pageSize],
    queryFn: fetchApplications,
  });

  const applications = data?.result ?? [];
  const meta = data?.meta;

  return (
    <div className="container py-8 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">{t("Title")}</h1>
        <p className="text-muted-foreground">
          {t("SubTitle")}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <Tabs
          defaultValue="ALL"
          value={activeTab}
          onValueChange={(val) => {
            setActiveTab(val);
            setPage(1);
          }}
          className="w-full sm:w-auto"
        >
          <TabsList className="w-full overflow-x-auto whitespace-nowrap sm:flex-wrap h-auto justify-start">
            <TabsTrigger className="flex-none mr-2" value="ALL">{t("All")}</TabsTrigger>
            {APPLICATION_STATUS.map((status) => (
              <TabsTrigger key={status.value} className="flex-none mr-2" value={status.value}>
                {t(`Status.${status.value}` as any)}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="relative w-full sm:w-72 shrink-0">
          {/*- truyền placeholder được đa ngôn ngữ hóa */}
          <SearchBar
            placeholder={t("SearchPlaceholder")}
            onChange={setSearchTerm}
            value={searchTerm}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 bg-muted/40 animate-pulse rounded-lg border"
            />
          ))}
        </div>
      ) : applications.length > 0 ? (
        <div className="grid gap-4">
          {applications.map((app: any) => (
            <ApplicationCard
              key={app._id}
              application={app as ApplicationResType}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg bg-muted/20">
          <p className="text-muted-foreground">
            {t("NoApplications")}
          </p>
        </div>
      )}

      {meta && (meta.totalPages || 0) > 1 && (
        <DataTablePagination meta={meta} onPageChange={(p) => setPage(p)} />
      )}
    </div>
  );
}
