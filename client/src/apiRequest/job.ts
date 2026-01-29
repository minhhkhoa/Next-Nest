import http from "@/lib/http";
import { ApiResponse } from "@/types/apiResponse";

const prefix = "/jobs";

const jobApiRequest = {
  //- Tạo mới công việc
  create: (
    payload: any, //- EDIT_HERE: CreateJobDto
  ) => http.post<ApiResponse<any>>(prefix, payload),

  //- Tìm tất cả công việc có lọc nâng cao (Phân trang, search, isDeleted...)
  findJobFilter: (params: {
    currentPage: number;
    pageSize: number;
    name?: string;
    status?: string;
    level?: string;
    location?: string;
    isDeleted?: string;
    [key: string]: any; //- Cho phép các field filter linh hoạt khác
  }) => http.get<ApiResponse<any>>(`${prefix}/filter`, { params }),

  //- Tìm tất cả công việc (Không lọc)
  findAll: () => http.get<ApiResponse<any[]>>(prefix),

  //- Khôi phục công việc đã xóa mềm (Chỉ dành cho Super_Admin)
  restore: (id: string) =>
    http.patch<ApiResponse<any>>(`${prefix}/restore/${id}`, {}),

  //- Recruiter_Admin xử lý phê duyệt hoặc từ chối công việc
  recruiterAdminVerifyJob: (payload: {
    jobID: string;
    action: "ACCEPT" | "REJECT" | "PENDING"; //- EDIT_HERE: Theo RecruiteAdminApproveJobDto
  }) => http.patch<ApiResponse<any>>(`${prefix}/verify-job`, payload),

  //- Tìm công việc theo ID (Có xử lý tính view qua IP)
  findOne: (id: string) => http.get<ApiResponse<any>>(`${prefix}/${id}`), //- EDIT_HERE: JobResType

  //- Cập nhật thông tin công việc
  update: (
    id: string,
    payload: any, //- EDIT_HERE: UpdateJobDto
  ) => http.patch<ApiResponse<any>>(`${prefix}/${id}`, payload),

  //- Xóa nhiều công việc cùng lúc
  removeMany: (ids: string[]) =>
    http.delete<ApiResponse<any>>(`${prefix}/deleteMany`, {
      data: {
        ids,
      },
    }),

  //- Xóa đơn lẻ một công việc (Soft delete)
  remove: (id: string) => http.delete<ApiResponse<any>>(`${prefix}/${id}`),
};

export default jobApiRequest;
