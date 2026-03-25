"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Conversation, ChatMessage } from "@/schemasvalidation/chat";
import { useChatSocket } from "@/hooks/use-chat-socket";
import { useAppStore } from "@/components/TanstackProvider";
import {
  useGetConversations,
  useGetMessages,
  useSendMessageMutation,
  useCreateConversationMutation,
} from "@/queries/useChat";
import SoftDestructiveSonner from "@/components/shadcn-studio/sonner/SoftDestructiveSonner";
import ConversationSidebar from "./components/ConversationSidebar";
import ChatWindow from "./components/ChatWindow";

export default function ChatPageModule() {
  const { user } = useAppStore();
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Lấy dữ liệu
  const { data: conversationsData, refetch: refetchConversations } =
    useGetConversations();
  const conversations: Conversation[] = useMemo(() => {
    return conversationsData?.data || [];
  }, [conversationsData]);

  const { data: messagesData } = useGetMessages(activeConversationId);
  const messages: ChatMessage[] = useMemo(() => {
    return messagesData?.data?.messages || [];
  }, [messagesData]);

  const { isConnected, realtimeMessages } = useChatSocket(activeConversationId);
  const sendMessageMutation = useSendMessageMutation();
  const createConversationMutation = useCreateConversationMutation();

  // Scroll bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, realtimeMessages]);

  const displayMessages = [...messages, ...realtimeMessages];

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConversationId) return;

    try {
      const textToSend = inputText.trim();
      setInputText("");

      await sendMessageMutation.mutateAsync({
        conversationId: activeConversationId,
        type: "TEXT",
        content: textToSend,
      });
    } catch (error) {
      SoftDestructiveSonner("Không thể gửi tin nhắn. Vui lòng thử lại");
    }
  };

  const handleCreateNewChat = async () => {
    // Tùy theo logic thực tế, user có thể tạo mới 1 cuộc Chat
    // Nếu user là ứng viên => tạo dummy tới cty, là Cty rỗng => cần chọn ứng viên (ở đây demo tạo rỗng)
    try {
      const payload: any = {};
      if (user?.roleCodeName === "CANDIDATE") {
        // Cần id của company để test (ví dụ)
        SoftDestructiveSonner(
          "Ứng viên cần ứng tuyển vào 1 công việc để có thể chat với HR!",
        );
        return;
      } else {
        // Cần id ứng viên để test
        SoftDestructiveSonner(
          "HR cần chọn ứng viên từ danh sách CV để bắt đầu chat!",
        );
        return;
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex h-[calc(100vh-100px)] w-full bg-white dark:bg-slate-900 border rounded-xl overflow-hidden shadow-sm">
      <ConversationSidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={setActiveConversationId}
        userRole={user?.roleCodeName}
        isConnected={isConnected}
        onCreateNewChat={handleCreateNewChat}
      />

      <ChatWindow
        messages={displayMessages}
        currentUserId={user?._id}
        activeConversationId={activeConversationId}
        inputText={inputText}
        onInputChange={setInputText}
        onSendMessage={handleSendMessage}
        isSending={sendMessageMutation.isPending}
        messagesEndRef={messagesEndRef}
      />
    </div>
  );
}
