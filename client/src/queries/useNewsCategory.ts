import {
  CategoryNewsApiRequest,
  NewsApiRequest,
} from "@/apiRequest/newsCategory";
import { useQuery } from "@tanstack/react-query";

//- category News
export const useGetListCategories = () => {
  return useQuery({
    queryKey: ["getListCategories"],
    queryFn: CategoryNewsApiRequest.getListCategories,
  });
};

//- News
export const useGetListNews = () => {
  return useQuery({
    queryKey: ["getListNews"],
    queryFn: NewsApiRequest.getListNews,
  });
};
