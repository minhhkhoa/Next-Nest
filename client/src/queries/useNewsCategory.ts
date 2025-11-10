import { CategoryNewsApiRequest } from "@/apiRequest/newsCategory";
import { useQuery } from "@tanstack/react-query";

export const useGetListCategories = () => {
  return useQuery({
    queryKey: ["getListCategories"],
    queryFn: CategoryNewsApiRequest.getListCategories,
  });
};
