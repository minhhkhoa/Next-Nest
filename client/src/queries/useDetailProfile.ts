import detailProfileApiRequest from "@/apiRequest/detailProfile";
import { useQuery } from "@tanstack/react-query";

export const useGetDetailProfile = ({ id }: { id: string }) => {
  return useQuery({
    queryKey: ["detailProfile", id],
    queryFn: () => detailProfileApiRequest.getDetailProfile(id),
    enabled: !!id,
  });
};
