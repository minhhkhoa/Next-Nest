import { cn, generateSlugUrl } from "@/lib/utils";
import { ChatMessage } from "@/schemasvalidation/chat";
import React, { useMemo, useState } from "react";
import { envConfig } from "../../../../../config";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { TypeActionBy } from "@/schemasvalidation/NewsCategory";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink, FileText } from "lucide-react";
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
  const [previewCvMessage, setPreviewCvMessage] = useState<ChatMessage | null>(
    null,
  );

  const handleOpenSystemCvPreview = (message: ChatMessage) => {
    setPreviewCvMessage(message);
  };

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
        const jobReferenceImage =
          msg.metadata?.jobImage || msg.metadata?.thumbnail;

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
                    (index === messages.length - 1 && isSameSenderAsNext
                      ? " mb-4"
                      : ""),
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
                          alt={msg.metadata?.fileName || "Ảnh đính kèm"}
                          width={msg.metadata?.width || 320}
                          height={msg.metadata?.height || 220}
                          className="rounded-xl object-cover max-h-[320px] w-full"
                        />
                      </a>
                    ) : (
                      <p className="text-xs italic opacity-80">Không có ảnh để hiển thị</p>
                    )}

                    {msg.content ? (
                      <p className="whitespace-pre-wrap break-all text-sm opacity-95">
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
                          ? "border-blue-200 bg-blue-400/20"
                          : "border-gray-200 bg-gray-50 dark:bg-slate-900 dark:border-slate-700",
                        !msg.metadata?.link && "pointer-events-none opacity-70",
                      )}
                      aria-label="Mở tệp đính kèm"
                    >
                      <div className="h-9 w-9 rounded-full bg-white/80 dark:bg-slate-800 flex items-center justify-center shrink-0">
                        <FileText className="h-4 w-4" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="font-semibold truncate">
                          {msg.metadata?.fileName || msg.content || "Tệp đính kèm"}
                        </p>
                        <p className="text-xs opacity-80 truncate">
                          {msg.metadata?.mimeType || msg.metadata?.fileExt || "File"}
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
                      <p className="whitespace-pre-wrap break-all text-sm opacity-95">
                        {msg.content}
                      </p>
                    ) : null}
                  </div>
                ) : msg.type === "CV_SYSTEM" ? (
                  <div className="space-y-2">
                    {msg.content ? (
                      <p className="whitespace-pre-wrap break-all">{msg.content}</p>
                    ) : null}

                    <button
                      type="button"
                      onClick={() => handleOpenSystemCvPreview(msg)}
                      className={cn(
                        "w-full rounded-xl border p-3 text-left transition hover:opacity-90",
                        isMe
                          ? "border-blue-200 bg-blue-400/20"
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
                              {msg.metadata?.cvName || msg.content || "CV hệ thống"}
                            </p>
                            {msg.metadata?.isDefault ? (
                              <span className="text-[10px] px-2 py-0.5 rounded-full border border-current/40">
                                Mặc định
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
                              Cập nhật: {new Date(msg.metadata.updatedAt).toLocaleDateString("vi-VN")}
                            </p>
                          ) : null}

                          <p className="text-xs opacity-80 mt-1">
                            Nhấn để xem CV
                          </p>
                        </div>
                      </div>
                    </button>
                  </div>
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
                              {jobReferenceImage && (
                                <Image
                                  src={jobReferenceImage}
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
                          {jobReferenceImage && (
                            <Image
                              src={jobReferenceImage}
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

  const previewTemplateId =
    previewCvMessage?.metadata?.templateID || previewCvMessage?.metadata?.templateId;
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
              {previewCvMessage?.metadata?.cvName || "Chi tiết CV hệ thống"}
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
                  Không tìm thấy mẫu CV phù hợp
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
