import http from "@/lib/http";
import {
  CategoryNewsResType,
  CateNewsCreateType,
  NewsResFilterResultType,
  NewsResType,
} from "@/schemasvalidation/NewsCategory";
import { ApiResponse } from "@/types/apiResponse";

const prefixCategory = "/cate-news";
const prefixNews = "/news";

const CategoryNewsApiRequest = {
  getListCategories: () =>
    http.get<ApiResponse<CategoryNewsResType[]>>(`${prefixCategory}`),

  createCategory: (payload: CateNewsCreateType) =>
    http.post<ApiResponse<any>>(`${prefixCategory}`, payload),

  updateCategory: (id: string, payload: CateNewsCreateType) =>
    http.patch<ApiResponse<any>>(`${prefixCategory}/${id}`, payload),

  deleteCategory: (id: string) =>
    http.delete<ApiResponse<any>>(`${prefixCategory}/${id}`),
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
