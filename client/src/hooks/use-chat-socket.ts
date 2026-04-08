import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAppStore } from "@/components/TanstackProvider";
import { envConfig } from "../../config";
import { getAccessTokenFromLocalStorage } from "@/lib/utils";
import { ChatMessage, Conversation } from "@/schemasvalidation/chat";
import { useQueryClient } from "@tanstack/react-query";

export const useChatSocket = (conversations: Conversation[]) => {
  const queryClient = useQueryClient();
  const { isLogin, user } = useAppStore();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [realtimeMessages, setRealtimeMessages] = useState<ChatMessage[]>([]);

  //- Dùng ref để ghi nhớ các phòng đã join, tránh join liên tục khi refetch conversations
  const joinedRooms = useRef<Set<string>>(new Set());

  //- 1. Khởi tạo kết nối Socket - Chỉ chạy khi login hoặc mất kết nối hoàn toàn
  useEffect(() => {
    if (!isLogin || !user?._id) return;

    const socketInstance = io(
      `${envConfig.NEXT_PUBLIC_API_URL_SERVER_BASE}/chat`,
      {
        auth: { token: getAccessTokenFromLocalStorage() },
        transports: ["websocket"],
        reconnection: true,
      },
    );

    socketInstance.on("connect", () => {
      console.log("Chat Socket connected:", socketInstance.id);
      setIsConnected(true);
      //- Khi kết nối lại, reset Set để join lại tất cả các phòng
      joinedRooms.current.clear();
    });

    socketInstance.on("disconnect", () => {
      console.log("Chat Socket disconnected");
      setIsConnected(false);
    });

    socketInstance.on("receive_message", (message: ChatMessage) => {
      console.log("Receive new chat message:", message);

      //- Chỉ thêm vào realtime nếu KHÔNG phải mình gửi (mình đã có optimistic)
      const isMine = message.senderId?._id === user?._id;
      if (!isMine) {
        setRealtimeMessages((prev) => [...prev, message]);
      }

      //- Luôn invalidate sidebar để cập nhật vị trí tin nhắn mới, số tin chưa đọc
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    });

    socketInstance.on(
      "messages_read",
      (payload: {
        conversationId: string;
        readerId?: string;
        readAt?: string;
      }) => {
        if (!payload?.conversationId || !payload.readerId) return;

        //- Không cần xử lý trạng thái "đã xem" cho chính người vừa đọc
        if (payload.readerId === user?._id) return;

        const readAtTime = payload.readAt
          ? new Date(payload.readAt).getTime()
          : Date.now();

        queryClient.setQueriesData(
          {
            queryKey: ["messages", payload.conversationId],
          },
          (oldData: any) => {
            if (!oldData?.data?.messages || !Array.isArray(oldData.data.messages)) {
              return oldData;
            }

            return {
              ...oldData,
              data: {
                ...oldData.data,
                messages: oldData.data.messages.map((message: ChatMessage) => {
                  const isMine = message.senderId?._id === user?._id;
                  const messageCreatedAt = new Date(message.createdAt).getTime();
                  const shouldMarkRead =
                    isMine && !message.isRead && messageCreatedAt <= readAtTime;

                  if (!shouldMarkRead) return message;

                  return {
                    ...message,
                    isRead: true,
                    readAt: payload.readAt || new Date().toISOString(),
                  };
                }),
              },
            };
          },
        );
      },
    );

    setSocket(socketInstance);

    return () => {
      socketInstance.off("messages_read");
      socketInstance.disconnect();
    };
  }, [isLogin, user?._id, queryClient]);

  //- 2. Xử lý Join các phòng mới khi danh sách conversations thay đổi
  useEffect(() => {
    if (!socket || !isConnected || conversations.length === 0) return;

    conversations.forEach((conv) => {
      if (!joinedRooms.current.has(conv._id)) {
        console.log("Joining room:", conv._id);
        socket.emit("join_conversation", conv._id);
        joinedRooms.current.add(conv._id);
      }
    });
  }, [socket, isConnected, conversations]);

  //- 3. Hàm xóa buffer tin nhắn realtime khi cần (ví dụ khi đổi phòng)
  const clearRealtimeMessages = () => setRealtimeMessages([]);

  return { socket, isConnected, realtimeMessages, clearRealtimeMessages };
};
