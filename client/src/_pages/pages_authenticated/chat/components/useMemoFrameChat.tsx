import { cn, generateSlugUrl } from "@/lib/utils";
import { ChatMessage, Conversation } from "@/schemasvalidation/chat";
import React, { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { envConfig } from "../../../../../config";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { TypeActionBy } from "@/schemasvalidation/NewsCategory";
import { MessageScrollerItem } from "@/components/ui/message-scroller";
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
} from "@/components/ui/message";
import { Bubble, BubbleContent, BubbleReactions } from "@/components/ui/bubble";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink, FileText, Smile } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CV_TEMPLATES } from "@/lib/constant";
import BasicTemplate from "@/components/cv-templates/BasicTemplate";
import ImpressiveTemplate from "@/components/cv-templates/ImpressiveTemplate";
import ModernTemplate from "@/components/cv-templates/ModernTemplate";
import SimpleTemplate from "@/components/cv-templates/SimpleTemplate";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslations, useLocale } from "next-intl";

const TEMPLATE_COMPONENTS: Record<string, React.ElementType> = {
  [CV_TEMPLATES.basicTemplate]: BasicTemplate,
  [CV_TEMPLATES.impressiveTemplate]: ImpressiveTemplate,
  [CV_TEMPLATES.modernTemplate]: ModernTemplate,
  [CV_TEMPLATES.simpleTemplate]: SimpleTemplate,
};

