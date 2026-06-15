import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChatMessage } from "@/schemasvalidation/chat";
import { getRoleCodeName } from "@/lib/utils";
import {
  User as UserIcon,
  Send,
  Menu,
  X,
  Plus,
  Paperclip,
  FileUser,
  Loader2,
  FileText,
  Trash2,
} from "lucide-react";
import { envConfig } from "../../../../../config";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import useMemoFrameChat from "./useMemoFrameChat";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { UserResumeResponseType } from "@/schemasvalidation/user-resume";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@/i18n/navigation";

export interface ChatUploadingAttachment {
  id: string;
  fileName: string;
  fileSize: number;
  conversationId: string;
}

export interface ChatPendingLocalFile {
  id: string;
  fileName: string;
  fileSize: number;
  isImage: boolean;
  previewUrl?: string;
}

interface ChatWindowProps {
  messages: ChatMessage[];
  activeConversationId: string | null;
  inputText: string;
  pendingJobReference?: {
    jobId?: string;
    jobTitle?: string;
    jobSlug?: string;
    salary?: string;
    jobImage?: string;
    companyName?: string;
    location?: string;
  } | null;
  onSendMessage: (e: React.FormEvent, text?: string) => void;
  onClearPendingJobReference?: () => void;
  isSending: boolean;
  onOpenMobileSidebar?: () => void;
  onSelectLocalFiles?: (files: FileList | null) => void;
  systemResumes?: UserResumeResponseType[];
  isLoadingSystemResumes?: boolean;
  onSendSystemResume?: (resume: UserResumeResponseType) => Promise<boolean>;
  uploadingAttachments?: ChatUploadingAttachment[];
  pendingLocalFiles?: ChatPendingLocalFile[];
  onRemovePendingLocalFile?: (id: string) => void;
}

