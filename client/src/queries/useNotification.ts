import notificationApiRequest from "@/apiRequest/notification";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// 1. Hook lấy số lượng thông báo chưa đọc (Dùng cho Badge cái chuông)
export const useGetCountUnread = (isLogin: boolean) => {
  return useQuery({
    queryKey: ["notifications-count"],
    queryFn: () => notificationApiRequest.getCountUnread(),
    enabled: isLogin, // Chỉ chạy khi đã đăng nhập
    refetchOnWindowFocus: true, // Tự động cập nhật khi quay lại tab
  });
};

// 2. Hook lấy danh sách thông báo có lọc và phân trang
export const useGetNotificationsFilter = ({
  currentPage,
  pageSize,
  isRead,
  title,
  isLogin,
}: {
  currentPage: number;
  pageSize: number;
  isRead?: boolean;
  title?: string;
  isLogin: boolean;
}) => {
  return useQuery({
    queryKey: ["notifications-filter", currentPage, pageSize, isRead, title],
    queryFn: () =>
      notificationApiRequest.getNotifications({
        currentPage,
        pageSize,
        isRead,
        title,
      }),
    enabled: isLogin, // Chỉ chạy khi đã đăng nhập
  });
};

// 3. Hook đánh dấu 1 thông báo là đã đọc
export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationApiRequest.markAsRead(id),
    onSuccess: () => {
      // Làm mới số lượng badge và danh sách lọc
      queryClient.invalidateQueries({ queryKey: ["notifications-count"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-filter"] });
    },
  });
};

// 4. Hook đánh dấu TẤT CẢ là đã đọc
export const useMarkAllRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationApiRequest.markAllRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications-count"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-filter"] });
    },
  });
};

// 5. Hook xóa 1 thông báo
export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationApiRequest.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications-count"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-filter"] });
    },
  });
};

// 6. Hook xóa TOÀN BỘ thông báo
export const useClearAllNotifications = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationApiRequest.clearAllNotifications,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications-count"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-filter"] });
    },
  });
};
