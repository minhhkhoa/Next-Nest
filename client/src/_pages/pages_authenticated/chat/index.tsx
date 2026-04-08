"use client";

import React, { useState, useMemo } from "react";
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

export default function ChatPageModule() {
  const { user } = useAppStore();
  const searchParams = useSearchParams();
  const defaultConversationId = searchParams.get("conversationId");

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

  const { isConnected, realtimeMessages } = useChatSocket(activeConversationId);
  const sendMessageMutation = useSendMessageMutation();

  //- Scroll bottom
  // useEffect(() => {
  //   messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  // }, [messages, realtimeMessages]);

  const displayMessages = [...messages, ...realtimeMessages];

  const markAsReadMutation = useMarkAsReadMutation();

  //- Chọn conversation trên mobile -> đóng sidebar
  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    setIsMobileSidebarOpen(false);

    //- đánh dấu đã đọc
    markAsReadMutation.mutate(id);
  };

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
      console.log("error send message: ", error);
    }
  };

  return (
    <div className="flex h-[calc(100vh-100px)] w-full bg-white dark:bg-slate-900 border rounded-xl overflow-hidden shadow-sm">
      {/* Desktop Sidebar - ẩn trên mobile */}
      <ConversationSidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        userRole={user?.roleCodeName}
        isConnected={isConnected}
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
