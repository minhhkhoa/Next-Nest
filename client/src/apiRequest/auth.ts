import http from "@/lib/http";
import {
  LoginBodyType,
  LoginResType,
  RegisterBodyType,
  RegisterResType,
} from "@/schemasvalidation/auth";
import { ProfileResType } from "@/schemasvalidation/user";
import { ApiResponse } from "@/types/apiResponse";

const prefix = "/auth";
const authApiRequest = {
  login: (body: LoginBodyType) =>
    http.post<ApiResponse<LoginResType>>(`${prefix}/login`, body),

  register: (body: RegisterBodyType) =>
    http.post<ApiResponse<RegisterResType>>(`${prefix}/register`, body),

  logout: () => http.post<ApiResponse<string>>(`${prefix}/logout`),

  getProfile: () => http.get<ApiResponse<ProfileResType>>(`${prefix}/profile`),
};

export default authApiRequest;
