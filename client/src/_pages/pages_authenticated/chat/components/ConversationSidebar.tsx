import React, { useEffect } from "react";
import { Conversation } from "@/schemasvalidation/chat";
import { cn, getRoleCodeName } from "@/lib/utils";
import { User as UserIcon } from "lucide-react";
import { envConfig } from "../../../../../config";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ConversationSidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  userRole: string | undefined;
  isConnected: boolean;
  onCreateNewChat?: () => void;
}

//- Nội dung danh sách conversation - dùng chung cho desktop & mobile
export function ConversationList({
  conversations,
  activeConversationId,
  onSelectConversation,
  userRole,
  isConnected,
  onCreateNewChat,
}: ConversationSidebarProps) {
  const isCandidate =
    getRoleCodeName() === envConfig.NEXT_PUBLIC_ROLE_CANDIDATE;

  useEffect(() => {
    // console.log("conversations::", conversations);
  }, [conversations]);
  return (
    <>
      <div className="p-4 border-b border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-950 flex justify-between items-center shrink-0">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          Đoạn chat{" "}
          {isConnected ? (
            <span className="w-2 h-2 rounded-full bg-green-500 block"></span>
          ) : (
            <span className="w-2 h-2 rounded-full bg-red-500 block"></span>
          )}
        </h2>
      </div>
      <ScrollArea className="flex-1">
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
                    <span className="w-3 h-3 bg-red-500 rounded-full flex-shrink-0">
                      {isCandidate ? conv.unreadCandidate : conv.unreadCompany}
                    </span>
                  )}
                </div>
                <span className="text-sm text-gray-500 truncate">
                  {conv.lastMessage || "Chưa có tin nhắn"}
                </span>
              </div>
            );
          })
        )}
      </ScrollArea>
    </>
  );
}

//- Desktop sidebar - ẩn trên mobile
export default function ConversationSidebar(props: ConversationSidebarProps) {
  return (
    <div className="hidden md:flex w-1/3 lg:w-1/4 border-r flex-col border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <ConversationList {...props} />
    </div>
  );
}
