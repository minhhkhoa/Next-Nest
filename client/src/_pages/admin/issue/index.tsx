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
import TableIssue from "./issueRole";
import { IssueDialogForm } from "./components/issue-modal-form";

export default function PageIssue() {
  const [filters, setFilters] = useState<{
    type: string;
    status: string;
    searchText: string;
  }>({
    type: "SUPPORT",
    status: "PENDING",
    searchText: "",
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
        <div className="mb-6">
          <SearchBar
            value={filters.searchText}
            onChange={(value) => setFilters({ ...filters, searchText: value })}
          />
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
