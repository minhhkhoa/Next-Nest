import skillApiRequest from "@/apiRequest/skill";
import { SkillCreateType } from "@/schemasvalidation/skill";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useGetDetaiSkill = () => {
  return useQuery({
    queryKey: ["getSkills"],
    queryFn: skillApiRequest.getAllSKills,
  });
};

//- getAllSKills
export const useGetAllSkills = () => {
  return useQuery({
    queryKey: ["getAllSkills"],
    queryFn: skillApiRequest.getAllSKills,
  });
};

export const useGetSkillFilter = ({
  currentPage,
  pageSize,
  name,
  industryIDs,
}: {
  currentPage: number;
  pageSize: number;
  name?: string;
  industryIDs?: string[];
}) => {
  return useQuery({
    queryKey: ["getSkills_filter", currentPage, pageSize, name, industryIDs],
    queryFn: () =>
      skillApiRequest.getSkillFilter({
        currentPage,
        pageSize,
        name,
        industryIDs,
      }),
  });
};

export const useCreateSkill = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: skillApiRequest.createSkill,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getSkills_filter"] });
    },
  });
};

export const useUpdateSkill = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SkillCreateType }) =>
      skillApiRequest.updateSkill(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getSkills_filter"] });
    },
  });
};

//- delete
export const useDeleteSkill = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: skillApiRequest.deleteSkill,
    onSuccess: () => {
      //- gọi lại api khi cập nhật thông tin
      queryClient.invalidateQueries({ queryKey: ["getSkills_filter"] });
    },
  });
};
