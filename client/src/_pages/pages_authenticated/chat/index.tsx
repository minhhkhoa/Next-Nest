"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Conversation,
  ChatMessage,
  CreateMessagePayload,
} from "@/schemasvalidation/chat";
import { useChatSocket } from "@/hooks/use-chat-socket";
import { useAppStore } from "@/components/TanstackProvider";
import {
  useGetConversations,
  useGetMessages,
  useMarkAsReadMutation,
  useSendMessageMutation,
} from "@/queries/useChat";
import { useGetUserResumes } from "@/queries/useUserResume";
import SoftDestructiveSonner from "@/components/shadcn-studio/sonner/SoftDestructiveSonner";
import ConversationSidebar, {
  ConversationList,
} from "./components/ConversationSidebar";
import ChatWindow, {
  ChatPendingLocalFile,
  ChatUploadingAttachment,
} from "./components/ChatWindow";
import { CHAT_JOB_REFERENCE_DRAFT_STORAGE_KEY } from "@/components/AskMoreJobButton";
import { useSearchParams } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useQueryClient } from "@tanstack/react-query";
import { envConfig } from "../../../../config";
import { uploadToCloudinary } from "@/lib/utils";
import { UserResumeResponseType } from "@/schemasvalidation/user-resume";

export default function ChatPageModule() {
  const { user } = useAppStore();
  const searchParams = useSearchParams();
  const defaultConversationId = searchParams.get("conversationId");
  const queryClient = useQueryClient();

  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(defaultConversationId || null);

  const [inputText, setInputText] = useState("");
  const [pendingJobReference, setPendingJobReference] = useState<{
    jobId?: string;
    jobTitle?: string;
    jobSlug?: string;
    salary?: string;
    jobImage?: string;
    companyName?: string;
    location?: string;
  } | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [uploadingAttachments, setUploadingAttachments] = useState<
    ChatUploadingAttachment[]
  >([]);
  const [pendingLocalFiles, setPendingLocalFiles] = useState<
    Array<{
      id: string;
      conversationId: string;
      file: File;
      previewUrl?: string;
    }>
  >([]);
  const [isSendingPendingFiles, setIsSendingPendingFiles] = useState(false);
  const pendingLocalFilesRef = useRef(pendingLocalFiles);

  //- Lấy dữ liệu
  const { data: conversationsData } = useGetConversations();

  const conversations: Conversation[] = useMemo(() => {
    return conversationsData?.data || [];
  }, [conversationsData]);

  const { data: messagesData } = useGetMessages(activeConversationId);
  const { data: userResumesData, isLoading: isLoadingSystemResumes } =
    useGetUserResumes(!!activeConversationId);

  const messages: ChatMessage[] = useMemo(() => {
    return messagesData?.data?.messages || [];
  }, [messagesData]);

  const systemResumes = useMemo(() => {
    return userResumesData?.data || [];
  }, [userResumesData]);

  const { socket, isConnected, realtimeMessages, clearRealtimeMessages } =
    useChatSocket(conversations);
  const sendMessageMutation = useSendMessageMutation();

  //- Chỉ hiển thị tin nhắn realtime thuộc về phòng đang active
  const activeRealtimeMessages = useMemo(() => {
    return realtimeMessages.filter(
      (msg) => msg.conversationId === activeConversationId,
    );
  }, [realtimeMessages, activeConversationId]);

  //- Gộp tin nhắn từ API và Socket, lọc trùng theo _id
  const displayMessages = useMemo(() => {
    const combined = [...messages, ...activeRealtimeMessages];
    const uniqueMessages = new Map();

    combined.forEach((msg) => {
      //- Nếu là tin nhắn optimistic (tạm thời) thì ưu tiên giữ lại cho đến khi có tin nhắn thực từ API
      if (!uniqueMessages.has(msg._id)) {
        uniqueMessages.set(msg._id, msg);
      }
    });

    return Array.from(uniqueMessages.values()).sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  }, [messages, activeRealtimeMessages]);

  const markAsReadMutation = useMarkAsReadMutation();
  const { mutate: markAsRead, isPending: isMarkingAsRead } = markAsReadMutation;

  const activeUploadingAttachments = useMemo(() => {
    return uploadingAttachments.filter(
      (file) => file.conversationId === activeConversationId,
    );
  }, [uploadingAttachments, activeConversationId]);

  const activePendingLocalFiles = useMemo(() => {
    return pendingLocalFiles.filter(
      (file) => file.conversationId === activeConversationId,
    );
  }, [pendingLocalFiles, activeConversationId]);

  const activePendingLocalFilesForView = useMemo<ChatPendingLocalFile[]>(() => {
    return activePendingLocalFiles.map((item) => ({
      id: item.id,
      fileName: item.file.name,
      fileSize: item.file.size,
      isImage: item.file.type.startsWith("image/"),
      previewUrl: item.previewUrl,
    }));
  }, [activePendingLocalFiles]);

  const getCurrentSenderType = (): ChatMessage["senderType"] => {
    return user?.roleCodeName === envConfig.NEXT_PUBLIC_ROLE_CANDIDATE
      ? (envConfig.NEXT_PUBLIC_ROLE_CANDIDATE as ChatMessage["senderType"])
      : (envConfig.NEXT_PUBLIC_ROLE_RECRUITER as ChatMessage["senderType"]);
  };

  const addOptimisticMessage = (
    queryKey: (string | number | null)[],
    optimisticMessage: ChatMessage,
  ) => {
    queryClient.setQueryData(queryKey, (old: any) => {
      if (!old?.data) {
        return {
          ...old,
          data: {
            messages: [optimisticMessage],
            meta: {
              current: 1,
              pageSize: 50,
              pages: 1,
              total: 1,
            },
          },
        };
      }

      return {
        ...old,
        data: {
          ...old.data,
          messages: [...(old.data?.messages || []), optimisticMessage],
        },
      };
    });
  };

  const sendMessageWithOptimistic = async (
    payload: CreateMessagePayload,
    errorMessage: string,
  ): Promise<boolean> => {
    if (!payload.conversationId) return false;

    const queryKey = ["messages", payload.conversationId, 1, 50];
    const previousData = queryClient.getQueryData(queryKey);

    const optimisticMessage: ChatMessage = {
      _id: `optimistic_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      conversationId: payload.conversationId,
      senderId: {
        _id: user?._id || "",
        name: user?.name || "",
        avatar: user?.avatar || "",
        email: user?.email || "",
      },
      senderType: getCurrentSenderType(),
      type: payload.type,
      content: payload.content || "",
      metadata: payload.metadata,
      isRead: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addOptimisticMessage(queryKey, optimisticMessage);

    try {
      await sendMessageMutation.mutateAsync(payload);

      queryClient.invalidateQueries({
        queryKey: ["messages", payload.conversationId],
      });

      return true;
    } catch (error) {
      queryClient.setQueryData(queryKey, previousData);
      SoftDestructiveSonner(errorMessage);
      console.log("error send message: ", error);
      return false;
    }
  };

  const removeUploadingAttachment = (uploadId: string) => {
    setUploadingAttachments((prev) =>
      prev.filter((item) => item.id !== uploadId),
    );
  };

  const revokePreviewUrl = (previewUrl?: string) => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  const removePendingLocalFile = (id: string) => {
    setPendingLocalFiles((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target?.previewUrl) {
        revokePreviewUrl(target.previewUrl);
      }
      return prev.filter((item) => item.id !== id);
    });
  };

  const clearPendingLocalFilesByConversation = (conversationId: string) => {
    setPendingLocalFiles((prev) => {
      prev
        .filter((item) => item.conversationId === conversationId)
        .forEach((item) => revokePreviewUrl(item.previewUrl));

      return prev.filter((item) => item.conversationId !== conversationId);
    });
  };

  useEffect(() => {
    pendingLocalFilesRef.current = pendingLocalFiles;
  }, [pendingLocalFiles]);

  useEffect(() => {
    return () => {
      pendingLocalFilesRef.current.forEach((item) =>
        revokePreviewUrl(item.previewUrl),
      );
    };
  }, []);

  //- Chọn conversation trên mobile -> đóng sidebar
  const handleSelectConversation = (id: string) => {
    //- Nếu chọn phòng khác, xóa tin nhắn realtime cũ
    if (id !== activeConversationId) {
      clearRealtimeMessages();
      setPendingJobReference(null);
      if (activeConversationId) {
        clearPendingLocalFilesByConversation(activeConversationId);
      }
    }
    setActiveConversationId(id);
    setIsMobileSidebarOpen(false);
  };

  useEffect(() => {
    if (!activeConversationId || typeof window === "undefined") return;

    const rawDraft = sessionStorage.getItem(
      CHAT_JOB_REFERENCE_DRAFT_STORAGE_KEY,
    );
    if (!rawDraft) return;

    try {
      const parsedDraft = JSON.parse(rawDraft);
      if (parsedDraft?.conversationId !== activeConversationId) return;

      setInputText(
        parsedDraft?.inputText || "Tôi muốn biết thêm thông tin về job này",
      );
      setPendingJobReference(parsedDraft?.metadata || null);
      sessionStorage.removeItem(CHAT_JOB_REFERENCE_DRAFT_STORAGE_KEY);
    } catch {
      sessionStorage.removeItem(CHAT_JOB_REFERENCE_DRAFT_STORAGE_KEY);
    }
  }, [activeConversationId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConversationId) return;

    const trimmedText = inputText.trim();
    const hasPendingLocalFiles = activePendingLocalFiles.length > 0;

    if (hasPendingLocalFiles) {
      const filesToProcess = [...activePendingLocalFiles];
      const captionText = trimmedText || undefined;

      setIsSendingPendingFiles(true);
      setInputText("");

      for (const pendingItem of filesToProcess) {
        removePendingLocalFile(pendingItem.id);

        const uploadId = `upload_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        setUploadingAttachments((prev) => [
          ...prev,
          {
            id: uploadId,
            fileName: pendingItem.file.name,
            fileSize: pendingItem.file.size,
            conversationId: pendingItem.conversationId,
          },
        ]);

        try {
          const uploadUrl = await uploadToCloudinary(pendingItem.file, "Chat");

          if (!uploadUrl) {
            throw new Error("Không lấy được URL file từ Cloudinary");
          }

          const isImage = pendingItem.file.type.startsWith("image/");
          const fileExt = pendingItem.file.name.includes(".")
            ? pendingItem.file.name.split(".").pop()?.toLowerCase() || ""
            : "";

          await sendMessageWithOptimistic(
            {
              conversationId: pendingItem.conversationId,
              type: isImage ? "IMAGE" : "CV_LINK",
              content: captionText,
              metadata: isImage
                ? {
                    imageUrl: uploadUrl,
                    link: uploadUrl,
                    fileName: pendingItem.file.name,
                    mimeType: pendingItem.file.type,
                    fileSize: pendingItem.file.size,
                    fileExt,
                  }
                : {
                    link: uploadUrl,
                    fileName: pendingItem.file.name,
                    mimeType: pendingItem.file.type,
                    fileSize: pendingItem.file.size,
                    fileExt,
                  },
            },
            `Không thể gửi file ${pendingItem.file.name}`,
          );
        } catch (error) {
          SoftDestructiveSonner(`Upload thất bại: ${pendingItem.file.name}`);
          console.log("error upload file: ", error);
        } finally {
          removeUploadingAttachment(uploadId);
        }
      }

      setIsSendingPendingFiles(false);
      return;
    }

    const sendingJobReference = !!pendingJobReference;
    if (!trimmedText && !sendingJobReference) return;

    const textToSend =
      trimmedText || "Tôi muốn biết thêm thông tin về công việc này";
    const jobReferenceData = pendingJobReference;
    const messageType = sendingJobReference ? "JOB_REFERENCE" : "TEXT";

    setInputText("");
    if (sendingJobReference) {
      setPendingJobReference(null);
    }

    const isSuccess = await sendMessageWithOptimistic(
      {
        conversationId: activeConversationId,
        type: messageType,
        content: textToSend,
        metadata: sendingJobReference ? jobReferenceData : undefined,
      },
      "Không thể gửi tin nhắn. Vui lòng thử lại",
    );

    if (!isSuccess) {
      setInputText(textToSend);
      if (sendingJobReference) {
        setPendingJobReference(jobReferenceData || null);
      }
    }
  };

  const handleSelectLocalFiles = (files: FileList | null) => {
    if (!activeConversationId) {
      SoftDestructiveSonner("Vui lòng chọn đoạn chat trước khi gửi file");
      return;
    }

    const localFiles = Array.from(files || []);
    if (localFiles.length === 0) return;

    const pendingFiles = localFiles.map((file) => ({
      id: `pending_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      conversationId: activeConversationId,
      file,
      previewUrl: file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : undefined,
    }));

    setPendingLocalFiles((prev) => [...prev, ...pendingFiles]);
  };

  const handleSendSystemResume = async (
    resume: UserResumeResponseType,
  ): Promise<boolean> => {
    if (!activeConversationId) {
      SoftDestructiveSonner("Vui lòng chọn đoạn chat trước khi gửi CV");
      return false;
    }

    const templateID =
      (resume as any).templateID ||
      (resume as any).templateId ||
      (resume as any).metadata?.templateId;

    const previewImage =
      (resume as any).previewImage || (resume as any).image || undefined;
    const resumeContent = (resume as any).content || (resume as any).metadata;

    return sendMessageWithOptimistic(
      {
        conversationId: activeConversationId,
        type: "CV_SYSTEM",
        content: resume.resumeName || resume.title || "CV hệ thống",
        metadata: {
          cvId: resume._id,
          cvName: resume.resumeName || resume.title || "CV hệ thống",
          templateID,
          templateId: templateID,
          resumeContent,
          isDefault: !!resume.isDefault,
          previewImage,
          updatedAt: resume.updatedAt,
        },
      },
      "Không thể gửi CV hệ thống",
    );
  };

  useEffect(() => {
    if (!activeConversationId || conversations.length === 0) return;

    const currentConv = conversations.find(
      (c) => c._id === activeConversationId,
    );
    if (!currentConv) return;

    const isUserCandidate =
      user?.roleCodeName === envConfig.NEXT_PUBLIC_ROLE_CANDIDATE;
    const unreadCount = isUserCandidate
      ? currentConv.unreadCandidate
      : currentConv.unreadCompany;

    if (unreadCount <= 0 || isMarkingAsRead) return;

    markAsRead(activeConversationId, {
      onSuccess: () => {
        socket?.emit("conversation_read", {
          conversationId: activeConversationId,
          readAt: new Date().toISOString(),
        });
      },
    });
  }, [
    activeConversationId,
    conversations,
    user?.roleCodeName,
    markAsRead,
    isMarkingAsRead,
    socket,
  ]);

  return (
    <div className="flex h-[calc(100vh-100px)] w-full bg-white dark:bg-slate-900 border rounded-xl overflow-hidden shadow-sm">
      {/* Desktop Sidebar - ẩn trên mobile */}
      <ConversationSidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        userRole={user?.roleCodeName}
        isConnected={isConnected}
        user={user}
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
            user={user}
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
        isSending={sendMessageMutation.isPending || isSendingPendingFiles}
        pendingJobReference={pendingJobReference}
        onClearPendingJobReference={() => setPendingJobReference(null)}
        onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        onSelectLocalFiles={handleSelectLocalFiles}
        systemResumes={systemResumes}
        isLoadingSystemResumes={isLoadingSystemResumes}
        onSendSystemResume={handleSendSystemResume}
        uploadingAttachments={activeUploadingAttachments}
        pendingLocalFiles={activePendingLocalFilesForView}
        onRemovePendingLocalFile={removePendingLocalFile}
      />
    </div>
  );
}
