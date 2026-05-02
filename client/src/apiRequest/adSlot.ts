import http from "@/lib/http";
import {
  AdSlotFilterResType,
  AdSlotResType,
  AdSlotUpdateType,
} from "@/schemasvalidation/adSlot";
import { ApiResponse } from "@/types/apiResponse";

const prefix = "/ad-slot";

const adSlotApiRequest = {
  //- Tạo mới slot quảng cáo (Super_Admin)
  create: (payload: any) =>
    http.post<ApiResponse<{ _id: string; code: string; name: string }>>(
      prefix,
      payload,
    ),

  //- Lấy danh sách slot có lọc/phân trang (Admin)
  findAll: (params: {
    currentPage?: number;
    pageSize?: number;
    keyword?: string;
    page?: string;
    adModeAllowed?: string;
    isActive?: string;
    isDeleted?: string;
  }) => {
    //- Lọc bỏ các params rỗng để tránh lỗi validate DTO backend
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(
        ([, v]) => v !== "" && v !== undefined && v !== null,
      ),
    );
    return http.get<ApiResponse<AdSlotFilterResType>>(prefix, {
      params: cleanParams,
    });
  },

  //- Lấy danh sách slot đang active (Public, không cần đăng nhập)
  findAllPublic: () =>
    http.get<ApiResponse<AdSlotResType[]>>(`${prefix}/public`),

  //- Lấy chi tiết slot theo ID
  findOne: (id: string) =>
    http.get<ApiResponse<AdSlotResType>>(`${prefix}/${id}`),

  //- Cập nhật thông tin slot (Super_Admin)
  update: (id: string, payload: AdSlotUpdateType) =>
    http.patch<ApiResponse<AdSlotResType>>(`${prefix}/${id}`, payload),

  //- Bật/tắt trạng thái active của slot (Super_Admin)
  toggleActive: (id: string) =>
    http.patch<ApiResponse<{ _id: string; code: string; isActive: boolean }>>(
      `${prefix}/${id}/toggle-active`,
      {},
    ),

  //- Xóa mềm slot (Super_Admin)
  remove: (id: string) =>
    http.delete<ApiResponse<{ message: string }>>(`${prefix}/${id}`),

  //- Khôi phục slot đã xóa (Super_Admin)
  restore: (id: string) =>
    http.patch<ApiResponse<AdSlotResType>>(`${prefix}/restore/${id}`, {}),

  //- Lấy chi tiết slot theo code (Public)
  findByCode: (code: string) =>
    http.get<ApiResponse<AdSlotResType>>(`${prefix}/code/${code}`),
};

export default adSlotApiRequest;
