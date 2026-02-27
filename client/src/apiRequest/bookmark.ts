import http from "@/lib/http";
import {
  BookmarkCreateType,
  BookmarkResType,
  apiGetAllBookmarkRes,
} from "@/schemasvalidation/bookmark";
import { ApiResponse } from "@/types/apiResponse";
import { z } from "zod";

const prefix = "/bookmarks";

const bookmarkApiRequest = {
  //- Tạo bookmark
  create: (body: BookmarkCreateType) =>
    http.post<ApiResponse<BookmarkResType>>(prefix, body),

  //- Lấy tất cả ID bookmark của user (để check status)
  getAllIds: (params?: { itemType?: string }) =>
    http.get<ApiResponse<{ _id: string; itemId: string; itemType: string }[]>>(
      `${prefix}/ids`,
      { params },
    ),

  //- Lấy danh sách bookmark của user
  findAll: (params: {
    currentPage: number;
    pageSize: number;
    itemType?: string;
  }) =>
    http.get<ApiResponse<z.infer<typeof apiGetAllBookmarkRes>>>(prefix, {
      params,
    }),

  //- Xóa bookmark theo ID
  remove: (id: string) => http.delete<ApiResponse<any>>(`${prefix}/${id}`),

  //- Xóa bookmark theo Item ID (dùng cho toggle button)
  removeByItemId: (itemId: string) =>
    http.delete<ApiResponse<any>>(`${prefix}/item/${itemId}`),
};

export default bookmarkApiRequest;
