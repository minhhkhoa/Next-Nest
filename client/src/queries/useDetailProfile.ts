import detailProfileApiRequest from "@/apiRequest/detailProfile";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useGetDetailProfile = ({ id }: { id: string }) => {
  return useQuery({
    queryKey: ["detailProfile"],
    queryFn: () => detailProfileApiRequest.getDetailProfile(id),
    enabled: !!id,
  });
};

export const useUpdateDetailProfileMutate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      detailProfileApiRequest.updateDetailProfile(id, payload),
    onSuccess: () => {
      //- khi update thành công thì invalidate query profile
      queryClient.invalidateQueries({ queryKey: ["detailProfile"] });
    },
  });
};
