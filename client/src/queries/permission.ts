import permissionApiRequest from "@/apiRequest/permission";
import { PermissionCreateType } from "@/schemasvalidation/permission";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useGetDetaiPermission = (id: string) => {
  return useQuery({
    queryKey: ["getPermission"],
    queryFn: () => permissionApiRequest.getDetailPermission(id),
    enabled: !!id,
  });
};

export const useGetAllModuleBussiness = () => {
  return useQuery({
    queryKey: ["getAllModuleBussiness"],
    queryFn: permissionApiRequest.getAllModuleBussiness,
  });
};

export const useGetPermissionFilter = ({
  currentPage,
  pageSize,
  name,
  method,
  module,
}: {
  currentPage: number;
  pageSize: number;
  name?: string;
  method?: string;
  module?: string;
}) => {
  return useQuery({
    queryKey: [
      "getPermission_filter",
      currentPage,
      pageSize,
      name,
      method,
      module,
    ],
    queryFn: () =>
      permissionApiRequest.getPermissionFilter({
        currentPage,
        pageSize,
        name,
        method,
        module,
      }),
  });
};

export const useCreatePermission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: permissionApiRequest.createPermission,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getPermission_filter"] });
    },
  });
};

export const useUpdatePermission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: PermissionCreateType;
    }) => permissionApiRequest.updatePermission(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getPermission_filter"] });
    },
  });
};

//- delete
export const useDeletePermission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: permissionApiRequest.deletePermission,
    onSuccess: () => {
      //- gọi lại api khi cập nhật thông tin
      queryClient.invalidateQueries({ queryKey: ["getPermission_filter"] });
    },
  });
};
