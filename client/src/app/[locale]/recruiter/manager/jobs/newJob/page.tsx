"use client";

import JobForm from "@/_pages/recruiter/manager/job/components/job-form";
import SoftSuccessSonner from "@/components/shadcn-studio/sonner/SoftSuccessSonner";
import { useCreateJob } from "@/queries/useJob";
import { JobCreateType } from "@/schemasvalidation/job";

export default function NewJobPage() {
  const { mutateAsync: createJobMutation, isPending } = useCreateJob();

  const handleCreateJob = async (values: JobCreateType) => {
    try {
      const res = await createJobMutation(values);

      if (res?.isError) return;

      SoftSuccessSonner(res?.message);
    } catch (error) {
      console.log("error handle create job: ", error);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <JobForm onSubmit={handleCreateJob} isPending={isPending} />
    </div>
  );
}
