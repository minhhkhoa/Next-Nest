import http from "@/lib/http";
import {
  GetAllUserByFilterResType,
  UpdateUserType,
} from "@/schemasvalidation/user";
import { ApiResponse } from "@/types/apiResponse";

const prefix = "/user";
const userApiRequest = {
  update: (id: string, payload: UpdateUserType) =>
    http.patch<ApiResponse<any>>(`${prefix}/${id}`, payload),

  updateRole: (id: string, roleID: string) =>
    http.patch<ApiResponse<any>>(`${prefix}/${id}/role`, { roleID }),

  restore: (id: string) =>
    http.patch<ApiResponse<any>>(`${prefix}/${id}/restore`, {}),

  getAllUserByFilter: (params: {
    currentPage: number;
    pageSize: number;
    name?: string;
    email?: string;
    address?: string;
  }) =>
    http.get<ApiResponse<GetAllUserByFilterResType>>(`${prefix}/filter`, {
      params,
    }),

  deleteUser: (id: string) => http.delete<ApiResponse<any>>(`${prefix}/${id}`),
};

export default userApiRequest;
