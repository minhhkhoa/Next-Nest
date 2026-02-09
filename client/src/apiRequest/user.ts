import http from "@/lib/http";
import {
  GetAllUserByFilterResType,
  TypeApproveCompany,
  TypeJoinCompany,
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
    companyName?: string;
  }) =>
    http.get<ApiResponse<GetAllUserByFilterResType>>(`${prefix}/filter`, {
      params,
    }),

  //- lấy danh sách thành viên trong công ty cho super_admin( quản lý)
  getMemberCompanyForSuperAdmin: (companyId: string) =>
    http.get<ApiResponse<any>>(`${prefix}/members-of-company/${companyId}`),

  deleteUser: (id: string, newOwnerID?: string) =>
    http.delete<ApiResponse<any>>(
      `${prefix}/${id}${newOwnerID ? `?newOwnerID=${newOwnerID}` : ""}`,
    ),

  //- Gửi yêu cầu gia nhập một công ty (dành cho Recruiter)
  joinCompany: (payload: TypeJoinCompany) =>
    http.patch<ApiResponse<any>>(`${prefix}/join-company`, payload),

  //- Phê duyệt hoặc Từ chối yêu cầu gia nhập (dành cho Recruiter Admin)
  approveJoinRequest: (payload: TypeApproveCompany) =>
    http.patch<ApiResponse<any>>(`${prefix}/approve-join-request`, payload),
};

export default userApiRequest;
