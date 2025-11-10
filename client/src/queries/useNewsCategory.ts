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

export const useGetListNewsFilter = ({
  currentPage,
  pageSize,
  title,
  cateNewsID,
  status
}: {
  currentPage: number;
  pageSize: number;
  title?: string;
  cateNewsID?: string | null;
  status?: string
}) => {
  return useQuery({
    queryKey: [
      "getListNewsFilter",
      currentPage,
      pageSize,
      title,
      cateNewsID,
      status,
    ],
    queryFn: () =>
      NewsApiRequest.getListNewsFilter({
        currentPage,
        pageSize,
        title: title ?? "",
        cateNewsID: cateNewsID ?? "",
        status: status ?? "",
      }),
  });
};
