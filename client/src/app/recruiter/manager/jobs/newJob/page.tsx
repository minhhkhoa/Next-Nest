"use client";

import JobForm from "@/_pages/recruiter/manager/job/components/job-form";

export default function NewJobPage() {
  // Khoa có thể gọi mutation ở đây (nếu dùng Client Component)
  // hoặc truyền trực tiếp vào JobForm

  return (
    <div className="container mx-auto py-10">
      <JobForm
        onSubmit={async (values) => {
          // Gọi API create ở đây
          console.log("Create Job:", values);
        }}
        isPending={false}
      />
    </div>
  );
}
