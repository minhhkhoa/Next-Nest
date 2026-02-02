"use client";

import { Button } from "@/components/ui/button";
import { RoleResType } from "@/schemasvalidation/role";
import { Plus, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { useDebounce } from "use-debounce";
import { SearchBar } from "../NewsCategory/components/search-bar";
import { Spinner } from "@/components/ui/spinner";
import { getRoleColumns } from "./roleColumn";
import TableRole from "./tableRole";
import { DeleteConfirmModal } from "../NewsCategory/components/modals/delete-confirm-modal";
import { RoleDialogForm } from "./components/role-modal-form";
import { useGetGroupModule } from "@/queries/usePermission";
import SoftDestructiveSonner from "@/components/shadcn-studio/sonner/SoftDestructiveSonner";
import SoftSuccessSonner from "@/components/shadcn-studio/sonner/SoftSuccessSonner";
import { useDeleteRole, useGetRoleFilter } from "@/queries/useRole";

export default function PageRole() {
  const [filtersName, setFiltersName] = useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [idDeleteMany, setIdDeleteMany] = useState<string[]>([]);

  const [roleModalState, setRoleModalState] = useState<{
    isOpen: boolean;
    data?: RoleResType;
  }>({ isOpen: false });

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    id: string;
  }>({ isOpen: false, id: "" });

  const [debouncedSearchName] = useDebounce(filtersName, 500);

  const { data: listRole, isLoading: isLoadingRole } = useGetRoleFilter({
    currentPage,
    pageSize: 8,
    name: debouncedSearchName,
  });

  const { data: listModules } = useGetGroupModule();

  const { mutateAsync: deleteRoleMutation, isPending: isDeleteRole } =
    useDeleteRole();

  const handleConfirmDelete = async () => {
    try {
      const res = await deleteRoleMutation(deleteModal.id);

      if (res.isError) SoftDestructiveSonner("Có lỗi xảy ra khi xóa quyền hạn");

      SoftSuccessSonner(res.message);
      setDeleteModal({ isOpen: false, id: "" });
    } catch (error) {
      SoftDestructiveSonner("Có lỗi xảy ra khi xóa quyền hạn");
      console.log("error delete permission: ", error);
    }
  };

  const handleOpenEditModal = (role: RoleResType) => {
    setRoleModalState({ isOpen: true, data: role });
  };

  const handleOpenDeleteModal = (role: RoleResType) => {
    setDeleteModal({ isOpen: true, id: role._id });
  };

  const columns = getRoleColumns(handleOpenEditModal, handleOpenDeleteModal);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Quyền hạn hệ thống
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Quản lý quyền hạn hệ thống
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
              <Button
                onClick={() => setRoleModalState({ isOpen: true })}
                size="sm"
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Thêm mới
              </Button>
            </div>
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-6">
          <SearchBar value={filtersName} onChange={setFiltersName} />
        </div>

        {/* Table */}
        {!isLoadingRole ? (
          <TableRole
            data={listRole?.data?.result ?? []}
            columns={columns}
            meta={
              listRole?.data?.meta ?? {
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
      {roleModalState.isOpen && (
        <RoleDialogForm
          onClose={() => setRoleModalState({ isOpen: false })}
          role={roleModalState.data}
          groupModules={listModules?.data || {}}
        />
      )}

      {/* modal confirm delete */}
      {deleteModal.isOpen && (
        <DeleteConfirmModal
          title="Xóa vai trò"
          isDeleting={isDeleteRole}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteModal({ isOpen: false, id: "" })}
        />
      )}
    </div>
  );
}
