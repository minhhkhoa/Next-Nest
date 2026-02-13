import http from "@/lib/http";
import { CreateUserResumeType, UserResumeResponseType } from "@/schemasvalidation/user-resume";
import { ApiResponse } from "@/types/apiResponse";

const prefix = "/user-resume";

const userResumeApiRequest = {
  create: (body: CreateUserResumeType) =>
    http.post<ApiResponse<UserResumeResponseType>>(`${prefix}`, body),
  
  findAll: () =>
    http.get<ApiResponse<UserResumeResponseType[]>>(`${prefix}`),
    
  findOne: (id: string) =>
    http.get<ApiResponse<UserResumeResponseType>>(`${prefix}/${id}`),
};

export default userResumeApiRequest;
