import adBookingApiRequest from "@/apiRequest/adBooking";
import { CreateAdBookingBodyType } from "@/schemasvalidation/adBooking";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useCreateAdBookingMutation = () => {
  return useMutation({
    mutationFn: (payload: CreateAdBookingBodyType) =>
      adBookingApiRequest.create(payload),
  });
};

export const useGetAdBookingsQuery = () => {
  return useQuery({
    queryKey: ["ad-bookings"],
    queryFn: () => adBookingApiRequest.findAll(),
  });
};

export const useDeleteAdBookingMutation = () => {
  return useMutation({
    mutationFn: (id: string) => adBookingApiRequest.remove(id),
  });
};

export const useGetBusyDatesQuery = (slotCode: string, enabled: boolean) => {
  return useQuery({
    queryKey: ["ad-busy-dates", slotCode],
    queryFn: () => adBookingApiRequest.getBusyDates(slotCode),
    enabled: enabled && !!slotCode,
  });
};

export const useGetAdBookingsAdminQuery = (params: { currentPage: number; pageSize: number }) => {
  return useQuery({
    queryKey: ["admin-ad-bookings", params.currentPage, params.pageSize],
    queryFn: () => adBookingApiRequest.findAllByAdmin(params),
  });
};

export const useCancelByUserMutation = () => {
  return useMutation({
    mutationFn: (id: string) => adBookingApiRequest.cancelByUser(id),
  });
};

export const useCancelByAdminMutation = () => {
  return useMutation({
    mutationFn: (id: string) => adBookingApiRequest.cancelByAdmin(id),
  });
};
