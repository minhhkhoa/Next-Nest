import http from "@/lib/http";
import {
  ApplicationResType,
  CreateApplicationType,
  FindApplicationFilterType,
  GetAllApplicationFilterType,
  UpdateApplicationType,
} from "@/schemasvalidation/application";
import { ApiResponse } from "@/types/apiResponse";

const prefix = "/application";

const applicationApiRequest = {
  //- ứng viên nộp hồ sơ ứng tuyển
  create: (payload: CreateApplicationType) =>
    http.post<ApiResponse<ApplicationResType>>(prefix, payload),

  //- recruiter xem danh sách đơn ứng tuyển với filter
  findAll: (params: FindApplicationFilterType) =>
    http.get<ApiResponse<GetAllApplicationFilterType>>(prefix, { params }),

  //- ứng viên xem lịch sử ứng tuyển của mình với filter
  findMyApplications: (params: FindApplicationFilterType) =>
    http.get<ApiResponse<GetAllApplicationFilterType>>(
      `${prefix}/my-applications`,
      { params },
    ),

  //- xem chi tiết đơn ứng tuyển (Ứng viên hoặc Recruiter)
  findOne: (id: string) =>
    http.get<ApiResponse<ApplicationResType>>(`${prefix}/${id}`),

  //- recruiter cập nhật trạng thái đơn
  update: (id: string, payload: UpdateApplicationType) =>
    http.patch<ApiResponse<ApplicationResType>>(`${prefix}/${id}`, payload),

  //- xóa đơn ứng tuyển
  remove: (id: string) =>
    http.delete<ApiResponse<{ _id: string; isDeleted: boolean }>>(
      `${prefix}/${id}`,
    ),
};

export default applicationApiRequest;
