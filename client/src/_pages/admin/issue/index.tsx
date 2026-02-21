"use client";

import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import React, { useState } from "react";
import { useDebounce } from "use-debounce";
import { SearchBar } from "../NewsCategory/components/search-bar";
import { Spinner } from "@/components/ui/spinner";
import { getIssueColumns } from "./issueColumn";
import { DeleteConfirmModal } from "../NewsCategory/components/modals/delete-confirm-modal";
import SoftDestructiveSonner from "@/components/shadcn-studio/sonner/SoftDestructiveSonner";
import SoftSuccessSonner from "@/components/shadcn-studio/sonner/SoftSuccessSonner";
import { IssueResType } from "@/schemasvalidation/issue";
import { useDeleteIssue, useGetIssueFilter } from "@/queries/useIssue";
import TableIssue from "./tableIssue";
import { IssueDialogForm } from "./components/issue-modal-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ISSUE_STATUS_OPTIONS, ISSUE_TYPE_OPTIONS } from "@/lib/constant";
import { useQueryFilter } from "@/hooks/useQueryFilter";

export default function PageIssueAdmin() {
  const [filters, setFilters] = useState<{
    type: string | undefined;
    status: string | undefined;
    searchText: string | undefined;
  }>({
    type: undefined,
    status: undefined,
    searchText: undefined,
  });
  const [currentPage, setCurrentPage] = React.useState(1);
  const [idDeleteMany, setIdDeleteMany] = useState<string[]>([]);

  const [issueModalState, setIssueModalState] = useState<{
    isOpen: boolean;
    data?: IssueResType;
  }>({ isOpen: false });

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    id: string;
  }>({ isOpen: false, id: "" });

  const [debouncedSearchName] = useDebounce(filters.searchText, 500);

  const { data: listIssue, isLoading: isLoadingIssue } = useGetIssueFilter({
    currentPage,
    pageSize: 8,
    type: filters.type,
    status: filters.status,
    searchText: debouncedSearchName,
  });

  const { mutateAsync: deleteIssueMutation, isPending: isDeleteIssue } =
    useDeleteIssue();

  const handleConfirmDelete = async () => {
    try {
      const res = await deleteIssueMutation(deleteModal.id);

      if (res.isError) SoftDestructiveSonner("Có lỗi xảy ra khi xóa vấn đề");

      SoftSuccessSonner(res.message);
      setDeleteModal({ isOpen: false, id: "" });
    } catch (error) {
      SoftDestructiveSonner("Có lỗi xảy ra khi xóa vấn đề");
      console.log("error delete permission: ", error);
    }
  };

  const handleOpenEditModal = (issue: IssueResType) => {
    setIssueModalState({ isOpen: true, data: issue });
  };

  const handleOpenDeleteModal = (issue: IssueResType) => {
    setDeleteModal({ isOpen: true, id: issue._id });
  };

  //- custom Hook
  useQueryFilter("statusFilterIssue", (value) => {
    if (value === "PENDING") {
      setFilters((prev) => ({ ...prev, status: value }));
    }
  });

  const columns = getIssueColumns(handleOpenEditModal, handleOpenDeleteModal);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Vấn đề hệ thống
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Quản lý vấn đề hệ thống
              </p>
            </div>
            <div className="flex gap-3">
              {idDeleteMany.length > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {}}
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
        <div className="mb-6 flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <SearchBar
              value={filters.searchText ?? ""}
              onChange={(value) =>
                setFilters({ ...filters, searchText: value })
              }
              placeholder="Tìm kiếm vấn đề..."
            />
          </div>

          <div className="flex gap-4">
            <Select
              value={filters.type || "all"}
              onValueChange={(value) =>
                setFilters({
                  ...filters,
                  type: value === "all" ? undefined : value,
                })
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Loại vấn đề" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại</SelectItem>
                {ISSUE_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label.vi}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.status || "all"}
              onValueChange={(value) =>
                setFilters({
                  ...filters,
                  status: value === "all" ? undefined : value,
                })
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                {ISSUE_STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label.vi}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        {!isLoadingIssue ? (
          <TableIssue
            data={listIssue?.data?.result ?? []}
            columns={columns}
            meta={
              listIssue?.data?.meta ?? {
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

      {issueModalState.isOpen && (
        <IssueDialogForm
          open={issueModalState.isOpen}
          onClose={() => setIssueModalState({ isOpen: false })}
          issue={issueModalState.data}
        />
      )}

      {/* modal confirm delete */}
      {deleteModal.isOpen && (
        <DeleteConfirmModal
          title="Xóa vấn đề"
          isDeleting={isDeleteIssue}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteModal({ isOpen: false, id: "" })}
        />
      )}
    </div>
  );
}
