"use client";

import { useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { useAppStore } from "./TanstackProvider";
import { useQueryClient } from "@tanstack/react-query";
import SoftSuccessSonner from "./shadcn-studio/sonner/SoftSuccessSonner";
import { envConfig } from "../../config";
import { getAccessTokenFromLocalStorage } from "@/lib/utils";

//- Biến instance bên ngoài để tránh khởi tạo lại khi re-render
let socket: Socket | null = null;

export const SocketListener = () => {
  const { isLogin, user, setSocket } = useAppStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    //- 1. Chỉ kết nối khi đã login và có thông tin user
    if (isLogin && user?._id) {
      if (!socket) {
        //- Cần dùng url base không có /api
        //- Bắt đầu tạo kết nối tới socket server
        socket = io(envConfig.NEXT_PUBLIC_API_URL_SERVER_BASE, {
          auth: {
            // Lấy token mới nhất từ local storage
            token: getAccessTokenFromLocalStorage(),
          },
          query: {
            userId: user._id,
          },
          transports: ["websocket"],
          reconnection: true,
          reconnectionAttempts: 5,
        });

        //- Lưu instance vào Zustand để NotificationBell có thể sử dụng
        setSocket(socket);
      }

      //- 2. Lắng nghe sự kiện kết nối thành công
      socket.on("connect", () => {
        console.log("✅ Socket connected:", socket?.id);
      });

      //- 3. Lắng nghe sự kiện thông báo mới từ NestJS
      socket.on("new-notification", (data) => {
        console.log("📩 Receive new notification:", data);

        //- làm mới 1 số api, chỉ hoạt động khi tính năng có ping thì client mới có biến 'data' trên kia để làm.

        //- start issue
        if (data.metadata.module === "ISSUE") {
          queryClient.invalidateQueries({ queryKey: ["getMyIssue"] });
          queryClient.invalidateQueries({
            queryKey: ["getIssue", data.issueId],
          });
          queryClient.invalidateQueries({ queryKey: ["getIssue_filter"] });
        }

        //- end issue

        //- Hiển thị Toast thông báo nhanh
        SoftSuccessSonner("Bạn có một thông báo mới!");

        //- Làm mới danh sách thông báo
        queryClient.invalidateQueries({ queryKey: ["notifications-filter"] });

        //- Làm mới số lượng thông báo chưa đọc (Badge trên chuông)
        queryClient.invalidateQueries({ queryKey: ["notifications-count"] });
      });

      //- 4. Lắng nghe lỗi kết nối
      socket.on("connect_error", (err) => {
        console.error("❌ Socket connection error:", err.message);
      });
    }

    //- Cleanup function: Chạy khi component unmount hoặc khi logout
    return () => {
      if (socket) {
        console.log("🔌 Socket disconnecting...");
        socket.disconnect();
        socket = null;
        setSocket(null); //- Xóa instance trong Zustand
      }
    };
  }, [isLogin, user?._id, queryClient, setSocket]);

  return null; //- Component này chỉ đóng vai trò logic, không render UI
};
