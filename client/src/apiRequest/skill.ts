import http from "@/lib/http";
import {
  SkillCreateType,
  SkillFilterResType,
  SkillResType,
} from "@/schemasvalidation/skill";
import { ApiResponse } from "@/types/apiResponse";

const prefix = "/skill";
const skillApiRequest = {
  getAllKills: () => http.get<ApiResponse<SkillResType>>(`${prefix}`),

  getSkillFilter: (params: {
    currentPage: number;
    pageSize: number;
    name?: string;
    industryID?: string;
  }) =>
    http.get<ApiResponse<SkillFilterResType>>(`${prefix}/filter`, { params }),

  createSkill: (payload: SkillCreateType) =>
    http.post<ApiResponse<any>>(`${prefix}`, payload),

  updateSkill: (id: string, payload: SkillCreateType) =>
    http.patch<ApiResponse<any>>(`${prefix}/${id}`, payload),

  deleteSkill: (id: string) => http.delete<ApiResponse<any>>(`${prefix}/${id}`),
};

export default skillApiRequest;
