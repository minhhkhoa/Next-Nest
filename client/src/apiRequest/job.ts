import http from "@/lib/http";
import {
  JobCreateType,
  JobResType,
  JobUpdateType,
  TypeGetAllJobFilter,
} from "@/schemasvalidation/job";
import { ApiResponse } from "@/types/apiResponse";

const prefix = "/jobs";

const jobApiRequest = {
  //- Tạo mới công việc
  create: (payload: JobCreateType) =>
    http.post<ApiResponse<any>>(prefix, payload),

  findJobFilter: (params: {
    currentPage: number;
    pageSize: number;
    title?: string;
    status?: string;
    isActive?: string;
    nameCreatedBy?: string;
    isHot?: string;
    isDeleted?: string;
    fieldCompany?: string;
  }) =>
    http.get<ApiResponse<TypeGetAllJobFilter>>(`${prefix}/filter`, { params }),

  findJobFilterPublic: (params: {
    currentPage: number;
    pageSize: number;
    title?: string;
    isHot?: string;
    fieldCompany?: string;
    level?: string;
    address?: string;
  }) =>
    http.get<ApiResponse<TypeGetAllJobFilter>>(`${prefix}/filter-public`, { params }),

  //- Tìm tất cả công việc (Không lọc)
  findAll: () => http.get<ApiResponse<JobResType[]>>(prefix),

  //- Khôi phục công việc đã xóa mềm (Chỉ dành cho Super_Admin)
  restore: (id: string) =>
    http.patch<ApiResponse<any>>(`${prefix}/restore/${id}`, {}),

  //- Recruiter_Admin xử lý phê duyệt hoặc từ chối công việc
  recruiterAdminVerifyJob: (payload: {
    jobId: string;
    action: "ACCEPT" | "REJECT";
  }) => http.patch<ApiResponse<any>>(`${prefix}/verify-job`, payload),

  //- Tìm công việc theo ID (Có xử lý tính view qua IP)
  findOne: (id: string) => http.get<ApiResponse<JobResType>>(`${prefix}/${id}`),

  //- Cập nhật thông tin công việc
  update: (id: string, payload: JobUpdateType) =>
    http.patch<ApiResponse<any>>(`${prefix}/${id}`, payload),

  //- Xóa nhiều công việc cùng lúc
  removeMany: (ids: string[]) =>
    http.delete<ApiResponse<any>>(`${prefix}/deleteMany`, {
      data: {
        ids,
      },
    }),

  //- Xóa đơn lẻ một công việc (Soft delete)
  remove: (id: string) => http.delete<ApiResponse<any>>(`${prefix}/${id}`),

  //- Lấy danh sách việc làm liên quan
  getRelatedJobs: ({
    id,
    page,
    limit,
  }: {
    id: string;
    page: number;
    limit: number;
  }) =>
    http.get<
      ApiResponse<{
        meta: {
          current: number;
          pageSize: number;
          totalPages: number;
          totalItems: number;
        };
        result: JobResType[];
      }>
    >(`${prefix}/${id}/related`, { params: { page, limit } }),
};

export default jobApiRequest;
