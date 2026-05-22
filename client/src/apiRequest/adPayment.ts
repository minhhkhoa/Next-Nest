import http from "@/lib/http";
import { ApiResponse } from "@/types/apiResponse";
import { AdPaymentDetailResType } from "@/schemasvalidation/adPayment";

const prefix = "/ad-payment";

const adPaymentApiRequest = {
  //- Lấy danh sách toàn bộ giao dịch thanh toán đối soát
  findAll: () =>
    http.get<ApiResponse<AdPaymentDetailResType[]>>(prefix),

  //- Lấy chi tiết giao dịch thanh toán đối soát theo ID
  findOne: (id: string) =>
    http.get<ApiResponse<AdPaymentDetailResType>>(`${prefix}/${id}`),
};

export default adPaymentApiRequest;
