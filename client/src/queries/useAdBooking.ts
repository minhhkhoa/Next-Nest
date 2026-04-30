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
