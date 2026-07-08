"use client";

import { useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { useAppStore } from "./TanstackProvider";
import { useQueryClient } from "@tanstack/react-query";
import SoftSuccessSonner from "./shadcn-studio/sonner/SoftSuccessSonner";
import { envConfig } from "../../config";
import {
  getAccessTokenFromLocalStorage,
  removeTokensFromLocalStorage,
} from "@/lib/utils";
import { useLogoutMutation } from "@/queries/useAuth";
import { NotificationType } from "@/lib/constant";
import { useRouter } from "next/navigation";

//- Biến instance bên ngoài để tránh khởi tạo lại khi re-render
let socket: Socket | null = null;

export const SocketListener = () => {
  const { isLogin, user, setSocket, setLogin, activeChatId } = useAppStore();
  const queryClient = useQueryClient();
  const { mutateAsync: mutationLogout } = useLogoutMutation();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const res = await mutationLogout();
      if (res.isError) return;

      removeTokensFromLocalStorage();
      setLogin(false);

      queryClient.removeQueries({ queryKey: ["profile"] });

      router.push("/login");
      router.refresh();
    } catch (error) {
      console.log("error logout: ", error);
    }
  };

  useEffect(() => {
    //- Chỉ kết nối khi đã login và có thông tin user
    if (isLogin && user?._id) {
      if (!socket) {
        //- Tự động nhận diện URL kết nối: Nếu không phải localhost thì dùng luôn domain hiện tại
        const socketUrl =
          typeof window !== "undefined" &&
          !window.location.hostname.includes("localhost")
            ? window.location.origin
            : envConfig.NEXT_PUBLIC_API_URL_SERVER_BASE;

        socket = io(socketUrl, {
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

      //- Lắng nghe sự kiện kết nối thành công
      socket.on("connect", () => {
        console.log("✅ Socket connected:", socket?.id);
      });

      //- Lắng nghe sự kiện thông báo mới từ NestJS
      socket.on("new-notification", (data) => {
        console.log("📩 Receive new notification:", data);

        //- làm mới 1 số api, chỉ hoạt động khi tính năng có ping thì client mới có biến 'data' trên kia để làm.

        //- xử lý thông báo tin nhắn mới thời gian thực
        if (data.type === "NEW_MESSAGE") {
          //- nếu đang mở đúng phòng chat đó thì không làm gì (tin nhắn hiển thị realtime qua socket chat rồi)
          if (activeChatId === data.metadata.resourceId) {
            return;
          }

          //- chỉ hiển thị thông báo toast khi người dùng không ở trang chat
          const isChatPage =
            typeof window !== "undefined" &&
            window.location.pathname.includes("/chat");
          if (!isChatPage) {
            SoftSuccessSonner("Bạn có một tin nhắn mới!");
          }

          queryClient.invalidateQueries({
            queryKey: ["unread-messages-count"],
          });
          queryClient.invalidateQueries({ queryKey: ["conversations"] });
          queryClient.invalidateQueries({
            queryKey: ["messages", data.metadata.resourceId],
          });
        }

        //- start issue
        if (data.metadata.module === "ISSUE") {
          queryClient.invalidateQueries({ queryKey: ["getMyIssue"] });
          queryClient.invalidateQueries({
            queryKey: ["getIssue", data.issueId],
          });
          queryClient.invalidateQueries({ queryKey: ["getIssue_filter"] });
          queryClient.invalidateQueries({ queryKey: ["jobs-filter"] });
        }

        //- end issue

        //- start job
        if (data.metadata.module === "JOB") {
          queryClient.invalidateQueries({ queryKey: ["jobs-filter"] });
        }
        //- end job

        //- start company
        if (data.metadata.module === "COMPANY") {
          if (
            data.type === NotificationType.COMPANY_ADMIN_REQUEST_PROCESSED ||
            data.type === NotificationType.COMPANY_JOIN_REQUEST_PROCESSED
          ) {
            //- cho login lai de lay token moi (da cap nhat role moi)
            SoftSuccessSonner(
              "Thông tin công ty đã được cập nhật, bạn sẽ được đăng xuất để cập nhật quyền mới!",
            );
            handleLogout();
          }
        }

        if (data.type !== "NEW_MESSAGE" && data.metadata.module !== "COMPANY") {
          SoftSuccessSonner("Bạn có một thông báo mới!");
        }

        //- Hiển thị Toast thông báo nhanh

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
