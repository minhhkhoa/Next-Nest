import http from "@/lib/http";
import {
  CompanyCreateType,
  CompanyResType,
  CompanyUpdateType,
} from "@/schemasvalidation/company";
import { ProfileResType } from "@/schemasvalidation/user";
import { ApiResponse } from "@/types/apiResponse";

const prefix = "/company";
const companyApiRequest = {
  create: (payload: CompanyCreateType) =>
    http.post<ApiResponse<any>>(prefix, payload),

  //- Lấy danh sách yêu cầu gia nhập (Dành cho Recruiter Admin)
  getJoinRequests: (params: {
    currentPage: number;
    pageSize: number;
    name?: string;
  }) => http.get<ApiResponse<any>>(`${prefix}/join-requests`, { params }),

  //- Lấy danh sách thành viên trong công ty (Dành cho Recruiter Admin)
  getMemberCompany: () =>
    http.get<ApiResponse<ProfileResType[]>>(`${prefix}/get-member-company`),

  findAllByFilter: (params: {
    currentPage: number;
    pageSize: number;
    name?: string;
    address?: string;
    status?: string;
  }) => http.get<ApiResponse<any>>(`${prefix}/filter`, { params }),

  //- Kiểm tra mã số thuế đã tồn tại chưa
  checkTaxCode: (taxCode: string) =>
    http.post<ApiResponse<{ exists: boolean; company?: CompanyResType }>>(
      prefix + "/check-tax-code",
      { taxCode },
    ),

  findOne: (id: string) =>
    http.get<ApiResponse<CompanyResType>>(`${prefix}/${id}`),

  //- Super_Admin phê duyệt hoặc từ chối công ty mới
  adminVerifyCompany: (payload: {
    companyID: string;
    action: "ACCEPT" | "REJECT";
  }) => http.patch<ApiResponse<any>>(`${prefix}/admin-verify`, payload),

  update: (id: string, payload: CompanyUpdateType) =>
    http.patch<ApiResponse<any>>(`${prefix}/${id}`, payload),

  remove: (id: string) => http.delete<ApiResponse<any>>(`${prefix}/${id}`),
};

export default companyApiRequest;