export default function ChatWindow({
  messages,
  activeConversationId,
  inputText,
  pendingJobReference,
  onSendMessage,
  onClearPendingJobReference,
  isSending,
  onOpenMobileSidebar,
  onSelectLocalFiles,
  systemResumes = [],
  isLoadingSystemResumes = false,
  onSendSystemResume,
  uploadingAttachments = [],
  pendingLocalFiles = [],
  onRemovePendingLocalFile,
}: ChatWindowProps) {
  //- Ref tới ScrollArea để cuộn xuống cuối
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const localFileInputRef = useRef<HTMLInputElement>(null);
  const [systemCvDialogOpen, setSystemCvDialogOpen] = useState(false);
  const [selectedSystemCvId, setSelectedSystemCvId] = useState("");
  const [isSubmittingSystemCv, setIsSubmittingSystemCv] = useState(false);
  const [attachmentMenuOpen, setAttachmentMenuOpen] = useState(false);

  //- sử dụng state cục bộ cho input nhằm tránh re-render toàn bộ Chat page gây lag khi gõ phím
  const [localText, setLocalText] = useState(inputText);

  React.useEffect(() => {
    setLocalText(inputText);
  }, [inputText]);

  //- Hàm cuộn viewport của ScrollArea xuống cuối
  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    const viewport = scrollAreaRef.current?.querySelector(
      '[data-slot="scroll-area-viewport"]',
    );
    if (viewport) {
      viewport.scrollTo({ top: viewport.scrollHeight, behavior });
    }
  };

  const currentUserSenderType: ChatMessage["senderType"] =
    getRoleCodeName() === envConfig.NEXT_PUBLIC_ROLE_CANDIDATE
      ? (envConfig.NEXT_PUBLIC_ROLE_CANDIDATE as ChatMessage["senderType"])
      : (envConfig.NEXT_PUBLIC_ROLE_RECRUITER as ChatMessage["senderType"]);

  const isCandidate = currentUserSenderType === "CANDIDATE";

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

  const lastOwnMessageId = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      if (messages[i].senderType === currentUserSenderType) {
        return messages[i]._id;
      }
    }
    return null;
  }, [messages, currentUserSenderType]);

  const messageItems = useMemoFrameChat({
    messages,
    currentUserSenderType,
    lastOwnMessageId,
    candidateData,
    hrData,
  });

  useEffect(() => {
    if (!systemCvDialogOpen) return;

    const defaultResume =
      systemResumes.find((resume) => resume.isDefault) || systemResumes[0];

    setSelectedSystemCvId(defaultResume?._id || "");
  }, [systemCvDialogOpen, systemResumes]);

  const handleOpenLocalFilePicker = () => {
    if (!activeConversationId) return;
    localFileInputRef.current?.click();
  };

  const handleLocalFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSelectLocalFiles?.(e.target.files);
    e.target.value = "";
  };

  const handleOpenSystemCvDialog = () => {
    if (!activeConversationId) return;
    setSystemCvDialogOpen(true);
  };

  const handleSystemCvSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSystemCvId || isSubmittingSystemCv) return;

    const selectedResume = systemResumes.find(
      (r) => r._id === selectedSystemCvId,
    );
    if (!selectedResume) return;

    setIsSubmittingSystemCv(true);
    try {
      const success = await onSendSystemResume?.(selectedResume);
      if (success) {
        setSystemCvDialogOpen(false);
      }
    } catch (error) {
      console.error("Lỗi gửi CV hệ thống:", error);
    } finally {
      setIsSubmittingSystemCv(false);
    }
  };

  //- Cuộn xuống khi có tin nhắn mới hoặc đổi cuộc trò chuyện
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom("instant");
    }
  }, [activeConversationId]);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom("smooth");
    }
  }, [messages.length]);

  if (!activeConversationId) {
    return (
      <div className="flex-1 flex flex-col bg-transparent min-w-0 w-full overflow-hidden">
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
    <div className="flex-1 flex flex-col h-full bg-transparent relative min-w-0 w-full overflow-hidden">
      {/*- làm nền cửa sổ chat trong suốt để lộ gradient phía sau */}
      {/* Chat header */}
      <div className="h-16 border-b border-gray-200 dark:border-slate-800 bg-white/40 dark:bg-slate-950/40 backdrop-blur-sm flex items-center px-4 gap-3 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onOpenMobileSidebar}
          aria-label="Mở danh sách đoạn chat"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
          <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
            <AvatarImage
              src={
                activeConversationId === "ai-assistant"
                  ? "https://cdn-icons-png.flaticon.com/512/8943/8943377.png"
                  : isCandidate
                  ? hrData?.avatar
                  : candidateData?.avatar
              }
            />
            <AvatarFallback>AI</AvatarFallback>
          </Avatar>
        </div>
        <span className="font-semibold truncate text-sm sm:text-base">
          {activeConversationId === "ai-assistant"
            ? "AI Assistant"
            : isCandidate
            ? hrData?.name
            : candidateData?.name}
        </span>
      </div>

      {/* Messages body */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 h-50 [&>div>div]:!block">
        <div className="p-2 flex flex-col gap-2 w-full max-w-full">
          {messages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm py-20">
              Chưa có tin nhắn nào. Hãy gửi lời chào!
            </div>
          ) : (
            messageItems
          )}
        </div>
      </ScrollArea>

      {/* Input Box */}
      <div className="p-2 sm:p-4 bg-white/40 dark:bg-slate-950/40 backdrop-blur-sm border-t border-gray-200 dark:border-slate-800 shrink-0">
        {pendingJobReference && (
          <div className="mb-2 rounded-lg border border-primary/20 bg-primary/5 dark:bg-slate-900 dark:border-slate-800 px-3 py-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3 min-w-0">
                {pendingJobReference.jobImage ? (
                  <Image
                    src={pendingJobReference.jobImage}
                    alt={pendingJobReference.jobTitle || "Job image"}
                    width={36}
                    height={36}
                    className="h-9 w-9 rounded-md object-cover shrink-0"
                  />
                ) : null}
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">Đang đính kèm job</p>
                  <p className="text-sm font-medium truncate">
                    {pendingJobReference.jobTitle || "Thông tin công việc"}
                  </p>
                </div>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={onClearPendingJobReference}
                className="shrink-0"
                aria-label="Xóa job đính kèm"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSendMessage(e, localText);
          }}
          className="flex gap-2 items-center"
        >
          <input
            ref={localFileInputRef}
            type="file"
            className="hidden"
            multiple
            accept="image/*,.pdf,.doc,.docx,.txt"
            onChange={handleLocalFileSelected}
          />

          <DropdownMenu
            open={attachmentMenuOpen}
            onOpenChange={setAttachmentMenuOpen}
          >
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="rounded-full shrink-0"
                disabled={
                  !activeConversationId ||
                  isSending ||
                  activeConversationId === "ai-assistant"
                }
                aria-label="Mở menu đính kèm"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  setAttachmentMenuOpen(false);
                  setTimeout(() => {
                    handleOpenLocalFilePicker();
                  }, 0);
                }}
              >
                <Paperclip className="w-4 h-4" />
                Chọn file từ máy
              </DropdownMenuItem>

              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  setAttachmentMenuOpen(false);
                  setTimeout(() => {
                    handleOpenSystemCvDialog();
                  }, 0);
                }}
              >
                <FileUser className="w-4 h-4" />
                Chọn CV hệ thống
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <input
            type="text"
            value={localText}
            onChange={(e) => setLocalText(e.target.value)}
            placeholder={
              pendingLocalFiles.length > 0
                ? "Nhập mô tả cho ảnh/file (tuỳ chọn)..."
                : "Nhập tin nhắn..."
            }
            className="flex-1 min-w-0 bg-gray-100 dark:bg-slate-900 border-none rounded-full px-4 py-2 text-sm sm:text-base focus:ring-2 focus:ring-primary/40 outline-none"
          />
          {pendingLocalFiles.length > 0 ? (
            <Button
              type="submit"
              disabled={isSending}
              className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shrink-0 px-4"
            >
              {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Xác nhận
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={(!localText.trim() && !pendingJobReference) || isSending}
              size="icon"
              className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shrink-0"
            >
              <Send className="w-4 h-4 sm:w-5 sm:h-[18px]" />
            </Button>
          )}
        </form>

        {pendingLocalFiles.length > 0 ? (
          <div className="mt-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-900 p-3">
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-2">
              Đã chọn {pendingLocalFiles.length} tệp. Nhấn Xác nhận để gửi.
            </p>

            <div className="grid gap-2 max-h-40 overflow-y-auto pr-1">
              {pendingLocalFiles.map((file) => (
                <div
                  key={file.id}
                  className="rounded-lg border bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 px-2 py-2"
                >
                  <div className="flex items-center gap-2">
                    {file.isImage && file.previewUrl ? (
                      <Image
                        src={file.previewUrl}
                        alt={file.fileName}
                        width={36}
                        height={36}
                        className="h-9 w-9 rounded-md object-cover shrink-0"
                      />
                    ) : (
                      <div className="h-9 w-9 rounded-md border bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                        <FileText className="h-4 w-4 text-slate-500" />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{file.fileName}</p>
                      <p className="text-xs text-slate-500">
                        {(file.fileSize / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onRemovePendingLocalFile?.(file.id)}
                      disabled={isSending}
                      aria-label="Xoá tệp chờ gửi"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {uploadingAttachments.length > 0 ? (
          <div className="mt-3 grid gap-2">
            {uploadingAttachments.map((file) => (
              <div
                key={file.id}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-900 px-3 py-2"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{file.fileName}</p>

                    <div className="mt-1 flex items-center gap-2">
                      <Skeleton className="h-2 w-24 sm:w-40" />
                      <span className="text-xs text-gray-500">
                        Đang upload {Math.max(file.fileSize / 1024 / 1024, 0.01).toFixed(2)}
                        MB...
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <Dialog open={systemCvDialogOpen} onOpenChange={setSystemCvDialogOpen}>
        <DialogContent className="w-[96vw] max-w-[680px] p-0 overflow-hidden">
          <DialogHeader className="px-5 pt-5 pb-3 border-b">
            <DialogTitle>Gửi CV hệ thống</DialogTitle>
            <DialogDescription>
              Chọn CV muốn gửi trong cuộc trò chuyện này. CV mặc định được chọn sẵn.
            </DialogDescription>
          </DialogHeader>

          <div className="px-5 py-4 max-h-[62vh] overflow-y-auto">
            {isLoadingSystemResumes ? (
              <div className="grid gap-3">
                {[1, 2, 3].map((idx) => (
                  <div key={idx} className="rounded-xl border p-3 space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                ))}
              </div>
            ) : systemResumes.length === 0 ? (
              <div className="rounded-xl border border-dashed p-8 text-center">
                <FileText className="mx-auto h-8 w-8 text-slate-400 mb-3" />
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
                  Bạn chưa có CV nào trong hệ thống.
                </p>
                <Button asChild variant="outline" size="sm">
                  <Link href="/my-cv">Đi tới trang quản lý CV</Link>
                </Button>
              </div>
            ) : (
              <RadioGroup
                value={selectedSystemCvId}
                onValueChange={setSelectedSystemCvId}
                className="grid gap-3"
              >
                {systemResumes.map((resume) => {
                  const isActive = selectedSystemCvId === resume._id;
                  const templateID = resume.templateID || "N/A";
                  const previewImage = (resume as any).previewImage as
                    | string
                    | undefined;

                  return (
                    <label
                      key={resume._id}
                      htmlFor={`chat-system-cv-${resume._id}`}
                      className={`group rounded-2xl border p-3 sm:p-4 cursor-pointer transition ${
                        isActive
                          ? "border-primary bg-primary/5 dark:bg-primary/20"
                          : "border-slate-200 hover:border-primary/50 dark:border-slate-700"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <RadioGroupItem
                          id={`chat-system-cv-${resume._id}`}
                          value={resume._id}
                          className="mt-1"
                        />

                        {previewImage ? (
                          <Image
                            src={previewImage}
                            alt={resume.resumeName || "CV preview"}
                            width={48}
                            height={56}
                            className="h-14 w-12 rounded-md border object-cover shrink-0"
                          />
                        ) : (
                          <div className="h-14 w-12 rounded-md border bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                            <FileText className="h-5 w-5 text-slate-400" />
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Label className="text-sm sm:text-base font-semibold cursor-pointer">
                              {resume.resumeName || "CV chưa đặt tên"}
                            </Label>
                            {resume.isDefault ? (
                              <Badge variant="secondary">Mặc định</Badge>
                            ) : null}
                          </div>

                          <p className="text-xs sm:text-sm text-slate-500 mt-1">
                            Template: {templateID}
                          </p>
                          <p className="text-xs sm:text-sm text-slate-500">
                            Cập nhật: {new Date(resume.updatedAt).toLocaleDateString("vi-VN")}
                          </p>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </RadioGroup>
            )}
          </div>

          <DialogFooter className="px-5 py-3 border-t bg-slate-50/80 dark:bg-slate-900/70">
            <Button
              type="button"
              variant="outline"
              onClick={() => setSystemCvDialogOpen(false)}
              disabled={isSubmittingSystemCv}
            >
              Hủy
            </Button>
            <Button
              type="button"
              onClick={handleSystemCvSubmit}
              disabled={
                isSubmittingSystemCv ||
                !selectedSystemCvId ||
                systemResumes.length === 0
              }
            >
              {isSubmittingSystemCv ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              Gửi CV đã chọn
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
