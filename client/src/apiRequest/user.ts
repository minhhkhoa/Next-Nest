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
};

export default userApiRequest;
