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

  requestHot: (payload: { targetId: string; description: string }) =>
    http.post<ApiResponse<any>>(`${prefix}/request-hot`, payload),

  setHot: (payload: {
    jobId: string;
    isHot: boolean;
    hotUntil?: string;
    issueId?: string;
  }) => http.post<ApiResponse<any>>(`${prefix}/set-hot`, payload),

  findJobFilterPublic: (params: {
    currentPage: number;
    pageSize: number;
    title?: string;
    isHot?: string;
    fieldCompany?: string;
    level?: string;
    address?: string;
  }) =>
    http.get<ApiResponse<TypeGetAllJobFilter>>(`${prefix}/filter-public`, {
      params,
    }),

  searchJobsPublicAdvanced: (params: {
    currentPage: number;
    pageSize: number;
    title?: string;
    fieldCompany?: string;
    address?: string;
    level?: string;
    employeeType?: string;
    experience?: string;
    isHot?: string;
    minSalary?: number;
    maxSalary?: number;
    currency?: string;
    industryIDs?: string[];
    skillIDs?: string[];
  }) => {
    const searchParams = new URLSearchParams();
    searchParams.append("currentPage", params.currentPage.toString());
    searchParams.append("pageSize", params.pageSize.toString());

    if (params.title) searchParams.append("title", params.title);
    if (params.fieldCompany)
      searchParams.append("fieldCompany", params.fieldCompany);
    if (params.address) searchParams.append("address", params.address);
    if (params.level) searchParams.append("level", params.level);
    if (params.employeeType)
      searchParams.append("employeeType", params.employeeType);
    if (params.experience)
      searchParams.append("experience", params.experience);
    if (params.isHot) searchParams.append("isHot", params.isHot);
    if (params.minSalary !== undefined)
      searchParams.append("minSalary", params.minSalary.toString());
    if (params.maxSalary !== undefined)
      searchParams.append("maxSalary", params.maxSalary.toString());
    if (params.currency) searchParams.append("currency", params.currency);

    if (params.industryIDs?.length) {
      params.industryIDs.forEach((id) => searchParams.append("industryIDs", id));
    }

    if (params.skillIDs?.length) {
      params.skillIDs.forEach((id) => searchParams.append("skillIDs", id));
    }

    return http.get<ApiResponse<TypeGetAllJobFilter>>(
      `${prefix}/search-public?${searchParams.toString()}`,
    );
  },

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
