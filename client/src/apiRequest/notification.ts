import http from "@/lib/http";
import { NotificationResTypeFilter } from "@/schemasvalidation/notification";
import { ApiResponse } from "@/types/apiResponse";

const prefix = "/notifications";
const notificationApiRequest = {
  // Lấy danh sách thông báo có phân trang & filter
  getNotifications: (params: {
    currentPage: number;
    pageSize: number;
    isRead?: boolean;
    title?: string;
  }) =>
    http.get<ApiResponse<NotificationResTypeFilter>>(`${prefix}`, { params }),

  // Lấy số lượng chưa đọc cho cái chuông
  getCountUnread: () =>
    http.get<ApiResponse<{ count: number }>>(`${prefix}/count-unread`),

  // Đánh dấu 1 cái đã đọc
  markAsRead: (id: string) =>
    http.patch<ApiResponse<any>>(`${prefix}/${id}`, {}),

  // Đánh dấu tất cả đã đọc
  markAllRead: () =>
    http.patch<ApiResponse<any>>(`${prefix}/mark-all-read`, {}),

  // Xóa 1 thông báo cụ thể
  deleteNotification: (id: string) =>
    http.delete<ApiResponse<any>>(`${prefix}/${id}`),

  // Xóa toàn bộ thông báo của mình
  clearAllNotifications: () =>
    http.delete<ApiResponse<any>>(`${prefix}/clear-all`),
};

export default notificationApiRequest;
