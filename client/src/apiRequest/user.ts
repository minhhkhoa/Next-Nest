import http from "@/lib/http";
import { UpdateUserType } from "@/schemasvalidation/user";
import { ApiResponse } from "@/types/apiResponse";

const prefix = "/user";
const userApiRequest = {
  update: (id: string, payload: UpdateUserType) =>
    http.patch<ApiResponse<any>>(`${prefix}/${id}`, payload),
};

export default userApiRequest;
