import http from "@/lib/http";
import { SkillResType } from "@/schemasvalidation/skill";
import { ApiResponse } from "@/types/apiResponse";

const prefix = "/skill";
const skillApiRequest = {
  getAllKills: () => http.get<ApiResponse<SkillResType>>(`${prefix}`),
};

export default skillApiRequest;
