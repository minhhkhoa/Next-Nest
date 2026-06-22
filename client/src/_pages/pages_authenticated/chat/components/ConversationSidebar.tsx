import React from "react";
import { Conversation } from "@/schemasvalidation/chat";
import { cn } from "@/lib/utils";
import { User as UserIcon } from "lucide-react";
import { envConfig } from "../../../../../config";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserResponseType } from "@/schemasvalidation/user";
import { useTranslations } from "next-intl";

interface ConversationSidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  userRole: string | undefined;
  isConnected: boolean;
  onCreateNewChat?: () => void;
  user: UserResponseType;
}

//- Nội dung danh sách conversation - dùng chung cho desktop & mobile
export function ConversationList({
  conversations,
  activeConversationId,
  onSelectConversation,
  userRole,
  isConnected,
  onCreateNewChat,
  user,
}: ConversationSidebarProps) {
  const t = useTranslations("Candidate.Chat");

  return (
    <>
      {/*- nền header danh sách chat bán trong suốt */}
      <div className="p-4 border-b border-gray-200 dark:border-slate-800 bg-gray-50/40 dark:bg-slate-950/40 backdrop-blur-sm flex justify-between items-center shrink-0">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          {t("MessageSquare")}{" "}
          {isConnected ? (
            <span
              title={t("Online")}
              className="w-2 h-2 rounded-full bg-green-500 block"
            ></span>
          ) : (
            <span
              title={t("Offline")}
              className="w-2 h-2 rounded-full bg-red-500 block"
            ></span>
          )}
        </h2>
      </div>
      <ScrollArea className="flex-1">
        {conversations.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center justify-center text-gray-400">
            <UserIcon className="w-12 h-12 mb-3 text-gray-300" />
            <p className="text-sm">{t("NoConversations")}</p>
            {onCreateNewChat && (
              <button
                onClick={onCreateNewChat}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition"
              >
                {t("CreateNewChat")}
              </button>
            )}
          </div>
        ) : (
          conversations.map((conv) => {
            const isCandidate = conv.candidateId._id === user._id;
            const displayInfo =
              userRole === envConfig.NEXT_PUBLIC_ROLE_CANDIDATE
                ? conv.companyId
                : conv.candidateId;
            const unreadCount = isCandidate
              ? conv.unreadCandidate
              : conv.unreadCompany;

            return (
              <div
                key={conv._id}
                onClick={() => onSelectConversation(conv._id)}
                className={cn(
                  "flex flex-col gap-1 p-3 cursor-pointer hover:bg-gray-200/30 dark:hover:bg-slate-800/40 border-b border-gray-100 dark:border-slate-800 transition-colors",
                  activeConversationId === conv._id &&
                    "bg-blue-500/10 dark:bg-indigo-500/20 border-l-4 border-l-primary",
                )}
              >
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-[15px] truncate">
                    {displayInfo?.name || t("User")}
                  </span>

                  {unreadCount > 0 ? (
                    <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                      {unreadCount}
                    </span>
                  ) : null}
                </div>
                <span className="text-sm text-gray-500 truncate">
                  {typeof conv.lastMessage === "object"
                    ? conv.lastMessage?.content
                    : conv.lastMessage || t("NoMessagesYet")}
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
    <div className="hidden md:flex w-1/3 lg:w-1/4 border-r flex-col border-gray-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm">
      {/*- nền container sidebar bán trong suốt */}
      <ConversationList {...props} />
    </div>
  );
}
