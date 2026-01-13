"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import React, { useState } from "react";
import PermissionFilter from "./component/permission-filter";
import { useDebounce } from "use-debounce";
import { useGetPermissionFilter } from "@/queries/permission";
import { envConfig } from "../../../../../config";
import TablePermission from "./tablePermission";
import { PermissionColumns } from "./permissionColumn";
import { Spinner } from "@/components/ui/spinner";

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border">
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
              <Button onClick={() => {}} size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Thêm mới
              </Button>
            </div>
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6">
          <PermissionFilter filters={filters} setFilters={setFilters} />
        </div>

        {/* Table */}
        {!isLoadingPermission ? (
          <TablePermission
            data={listPermissions?.data?.result ?? []}
            columns={PermissionColumns}
            meta={
              listPermissions?.data?.meta ?? {
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
      {/* Dialog */}
      {/* <PermissionDialog
        open={isDialogOpen}
        onOpenChange={handleDialogClose}
        permission={editingPermission}
        onSaved={handlePermissionSaved}
      /> */}
    </div>
  );
}
