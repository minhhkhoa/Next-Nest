import skillApiRequest from "@/apiRequest/skill";
import { useQuery } from "@tanstack/react-query";

export const useGetDetaiSkill = () => {
  return useQuery({
    queryKey: ["getSkills"],
    queryFn: skillApiRequest.getAllKills,
  });
};

export const useGetSkillFilter = ({
  currentPage,
  pageSize,
  name,
  industryID,
}: {
  currentPage: number;
  pageSize: number;
  name?: string;
  industryID?: Array<string>;
}) => {
  return useQuery({
    queryKey: ["getSkills", currentPage, pageSize, name, industryID],
    queryFn: () => skillApiRequest.getSkillFilter({ currentPage, pageSize, name, industryID }),
  });
};
