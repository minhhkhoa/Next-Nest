"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Conversation, ChatMessage } from "@/schemasvalidation/chat";
import { useChatSocket } from "@/hooks/use-chat-socket";
import { useAppStore } from "@/components/TanstackProvider";
import {
  useGetConversations,
  useGetMessages,
  useSendMessageMutation,
} from "@/queries/useChat";
import { useSearchParams } from "next/navigation";
import SoftDestructiveSonner from "@/components/shadcn-studio/sonner/SoftDestructiveSonner";
import ConversationSidebar from "./components/ConversationSidebar";
import ChatWindow from "./components/ChatWindow";

export default function ChatPageModule() {
  const { user } = useAppStore();
  const searchParams = useSearchParams();
  const defaultConversationId = searchParams.get("conversationId");

  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(defaultConversationId || null);
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

  return (
    <div className="flex h-[calc(100vh-100px)] w-full bg-white dark:bg-slate-900 border rounded-xl overflow-hidden shadow-sm">
      <ConversationSidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={setActiveConversationId}
        userRole={user?.roleCodeName}
        isConnected={isConnected}
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
