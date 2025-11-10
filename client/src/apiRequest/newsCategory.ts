import http from "@/lib/http";
import {
  CategoryNewsResType,
  NewsResFilterResultType,
  NewsResType,
} from "@/schemasvalidation/NewsCategory";
import { ApiResponse } from "@/types/apiResponse";

const prefixCategory = "/cate-news";
const prefixNews = "/news";
const CategoryNewsApiRequest = {
  getListCategories: () =>
    http.get<ApiResponse<CategoryNewsResType[]>>(`${prefixCategory}`),
};

const NewsApiRequest = {
  getListNews: () => http.get<ApiResponse<NewsResType[]>>(`${prefixNews}`),
  getListNewsFilter: (params: {
    currentPage: number;
    pageSize: number;
    title?: string;
    cateNewsID?: string;
    status?: string;
  }) =>
    http.get<ApiResponse<NewsResFilterResultType>>(`${prefixNews}/filter`, {
      params,
    }),
};

export { CategoryNewsApiRequest, NewsApiRequest };
