import skillApiRequest from "@/apiRequest/skill";
import { useQuery } from "@tanstack/react-query";

export const useGetDetaiSkill = () => {
  return useQuery({
    queryKey: ["getSkills"],
    queryFn: skillApiRequest.getAllKills
  });
};
