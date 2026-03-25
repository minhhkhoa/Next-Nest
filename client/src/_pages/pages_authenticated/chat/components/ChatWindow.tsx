import React from "react";
import { ChatMessage } from "@/schemasvalidation/chat";
import { cn } from "@/lib/utils";
import { User as UserIcon, Send } from "lucide-react";

interface ChatWindowProps {
  messages: ChatMessage[];
  currentUserId: string | undefined;
  activeConversationId: string | null;
  inputText: string;
  onInputChange: (val: string) => void;
  onSendMessage: (e: React.FormEvent) => void;
  isSending: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export default function ChatWindow({
  messages,
  currentUserId,
  activeConversationId,
  inputText,
  onInputChange,
  onSendMessage,
  isSending,
  messagesEndRef,
}: ChatWindowProps) {
  if (!activeConversationId) {
    return (
      <div className="flex-1 flex flex-col bg-gray-50 dark:bg-slate-900 border-gray-200 dark:border-slate-800">
        <div className="flex-1 flex items-center justify-center flex-col text-gray-400">
          <UserIcon className="w-16 h-16 text-gray-200 mb-4" />
          <p>Chọn một đoạn chat để bắt đầu</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-2/3 flex flex-col bg-gray-50 dark:bg-slate-900">
      {/* Header Chat */}
      <div className="h-16 flex items-center px-4 border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
          <UserIcon className="w-5 h-5 text-gray-500" />
        </div>
        <span className="font-semibold">Đang chat...</span>
      </div>

      {/* Messages body */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
            Chưa có tin nhắn nào. Hãy gửi lời chào!
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.senderId._id === currentUserId;

            return (
              <div
                key={msg._id || index}
                className={cn(
                  "flex flex-col max-w-[70%]",
                  isMe ? "self-end items-end" : "self-start items-start",
                )}
              >
                <div
                  className={cn(
                    "px-4 py-2 rounded-2xl",
                    isMe
                      ? "bg-blue-500 text-white rounded-br-none"
                      : "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-bl-none",
                  )}
                >
                  {msg.type === "TEXT" ? (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
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
            );
          })
        )}
        <div ref={messagesEndRef}></div>
      </div>

      {/* Input Box */}
      <div className="p-4 bg-white dark:bg-slate-950 border-t border-gray-200 dark:border-slate-800">
        <form onSubmit={onSendMessage} className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder="Nhập tin nhắn..."
            className="flex-1 bg-gray-100 dark:bg-slate-900 border-none rounded-full px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isSending}
            className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <Send className="w-5 h-5 -ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
