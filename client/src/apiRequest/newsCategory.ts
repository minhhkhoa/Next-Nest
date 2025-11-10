import http from "@/lib/http";
import { CategoryNewsResType } from "@/schemasvalidation/NewsCategory";
import { ApiResponse } from "@/types/apiResponse";

const prefixCategory = "/cate-news";
const prefixNews = "/cate-news";
const CategoryNewsApiRequest = {
  getListCategories: () =>
    http.get<ApiResponse<CategoryNewsResType[]>>(`${prefixCategory}`),
};

export { CategoryNewsApiRequest };
