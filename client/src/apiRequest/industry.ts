import http from "@/lib/http";
import {
  CateIndustryCreateType,
  GetAllResType,
  IndustryTreeResponse,
} from "@/schemasvalidation/industry";
import { ApiResponse } from "@/types/apiResponse";

const prefix = "/industry";
const industryApiRequest = {
  getAllKills: () =>
    http.get<ApiResponse<GetAllResType>>(
      `${prefix}?currentPage=1&pageSize=100`
    ),
  //- đặt sai tên
  getIndustryFilter: (params: {
    currentPage: number;
    pageSize: number;
    name?: string;
  }) => http.get<ApiResponse<GetAllResType>>(`${prefix}`, { params }), //- đặt sai tên

  getTreeIndustry: (name?: string) =>
    http.get<ApiResponse<IndustryTreeResponse>>(
      `${prefix}/tree${name ? `?name=${name}` : ""}`
    ),

  createIndustry: (payload: CateIndustryCreateType) =>
    http.post<ApiResponse<any>>(`${prefix}`, payload),

  updateIndustry: (id: string, payload: CateIndustryCreateType) =>
    http.patch<ApiResponse<any>>(`${prefix}/${id}`, payload),

  deleteIndustry: (id: string) =>
    http.delete<ApiResponse<any>>(`${prefix}/${id}`),
};

export default industryApiRequest;
