import http from "@/lib/http";
import { ApiResponse } from "@/types/apiResponse";
import {
  AdBookingResType,
  AdPaymentResType,
  CreateAdBookingBodyType,
} from "@/schemasvalidation/adBooking";

const prefix = "/ad-booking";

const adBookingApiRequest = {
  create: (payload: CreateAdBookingBodyType) =>
    http.post<
      ApiResponse<{
        booking: AdBookingResType;
        payment: AdPaymentResType;
      }>
    >(prefix, payload),

  findAll: () => http.get<ApiResponse<AdBookingResType[]>>(prefix),

  findOne: (id: string) =>
    http.get<ApiResponse<AdBookingResType>>(`${prefix}/${id}`),

  remove: (id: string) =>
    http.delete<ApiResponse<{ message: string }>>(`${prefix}/${id}`),
};

export default adBookingApiRequest;
