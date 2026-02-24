"use client";

import { notFound, useParams } from "next/navigation";
import { useGetJobDetail, useUpdateJob } from "@/queries/useJob";
import { Spinner } from "@/components/ui/spinner";
import JobForm from "@/_pages/recruiter/manager/job/components/job-form";
import { JobUpdateForRecruiterType } from "@/schemasvalidation/job";
import SoftSuccessSonner from "@/components/shadcn-studio/sonner/SoftSuccessSonner";
import { isValidObjectId } from "@/lib/utils";

export default function EditJobPage() {
  const params = useParams();
  const jobId = params.id as string;

  //- Validate jobId
  const isIdValid = isValidObjectId(jobId);

  if (!isIdValid) {
    notFound();
  }

  //- Fetch dữ liệu chi tiết Job từ Backend
  const { data: jobDetail, isLoading, error } = useGetJobDetail(jobId);

  const { mutateAsync: updateJob, isPending } = useUpdateJob();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error || !jobDetail?.data) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold text-red-500">
          Không tìm thấy thông tin công việc hoặc có lỗi xảy ra.
        </h1>
        <p className="text-gray-500 mt-2">
          Vui lòng kiểm tra lại đường dẫn hoặc thử lại sau.
        </p>
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
