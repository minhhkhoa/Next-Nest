import http from "@/lib/http";
import {
  LoginBodyType,
  LoginResType,
  RegisterBodyType,
  RegisterResType,
} from "@/schemasvalidation/auth";
import { ApiResponse } from "@/types/apiResponse";

const prefix = "/auth";
const authApiRequest = {
  login: (body: LoginBodyType) =>
    http.post<ApiResponse<LoginResType>>(`${prefix}/login`, body),

  register: (body: RegisterBodyType) =>
    http.post<ApiResponse<RegisterResType>>(`${prefix}/register`, body),
};

export default authApiRequest;
