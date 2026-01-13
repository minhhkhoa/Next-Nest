"use client";

import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import React, { use, useState } from "react";
import PermissionFilter from "./component/permission-filter";
import { useDebounce } from "use-debounce";
import {
  useDeleteManyPermission,
  useDeletePermission,
  useGetAllModuleBussiness,
  useGetPermissionFilter,
} from "@/queries/permission";
import { envConfig } from "../../../../../config";
import { getPermissionColumns } from "./permissionColumn";
import { Spinner } from "@/components/ui/spinner";
import { PermissionDialogForm } from "./component/permission-modal-form";
import { PermissionResType } from "@/schemasvalidation/permission";
import TablePermission from "./tablePermission";
import { DeleteConfirmModal } from "../NewsCategory/components/modals/delete-confirm-modal";
import SoftDestructiveSonner from "@/components/shadcn-studio/sonner/SoftDestructiveSonner";
import SoftSuccessSonner from "@/components/shadcn-studio/sonner/SoftSuccessSonner";
import { set } from "zod";

export default function PagePermission() {
  const [filters, setFilters] = useState<{
    name: string;
    method: string;
    module: string;
  }>({
    name: "",
    method: "",
    module: "",
  });
  const [currentPage, setCurrentPage] = React.useState(1);
  const [idDeleteMany, setIdDeleteMany] = useState<string[]>([]);

  const [permissionModalState, setPermissionModalState] = useState<{
    isOpen: boolean;
    data?: PermissionResType;
  }>({ isOpen: false });

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    id: string;
  }>({ isOpen: false, id: "" });

  const [debouncedSearchName] = useDebounce(filters.name, 500);
  const [debouncedSearchMethod] = useDebounce(filters.method, 500);
  const [debouncedSearchModule] = useDebounce(filters.module, 500);

  const { data: listPermissions, isLoading: isLoadingPermission } =
    useGetPermissionFilter({
      currentPage,
      pageSize: Number(envConfig.NEXT_PUBLIC_PAGE_SIZE),
      name: debouncedSearchName,
      method: debouncedSearchMethod,
      module: debouncedSearchModule,
    });

  const { data: listModules } = useGetAllModuleBussiness();

  const {
    mutateAsync: deletePermissionMutation,
    isPending: isDeletePermission,
  } = useDeletePermission();

  const {
    mutateAsync: deleteManyPermissionMutation,
  } = useDeleteManyPermission();

  const handleDeleteManyPermission = async () => {
    try {
      if (idDeleteMany.length === 0) return;

      const res = await deleteManyPermissionMutation(idDeleteMany);

      if (res.isError) SoftDestructiveSonner("Có lỗi xảy ra khi xóa quyền hạn");

      setIdDeleteMany([]);

      SoftSuccessSonner(res.message);
    } catch (error) {
      console.log("error delete many permission");
    }
  };

  const handleOpenEditModal = (permission: PermissionResType) => {
    setPermissionModalState({ isOpen: true, data: permission });
  };

  const handleOpenDeleteModal = (permission: PermissionResType) => {
    setDeleteModal({ isOpen: true, id: permission._id });
  };

  const columns = getPermissionColumns(
    handleOpenEditModal,
    handleOpenDeleteModal
  );

  const handleConfirmDelete = async () => {
    try {
      const res = await deletePermissionMutation(deleteModal.id);

      if (res.isError) SoftDestructiveSonner("Có lỗi xảy ra khi xóa quyền hạn");

      SoftSuccessSonner(res.message);
      setDeleteModal({ isOpen: false, id: "" });
    } catch (error) {
      SoftDestructiveSonner("Có lỗi xảy ra khi xóa quyền hạn");
      console.log("error delete permission: ", error);
    }
  };

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
                  onClick={handleDeleteManyPermission}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete ({idDeleteMany.length})
                </Button>
              )}
              <Button
                onClick={() => setPermissionModalState({ isOpen: true })}
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
          <PermissionFilter
            filters={filters}
            setFilters={setFilters}
            listModules={listModules?.data ?? []}
          />
        </div>

        {/* Table */}
        {!isLoadingPermission ? (
          <TablePermission
            data={listPermissions?.data?.result ?? []}
            columns={columns}
            meta={
              listPermissions?.data?.meta ?? {
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
      {permissionModalState.isOpen && (
        <PermissionDialogForm
          onClose={() => setPermissionModalState({ isOpen: false })}
          permission={permissionModalState.data}
          listModules={listModules?.data ?? []}
        />
      )}

      {/* modal confirm delete */}
      {deleteModal.isOpen && (
        <DeleteConfirmModal
          title="Xóa quyền hạn"
          isDeleting={isDeletePermission}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteModal({ isOpen: false, id: "" })}
        />
      )}
    </div>
  );
}
