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

  forgotPassword: (email: string) =>
    http.post<ApiResponse<{ message: string }>>(`${prefix}/forgot-password`, {
      email,
    }),

  validateTokenResetPassword: (token: string, email: string) =>
    http.get<ApiResponse<{ valid: boolean }>>(
      `${prefix}/validate-reset?token=${token}&email=${email}`
    ),
};

export default authApiRequest;
