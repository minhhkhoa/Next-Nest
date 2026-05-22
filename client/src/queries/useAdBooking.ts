import adBookingApiRequest from "@/apiRequest/adBooking";
import { CreateAdBookingBodyType } from "@/schemasvalidation/adBooking";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useCreateAdBookingMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAdBookingBodyType) =>
      adBookingApiRequest.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ad-busy-dates"] });
      queryClient.invalidateQueries({ queryKey: ["ad-bookings"] });
    },
  });
};

export const useGetAdBookingsQuery = (query: {
  currentPage: number;
  pageSize: number;
}) => {
  return useQuery({
    queryKey: ["ad-bookings", query],
    queryFn: () => adBookingApiRequest.findAll(query),
  });
};

export const useDeleteAdBookingMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adBookingApiRequest.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ad-busy-dates"] });
      queryClient.invalidateQueries({ queryKey: ["ad-bookings"] });
    },
  });
};

export const useGetBusyDatesQuery = (slotCode: string, enabled: boolean) => {
  return useQuery({
    queryKey: ["ad-busy-dates", slotCode],
    queryFn: () => adBookingApiRequest.getBusyDates(slotCode),
    enabled: enabled && !!slotCode,
    staleTime: 0,
    refetchOnMount: "always",
  });
};

export const useGetAdBookingsAdminQuery = (params: { currentPage: number; pageSize: number }) => {
  return useQuery({
    queryKey: ["admin-ad-bookings", params.currentPage, params.pageSize],
    queryFn: () => adBookingApiRequest.findAllByAdmin(params),
  });
};

export const useCancelByUserMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adBookingApiRequest.cancelByUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ad-busy-dates"] });
      queryClient.invalidateQueries({ queryKey: ["ad-bookings"] });
    },
  });
};

export const useCancelByAdminMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adBookingApiRequest.cancelByAdmin(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ad-busy-dates"] });
      queryClient.invalidateQueries({ queryKey: ["admin-ad-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["ad-bookings"] });
    },
  });
};

export const useGetActiveAdQuery = (slotCode: string) => {
  return useQuery({
    queryKey: ["active-ad", slotCode],
    queryFn: () => adBookingApiRequest.getActiveAd(slotCode),
    enabled: !!slotCode,
    staleTime: 1000 * 60 * 5, //- 5 phút
  });
};
