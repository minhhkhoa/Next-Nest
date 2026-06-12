import { useQuery } from "@tanstack/react-query";
import dashboardApiRequest from "@/apiRequest/dashboard";

export const useGetAdminStats = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ["adminStats", startDate, endDate],
    queryFn: () => dashboardApiRequest.getAdminStats(startDate, endDate),
  });
};
