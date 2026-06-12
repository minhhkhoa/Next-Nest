import { useQuery } from "@tanstack/react-query";
import recruiterDashboardApiRequest from "@/apiRequest/recruiterDashboard";

export const useGetRecruiterStats = (startDate?: string, endDate?: string) => {
  //- hook react query để lấy thống kê dashboard của recruiter
  return useQuery({
    queryKey: ["recruiterStats", startDate, endDate],
    queryFn: () => recruiterDashboardApiRequest.getStats(startDate, endDate),
  });
};
