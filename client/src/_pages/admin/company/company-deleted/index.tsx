"use client";

import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { useDebounce } from "use-debounce";
import { Spinner } from "@/components/ui/spinner";
import { useGetCompaniesFilter, useRestoreCompany } from "@/queries/useCompany";
import { getCompanyColumns } from "../companyColumn";
import { SearchBar } from "../../NewsCategory/components/search-bar";
import TableCompany from "../tableCompany";
import SoftSuccessSonner from "@/components/shadcn-studio/sonner/SoftSuccessSonner";
import Link from "next/link";
import { Arrow } from "@radix-ui/react-popover";
import { ArrowLeft } from "lucide-react";

const statusFilters = [
  { label: "Tất cả", value: "" },
  { label: "Đang hoạt động", value: "ACCEPT" },
  { label: "Chờ phê duyệt", value: "PENDING" },
];

export default function PageAdminCompanyDeleted() {
  const [filtersCompany, setFiltersCompany] = useState<{
    name: string;
    status: string;
    address: string;
    isDeleted: string;
  }>({
    name: "",
    status: "",
    address: "",
    isDeleted: "true",
  });
  const [currentPage, setCurrentPage] = React.useState(1);
  const [debouncedSearchName] = useDebounce(filtersCompany?.name, 500);
  const [debouncedSearchStatus] = useDebounce(filtersCompany?.status, 500);
  const [debouncedSearchAddress] = useDebounce(filtersCompany?.address, 500);

  const { data: listCompany, isLoading: isLoadingCompany } =
    useGetCompaniesFilter({
      currentPage,
      pageSize: 8,
      name: debouncedSearchName,
      address: debouncedSearchAddress,
      status: debouncedSearchStatus,
      isDeleted: "true",
    });

  const { mutateAsync: restoreCompanyMutation } = useRestoreCompany();

  const handleStatusFilterChange = (status: string) => {
    setFiltersCompany((prev) => ({ ...prev, status }));
    setCurrentPage(1);
  };

  const handleRestoreCompany = async (companyID: string) => {
    try {
      const res = await restoreCompanyMutation(companyID);

      if (res?.isError) return;

      SoftSuccessSonner(res?.message);
    } catch (error) {}
  };

  const columns = getCompanyColumns(
    undefined,
    undefined,
    undefined,
    handleRestoreCompany,
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/admin/company">
                <Button variant="link" className="px-0">
                  <ArrowLeft size={20} />
                  Trở về
                </Button>
              </Link>
              <p className="text-3xl font-semibold text-foreground">
                Danh sách công ty đã xóa
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-6 space-y-4">
          {/* Search section */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <SearchBar
                value={filtersCompany.name}
                onChange={(value) =>
                  setFiltersCompany((prev) => ({ ...prev, name: value }))
                }
                placeholder="Tìm theo tên công ty"
              />
            </div>

            <div className="flex-1">
              <SearchBar
                value={filtersCompany.address}
                onChange={(value) =>
                  setFiltersCompany((prev) => ({ ...prev, address: value }))
                }
                placeholder="Tìm theo địa chỉ"
              />
            </div>
          </div>

          {/* Filter section */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
              Lọc theo trạng thái
            </span>

            <div className="flex gap-2 flex-wrap">
              {statusFilters.map((item) => (
                <Button
                  key={item.value}
                  variant={
                    filtersCompany.status === item.value ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => handleStatusFilterChange(item.value)}
                  className="rounded-full px-4"
                >
                  {item.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        {!isLoadingCompany ? (
          <TableCompany
            data={listCompany?.data?.result ?? []}
            columns={columns}
            meta={
              listCompany?.data?.meta ?? {
                current: 0,
                pageSize: 0,
                totalPages: 0,
                totalItems: 0,
              }
            }
            setCurrentPage={setCurrentPage}
          />
        ) : (
          <div className="flex justify-center">
            <Spinner />
          </div>
        )}
      </div>
    </div>
  );
}
