import React from "react";
import { Conversation } from "@/schemasvalidation/chat";
import { cn } from "@/lib/utils";
import { User as UserIcon, Plus } from "lucide-react";
import { envConfig } from "../../../../../config";

interface ConversationSidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  userRole: string | undefined;
  isConnected: boolean;
  onCreateNewChat?: () => void;
}

export default function ConversationSidebar({
  conversations,
  activeConversationId,
  onSelectConversation,
  userRole,
  isConnected,
  onCreateNewChat,
}: ConversationSidebarProps) {
  return (
    <div className="w-1/3 border-r flex flex-col border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <div className="p-4 border-b border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-950 flex justify-between items-center">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          Đoạn chat{" "}
          {isConnected ? (
            <span className="w-2 h-2 rounded-full bg-green-500 block"></span>
          ) : (
            <span className="w-2 h-2 rounded-full bg-red-500 block"></span>
          )}
        </h2>
        {/* {onCreateNewChat && (
          <button
            onClick={onCreateNewChat}
            title="Tạo cuộc trò chuyện mới"
            className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition"
          >
            <Plus className="w-5 h-5" />
          </button>
        )} */}
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center justify-center text-gray-400">
            <UserIcon className="w-12 h-12 mb-3 text-gray-300" />
            <p className="text-sm">Không có cuộc hội thoại nào.</p>
            {onCreateNewChat && (
              <button
                onClick={onCreateNewChat}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition"
              >
                Tạo tin nhắn mới
              </button>
            )}
          </div>
        ) : (
          conversations.map((conv) => {
            const displayInfo =
              userRole === envConfig.NEXT_PUBLIC_ROLE_CANDIDATE
                ? conv.companyId
                : conv.candidateId;

            return (
              <div
                key={conv._id}
                onClick={() => onSelectConversation(conv._id)}
                className={cn(
                  "flex flex-col gap-1 p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800 border-b border-gray-100 dark:border-slate-800 transition-colors",
                  activeConversationId === conv._id &&
                    "bg-blue-50 dark:bg-slate-800 border-l-4 border-l-blue-500",
                )}
              >
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-[15px] truncate">
                    {displayInfo?.name || "Người dùng"}
                  </span>
                  {(conv.unreadCandidate > 0 || conv.unreadCompany > 0) && (
                    <span className="w-3 h-3 bg-red-500 rounded-full flex-shrink-0"></span>
                  )}
                </div>
                <span className="text-sm text-gray-500 truncate">
                  {conv.lastMessage || "Chưa có tin nhắn"}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
