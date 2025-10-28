import industryApiRequest from "@/apiRequest/industry";
import { useQuery } from "@tanstack/react-query";

export const useGetDetaiIndustry = () => {
  return useQuery({
    queryKey: ["getIndustry"],
    queryFn: industryApiRequest.getAllKills
  });
};
