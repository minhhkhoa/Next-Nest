import http from "@/lib/http";
import { DetailProfileResponseType } from "@/schemasvalidation/detailProfile";
import { ApiResponse } from "@/types/apiResponse";

const prefix = "/detail-profile";
const detailProfileApiRequest = {
  getDetailProfile: (id: string) =>
    http.get<ApiResponse<DetailProfileResponseType>>(`${prefix}/${id}`),
};

export default detailProfileApiRequest;
