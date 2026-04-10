import { cn, generateSlugUrl } from "@/lib/utils";
import { ChatMessage } from "@/schemasvalidation/chat";
import React, { useMemo } from "react";
import { envConfig } from "../../../../../config";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { TypeActionBy } from "@/schemasvalidation/NewsCategory";
import { Card, CardContent } from "@/components/ui/card";

interface UseMemoFrameChatProps {
  messages: ChatMessage[];
  currentUserSenderType: string;
  lastOwnMessageId: string | null;
  candidateData: TypeActionBy | undefined;
  hrData: TypeActionBy | undefined;
}

export default function useMemoFrameChat({
  messages,
  currentUserSenderType,
  lastOwnMessageId,
  candidateData,
  hrData,
}: UseMemoFrameChatProps) {
  //- sử dụng useMemo để tránh tính toán render lại toàn bộ không gian chat khi chỉ có một tin nhắn mới
  //- sẽ mượt hơn hẳn.
  const messageItems = useMemo(
    () =>
      messages.map((msg, index) => {
        const isMe = msg.senderType === currentUserSenderType;
        const isLastOwnMessage = isMe && msg._id === lastOwnMessageId;

        const nextMessage = messages[index + 1];
        const isSameSenderAsNext =
          !!nextMessage &&
          nextMessage.senderType === msg.senderType &&
          nextMessage.senderId?._id === msg.senderId?._id;
        const shouldShowAvatar = !isSameSenderAsNext;

        const avatarSrc =
          msg.senderId?.avatar ||
          (msg.senderType === envConfig.NEXT_PUBLIC_ROLE_CANDIDATE
            ? candidateData?.avatar
            : hrData?.avatar);
        const jobReferenceSlug =
          msg.metadata?.jobSlug || msg.metadata?.jobTitle || "chi-tiet-job";
        const jobReferenceLink = msg.metadata?.jobId
          ? `/jobs/${generateSlugUrl({
              name: jobReferenceSlug,
              id: msg.metadata.jobId,
            })}`
          : null;

        return (
          <div
            key={msg._id}
            className={cn(
              "flex max-w-[calc(100%-2.75rem)] sm:max-w-[70%] gap-2 items-end",
              isMe ? "flex-row-reverse self-end " : "flex-row self-start",
            )}
          >
            {shouldShowAvatar ? (
              <div
                className={cn(
                  "h-8 w-8 sm:h-10 sm:w-10 shrink-0" +
                    (index === messages.length - 1 ? " mb-4" : ""),
                )}
              >
                <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                  <AvatarImage src={avatarSrc} />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
              </div>
            ) : (
              <div className="h-8 w-8 sm:h-10 sm:w-10 shrink-0" />
            )}
            <div className="min-w-0 flex-1">
              <div
                className={cn(
                  "px-3 py-2 sm:px-4 rounded-2xl text-sm sm:text-base w-full max-w-full [overflow-wrap:anywhere]",
                  isMe
                    ? "bg-blue-500 text-white rounded-br-none"
                    : "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-bl-none",
                )}
              >
                {msg.type === "TEXT" ? (
                  <p className="whitespace-pre-wrap break-all">{msg.content}</p>
                ) : msg.type === "JOB_REFERENCE" ? (
                  <div className="space-y-2">
                    {msg.content ? (
                      <p className="whitespace-pre-wrap break-all">
                        {msg.content}
                      </p>
                    ) : null}

                    {jobReferenceLink ? (
                      <Link
                        href={jobReferenceLink}
                        className="block"
                        aria-label="Mở chi tiết công việc"
                      >
                        <div
                          className={cn(
                            "rounded-xl transition hover:opacity-90",
                            isMe
                              ? "border-blue-200 bg-blue-400/20"
                              : "border-gray-200 bg-gray-50 dark:bg-slate-900 dark:border-slate-700",
                          )}
                        >
                          <Card className="flex items-center gap-3 dark:!bg-black/80">
                            <CardContent className="flex items-center gap-3 p-3">
                              {(msg.metadata?.jobImage ||
                                msg.metadata?.thumbnail) && (
                                <Image
                                  src={
                                    msg.metadata?.jobImage ||
                                    msg.metadata?.thumbnail
                                  }
                                  alt={msg.metadata?.jobTitle || "Job image"}
                                  width={40}
                                  height={40}
                                  className="h-10 w-10 rounded-md object-cover shrink-0"
                                />
                              )}
                              <div className="min-w-0">
                                <p className="font-semibold truncate underline-offset-2 text-bl hover:underline">
                                  {msg.metadata?.jobTitle ||
                                    "Công việc tham chiếu"}
                                </p>
                                {msg.metadata?.salary ? (
                                  <p className="text-xs opacity-80 truncate">
                                    {msg.metadata.salary}
                                  </p>
                                ) : null}
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </Link>
                    ) : (
                      <div
                        className={cn(
                          "rounded-xl border p-2 sm:p-3",
                          isMe
                            ? "border-blue-200 bg-blue-400/20"
                            : "border-gray-200 bg-gray-50 dark:bg-slate-900 dark:border-slate-700",
                        )}
                      >
                        <div className="flex items-center gap-3">
                          {(msg.metadata?.jobImage ||
                            msg.metadata?.thumbnail) && (
                            <Image
                              src={
                                msg.metadata?.jobImage ||
                                msg.metadata?.thumbnail
                              }
                              alt={msg.metadata?.jobTitle || "Job image"}
                              width={40}
                              height={40}
                              className="h-10 w-10 rounded-md object-cover shrink-0"
                            />
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold truncate">
                              {msg.metadata?.jobTitle || "Công việc tham chiếu"}
                            </p>
                            {msg.metadata?.salary ? (
                              <p className="text-xs opacity-80 truncate">
                                {msg.metadata.salary}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="italic text-gray-300 break-all">
                    [Loại tin nhắn chưa hỗ trợ: {msg.type}]
                  </p>
                )}
              </div>
              {isLastOwnMessage ? (
                <>
                  <span className="text-[11px] text-gray-400 mt-1">
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <span className="text-[11px] text-gray-400 ml-2">
                    {msg.isRead ? "Đã xem" : "Đã gửi"}
                  </span>
                </>
              ) : null}
            </div>
          </div>
        );
      }),
    [
      messages,
      currentUserSenderType,
      lastOwnMessageId,
      candidateData?.avatar,
      hrData?.avatar,
    ],
  );

  return messageItems;
}
