import http from "@/lib/http";
import {
  CategoryNewsResType,
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
};

export { CategoryNewsApiRequest, NewsApiRequest };
