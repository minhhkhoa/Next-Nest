import jobApiRequest from "@/apiRequest/job";
import { JobCreateType, JobUpdateType } from "@/schemasvalidation/job";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

//- Hook tạo mới công việc
export function useCreateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: JobCreateType) => jobApiRequest.create(payload),
    onSuccess: () => {
      // Refresh danh sách job sau khi tạo mới
      queryClient.invalidateQueries({ queryKey: ["jobs-filter"] });
    },
  });
}

//- Hook lấy chi tiết công việc theo ID
export const useGetJobDetail = (id: string) => {
  return useQuery({
    queryKey: ["job-detail", id],
    queryFn: () => jobApiRequest.findOne(id),
    enabled: !!id, // Chỉ fetch khi có ID
  });
};

//- Hook lấy danh sách công việc có lọc nâng cao (Phân trang, search...)
export const useGetJobsFilter = (params: {
  currentPage: number;
  pageSize: number;
  title?: string;
  status?: string;
  isActive?: string;
  nameCreatedBy?: string;
  isHot?: string;
  isDeleted?: string;
  fieldCompany?: string;
}) => {
  return useQuery({
    queryKey: ["jobs-filter", params],
    queryFn: () => jobApiRequest.findJobFilter(params),
  });
};

//- Hook lấy danh sách công việc PUBLIC (Không cần login, chỉ active)
export const useGetJobsFilterPublic = (params: {
  currentPage: number;
  pageSize: number;
  title?: string;
  isHot?: string;
  fieldCompany?: string;
  address?: string;
  level?: string;
}) => {
  return useQuery({
    queryKey: ["jobs-filter-public", params],
    queryFn: () => jobApiRequest.findJobFilterPublic(params),
  });
};

//- Hook lấy toàn bộ công việc (không lọc)
export const useGetAllJobs = () => {
  return useQuery({
    queryKey: ["all-jobs"],
    queryFn: jobApiRequest.findAll,
  });
};

//- Hook cập nhật công việc
export function useUpdateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: JobUpdateType }) =>
      jobApiRequest.update(id, payload),
    onSuccess: (_, variables) => {
      // Làm tươi chi tiết job cụ thể và danh sách chung
      queryClient.invalidateQueries({ queryKey: ["job-detail", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["jobs-filter"] });
    },
  });
}

//- Hook Recruiter_Admin phê duyệt công việc
export function useVerifyJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { jobId: string; action: "ACCEPT" | "REJECT" }) =>
      jobApiRequest.recruiterAdminVerifyJob(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs-filter"] });
    },
  });
}

//- Hook xóa đơn lẻ (Soft delete)
export function useDeleteJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => jobApiRequest.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs-filter"] });
    },
  });
}

//- Hook xóa nhiều công việc
export function useDeleteManyJobs() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => jobApiRequest.removeMany(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs-filter"] });
    },
  });
}

//- Hook khôi phục công việc (Super_Admin)
export function useRestoreJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => jobApiRequest.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs-filter"] });
    },
  });
}

//- Hook lấy danh sách công việc liên quan
export const useGetRelatedJobs = (id: string, page: number, limit: number) => {
  return useQuery({
    queryKey: ["related-jobs", id, page, limit],
    queryFn: () => jobApiRequest.getRelatedJobs({ id, page, limit }),
    enabled: !!id,
    placeholderData: (previousData) => previousData,
  });
};
