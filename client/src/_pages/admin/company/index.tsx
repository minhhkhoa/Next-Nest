"use client";

import { Button } from "@/components/ui/button";
import { InfoIcon, MoreVerticalIcon, Plus, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { useDebounce } from "use-debounce";
import { SearchBar } from "../NewsCategory/components/search-bar";
import { Spinner } from "@/components/ui/spinner";
import { CompanyResType } from "@/schemasvalidation/company";
import {
  useAdminVerifyCompany,
  useDeleteCompany,
  useDeleteManyCompany,
  useGetCompaniesFilter,
} from "@/queries/useCompany";
import { getCompanyColumns } from "./companyColumn";
import TableCompany from "./tableCompany";
import { useQueryFilter } from "@/hooks/useQueryFilter";
import { CompanyDialogForm } from "./components/company-modal-form";
import SoftSuccessSonner from "@/components/shadcn-studio/sonner/SoftSuccessSonner";
import Link from "next/link";
import { Popover } from "@radix-ui/react-popover";
import { PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DeleteConfirmModal } from "../NewsCategory/components/modals/delete-confirm-modal";
import SoftDestructiveSonner from "@/components/shadcn-studio/sonner/SoftDestructiveSonner";

const statusFilters = [
  { label: "Tất cả", value: "" },
  { label: "Đang hoạt động", value: "ACCEPT" },
  { label: "Chờ phê duyệt", value: "PENDING" },
];

export default function PageAdminCompany() {
  const [filtersCompany, setFiltersCompany] = useState<{
    name: string;
    status: string;
    address: string;
  }>({
    name: "",
    status: "",
    address: "",
  });
  const [currentPage, setCurrentPage] = React.useState(1);
  const [idDeleteMany, setIdDeleteMany] = useState<string[]>([]);

  const [companyModalState, setCompanyModalState] = useState<{
    isOpen: boolean;
    data?: CompanyResType;
  }>({ isOpen: false });

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    id: string;
  }>({ isOpen: false, id: "" });

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
    });

  const { mutateAsync: deleteCompanyMutation, isPending: isDeleteCompany } =
    useDeleteCompany();

  const { mutateAsync: deleteManyCompanyMutation } = useDeleteManyCompany();

  const handleConfirmDelete = async () => {
    try {
      const res = await deleteCompanyMutation(deleteModal.id);

      if (res.isError) SoftDestructiveSonner("Có lỗi xảy ra khi xóa quyền hạn");

      SoftSuccessSonner(res.message);
      setDeleteModal({ isOpen: false, id: "" });
    } catch (error) {
      SoftDestructiveSonner("Có lỗi xảy ra khi xóa quyền hạn");
      console.log("error delete company: ", error);
    }
  };

  const handleDeleteManyCompany = async () => {
    try {
      if (idDeleteMany.length === 0) return;

      const res = await deleteManyCompanyMutation(idDeleteMany);

      if (res.isError) SoftDestructiveSonner("Có lỗi xảy ra khi xóa công ty");

      setIdDeleteMany([]);

      SoftSuccessSonner(res.message);
    } catch (error) {
      console.log("error delete many company", error);
    }
  };

  const handleOpenEditModal = (company: CompanyResType) => {
    setCompanyModalState({ isOpen: true, data: company });
  };

  const handleOpenDeleteModal = (company: CompanyResType) => {
    setDeleteModal({ isOpen: true, id: company._id });
  };

  const handleStatusFilterChange = (status: string) => {
    setFiltersCompany((prev) => ({ ...prev, status }));
    setCurrentPage(1);
  };

  const { mutateAsync: verifyCompanyMutation } = useAdminVerifyCompany();

  const handleVerifyCompany = async (
    companyID: string,
    action: "ACCEPT" | "REJECT",
  ) => {
    try {
      const res = await verifyCompanyMutation({ companyID, action });

      if (res.isError) {
        // Hiển thị thông báo lỗi
        console.log("Có lỗi xảy ra khi phê duyệt công ty");
        return;
      }

      SoftSuccessSonner(res.message);
    } catch (error) {
      console.log("error verify company: ", error);
    }
  };

  //- custom Hook
  useQueryFilter("statusFilterCompany", (value) => {
    if (value === "PENDING") {
      setFiltersCompany((prev) => ({ ...prev, status: value }));
    }
  });

  const columns = getCompanyColumns(
    handleOpenEditModal,
    handleOpenDeleteModal,
    handleVerifyCompany,
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <HeaderPage />
            </div>
            <div className="flex gap-3">
              {idDeleteMany.length > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteManyCompany}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Xóa ({idDeleteMany.length})
                </Button>
              )}
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
            setIdDeleteMany={setIdDeleteMany}
          />
        ) : (
          <div className="flex justify-center">
            <Spinner />
          </div>
        )}
      </div>
      {/* Dialog */}
      {companyModalState?.isOpen && (
        <CompanyDialogForm
          onClose={() => setCompanyModalState({ isOpen: false })}
          data={companyModalState?.data}
        />
      )}

      {/* modal confirm delete */}
      {deleteModal.isOpen && (
        <DeleteConfirmModal
          title="Xóa vai trò"
          isDeleting={isDeleteCompany}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteModal({ isOpen: false, id: "" })}
        />
      )}
    </div>
  );
}

function HeaderPage() {
  return (
    <div>
      <div className="flex items-center">
        <p className="text-3xl font-bold text-foreground">Danh sách công ty</p>

        <Popover modal={false}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="ml-2 text-muted-foreground hover:text-foreground transition"
            >
              <InfoIcon className="h-4 w-4" color="yellow" />
            </button>
          </PopoverTrigger>

          <PopoverContent className="w-80">
            <div className="space-y-3">
              <p className="font-semibold">Thông tin quản lý công ty</p>

              <p className="text-sm text-muted-foreground">
                Khu vực này hiển thị các công ty đang hoạt động. Bạn có thể xem,
                chỉnh sửa thông tin và quản lý trạng thái công ty.
              </p>

              <p className="text-sm text-muted-foreground">
                Nếu bạn không tìm thấy công ty mong muốn, có thể công ty đó đã
                bị xoá tạm thời.
              </p>

              <div className="pt-2">
                <Link href="/admin/company/company-deleted">
                  <Button variant="link" className="px-0">
                    Xem danh sách công ty đã xoá →
                  </Button>
                </Link>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <p className="mt-2 text-sm text-muted-foreground">Quản lý công ty</p>
    </div>
  );
}
