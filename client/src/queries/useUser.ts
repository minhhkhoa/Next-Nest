import userApiRequest from "@/apiRequest/user";
import {
  TypeApproveCompany,
  TypeJoinCompany,
  UpdateUserType,
} from "@/schemasvalidation/user";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useUpdateUserMutate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserType }) =>
      userApiRequest.update(id, payload),
    onSuccess: () => {
      //- khi update thành công thì invalidate query profile
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

export function useUpdateRoleMutate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, roleID }: { id: string; roleID: string }) =>
      userApiRequest.updateRole(id, roleID),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getAllUserByFilter"] });
    },
  });
}

export const useRestoreUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userApiRequest.restore(id),
    onSuccess: () => {
      // Làm tươi lại danh sách người dùng sau khi khôi phục thành công
      queryClient.invalidateQueries({ queryKey: ["getAllUserByFilter"] });
    },
  });
};

export const useGetAllUserByFilter = ({
  currentPage,
  pageSize,
  name,
  email,
  address,
}: {
  currentPage: number;
  pageSize: number;
  name?: string;
  email?: string;
  address?: string;
}) => {
  return useQuery({
    queryKey: [
      "getAllUserByFilter",
      currentPage,
      pageSize,
      name,
      email,
      address,
    ],
    queryFn: () =>
      userApiRequest.getAllUserByFilter({
        currentPage,
        pageSize,
        name,
        email,
        address,
      }),
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => userApiRequest.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getAllUserByFilter"] });
    },
  });
};

//- Hook cho Recruiter gửi yêu cầu gia nhập công ty
export function useJoinCompanyMutate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TypeJoinCompany) =>
      userApiRequest.joinCompany(payload),
    onSuccess: () => {
      // Làm tươi lại profile để cập nhật trạng thái employerInfo thành PENDING trên UI
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      // Nếu Khoa có trang danh sách công ty, có thể invalidate thêm ở đây
    },
  });
}

//- Hook cho Recruiter_Admin phê duyệt hoặc từ chối thành viên
export function useApproveJoinRequestMutate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TypeApproveCompany) =>
      userApiRequest.approveJoinRequest(payload),
    onSuccess: () => {
      //- Làm tươi lại danh sách yêu cầu gia nhập (danh sách notification/request)
      queryClient.invalidateQueries({ queryKey: ["join-requests"] });

      //- Nếu Admin đang xem danh sách nhân viên công ty, cũng cần làm tươi lại
      queryClient.invalidateQueries({ queryKey: ["getAllUserByFilter"] });
    },
  });
}
