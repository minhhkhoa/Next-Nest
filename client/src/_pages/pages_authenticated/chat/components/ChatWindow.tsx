import React, { useEffect, useRef } from "react";
import { ChatMessage } from "@/schemasvalidation/chat";
import {
  cn,
  getRoleCandidate,
  getRoleCodeName,
  getRoleRecruiter,
} from "@/lib/utils";
import { User as UserIcon, Send, Menu } from "lucide-react";
import { envConfig } from "../../../../../config";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChatWindowProps {
  messages: ChatMessage[];
  activeConversationId: string | null;
  inputText: string;
  onInputChange: (val: string) => void;
  onSendMessage: (e: React.FormEvent) => void;
  isSending: boolean;
  onOpenMobileSidebar?: () => void;
}

export default function ChatWindow({
  messages,
  activeConversationId,
  inputText,
  onInputChange,
  onSendMessage,
  isSending,
  onOpenMobileSidebar,
}: ChatWindowProps) {
  //- Ref tới ScrollArea để cuộn xuống cuối
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  //- Hàm cuộn viewport của ScrollArea xuống cuối
  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    const viewport = scrollAreaRef.current?.querySelector(
      '[data-slot="scroll-area-viewport"]',
    );
    if (viewport) {
      viewport.scrollTop = viewport.scrollHeight;
    }
  };

  //- Cuộn xuống cuối khi load tin nhắn hoặc có tin nhắn mới
  useEffect(() => {
    //- Dùng setTimeout nhỏ để đợi DOM render xong
    const timer = setTimeout(() => {
      scrollToBottom("instant");
    }, 50);
    return () => clearTimeout(timer);
  }, [messages, activeConversationId]);

  const isCandidate =
    getRoleCodeName() === envConfig.NEXT_PUBLIC_ROLE_CANDIDATE;

  //- lọc lấy 2 message của ứng viên và nhà tuyển dụng để lấy thông tin
  const candidateData = messages.find(
    (msg) => msg.senderType === envConfig.NEXT_PUBLIC_ROLE_CANDIDATE,
  )?.senderId;

  const hrData = messages.find(
    (msg) =>
      msg.senderType ===
      (envConfig.NEXT_PUBLIC_ROLE_RECRUITER ||
        envConfig.NEXT_PUBLIC_ROLE_RECRUITER_ADMIN),
  )?.senderId;

  if (!activeConversationId) {
    return (
      <div className="flex-1 flex flex-col bg-gray-50 dark:bg-slate-900 border-gray-200 dark:border-slate-800">
        {/* Nút mở sidebar trên mobile khi chưa chọn conversation */}
        <div className="md:hidden p-3 border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950">
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenMobileSidebar}
            aria-label="Mở danh sách đoạn chat"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex-1 flex items-center justify-center flex-col text-gray-400 px-4 text-center">
          <UserIcon className="w-16 h-16 text-gray-200 mb-4" />
          <p>Chọn một đoạn chat để bắt đầu</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50 dark:bg-slate-900 min-w-0">
      {/* Header Chat */}
      <div className="h-14 sm:h-16 flex items-center px-3 sm:px-4 border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 shrink-0 gap-2">
        {/* Nút menu chỉ hiện trên mobile */}
        <Button
          variant="ghost"
          size="icon-sm"
          className="md:hidden shrink-0"
          onClick={onOpenMobileSidebar}
          aria-label="Mở danh sách đoạn chat"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
          <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
            <AvatarImage
              src={isCandidate ? hrData?.avatar : candidateData?.avatar}
            />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </div>
        <span className="font-semibold truncate text-sm sm:text-base">
          {isCandidate ? hrData?.name : candidateData?.name}
        </span>
      </div>

      {/* Messages body */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 h-50">
        <div className="p-3 sm:p-4 flex flex-col gap-3 sm:gap-4">
          {messages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm py-20">
              Chưa có tin nhắn nào. Hãy gửi lời chào!
            </div>
          ) : (
            messages.map((msg, index) => {
              //- logic la cu la candidate thi o 1 ben con lai phia cty se o 1 ben
              const isRoleCandidate =
                getRoleCodeName() === envConfig.NEXT_PUBLIC_ROLE_CANDIDATE
                  ? getRoleCandidate()
                  : getRoleRecruiter();

              console.log("check fungetRoleName: ", getRoleCodeName());
              console.log("check isRoleCandidate: ", isRoleCandidate);
              const isMe = msg.senderType === isRoleCandidate ? true : false;

              console.log("isMe: ", isMe);
              const avatarSrc =
                msg.senderType === envConfig.NEXT_PUBLIC_ROLE_CANDIDATE
                  ? candidateData?.avatar
                  : hrData?.avatar;

              return (
                <div
                  key={msg._id || index}
                  className={cn(
                    "flex flex-col max-w-[85%] sm:max-w-[70%] gap-2 items-start",
                    isMe ? "flex-row-reverse self-end " : "flex-row self-start",
                  )}
                >
                  <div>
                    <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                      <AvatarImage src={avatarSrc} />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                  </div>
                  <div>
                    <div
                      className={cn(
                        "px-3 py-2 sm:px-4 rounded-2xl text-sm sm:text-base",
                        isMe
                          ? "bg-blue-500 text-white rounded-br-none"
                          : "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-bl-none",
                      )}
                    >
                      {msg.type === "TEXT" ? (
                        <p className="whitespace-pre-wrap break-words">
                          {msg.content}
                        </p>
                      ) : (
                        <p className="italic text-gray-300">
                          [Loại tin nhắn chưa hỗ trợ: {msg.type}]
                        </p>
                      )}
                    </div>
                    <span className="text-[11px] text-gray-400 mt-1">
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>

      {/* Input Box */}
      <div className="p-2 sm:p-4 bg-white dark:bg-slate-950 border-t border-gray-200 dark:border-slate-800 shrink-0">
        <form onSubmit={onSendMessage} className="flex gap-2 items-center">
          <input
            type="text"
            value={inputText}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder="Nhập tin nhắn..."
            className="flex-1 min-w-0 bg-gray-100 dark:bg-slate-900 border-none rounded-full px-4 py-2 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <Button
            type="submit"
            disabled={!inputText.trim() || isSending}
            size="icon"
            className="rounded-full bg-blue-500 hover:bg-blue-600 shrink-0"
          >
            <Send className="w-4 h-4 sm:w-5 sm:h-[18px]" />
          </Button>
        </form>
      </div>
    </div>
  );
}
