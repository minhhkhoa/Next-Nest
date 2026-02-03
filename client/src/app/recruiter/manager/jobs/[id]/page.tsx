"use client";

import { useParams } from "next/navigation";
import { useGetJobDetail, useUpdateJob } from "@/queries/useJob";
import { Spinner } from "@/components/ui/spinner";
import JobForm from "@/_pages/recruiter/manager/job/components/job-form";

export default function EditJobPage() {
  const params = useParams();
  const jobId = params.id as string;

  // 1. Fetch dữ liệu chi tiết Job từ Backend
  const { data: jobDetail, isLoading } = useGetJobDetail(jobId);

  // 2. Hook update API
  const { mutateAsync: updateJob, isPending } = useUpdateJob();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const handleUpdate = async (values: any) => {
    try {
      console.log("values update job: ", values);
      // await updateJob({ id: jobId, payload: values });
      // Thêm thông báo thành công hoặc redirect ở đây
    } catch (error) {
      console.error("Update failed", error);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <JobForm
        initialData={jobDetail?.data}
        onSubmit={handleUpdate}
        isPending={isPending}
      />
    </div>
  );
}
