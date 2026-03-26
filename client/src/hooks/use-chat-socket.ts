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
    const socketInstance = io(
      `${envConfig.NEXT_PUBLIC_API_URL_SERVER_BASE}/chat`,
      {
        auth: {
          token: getAccessTokenFromLocalStorage(),
        },
        transports: ["websocket"],
        reconnection: true,
        reconnectionAttempts: 5,
      },
    );

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

      //- clean up function khi activeConversationId thay đổi hoặc component unmount, để rời phòng chat cũ và tham số activeConversationId ở đây sẽ là id phòng chat cũ trước khi chuyển sang phòng mới
      return () => {
        if (activeConversationId) {
          socket.emit("leave_conversation", activeConversationId);
        }
      };
    }
  }, [socket, isConnected, activeConversationId]);

  return { socket, isConnected, realtimeMessages };
};

/**
 * Dưới đây là lời giải thích chi tiết quá trình React ghi nhớ ID phòng cũ:

  1. Cơ chế nhớ mặt (Closure) của useEffect
  Khi useEffect chạy, nó tạo ra một hàm return () => {...} để dùng cho công tác dọn dẹp sau này.
  Điều kỳ diệu là: Hàm dọn dẹp này sẽ "đóng gói" (mặc định ghi nhớ) chính xác giá trị của activeConversationId ở thời điểm nó được tạo ra, chứ nó không lấy giá trị ở tương lai.

  2. Ví dụ luồng chạy từng bước (Phòng A sang Phòng B)
  Giả sử bạn đang ở Phòng A (ID = Room_A), sau đó bạn click sang Phòng B (ID = Room_B). Luồng chạy của React sẽ diễn ra đúng trình tự 3 bước sau:

  Bước 1: Nằm ở Phòng A (Lần render đầu)
    - activeConversationId đang là "Room_A".
    - useEffect chạy:
        + Join phòng: socket.emit("join_conversation", "Room_A")
        + Nó đăng ký một hàm dọn dẹp vào bộ nhớ của React:
          return () => { 
            socket.emit("leave_conversation", "Room_A") // Nó nhớ cứng chữ "Room_A" ở đây
          }

  Bước 2: Click chuuyển sang Phòng B
    - Biến trạng thái State thay đổi, activeConversationId cập nhật thành "Room_B".
    - Component bắt đầu Re-render (Vẽ lại giao diện).

  Bước 3: Dọn dẹp cái cũ TRƯỚC KHI chạy cái mới (Quan trọng nhất)
    - Trước khi chạy useEffect cho "Room_B", React sẽ lôi cái Hàm dọn dẹp của Bước 1 ra và ép nó chạy.
    - Lúc này, lệnh được thực thi là socket.emit("leave_conversation", "Room_A"). (Server nhận lệnh và đá bạn ra khỏi phòng A).
    - Sau khi dọn dẹp xong, useEffect mới chính thức chạy vòng đời cho "Room_B":
      + Xóa mảng: setRealtimeMessages([])
      + Join phòng: socket.emit("join_conversation", "Room_B")
      + Đăng ký tiếp hàm dọn dẹp mới vào RAM: 
        return () => { socket.emit("leave_conversation", "Room_B") }

  Tóm lại đoạn code đó làm 3 nhiệm vụ:
    - Giao tiếp lên Server báo cho WebSockets cắm Cáp dữ liệu vào ID phòng này (join_conversation).
    - Tự động dọn dẹp Array realtimeMessages trên UI (để tin nhắn phòng A không hiển thị dính sang phòng B những giây đầu tiên).
    - Sử dụng return () => {...} để tự động rút Cáp dữ liệu của phòng cũ ra (leave_conversation) ngay phần nghìn giây trước khi mạng lưới Cáp dữ liệu mới (join) được cắm vào.
 */
