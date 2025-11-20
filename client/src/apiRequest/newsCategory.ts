import http from "@/lib/http";
import {
  CategoryNewsResType,
  CateNewsCreateType,
  NewsCreateType,
  NewsDashboardType,
  NewsResFilterResultType,
  NewsResType,
} from "@/schemasvalidation/NewsCategory";
import { ApiResponse } from "@/types/apiResponse";

const prefixCategory = "/cate-news";
const prefixNews = "/news";

const CategoryNewsApiRequest = {
  getListCategories: () =>
    http.get<ApiResponse<CategoryNewsResType[]>>(`${prefixCategory}`),

  getCategoryById: (id: string) =>
    http.get<ApiResponse<CategoryNewsResType>>(`${prefixCategory}/${id}`),

  createCategory: (payload: CateNewsCreateType) =>
    http.post<ApiResponse<any>>(`${prefixCategory}`, payload),

  updateCategory: (id: string, payload: CateNewsCreateType) =>
    http.patch<ApiResponse<any>>(`${prefixCategory}/${id}`, payload),

  deleteCategory: (id: string) =>
    http.delete<ApiResponse<any>>(`${prefixCategory}/${id}`),
};

const NewsApiRequest = {
  getListNews: () => http.get<ApiResponse<NewsResType[]>>(`${prefixNews}`),
  getListNewsDashboard: () =>
    http.get<ApiResponse<NewsDashboardType>>(`${prefixNews}/news-dashboard`),
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

  createNews: (payload: NewsCreateType) =>
    http.post<ApiResponse<any>>(`${prefixNews}`, payload),

  updateNews: (id: string, payload: NewsCreateType) =>
    http.patch<ApiResponse<any>>(`${prefixNews}/${id}`, payload),

  deleteNews: (id: string) =>
    http.delete<ApiResponse<any>>(`${prefixNews}/${id}`),
};

export { CategoryNewsApiRequest, NewsApiRequest };
