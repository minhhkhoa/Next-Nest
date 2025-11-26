import industryApiRequest from "@/apiRequest/industry";
import { CateIndustryCreateType } from "@/schemasvalidation/industry";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useGetDetaiIndustry = () => {
  return useQuery({
    queryKey: ["getIndustry"],
    queryFn: industryApiRequest.getAllKills,
  });
};

export const useGetTreeIndustry = ({ name }: { name?: string }) => {
  return useQuery({
    queryKey: ["getTreeIndustry", name],
    queryFn: () => industryApiRequest.getTreeIndustry(name),
  });
};

export const useGetIndustryFilter = ({
  currentPage,
  pageSize,
  name,
}: {
  currentPage: number;
  pageSize: number;
  name?: string;
}) => {
  return useQuery({
    queryKey: ["getIndustryFilter", name],
    queryFn: () =>
      industryApiRequest.getIndustryFilter({ currentPage, pageSize, name }),
  });
};

export const useCreateIndustry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: industryApiRequest.createIndustry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getTreeIndustry"] });
    },
  });
};

export const useUpdateIndustry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: CateIndustryCreateType;
    }) => industryApiRequest.updateIndustry(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getTreeIndustry"] });
    },
  });
};

//- delete
export const useDeleteIndustry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: industryApiRequest.deleteIndustry,
    onSuccess: () => {
      //- gọi lại api khi cập nhật thông tin
      queryClient.invalidateQueries({ queryKey: ["getTreeIndustry"] });
    },
  });
};
