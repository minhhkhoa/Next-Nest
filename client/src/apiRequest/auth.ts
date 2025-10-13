import http from "@/lib/http";
import { LoginBodyType, LoginResType } from "@/schemasvalidation/auth";
import { ApiResponse } from "@/types/apiResponse";

const prefix = "/auth";
const authApiRequest = {
  login: (body: LoginBodyType) =>
    http.post<ApiResponse<LoginResType>>(`${prefix}/login`, body),
};

export default authApiRequest;
