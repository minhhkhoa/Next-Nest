import http from "@/lib/http";
import {
  GroupedPermissionRes,
  PermissionCreateType,
  PermissionResType,
  PermissionResTypeFilter,
} from "@/schemasvalidation/permission";
import { ApiResponse } from "@/types/apiResponse";

const prefix = "/permission";
const permissionApiRequest = {
  getPermissionFilter: (params: {
    currentPage: number;
    pageSize: number;
    name?: string;
    method?: string;
    module?: string;
  }) =>
    http.get<ApiResponse<PermissionResTypeFilter>>(`${prefix}/filter`, {
      params,
    }),

  getGroupModule: () =>
    http.get<ApiResponse<GroupedPermissionRes>>(`${prefix}/get-group-module`),

  getAllModuleBussiness: () =>
    http.get<ApiResponse<Array<string>>>(`${prefix}/modules`),

  getDetailPermission: (id: string) =>
    http.get<ApiResponse<PermissionResType>>(`${prefix}/${id}`),

  createPermission: (payload: PermissionCreateType) =>
    http.post<ApiResponse<any>>(`${prefix}`, payload),

  updatePermission: (id: string, payload: PermissionCreateType) =>
    http.patch<ApiResponse<any>>(`${prefix}/${id}`, payload),

  deletePermission: (id: string) =>
    http.delete<ApiResponse<any>>(`${prefix}/${id}`),

  deleteManyPermission: (ids: string[]) =>
    http.delete<ApiResponse<any>>(`${prefix}/deleteMany`, {
      data: {
        ids,
      },
    }),
};

export default permissionApiRequest;
