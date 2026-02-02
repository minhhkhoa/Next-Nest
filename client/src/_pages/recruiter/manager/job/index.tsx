"use client";

import { Button } from "@/components/ui/button";
import { InfoIcon, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { useDebounce } from "use-debounce";
import { Spinner } from "@/components/ui/spinner";
import SoftSuccessSonner from "@/components/shadcn-studio/sonner/SoftSuccessSonner";
import Link from "next/link";
import { Popover } from "@radix-ui/react-popover";
import { PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import SoftDestructiveSonner from "@/components/shadcn-studio/sonner/SoftDestructiveSonner";
import {
  useDeleteJob,
  useDeleteManyJobs,
  useGetJobsFilter,
  useVerifyJob,
} from "@/queries/useJob";
import { JobResType } from "@/schemasvalidation/job";
import { getRecruiterJobColumns } from "./recruiter-jobColumn";
import { useAppStore } from "@/components/TanstackProvider";
import { getRoleRecruiterAdmin } from "@/lib/utils";
import TableRecruiterJob from "./recruiter-tableJob";
import { DeleteConfirmModal } from "@/_pages/admin/NewsCategory/components/modals/delete-confirm-modal";
import BlockFiltersJob, {
  FilterSelect,
  isActiveFilters,
  statusFilters,
} from "@/_pages/admin/jobs/components/blockFiltersJob";
import { SearchBar } from "@/_pages/admin/NewsCategory/components/search-bar";

export default function RecruiterAdminJobsPage() {
  const { user } = useAppStore();
  const roleCodeName = user?.roleCodeName;
  const roleRecruiterAdmin = getRoleRecruiterAdmin();

  const [filtersJob, setFiltersJob] = useState<{
    title: string;
    status: string;
    isActive: string;
    nameCreatedBy: string;
  }>({
    title: "",
    status: "",
    isActive: "",
    nameCreatedBy: "",
  });
  const [currentPage, setCurrentPage] = React.useState(1);
  const [idDeleteMany, setIdDeleteMany] = useState<string[]>([]);

  const [jobState, setJobState] = useState<{
    isOpen: boolean;
    data?: JobResType;
  }>({ isOpen: false });

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    id: string;
  }>({ isOpen: false, id: "" });

  const [debouncedSearchTitle] = useDebounce(filtersJob?.title, 500);
  const [debouncedSearchStatus] = useDebounce(filtersJob?.status, 500);
  const [debouncedSearchIsActive] = useDebounce(filtersJob?.isActive, 500);
  const [debouncedSearchNameCreatedBy] = useDebounce(
    filtersJob?.nameCreatedBy,
    500,
  );

  const { data: listJob, isLoading: isLoadingJob } = useGetJobsFilter({
    currentPage,
    pageSize: 8,
    title: debouncedSearchTitle,
    status: debouncedSearchStatus,
    isActive: debouncedSearchIsActive,
    nameCreatedBy: debouncedSearchNameCreatedBy,
  });

  const { mutateAsync: deleteJobMutation, isPending: isDeleteJob } =
    useDeleteJob();

  const { mutateAsync: deleteManyJobMutation } = useDeleteManyJobs();

  //- chi cho recruiter_admin
  const handleConfirmDelete = async () => {
    try {
      const res = await deleteJobMutation(deleteModal.id);
      if (res.isError) SoftDestructiveSonner("Có lỗi xảy ra khi xóa công việc");

      SoftSuccessSonner(res.message);
      setDeleteModal({ isOpen: false, id: "" });
    } catch (error) {
      SoftDestructiveSonner("Có lỗi xảy ra khi xóa công việc");
      console.log("error delete job: ", error);
    }
  };

  //- chi cho recruiter_admin
  const handleDeleteManyJob = async () => {
    try {
      if (idDeleteMany.length === 0) return;

      const res = await deleteManyJobMutation(idDeleteMany);
      if (res.isError) SoftDestructiveSonner("Có lỗi xảy ra khi xóa công việc");

      setIdDeleteMany([]);

      SoftSuccessSonner(res.message);
    } catch (error) {
      console.log("error delete many job", error);
    }
  };

  const handleOpenEditModal = (job: JobResType) => {
    //- cần navigate đến trang chi tiết công việc để chỉnh sửa kèm theo data
    setJobState({ isOpen: true, data: job });
  };

  const handleOpenDeleteModal = (job: JobResType) => {
    setDeleteModal({ isOpen: true, id: job._id });
  };

  const handleChooseFilter = (type: string, value: string) => {
    //- chuyển "all" về giá trị rỗng để lọc tất cả
    if (value === "all") value = "";

    switch (type) {
      case "status":
        setFiltersJob((prev) => ({ ...prev, status: value }));
        setCurrentPage(1);
        break;
      case "isActive":
        setFiltersJob((prev) => ({ ...prev, isActive: value }));
        setCurrentPage(1);
        break;
      default:
        break;
    }
  };

  const { mutateAsync: verifyJobMutation } = useVerifyJob();

  const handleVerifyJob = async (
    jobId: string,
    action: "ACCEPT" | "REJECT",
  ) => {
    try {
      const res = await verifyJobMutation({ jobId, action });

      if (res.isError) {
        // Hiển thị thông báo lỗi
        console.log("Có lỗi xảy ra khi phê duyệt công việc");
        return;
      }

      SoftSuccessSonner(res.message);
    } catch (error) {
      console.log("error verify company: ", error);
    }
  };

  const columns = getRecruiterJobColumns(
    handleOpenEditModal,
    handleOpenDeleteModal,
    roleCodeName === roleRecruiterAdmin ? handleVerifyJob : undefined,
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="">
        <div className="mx-auto max-w-7xl px-5 py-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold">Quản lý công việc</p>
            </div>
            <div className="flex gap-3">
              {idDeleteMany.length > 0 &&
                roleCodeName === roleRecruiterAdmin && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDeleteManyJob}
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
        {/* khối lọc */}
        <div>
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <SearchBar
                value={filtersJob.title}
                onChange={(value) =>
                  setFiltersJob((prev) => ({ ...prev, title: value }))
                }
                placeholder="Tìm theo tên công việc"
              />
            </div>

            <div className="flex-1">
              <SearchBar
                value={filtersJob.nameCreatedBy}
                onChange={(value) =>
                  setFiltersJob((prev) => ({ ...prev, nameCreatedBy: value }))
                }
                placeholder="Tìm theo tên người tạo công việc"
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:gap-10 gap-3 py-3">
            {/* Filter section active */}
            <FilterSelect
              label="Lọc theo trạng thái:"
              value={filtersJob.status}
              options={statusFilters}
              onChange={(value) => handleChooseFilter("status", value)}
            />

            {/* Filter section isActive */}
            <FilterSelect
              label="Lọc theo kích hoạt:"
              value={filtersJob.isActive}
              options={isActiveFilters}
              onChange={(value) => handleChooseFilter("isActive", value)}
            />
          </div>
        </div>

        {/* Table */}
        {!isLoadingJob ? (
          <TableRecruiterJob
            data={listJob?.data?.result ?? []}
            columns={columns}
            meta={
              listJob?.data?.meta ?? {
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

      {/* modal confirm delete */}
      {deleteModal.isOpen && (
        <DeleteConfirmModal
          title="Xóa vai trò"
          isDeleting={isDeleteJob}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteModal({ isOpen: false, id: "" })}
        />
      )}
    </div>
  );
}
