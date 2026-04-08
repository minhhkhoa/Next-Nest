"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Conversation, ChatMessage } from "@/schemasvalidation/chat";
import { useChatSocket } from "@/hooks/use-chat-socket";
import { useAppStore } from "@/components/TanstackProvider";
import {
  useGetConversations,
  useGetMessages,
  useMarkAsReadMutation,
  useSendMessageMutation,
} from "@/queries/useChat";
import SoftDestructiveSonner from "@/components/shadcn-studio/sonner/SoftDestructiveSonner";
import ConversationSidebar, {
  ConversationList,
} from "./components/ConversationSidebar";
import ChatWindow from "./components/ChatWindow";
import { useSearchParams } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useQueryClient } from "@tanstack/react-query";
import { envConfig } from "../../../../config";

export default function ChatPageModule() {
  const { user } = useAppStore();
  const searchParams = useSearchParams();
  const defaultConversationId = searchParams.get("conversationId");
  const queryClient = useQueryClient();

  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(defaultConversationId || null);

  const [inputText, setInputText] = useState("");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  //- Lấy dữ liệu
  const { data: conversationsData } = useGetConversations();

  const conversations: Conversation[] = useMemo(() => {
    return conversationsData?.data || [];
  }, [conversationsData]);

  const { data: messagesData } = useGetMessages(activeConversationId);

  const messages: ChatMessage[] = useMemo(() => {
    return messagesData?.data?.messages || [];
  }, [messagesData]);

  const { socket, isConnected, realtimeMessages, clearRealtimeMessages } =
    useChatSocket(conversations);
  const sendMessageMutation = useSendMessageMutation();

  //- Chỉ hiển thị tin nhắn realtime thuộc về phòng đang active
  const activeRealtimeMessages = useMemo(() => {
    return realtimeMessages.filter(
      (msg) => msg.conversationId === activeConversationId,
    );
  }, [realtimeMessages, activeConversationId]);

  //- Gộp tin nhắn từ API và Socket, lọc trùng theo _id
  const displayMessages = useMemo(() => {
    const combined = [...messages, ...activeRealtimeMessages];
    const uniqueMessages = new Map();

    combined.forEach((msg) => {
      //- Nếu là tin nhắn optimistic (tạm thời) thì ưu tiên giữ lại cho đến khi có tin nhắn thực từ API
      if (!uniqueMessages.has(msg._id)) {
        uniqueMessages.set(msg._id, msg);
      }
    });

    return Array.from(uniqueMessages.values()).sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  }, [messages, activeRealtimeMessages]);

  const markAsReadMutation = useMarkAsReadMutation();
  const { mutate: markAsRead, isPending: isMarkingAsRead } = markAsReadMutation;

  //- Chọn conversation trên mobile -> đóng sidebar
  const handleSelectConversation = (id: string) => {
    //- Nếu chọn phòng khác, xóa tin nhắn realtime cũ
    if (id !== activeConversationId) {
      clearRealtimeMessages();
    }
    setActiveConversationId(id);
    setIsMobileSidebarOpen(false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConversationId) return;

    const textToSend = inputText.trim();
    setInputText("");

    //- Tạo tin nhắn tạm (optimistic) để hiển thị ngay lập tức
    const optimisticMessage: ChatMessage = {
      _id: `optimistic_${Date.now()}`,
      conversationId: activeConversationId,
      senderId: {
        _id: user?._id || "",
        name: user?.name || "",
        avatar: user?.avatar || "",
        email: user?.email || "",
      },
      senderType: user?.roleCodeName as "CANDIDATE" | "RECRUITER",
      type: "TEXT",
      content: textToSend,
      isRead: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    //- Lưu cache cũ để rollback nếu lỗi
    const queryKey = ["messages", activeConversationId, 1, 50];
    const previousData = queryClient.getQueryData(queryKey);

    //- Chèn tin nhắn tạm vào cache ngay lập tức
    queryClient.setQueryData(queryKey, (old: any) => {
      if (!old) return old;
      return {
        ...old,
        data: {
          ...old.data,
          messages: [...(old.data?.messages || []), optimisticMessage],
        },
      };
    });

    try {
      await sendMessageMutation.mutateAsync({
        conversationId: activeConversationId,
        type: "TEXT",
        content: textToSend,
      });

      //- Khi API thành công, invalidate để lấy dữ liệu thật thay thế tin nhắn tạm
      queryClient.invalidateQueries({
        queryKey: ["messages", activeConversationId],
      });
    } catch (error) {
      //- Rollback cache về trạng thái cũ nếu gửi thất bại
      queryClient.setQueryData(queryKey, previousData);
      SoftDestructiveSonner("Không thể gửi tin nhắn. Vui lòng thử lại");
      console.log("error send message: ", error);
    }
  };

  useEffect(() => {
    if (!activeConversationId || conversations.length === 0) return;

    const currentConv = conversations.find(
      (c) => c._id === activeConversationId,
    );
    if (!currentConv) return;

    const isUserCandidate =
      user?.roleCodeName === envConfig.NEXT_PUBLIC_ROLE_CANDIDATE;
    const unreadCount = isUserCandidate
      ? currentConv.unreadCandidate
      : currentConv.unreadCompany;

    if (unreadCount <= 0 || isMarkingAsRead) return;

    markAsRead(activeConversationId, {
      onSuccess: () => {
        socket?.emit("conversation_read", {
          conversationId: activeConversationId,
          readAt: new Date().toISOString(),
        });
      },
    });
  }, [
    activeConversationId,
    conversations,
    user?.roleCodeName,
    markAsRead,
    isMarkingAsRead,
    socket,
  ]);

  return (
    <div className="flex h-[calc(100vh-100px)] w-full bg-white dark:bg-slate-900 border rounded-xl overflow-hidden shadow-sm">
      {/* Desktop Sidebar - ẩn trên mobile */}
      <ConversationSidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        userRole={user?.roleCodeName}
        isConnected={isConnected}
        user={user}
      />

      {/* Mobile Sidebar - dùng Sheet slide-in */}
      <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
        <SheetContent
          side="left"
          className="w-[85vw] sm:w-[350px] p-0 flex flex-col"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Danh sách đoạn chat</SheetTitle>
          </SheetHeader>
          <ConversationList
            conversations={conversations}
            activeConversationId={activeConversationId}
            onSelectConversation={handleSelectConversation}
            userRole={user?.roleCodeName}
            isConnected={isConnected}
            user={user}
          />
        </SheetContent>
      </Sheet>

      {/* Chat Window - full width trên mobile */}
      <ChatWindow
        messages={displayMessages}
        activeConversationId={activeConversationId}
        inputText={inputText}
        onInputChange={setInputText}
        onSendMessage={handleSendMessage}
        isSending={sendMessageMutation.isPending}
        onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
      />
    </div>
  );
}
