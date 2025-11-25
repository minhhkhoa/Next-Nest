import industryApiRequest from "@/apiRequest/industry";
import { useQuery } from "@tanstack/react-query";

export const useGetDetaiIndustry = () => {
  return useQuery({
    queryKey: ["getIndustry"],
    queryFn: industryApiRequest.getAllKills,
  });
};

export const useGetTreeIndustry = ({name }: {name?: string}) => {
  return useQuery({
    queryKey: ["getTreeIndustry", name],
    queryFn: () => industryApiRequest.getTreeIndustry(name),
  });
};