const formatFileSize = (size?: number) => {
  if (!size || Number.isNaN(size)) return "";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(2)} MB`;
};

//- component su dung thu vien react-markdown de hien thi toan bo case tu ai assistant
function MarkdownRenderer({ content }: { content: string }) {
  if (!content) return null;

  return (
    <div className="prose dark:prose-invert max-w-none text-sm sm:text-base leading-relaxed break-words text-slate-800 dark:text-slate-200">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}

interface UseMemoFrameChatProps {
  messages: ChatMessage[];
  currentUserSenderType: string;
  lastOwnMessageId: string | null;
  candidateData: TypeActionBy | undefined;
  hrData: TypeActionBy | undefined;
  activeConversation?: Conversation | null;
  onSendReaction?: (messageId: string, emoji: string) => void;
  currentUserId?: string;
}

export default function useMemoFrameChat({
  messages,
  currentUserSenderType,
  lastOwnMessageId,
  candidateData,
  hrData,
  activeConversation,
  onSendReaction,
  currentUserId,
}: UseMemoFrameChatProps) {
  const t = useTranslations("Candidate.Chat");
  const tCommon = useTranslations("Common");
  const locale = useLocale();

  const [previewCvMessage, setPreviewCvMessage] = useState<ChatMessage | null>(
    null,
  );

  const handleOpenSystemCvPreview = (message: ChatMessage) => {
    setPreviewCvMessage(message);
  };

  //- state lưu id tin nhắn đang được nhấn giữ chọn emoji trên mobile
  const [mobileReactionMessageId, setMobileReactionMessageId] = useState<
    string | null
  >(null);

  //- các ref để quản lý sự kiện chạm phát hiện long press
  const touchStartRef = React.useRef<{ x: number; y: number } | null>(null);
  const longPressTimerRef = React.useRef<any | null>(null);
  const isLongPressRef = React.useRef<boolean>(false);

  //- xử lý sự kiện khi bắt đầu chạm vào tin nhắn
  const handleTouchStart = (e: React.TouchEvent, messageId: string) => {
    //- chỉ xử lý khi chạm 1 ngón tay
    if (e.touches.length !== 1) return;

    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    isLongPressRef.current = false;

    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }

    //- thiết lập hẹn giờ 500ms cho hành động nhấn giữ
    longPressTimerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      //- rung nhẹ thiết bị để báo hiệu thành công (haptic feedback) nếu trình duyệt hỗ trợ
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        try {
          navigator.vibrate(50);
        } catch (err) {
          console.log("log err: ", err);
          //- bỏ qua nếu trình duyệt không cho phép rung không qua tương tác trực tiếp
        }
      }
      setMobileReactionMessageId(messageId);
    }, 500);
  };

  //- xử lý sự kiện khi di chuyển ngón tay (hủy long press nếu di chuyển nhiều - ví dụ đang cuộn trang)
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current || !longPressTimerRef.current) return;

    const touch = e.touches[0];
    const diffX = Math.abs(touch.clientX - touchStartRef.current.x);
    const diffY = Math.abs(touch.clientY - touchStartRef.current.y);

    if (diffX > 10 || diffY > 10) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  //- xử lý sự kiện khi nhấc ngón tay lên
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    //- nếu là long press, ngăn chặn hành vi click/tap mặc định của trình duyệt
    if (isLongPressRef.current) {
      e.preventDefault();
    }
  };

  //- sử dụng useMemo để tránh tính toán render lại toàn bộ không gian chat khi chỉ có một tin nhắn mới
  //- sẽ mượt hơn hẳn.
  const messageItems = useMemo(
    () =>
      messages.map((msg, index) => {
        const isMe =
          msg.conversationId === "ai-assistant"
            ? msg.senderId?._id !== "ai-bot"
            : msg.senderType === currentUserSenderType;
        const isLastOwnMessage = isMe && msg._id === lastOwnMessageId;

        const nextMessage = messages[index + 1];
        const isSameSenderAsNext =
          !!nextMessage &&
          nextMessage.senderType === msg.senderType &&
          nextMessage.senderId?._id === msg.senderId?._id;
        const shouldShowAvatar = !isSameSenderAsNext;

        //- Xác định avatar hiển thị
        let avatarSrc = msg.senderId?.avatar;
        if (msg.conversationId !== "ai-assistant" && activeConversation) {
          if (isMe) {
            if (currentUserSenderType === "CANDIDATE") {
              avatarSrc = msg.senderId?.avatar;
            } else {
              //- Mình là Recruiter -> hiển thị logo công ty của mình
              avatarSrc =
                activeConversation.companyId?.logo || msg.senderId?.avatar;
            }
          } else {
            if (currentUserSenderType === "CANDIDATE") {
              //- Đối phương là Company -> hiển thị logo công ty
              avatarSrc =
                activeConversation.companyId?.logo || msg.senderId?.avatar;
            } else {
              //- Đối phương là Candidate -> hiển thị avatar candidate
              avatarSrc =
                activeConversation.candidateId?.avatar || msg.senderId?.avatar;
            }
          }
        }

        //- Fallback nếu avatarSrc rỗng
        if (!avatarSrc) {
          avatarSrc =
            msg.senderType === envConfig.NEXT_PUBLIC_ROLE_CANDIDATE
              ? candidateData?.avatar
              : hrData?.avatar;
        }

        const jobReferenceSlug =
          msg.metadata?.jobSlug || msg.metadata?.jobTitle || "chi-tiet-job";
        const jobReferenceLink = msg.metadata?.jobId
          ? `/jobs/${generateSlugUrl({
              name: jobReferenceSlug,
              id: msg.metadata.jobId,
            })}`
          : null;
        const jobReferenceImage =
          msg.metadata?.jobImage || msg.metadata?.thumbnail;

        return (
          <MessageScrollerItem
            key={msg._id}
            messageId={msg._id}
            //- chỉ dùng tin nhắn cuối cùng làm anchor cuộn để scroller luôn bám đáy và tránh bị nhảy cuộn lên đầu khi gửi
            scrollAnchor={index === messages.length - 1}
            className={cn(
              "w-full flex",
              isMe ? "justify-end" : "justify-start",
              //- nếu tin nhắn hiện tại có biểu cảm và có tin nhắn tiếp theo thì thêm padding bottom để tránh đè
              msg.reactions && msg.reactions.length > 0 && nextMessage
                ? "pb-3.5"
                : "",
            )}
          >
            <Message
              align={isMe ? "end" : "start"}
              className="max-w-[calc(100%-2.75rem)] sm:max-w-[70%] gap-2 items-end min-w-0"
            >
              {shouldShowAvatar ? (
                <MessageAvatar className="h-8 w-8 sm:h-10 sm:w-10 shrink-0 bg-transparent rounded-none p-0 border-none min-w-0 overflow-visible group-has-data-[slot=message-footer]/message:-translate-y-5">
                  <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                    <AvatarImage src={avatarSrc} />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                </MessageAvatar>
              ) : (
                <div className="h-8 w-8 sm:h-10 sm:w-10 shrink-0" />
              )}
              <MessageContent className="min-w-0 flex-1 gap-1">
                <div
                  className={cn(
                    "flex items-center gap-1.5 w-full max-w-full min-w-0 relative group/row",
                    isMe ? "flex-row-reverse" : "flex-row",
                  )}
                >
                  <Bubble variant="custom" className="max-w-full">
                    <BubbleContent
                      className={cn(
                        "px-3 py-2 sm:px-4 rounded-2xl text-sm sm:text-base w-full max-w-full break-words shadow-xs border",
                        //- ngăn chặn bôi đen text khi nhấn giữ trên mobile, vẫn cho phép trên desktop
                        "select-none sm:select-text cursor-pointer",
                        isMe
                          ? "bg-primary/10 text-primary dark:bg-primary/25 dark:text-primary-foreground border border-primary/20"
                          : "bg-white/60 dark:bg-slate-900/60 border border-slate-200/40 dark:border-slate-800/40 backdrop-blur-xs",
                      )}
                      style={{ WebkitTouchCallout: "none" }}
                      onTouchStart={
                        msg.conversationId !== "ai-assistant"
                          ? (e) => handleTouchStart(e, msg._id)
                          : undefined
                      }
                      onTouchMove={
                        msg.conversationId !== "ai-assistant"
                          ? handleTouchMove
                          : undefined
                      }
                      onTouchEnd={
                        msg.conversationId !== "ai-assistant"
                          ? handleTouchEnd
                          : undefined
                      }
                    >
                      {msg.type === "TEXT" ? (
                        msg.content ? (
                          //- su dung component markdown renderer khi tin nhan la tu ai assistant
                          msg.conversationId === "ai-assistant" &&
                          msg.senderId?._id === "ai-bot" ? (
                            <MarkdownRenderer content={msg.content} />
                          ) : (
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                          )
                        ) : (
                          <div className="flex gap-1.5 py-1.5 px-1 items-center h-[24px]">
                            <div
                              className="w-2 h-2 bg-current rounded-full animate-bounce"
                              style={{ animationDelay: "0ms" }}
                            />
                            <div
                              className="w-2 h-2 bg-current rounded-full animate-bounce"
                              style={{ animationDelay: "150ms" }}
                            />
                            <div
                              className="w-2 h-2 bg-current rounded-full animate-bounce"
                              style={{ animationDelay: "300ms" }}
                            />
                          </div>
                        )
                      ) : msg.type === "IMAGE" ? (
                        <div className="space-y-2">
                          {msg.metadata?.imageUrl ? (
                            <a
                              href={msg.metadata.imageUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="block"
                              aria-label="Mở ảnh đính kèm"
                            >
                              <Image
                                src={msg.metadata.imageUrl}
                                alt={msg.metadata?.fileName || t("Attachments")}
                                width={msg.metadata?.width || 320}
                                height={msg.metadata?.height || 220}
                                className="rounded-xl object-cover max-h-[320px] w-full"
                              />
                            </a>
                          ) : (
                            <p className="text-xs italic opacity-80">
                              {t("NoImageToDisplay")}
                            </p>
                          )}

                          {msg.content ? (
                            <p className="whitespace-pre-wrap text-sm opacity-95">
                              {msg.content}
                            </p>
                          ) : null}
                        </div>
                      ) : msg.type === "CV_LINK" ? (
                        <div className="space-y-2">
                          <a
                            href={msg.metadata?.link}
                            target="_blank"
                            rel="noreferrer"
                            className={cn(
                              "flex items-center gap-3 rounded-xl border p-3 transition hover:opacity-90",
                              isMe
                                ? "border-primary/20 bg-primary/10"
                                : "border-gray-200 bg-gray-50 dark:bg-slate-900 dark:border-slate-700",
                              !msg.metadata?.link &&
                                "pointer-events-none opacity-70",
                            )}
                            aria-label="Mở tệp đính kèm"
                          >
                            <div className="h-9 w-9 rounded-full bg-white/80 dark:bg-slate-800 flex items-center justify-center shrink-0">
                              <FileText className="h-4 w-4" />
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="font-semibold truncate">
                                {msg.metadata?.fileName ||
                                  msg.content ||
                                  t("Attachments")}
                              </p>
                              <p className="text-xs opacity-80 truncate">
                                {msg.metadata?.mimeType ||
                                  msg.metadata?.fileExt ||
                                  "File"}
                                {msg.metadata?.fileSize
                                  ? ` • ${formatFileSize(msg.metadata.fileSize)}`
                                  : ""}
                              </p>
                            </div>

                            {msg.metadata?.link ? (
                              <ExternalLink className="h-4 w-4 shrink-0" />
                            ) : null}
                          </a>

                          {msg.content ? (
                            <p className="whitespace-pre-wrap text-sm opacity-95">
                              {msg.content}
                            </p>
                          ) : null}
                        </div>
                      ) : msg.type === "CV_SYSTEM" ? (
                        <div className="space-y-2">
                          {msg.content ? (
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                          ) : null}

                          <button
                            type="button"
                            onClick={() => handleOpenSystemCvPreview(msg)}
                            className={cn(
                              "w-full rounded-xl border p-3 text-left transition hover:opacity-90",
                              isMe
                                ? "border-primary/20 bg-primary/10"
                                : "border-gray-200 bg-gray-50 dark:bg-slate-900 dark:border-slate-700",
                            )}
                          >
                            <div className="flex items-center gap-3">
                              {msg.metadata?.previewImage ? (
                                <Image
                                  src={msg.metadata.previewImage}
                                  alt={msg.metadata?.cvName || "CV preview"}
                                  width={44}
                                  height={56}
                                  className="h-14 w-11 rounded-md border object-cover shrink-0"
                                />
                              ) : (
                                <div className="h-14 w-11 rounded-md border bg-white/70 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                  <FileText className="h-4 w-4 text-slate-500" />
                                </div>
                              )}

                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="font-semibold truncate">
                                    {msg.metadata?.cvName ||
                                      msg.content ||
                                      t("SystemCv")}
                                  </p>
                                  {msg.metadata?.isDefault ? (
                                    <span className="text-[10px] px-2 py-0.5 rounded-full border border-current/40">
                                      {t("DefaultResume")}
                                    </span>
                                  ) : null}
                                </div>

                                {msg.metadata?.templateID ? (
                                  <p className="text-xs opacity-80 truncate">
                                    Template: {msg.metadata.templateID}
                                  </p>
                                ) : null}

                                {msg.metadata?.updatedAt ? (
                                  <p className="text-xs opacity-80 truncate">
                                    {t("UpdateAt", {
                                      date: new Date(
                                        msg.metadata.updatedAt,
                                      ).toLocaleDateString(
                                        locale === "vi" ? "vi-VN" : "en-US",
                                      ),
                                    })}
                                  </p>
                                ) : null}

                                <p className="text-xs opacity-80 mt-1">
                                  {t("ClickToViewCv")}
                                </p>
                              </div>
                            </div>
                          </button>
                        </div>
                      ) : msg.type === "JOB_REFERENCE" ? (
                        <div className="space-y-2 w-full min-w-0">
                          {msg.content ? (
                            <p className="whitespace-pre-wrap break-all">
                              {msg.content}
                            </p>
                          ) : null}

                          {jobReferenceLink ? (
                            <Link
                              href={jobReferenceLink}
                              className="block w-full min-w-0"
                              aria-label="Mở chi tiết công việc"
                            >
                              <div
                                className={cn(
                                  "rounded-xl transition hover:opacity-90 w-full min-w-0",
                                  isMe
                                    ? "border-primary/20 bg-primary/10"
                                    : "border-gray-200 bg-gray-50 dark:bg-slate-900 dark:border-slate-700",
                                )}
                              >
                                <Card className="w-full min-w-0 dark:!bg-black/80">
                                  <CardContent className="flex items-center gap-3 p-3 min-w-0 w-full">
                                    {jobReferenceImage && (
                                      <Image
                                        src={jobReferenceImage}
                                        alt={
                                          msg.metadata?.jobTitle || "Job image"
                                        }
                                        width={40}
                                        height={40}
                                        className="h-10 w-10 rounded-md object-cover shrink-0"
                                      />
                                    )}
                                    <div className="min-w-0 flex-1">
                                      <p className="font-semibold truncate underline-offset-2 text-bl hover:underline">
                                        {msg.metadata?.jobTitle ||
                                          t("ReferencedJob")}
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
                                  ? "border-primary/20 bg-primary/10"
                                  : "border-gray-200 bg-gray-50 dark:bg-slate-900 dark:border-slate-700",
                              )}
                            >
                              <div className="flex items-center gap-3 w-full min-w-0">
                                {jobReferenceImage && (
                                  <Image
                                    src={jobReferenceImage}
                                    alt={msg.metadata?.jobTitle || "Job image"}
                                    width={40}
                                    height={40}
                                    className="h-10 w-10 rounded-md object-cover shrink-0"
                                  />
                                )}
                                <div className="min-w-0 flex-1">
                                  <p className="font-semibold truncate">
                                    {msg.metadata?.jobTitle ||
                                      t("ReferencedJob")}
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
                          {t("UnsupportedMessage", { type: msg.type })}
                        </p>
                      )}
                    </BubbleContent>

                    {/* hiển thị các biểu cảm cảm xúc đã thả trên tin nhắn này */}
                    {msg.reactions && msg.reactions.length > 0 && (
                      <BubbleReactions
                        side="bottom"
                        align={(() => {
                          if (isMe) {
                            //- nếu đối phương thả cảm xúc vào tin nhắn của mình thì hiển thị ở bên trái (start)
                            const hasOpponentReaction = msg.reactions.some(
                              (r) => r.userId !== currentUserId,
                            );
                            return hasOpponentReaction ? "start" : "end";
                          }
                          //- nếu là tin nhắn của đối phương thì hiển thị ở bên phải (end) để tránh đè avatar đối phương ở bên trái
                          return "end";
                        })()}
                        className="cursor-pointer select-none bg-background/90 dark:bg-slate-950/90 border border-border shadow-xs scale-90 opacity-90 hover:opacity-100 hover:scale-95 transition-all"
                      >
                        {(
                          Array.from(
                            msg.reactions
                              .reduce(
                                (acc: Map<string, number>, current: any) => {
                                  acc.set(
                                    current.emoji,
                                    (acc.get(current.emoji) || 0) + 1,
                                  );
                                  return acc;
                                },
                                new Map<string, number>(),
                              )
                              .entries(),
                          ) as [string, number][]
                        ).map(([emoji, count]) => (
                          <div
                            key={emoji}
                            className="flex items-center gap-0.5"
                          >
                            <span>{emoji}</span>
                            {count > 1 && (
                              <span className="text-[9px] text-muted-foreground font-medium px-0.5">
                                {count}
                              </span>
                            )}
                          </div>
                        ))}
                      </BubbleReactions>
                    )}
                  </Bubble>

                  {/* nút chọn biểu cảm xuất hiện khi di chuột qua dòng tin nhắn */}
                  {msg.conversationId !== "ai-assistant" && (
                    <div
                      className={cn(
                        "hidden md:flex opacity-0 group-hover/row:opacity-100 transition-opacity duration-200 shrink-0",
                        isMe ? "mr-1" : "ml-1",
                      )}
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className="h-7 w-7 rounded-full hover:bg-muted/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="Bày tỏ cảm xúc"
                          >
                            <Smile className="h-4.5 w-4.5" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align={isMe ? "end" : "start"}
                          className="flex flex-row p-1 gap-1.5 bg-background/95 dark:bg-slate-900/95 backdrop-blur-md rounded-full shadow-lg border border-border/80 min-w-0"
                        >
                          {["👍", "❤️", "😆", "😢", "😮", "🙏"].map((emoji) => (
                            <DropdownMenuItem
                              key={emoji}
                              onClick={() => onSendReaction?.(msg._id, emoji)}
                              className="cursor-pointer text-base hover:scale-125 hover:bg-accent rounded-full p-1.5 h-8 w-8 flex items-center justify-center transition-all duration-150"
                            >
                              {emoji}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                </div>
                {isLastOwnMessage ? (
                  //- căn phải phần thời gian và trạng thái tin nhắn cho tin nhắn cuối của mình
                  <MessageFooter
                    className={cn(
                      "flex justify-end items-center gap-1.5 text-[11px] text-gray-400 select-none",
                      //- nếu có biểu cảm thì dịch footer xuống mt-3.5 để tránh bị đè chữ, ngược lại dùng mt-1
                      msg.reactions && msg.reactions.length > 0
                        ? "mt-3.5"
                        : "mt-1",
                    )}
                  >
                    <span>
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span>•</span>
                    <span>{msg.isRead ? t("Read") : t("Sent")}</span>
                  </MessageFooter>
                ) : null}
              </MessageContent>
            </Message>
          </MessageScrollerItem>
        );
      }),
    [
      messages,
      currentUserSenderType,
      lastOwnMessageId,
      candidateData?.avatar,
      hrData?.avatar,
      activeConversation,
      t,
      tCommon,
      locale,
      onSendReaction,
      currentUserId,
    ],
  );

  const previewTemplateId =
    previewCvMessage?.metadata?.templateID ||
    previewCvMessage?.metadata?.templateId;
  const previewResumeContent = previewCvMessage?.metadata?.resumeContent;
  const PreviewTemplateComponent = previewTemplateId
    ? TEMPLATE_COMPONENTS[previewTemplateId]
    : null;

  return (
    <>
      {messageItems}

      {/* sheeet preview CV */}
      <Sheet
        open={!!previewCvMessage}
        onOpenChange={(open) => {
          if (!open) setPreviewCvMessage(null);
        }}
      >
        <SheetContent
          side="right"
          className="w-[100vw] sm:max-w-[70vw] p-0 gap-0 h-full"
        >
          <SheetHeader className="px-4 py-3 border-b shrink-0">
            <SheetTitle>
              {previewCvMessage?.metadata?.cvName || t("SystemCvDetail")}
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 w-full bg-muted/20 overflow-y-auto p-4 md:p-6 flex justify-center">
            <div className="max-w-4xl w-full bg-white shadow-sm ring-1 ring-border p-2">
              {PreviewTemplateComponent && previewResumeContent ? (
                <PreviewTemplateComponent
                  data={previewResumeContent}
                  isEdit={false}
                  isView={true}
                />
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  {t("NoCvTemplate")}
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Dialog chọn emoji reaction dành riêng cho mobile */}
      <Dialog
        open={!!mobileReactionMessageId}
        onOpenChange={(open) => {
          if (!open) setMobileReactionMessageId(null);
        }}
      >
        <DialogContent className="max-w-[340px] w-[90%] rounded-2xl p-4 flex flex-col items-center gap-4 bg-background/95 backdrop-blur-md border border-border shadow-2xl">
          <DialogHeader className="p-0 text-center">
            <DialogTitle className="text-sm font-semibold text-muted-foreground">
              {locale === "vi" ? "Bày tỏ cảm xúc" : "React to message"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex justify-center items-center gap-2.5 w-full py-1">
            {["👍", "❤️", "😆", "😢", "😮", "🙏"].map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => {
                  if (mobileReactionMessageId) {
                    onSendReaction?.(mobileReactionMessageId, emoji);
                    setMobileReactionMessageId(null);
                  }
                }}
                className="text-3xl active:scale-130 transition-transform duration-100 p-1 hover:bg-accent rounded-full select-none"
              >
                {emoji}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
