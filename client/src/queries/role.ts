import roleApiRequest from "@/apiRequest/role";
import { RoleCreateType } from "@/schemasvalidation/role";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useGetDetaiRole = (id: string) => {
  return useQuery({
    queryKey: ["getRole"],
    queryFn: () => roleApiRequest.getDetailRole(id),
    enabled: !!id,
  });
};

export const useGetRoleFilter = ({
  currentPage,
  pageSize,
  name,
}: {
  currentPage: number;
  pageSize: number;
  name?: string;
}) => {
  return useQuery({
    queryKey: ["getRole_filter", currentPage, pageSize, name],
    queryFn: () =>
      roleApiRequest.getRoleFilter({
        currentPage,
        pageSize,
        name,
      }),
  });
};

export const useCreateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: roleApiRequest.createRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getRole_filter"] });
    },
  });
};

export const useUpdateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: RoleCreateType }) =>
      roleApiRequest.updateRole(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getRole_filter"] });
    },
  });
};

//- delete
export const useDeleteRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: roleApiRequest.deleteRole,
    onSuccess: () => {
      //- gọi lại api khi cập nhật thông tin
      queryClient.invalidateQueries({ queryKey: ["getRole_filter"] });
    },
  });
};
