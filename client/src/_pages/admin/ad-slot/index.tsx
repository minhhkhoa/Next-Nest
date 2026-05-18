"use client";

import React, { useState } from "react";
import { useDebounce } from "use-debounce";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Plus, LayoutGrid } from "lucide-react";
import SoftSuccessSonner from "@/components/shadcn-studio/sonner/SoftSuccessSonner";
import SoftDestructiveSonner from "@/components/shadcn-studio/sonner/SoftDestructiveSonner";
import { DeleteConfirmModal } from "../NewsCategory/components/modals/delete-confirm-modal";
import { AdSlotResType } from "@/schemasvalidation/adSlot";
import {
  useDeleteAdSlot,
  useGetAdSlotsFilter,
  useRestoreAdSlot,
  useToggleAdSlotActive,
} from "@/queries/useAdSlot";
import { getAdSlotColumns } from "./adSlotColumn";
import TableAdSlot from "./tableAdSlot";
import { AdSlotModalForm } from "./components/adSlotModalForm";
import { SearchBar } from "../NewsCategory/components/search-bar";

//- Trang quản lý vị trí quảng cáo (AdSlot)
export default function PageAdminAdSlot() {
  const [currentPage, setCurrentPage] = useState(1);

  //- State bộ lọc
  const [filters, setFilters] = useState<{
    keyword: string;
    page: string;
    isActive: string;
    isDeleted: string;
  }>({
    keyword: "",
    page: "",
    isActive: "",
    isDeleted: "false",
  });

  //- State modal tạo/chỉnh sửa
  const [slotModal, setSlotModal] = useState<{
    isOpen: boolean;
    data?: AdSlotResType;
  }>({ isOpen: false });

  //- State modal xác nhận xóa
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    id: string;
    code: string;
  }>({ isOpen: false, id: "", code: "" });

  //- Debounce keyword search
  const [debouncedKeyword] = useDebounce(filters.keyword, 500);

  //- Query data
  const { data: listSlot, isLoading } = useGetAdSlotsFilter({
    currentPage,
    pageSize: 10,
    keyword: debouncedKeyword,
    page: filters.page,
    isActive: filters.isActive,
    isDeleted: filters.isDeleted,
  });

  //- Mutations
  const { mutateAsync: deleteSlot, isPending: isDeleting } = useDeleteAdSlot();
  const { mutateAsync: restoreSlot } = useRestoreAdSlot();
  const { mutateAsync: toggleActive } = useToggleAdSlotActive();

  //- Handler mở modal chỉnh sửa
  const handleOpenEdit = (slot: AdSlotResType) => {
    setSlotModal({ isOpen: true, data: slot });
  };

  //- Handler mở modal xóa
  const handleOpenDelete = (slot: AdSlotResType) => {
    setDeleteModal({ isOpen: true, id: slot._id, code: slot.code });
  };

  //- Handler xác nhận xóa
  const handleConfirmDelete = async () => {
    try {
      const res = await deleteSlot(deleteModal.id);
      if (res.isError) {
        SoftDestructiveSonner("Có lỗi xảy ra khi xóa slot");
        return;
      }
      SoftSuccessSonner(res.message ?? "Xóa slot thành công");
      setDeleteModal({ isOpen: false, id: "", code: "" });
    } catch (error) {
      SoftDestructiveSonner("Có lỗi xảy ra khi xóa slot");
      console.log("error delete slot: ", error);
    }
  };

  //- Handler bật/tắt slot
  const handleToggleActive = async (slot: AdSlotResType) => {
    try {
      const res = await toggleActive(slot._id);
      if (res.isError) {
        SoftDestructiveSonner("Có lỗi xảy ra");
        return;
      }
      const statusText = res.data?.isActive ? "bật" : "tắt";
      SoftSuccessSonner(`Đã ${statusText} slot ${slot.code}`);
    } catch (error) {
      console.log("error toggle slot: ", error);
    }
  };

  //- Handler khôi phục slot
  const handleRestore = async (slot: AdSlotResType) => {
    try {
      const res = await restoreSlot(slot._id);
      if (res.isError) {
        SoftDestructiveSonner("Có lỗi xảy ra khi khôi phục slot");
        return;
      }
      SoftSuccessSonner(`Khôi phục slot ${slot.code} thành công`);
    } catch (error) {
      console.log("error restore slot: ", error);
    }
  };

  //- Handler thay đổi filter
  const handleFilterChange = (type: string, value: string) => {
    const normalizedValue = value === "all" ? "" : value;
    setFilters((prev) => ({ ...prev, [type]: normalizedValue }));
    setCurrentPage(1);
  };

  const columns = getAdSlotColumns(
    handleOpenEdit,
    handleOpenDelete,
    handleToggleActive,
    handleRestore,
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="mx-auto max-w-7xl pb-8 md:pt-8 ">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-3xl font-bold text-foreground">
                Vị trí quảng cáo
              </p>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Quản lý các vị trí hiển thị quảng cáo trong hệ thống
            </p>
          </div>

          <Button
            onClick={() => setSlotModal({ isOpen: true, data: undefined })}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Thêm slot mới
          </Button>
        </div>
      </div>

      {/* Bộ lọc */}
      <div className="max-w-7xl mb-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Tìm kiếm theo keyword */}
          <div className="relative flex-1">
            <SearchBar
              placeholder="Tìm theo mã slot hoặc tên..."
              value={filters.keyword}
              onChange={(value) => {
                setFilters((prev) => ({ ...prev, keyword: value }));
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Lọc theo trang */}
          <Select
            value={filters.page || "all"}
            onValueChange={(val) => handleFilterChange("page", val)}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Tất cả trang" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trang</SelectItem>
              <SelectItem value="HOME">Trang chủ</SelectItem>
              <SelectItem value="JOB_DETAIL">Chi tiết việc làm</SelectItem>
              <SelectItem value="COMPANY_DETAIL">Chi tiết công ty</SelectItem>
            </SelectContent>
          </Select>

          {/* Lọc trạng thái active */}
          <Select
            value={filters.isActive || "all"}
            onValueChange={(val) => handleFilterChange("isActive", val)}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Tất cả trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="true">Đang mở</SelectItem>
              <SelectItem value="false">Đã tắt</SelectItem>
            </SelectContent>
          </Select>

          {/* Lọc slot đã xóa */}
          <Select
            value={filters.isDeleted}
            onValueChange={(val) => handleFilterChange("isDeleted", val)}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Xóa mềm" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="false">Đang hoạt động</SelectItem>
              <SelectItem value="true">Đã xóa</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Bảng dữ liệu */}
      <div className="max-w-7xl">
        {!isLoading ? (
          <TableAdSlot
            data={listSlot?.data?.result ?? []}
            columns={columns}
            meta={
              listSlot?.data?.meta ?? {
                current: 0,
                pageSize: 0,
                totalPages: 0,
                totalItems: 0,
              }
            }
            setCurrentPage={setCurrentPage}
          />
        ) : (
          <div className="flex justify-center py-20">
            <Spinner />
          </div>
        )}
      </div>

      {/* Modal tạo/chỉnh sửa slot */}
      {slotModal.isOpen && (
        <AdSlotModalForm
          onClose={() => setSlotModal({ isOpen: false })}
          data={slotModal.data}
        />
      )}

      {/* Modal xác nhận xóa */}
      {deleteModal.isOpen && (
        <DeleteConfirmModal
          title={`Xóa slot quảng cáo: ${deleteModal.code}`}
          isDeleting={isDeleting}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteModal({ isOpen: false, id: "", code: "" })}
        >
          <p className="text-sm text-amber-600 mt-2">
            ⚠️ Slot đã xóa sẽ không nhận được booking mới. Bạn có thể khôi phục
            sau.
          </p>
        </DeleteConfirmModal>
      )}
    </div>
  );
}
