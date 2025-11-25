import http from "@/lib/http";
import { SkillFilterResType, SkillResType } from "@/schemasvalidation/skill";
import { ApiResponse } from "@/types/apiResponse";

const prefix = "/skill";
const skillApiRequest = {
  getAllKills: () => http.get<ApiResponse<SkillResType>>(`${prefix}`),

  getSkillFilter: (params: {
    currentPage: number;
    pageSize: number;
    name?: string;
    industryID?: Array<string>;
  }) =>
    http.get<ApiResponse<SkillFilterResType>>(`${prefix}/filter`, { params }),
};

export default skillApiRequest;
