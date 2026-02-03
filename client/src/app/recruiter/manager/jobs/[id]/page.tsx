"use client";

import { useParams } from "next/navigation";
import { useGetJobDetail, useUpdateJob } from "@/queries/useJob";
import { Spinner } from "@/components/ui/spinner";
import JobForm from "@/_pages/recruiter/manager/job/components/job-form";
import { JobUpdateForRecruiterType } from "@/schemasvalidation/job";
import SoftSuccessSonner from "@/components/shadcn-studio/sonner/SoftSuccessSonner";

export default function EditJobPage() {
  const params = useParams();
  const jobId = params.id as string;

  //- Fetch dữ liệu chi tiết Job từ Backend
  const { data: jobDetail, isLoading } = useGetJobDetail(jobId);

  const { mutateAsync: updateJob, isPending } = useUpdateJob();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const handleUpdate = async (values: JobUpdateForRecruiterType) => {
    try {
      const res = await updateJob({ id: jobId, payload: values });

      if (res?.isError) return;

      SoftSuccessSonner(res?.message);
    } catch (error) {
      console.error("error handle update job: ", error);
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
