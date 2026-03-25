import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAppStore } from "@/components/TanstackProvider";
import { envConfig } from "../../config";
import { getAccessTokenFromLocalStorage } from "@/lib/utils";
import { ChatMessage } from "@/schemasvalidation/chat";

export const useChatSocket = (activeConversationId: string | null) => {
  const { isLogin, user } = useAppStore();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [realtimeMessages, setRealtimeMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    if (!isLogin || !user?._id) return;

    //- Connect to the /chat namespace
    const socketInstance = io(`${envConfig.NEXT_PUBLIC_API_URL_SERVER_BASE}/chat`, {
      auth: {
        token: getAccessTokenFromLocalStorage(),
      },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
    });

    socketInstance.on("connect", () => {
      console.log("Chat Socket connected:", socketInstance.id);
      setIsConnected(true);
      
      //- vào phòng chat nếu đã có activeConversationId khi kết nối thành công
      if (activeConversationId) {
        socketInstance.emit("join_conversation", activeConversationId);
      }
    });

    socketInstance.on("disconnect", () => {
      console.log("Chat Socket disconnected");
      setIsConnected(false);
    });

    //- Lắng nghe sự kiện 'receive_message' từ server khi có tin nhắn mới trong phòng chat đang mở
    socketInstance.on("receive_message", (message: ChatMessage) => {
      console.log("Receive new chat message:", message);
      setRealtimeMessages((prev) => [...prev, message]);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [isLogin, user?._id, activeConversationId]); 

  //- Khi activeConversationId thay đổi (người dùng chuyển sang mở khung chat khác), thì emit sự kiện join_conversation với conversationId mới, đồng thời có thể emit leave_conversation với conversationId cũ nếu muốn. Cũng có thể reset realtimeMessages để tránh hiển thị tin nhắn của phòng chat cũ khi chuyển sang phòng mới.
  useEffect(() => {
    if (socket && isConnected) {
      if (activeConversationId) {
        //- Khi chuyển sang phòng chat mới, reset realtimeMessages để tránh hiển thị tin nhắn của phòng cũ
        setRealtimeMessages([]);
        socket.emit("join_conversation", activeConversationId);
      }

      return () => {
        if (activeConversationId) {
          socket.emit("leave_conversation", activeConversationId);
        }
      };
    }
  }, [socket, isConnected, activeConversationId]);

  return { socket, isConnected, realtimeMessages };
};
