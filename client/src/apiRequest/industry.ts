import http from "@/lib/http";
import { GetAllResType } from "@/schemasvalidation/industry";
import { ApiResponse } from "@/types/apiResponse";

const prefix = "/industry";
const industryApiRequest = {
  getAllKills: () =>
    http.get<ApiResponse<GetAllResType>>(`${prefix}?currentPage=1&pageSize=100`),
};

export default industryApiRequest;
