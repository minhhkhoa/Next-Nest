import adPaymentApiRequest from "@/apiRequest/adPayment";
import { useQuery } from "@tanstack/react-query";

//- Hook React Query lấy toàn bộ danh sách thanh toán đối soát
export const useGetAdPaymentsQuery = () => {
  return useQuery({
    queryKey: ["ad-payments"],
    queryFn: () => adPaymentApiRequest.findAll(),
  });
};

//- Hook React Query lấy chi tiết một giao dịch thanh toán đối soát theo ID
export const useGetAdPaymentDetailQuery = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["ad-payment-detail", id],
    queryFn: () => adPaymentApiRequest.findOne(id),
    enabled: enabled && !!id,
  });
};
