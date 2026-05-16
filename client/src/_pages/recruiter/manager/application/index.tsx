"use client";

import React, { useState } from "react";
import { useDebounce } from "use-debounce";
import { Spinner } from "@/components/ui/spinner";
import SoftSuccessSonner from "@/components/shadcn-studio/sonner/SoftSuccessSonner";
import SoftDestructiveSonner from "@/components/shadcn-studio/sonner/SoftDestructiveSonner";
import { DeleteConfirmModal } from "@/_pages/admin/NewsCategory/components/modals/delete-confirm-modal";
import { FilterSelect } from "@/_pages/admin/jobs/components/blockFiltersJob";
import { SearchBar } from "@/_pages/admin/NewsCategory/components/search-bar";
import {
  useDeleteApplication,
  useFindAllApplications,
} from "@/queries/useApplication";
import { ApplicationResType } from "@/schemasvalidation/application";
import TableApplication from "./application-tableJob";
import { getApplicationColumns } from "./application-jobColumn";
import { APPLICATION_STATUS } from "@/lib/constant";
import { EditApplicationDialog } from "./components/EditApplicationDialog";
import { ViewApplicationSheet } from "./components/ViewApplicationSheet";
import { RatingSlider } from "./components/RatingSlider";

export default function RecruiterApplicationPage() {
  const [filtersApplication, setFiltersApplication] = useState<{
    status: string | undefined;
    jobId: string | undefined;
    minScore: number | undefined;
    keyword: string | undefined;
  }>({
    status: undefined,
    jobId: undefined,
    minScore: undefined,
    keyword: undefined,
  });
  const [currentPage, setCurrentPage] = React.useState(1);

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    id: string;
  }>({ isOpen: false, id: "" });

  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    application: ApplicationResType | null;
  }>({ isOpen: false, application: null });

  const [viewSheet, setViewSheet] = useState<{
    isOpen: boolean;
    applicationId: string | null;
  }>({ isOpen: false, applicationId: null });

  const [debouncedSearchTitle] = useDebounce(filtersApplication?.keyword, 500);
  const [debouncedSearchStatus] = useDebounce(filtersApplication?.status, 500);
  const [debouncedSearchMinScore] = useDebounce(
    filtersApplication?.minScore,
    500,
  );

  const { data: listApplication, isLoading: isLoadingApplication } =
    useFindAllApplications({
      currentPage,
      pageSize: 8,
      status: debouncedSearchStatus,
      minScore: debouncedSearchMinScore,
      keyword: debouncedSearchTitle,
    });

  const {
    mutateAsync: deleteApplicationMutation,
    isPending: isDeleteApplication,
  } = useDeleteApplication();

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

  const handleOpenEdit = (application: ApplicationResType) => {
    setEditModal({ isOpen: true, application });
  };

  const handleOpenDeleteModal = (application: ApplicationResType) => {
    setDeleteModal({ isOpen: true, id: application._id });
  };

  const handleViewApplication = async (application: ApplicationResType) => {
    setViewSheet({ isOpen: true, applicationId: application._id });
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
        <div className="flex flex-col md:flex-row gap-4 items-center mb-3">
          {/* Search */}
          <div className="w-full md:w-1/3">
            <SearchBar
              value={
                filtersApplication.keyword === undefined
                  ? ""
                  : filtersApplication.keyword
              }
              onChange={(value) =>
                setFiltersApplication((prev) => ({ ...prev, keyword: value }))
              }
              placeholder="Tìm theo tên ứng viên, thư..."
            />
          </div>

          {/* Độ tiềm năng - Slider custom */}
          <RatingSlider
            value={filtersApplication.minScore || 0}
            onChange={(val) =>
              setFiltersApplication((prev) => ({ ...prev, minScore: val }))
            }
          />

          {/* Trạng thái */}
          <div className="w-full md:w-1/4">
            <FilterSelect
              label="Trạng thái"
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
          title="Xóa đơn ứng tuyển"
          isDeleting={isDeleteApplication}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteModal({ isOpen: false, id: "" })}
        />
      )}

      {/* modal edit application */}
      {editModal.isOpen && (
        <EditApplicationDialog
          open={editModal.isOpen}
          onOpenChange={(open) =>
            setEditModal((prev) => ({ ...prev, isOpen: open }))
          }
          application={editModal.application}
        />
      )}

      {/* sheet view application CV */}
      <ViewApplicationSheet
        open={viewSheet.isOpen}
        onOpenChange={(open) =>
          setViewSheet((prev) => ({ ...prev, isOpen: open }))
        }
        applicationId={viewSheet.applicationId}
      />
    </div>
  );
}
