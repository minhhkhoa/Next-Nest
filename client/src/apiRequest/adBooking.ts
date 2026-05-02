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

  findAll: (query: { currentPage: number; pageSize: number }) =>
    http.get<ApiResponse<any>>(
      `${prefix}/recruiter/all?currentPage=${query.currentPage}&pageSize=${query.pageSize}`
    ),

  findOne: (id: string) =>
    http.get<ApiResponse<AdBookingResType>>(`${prefix}/${id}`),

  remove: (id: string) =>
    http.delete<ApiResponse<{ message: string }>>(`${prefix}/${id}`),

  getBusyDates: (slotCode: string) =>
    http.get<ApiResponse<{ startAt: string; endAt: string }[]>>(
      `${prefix}/busy-dates/${slotCode}`,
    ),

  findAllByAdmin: (params: { currentPage: number; pageSize: number }) =>
    http.get<ApiResponse<any>>(`${prefix}/admin/all`, { params }),

  cancelByUser: (id: string) =>
    http.patch<ApiResponse<any>>(`${prefix}/cancel/${id}`, {}),

  cancelByAdmin: (id: string) =>
    http.patch<ApiResponse<any>>(`${prefix}/admin/cancel/${id}`, {}),

  getActiveAd: (slotCode: string) =>
    http.get<ApiResponse<AdBookingResType>>(`${prefix}/active/${slotCode}`),
};

export default adBookingApiRequest;
