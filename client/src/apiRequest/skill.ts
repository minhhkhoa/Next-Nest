import http from "@/lib/http";
import {
  SkillCreateType,
  SkillFilterResType,
  SkillResType,
} from "@/schemasvalidation/skill";
import { ApiResponse } from "@/types/apiResponse";

const prefix = "/skill";
const skillApiRequest = {
  getAllSKills: () => http.get<ApiResponse<SkillResType[]>>(`${prefix}`),

  getSkillFilter: (params: {
    currentPage: number;
    pageSize: number;
    name?: string;
    industryIDs?: string[];
  }) => {
    // Tự serialize nếu không muốn dùng thư viện qs
    const searchParams = new URLSearchParams();
    searchParams.append("currentPage", params.currentPage.toString());
    searchParams.append("pageSize", params.pageSize.toString());
    if (params.name) searchParams.append("name", params.name);

    if (params.industryIDs) {
      params.industryIDs.forEach((id) =>
        searchParams.append("industryIDs", id),
      );
    }

    return http.get<ApiResponse<SkillFilterResType>>(
      `${prefix}/filter?${searchParams.toString()}`,
    );
  },

  createSkill: (payload: SkillCreateType) =>
    http.post<ApiResponse<any>>(`${prefix}`, payload),

  updateSkill: (id: string, payload: SkillCreateType) =>
    http.patch<ApiResponse<any>>(`${prefix}/${id}`, payload),

  deleteSkill: (id: string) => http.delete<ApiResponse<any>>(`${prefix}/${id}`),
};

export default skillApiRequest;
