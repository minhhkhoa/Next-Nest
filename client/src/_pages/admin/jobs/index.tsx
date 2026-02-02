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
import { DeleteConfirmModal } from "../NewsCategory/components/modals/delete-confirm-modal";
import SoftDestructiveSonner from "@/components/shadcn-studio/sonner/SoftDestructiveSonner";
import {
  useDeleteJob,
  useDeleteManyJobs,
  useGetJobsFilter,
} from "@/queries/useJob";
import { JobResType } from "@/schemasvalidation/job";
import { getJobColumns } from "./jobColumn";
import TableJob from "./tableJob";
import BlockFiltersJob from "./components/blockFiltersJob";
import { JobDialogForm } from "./components/job-modal-form";

export default function PageAdminJob() {
  const [filtersJob, setFiltersJob] = useState<{
    title: string;
    status: string;
    isActive: string;
    nameCreatedBy: string;
    isHot: string;
    fieldCompany: string;
  }>({
    title: "",
    status: "",
    isActive: "",
    nameCreatedBy: "",
    isHot: "",
    fieldCompany: "",
  });
  const [currentPage, setCurrentPage] = React.useState(1);
  const [idDeleteMany, setIdDeleteMany] = useState<string[]>([]);

  const [jobModalState, setJobModalState] = useState<{
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
  const [debouncedSearchIsHot] = useDebounce(filtersJob?.isHot, 500);
  const [debouncedSearchFieldCompany] = useDebounce(
    filtersJob?.fieldCompany,
    500,
  );

  const { data: listJob, isLoading: isLoadingJob } = useGetJobsFilter({
    currentPage,
    pageSize: 8,
    title: debouncedSearchTitle,
    status: debouncedSearchStatus,
    isActive: debouncedSearchIsActive,
    nameCreatedBy: debouncedSearchNameCreatedBy,
    isHot: debouncedSearchIsHot,
    fieldCompany: debouncedSearchFieldCompany,
  });

  const { mutateAsync: deleteJobMutation, isPending: isDeleteJob } =
    useDeleteJob();

  const { mutateAsync: deleteManyJobMutation } = useDeleteManyJobs();

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
    setJobModalState({ isOpen: true, data: job });
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
      case "isHot":
        setFiltersJob((prev) => ({ ...prev, isHot: value }));
        setCurrentPage(1);
        break;
      default:
        break;
    }
  };

  const columns = getJobColumns(handleOpenEditModal, handleOpenDeleteModal);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="">
        <div className="mx-auto max-w-7xl px-5 py-8">
          <div className="flex items-center justify-between">
            <div>
              <HeaderPage />
            </div>
            <div className="flex gap-3">
              {idDeleteMany.length > 0 && (
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
          <BlockFiltersJob
            filtersJob={filtersJob}
            setFiltersJob={setFiltersJob}
            handleChooseFilter={handleChooseFilter}
          />
        </div>

        {/* Table */}
        {!isLoadingJob ? (
          <TableJob
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

      {/* Dialog */}
      {jobModalState?.isOpen && (
        <JobDialogForm
          onClose={() => setJobModalState({ isOpen: false })}
          data={jobModalState?.data}
        />
      )}

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

function HeaderPage() {
  return (
    <div>
      <div className="flex items-center">
        <p className="text-3xl font-bold text-foreground">
          Danh sách công việc
        </p>

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
              <p className="font-semibold">Thông tin quản lý công việc</p>

              <p className="text-sm text-muted-foreground">
                Khu vực này hiển thị các công việc đang hoạt động. Bạn có thể
                xem, chỉnh sửa thông tin và quản lý trạng thái công việc.
              </p>

              <p className="text-sm text-muted-foreground">
                Nếu bạn không tìm thấy công việc mong muốn, có thể công việc đó
                đã bị xoá tạm thời.
              </p>

              <div className="pt-2">
                <Link href="/admin/jobs/job-deleted">
                  <Button variant="link" className="px-0">
                    Xem danh sách công việc đã xoá →
                  </Button>
                </Link>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <p className="mt-2 text-sm text-muted-foreground">Quản lý công việc</p>
    </div>
  );
}
