"use client";

import React, { useState } from "react";
import { useDebounce } from "use-debounce";
import { Spinner } from "@/components/ui/spinner";
import SoftSuccessSonner from "@/components/shadcn-studio/sonner/SoftSuccessSonner";
import SoftDestructiveSonner from "@/components/shadcn-studio/sonner/SoftDestructiveSonner";
import { DeleteConfirmModal } from "@/_pages/admin/NewsCategory/components/modals/delete-confirm-modal";
import {
  FilterSelect,
  isActiveFilters,
} from "@/_pages/admin/jobs/components/blockFiltersJob";
import { SearchBar } from "@/_pages/admin/NewsCategory/components/search-bar";
import {
  useDeleteApplication,
  useFindAllApplications,
  useGetApplicationDetail,
} from "@/queries/useApplication";
import { ApplicationResType } from "@/schemasvalidation/application";
import TableApplication from "./application-tableJob";
import { getApplicationColumns } from "./application-jobColumn";
import { APPLICATION_STATUS } from "@/lib/constant";

export default function RecruiterApplicationPage() {
  const [filtersApplication, setFiltersApplication] = useState<{
    status: string | undefined;
    jobId: string | undefined;
    minRating: number | undefined;
    keyword: string | undefined;
  }>({
    status: undefined,
    jobId: undefined,
    minRating: undefined,
    keyword: undefined,
  });
  const [currentPage, setCurrentPage] = React.useState(1);

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    id: string;
  }>({ isOpen: false, id: "" });

  const [debouncedSearchTitle] = useDebounce(filtersApplication?.keyword, 500);
  const [debouncedSearchStatus] = useDebounce(filtersApplication?.status, 500);
  const [debouncedSearchMinRating] = useDebounce(
    filtersApplication?.minRating,
    500,
  );

  const { data: listApplication, isLoading: isLoadingApplication } =
    useFindAllApplications({
      currentPage,
      pageSize: 8,
      status: debouncedSearchStatus,
      minRating: debouncedSearchMinRating,
      keyword: debouncedSearchTitle,
    });

  const {
    mutateAsync: deleteApplicationMutation,
    isPending: isDeleteApplication,
  } = useDeleteApplication();

  //- chi cho recruiter_admin
  const handleConfirmDelete = async () => {
    try {
      const res = await deleteApplicationMutation(deleteModal.id);
      if (res.isError)
        SoftDestructiveSonner("Có lỗi xảy ra khi xóa đơn ứng tuyển");

      SoftSuccessSonner(res.message);
      setDeleteModal({ isOpen: false, id: "" });
    } catch (error) {
      SoftDestructiveSonner("Có lỗi xảy ra khi xóa đơn ứng tuyển");
      console.log("error delete application: ", error);
    }
  };

  const handleOpenEdit = (job: ApplicationResType) => {
    //- hiển thị modal
  };

  const handleOpenDeleteModal = (job: ApplicationResType) => {
    setDeleteModal({ isOpen: true, id: job._id });
  };

  const handleViewApplication = async (application: ApplicationResType) => {
    //- lấy id đã
    const idApplication = application._id;
    //- hiển thị modal chi tiết ứng tuyển
  };

  const columns = getApplicationColumns(
    handleViewApplication,
    handleOpenEdit,
    handleOpenDeleteModal,
  );

  //- custom Hook
  // useQueryFilter("isActive", (value) => {
  //   if (value === "false") {
  //     setFiltersJob((prev) => ({ ...prev, isActive: value }));
  //   }
  // });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="">
        <div className="mx-auto max-w-7xl px-5 py-8">
          <div className="flex items-center justify-between">
            <p className="text-3xl font-bold">Quản lý đơn ứng tuyển</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6">
        {/* khối lọc */}
        <div>
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <SearchBar
                value={
                  filtersApplication.keyword === undefined
                    ? ""
                    : filtersApplication.keyword
                }
                onChange={(value) =>
                  setFiltersApplication((prev) => ({ ...prev, keyword: value }))
                }
                placeholder="Tìm theo tên ứng viên"
              />
            </div>

            <div className="flex-1">
              <FilterSelect
                label="Lọc theo trạng thái:"
                value={
                  filtersApplication.status === undefined
                    ? ""
                    : filtersApplication.status
                }
                options={APPLICATION_STATUS}
                onChange={(value) =>
                  setFiltersApplication((prev) => ({ ...prev, status: value }))
                }
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:gap-10 gap-3 py-3">
            {/* Filter minRating dạng slide chọn start */}
          </div>
        </div>

        {/* Table */}
        {!isLoadingApplication ? (
          <TableApplication
            data={listApplication?.data?.result ?? []}
            columns={columns}
            meta={
              listApplication?.data?.meta ?? {
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

      {/* modal confirm delete */}
      {deleteModal.isOpen && (
        <DeleteConfirmModal
          title="Xóa vai trò"
          isDeleting={isDeleteApplication}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteModal({ isOpen: false, id: "" })}
        />
      )}
    </div>
  );
}
