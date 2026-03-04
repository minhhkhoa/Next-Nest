import applicationApiRequest from "@/apiRequest/application";
import {
  CreateApplicationType,
  UpdateApplicationType,
  FindApplicationFilterType,
} from "@/schemasvalidation/application";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

//- hook ứng viên nộp hồ sơ ứng tuyển
export function useCreateApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateApplicationType) =>
      applicationApiRequest.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-applications"] });
    },
  });
}

//- hook recruiter xem danh sách đơn ứng tuyển với filter
export function useFindAllApplications(params: FindApplicationFilterType) {
  return useQuery({
    queryKey: ["all-applications", params],
    queryFn: () => applicationApiRequest.findAll(params),
  });
}

//- hook ứng viên xem lịch sử ứng tuyển của mình với filter
export function useFindMyApplications(params: FindApplicationFilterType) {
  return useQuery({
    queryKey: ["my-applications", params],
    queryFn: () => applicationApiRequest.findMyApplications(params),
  });
}

//- hook xem chi tiết đơn ứng tuyển (Ứng viên hoặc Recruiter)
export function useGetApplicationDetail(id: string) {
  return useQuery({
    queryKey: ["application-detail", id],
    queryFn: () => applicationApiRequest.findOne(id),
    enabled: !!id,
  });
}

//- hook recruiter cập nhật trạng thái đơn
export function useUpdateApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateApplicationType;
    }) => applicationApiRequest.update(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["application-detail", variables.id],
      });
      queryClient.invalidateQueries({ queryKey: ["all-applications"] });
    },
  });
}

//- hook xóa đơn ứng tuyển
export function useDeleteApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => applicationApiRequest.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-applications"] });
      queryClient.invalidateQueries({ queryKey: ["my-applications"] });
    },
  });
}
