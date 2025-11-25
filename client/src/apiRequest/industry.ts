import http from "@/lib/http";
import {
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

  getTreeIndustry: (name?: string) =>
    http.get<ApiResponse<IndustryTreeResponse>>(
      `${prefix}/tree${name ? `?name=${name}` : ""}`
    ),
};

export default industryApiRequest;
