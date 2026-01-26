import companyApiRequest from "@/apiRequest/company";
import { CompanyCreateType, CompanyUpdateType } from "@/schemasvalidation/company";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useCreateCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CompanyCreateType) =>
      companyApiRequest.create(payload),
    onSuccess: () => {
      // Làm tươi lại profile vì sau khi tạo company, role và status của user sẽ thay đổi
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

export const useGetCompanyDetail = (id: string) => {
  return useQuery({
    queryKey: ["company-detail", id],
    queryFn: () => companyApiRequest.findOne(id),
    enabled: !!id,
  });
};

//- Hook lấy danh sách yêu cầu gia nhập cho Recruiter Admin
export const useGetJoinRequests = (params: {
  currentPage: number;
  pageSize: number;
  name?: string;
}) => {
  return useQuery({
    queryKey: ["join-requests", params],
    queryFn: () => companyApiRequest.getJoinRequests(params),
    // Chỉ fetch khi có token (người dùng đã đăng nhập)
    enabled: !!params.currentPage,
  });
};

export const useGetCompaniesFilter = (params: {
  currentPage: number;
  pageSize: number;
  name?: string;
  address?: string;
  status?: string;
}) => {
  return useQuery({
    queryKey: ["companies-filter", params],
    queryFn: () => companyApiRequest.findAllByFilter(params),
  });
};

//- Hook Super_Admin phê duyệt công ty
export function useAdminVerifyCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { companyID: string; action: "ACCEPT" | "REJECT" }) =>
      companyApiRequest.adminVerifyCompany(payload),
    onSuccess: () => {
      // Làm tươi lại danh sách công ty để cập nhật trạng thái mới nhất
      queryClient.invalidateQueries({ queryKey: ["companies-filter"] });
    },
  });
}

export function useUpdateCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CompanyUpdateType }) =>
      companyApiRequest.update(id, payload),
    onSuccess: (_, variables) => {
      // Làm tươi dữ liệu chi tiết công ty cụ thể
      queryClient.invalidateQueries({
        queryKey: ["company-detail", variables.id],
      });
      queryClient.invalidateQueries({ queryKey: ["companies-filter"] });
    },
  });
}

export function useDeleteCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => companyApiRequest.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies-filter"] });
    },
  });
}

export function useCheckTaxIdExists(taxId: string) {
  return useMutation({
    mutationFn: () => companyApiRequest.checkTaxCode(taxId),
    onSuccess: () => {},
  });
}
