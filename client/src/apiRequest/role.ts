import http from "@/lib/http";
import {
  RoleCreateType,
  RoleResType,
  RoleResTypeFilter,
} from "@/schemasvalidation/role";
import { ApiResponse } from "@/types/apiResponse";

const prefix = "/role";
const roleApiRequest = {
  getRoleFilter: (params: {
    currentPage: number;
    pageSize: number;
    name?: string;
  }) =>
    http.get<ApiResponse<RoleResTypeFilter>>(`${prefix}/filter`, {
      params,
    }),

  getDetailRole: (id: string) =>
    http.get<ApiResponse<RoleResType>>(`${prefix}/${id}`),

  createRole: (payload: RoleCreateType) =>
    http.post<ApiResponse<any>>(`${prefix}`, payload),

  updateRole: (id: string, payload: RoleCreateType) =>
    http.patch<ApiResponse<any>>(`${prefix}/${id}`, payload),

  deleteRole: (id: string) => http.delete<ApiResponse<any>>(`${prefix}/${id}`),

  deleteManyRole: (ids: string[]) =>
    http.delete<ApiResponse<any>>(`${prefix}/deleteMany`, {
      data: {
        ids,
      },
    }),
};

export default roleApiRequest;
