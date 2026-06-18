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
import aiApiRequest from "@/apiRequest/ai";
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
  const { user, setActiveChatId } = useAppStore();
  const searchParams = useSearchParams();
  const defaultConversationId = searchParams.get("conversationId");
  const queryClient = useQueryClient();

  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(defaultConversationId || null);

  //- Đồng bộ hóa ID phòng chat đang mở lên Zustand store toàn cục
  useEffect(() => {
    setActiveChatId(activeConversationId);
    return () => {
      setActiveChatId(null);
    };
  }, [activeConversationId, setActiveChatId]);

  const [aiSession, setAiSession] = useState<{
    userId: string;
    jobId: string;
    jobTitle: string;
    timestamp: number;
  } | null>(null);
  const [aiMessages, setAiMessages] = useState<ChatMessage[]>([]);
  const [isAiStreaming, setIsAiStreaming] = useState(false);

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

  const { data: messagesData } = useGetMessages(
    activeConversationId === "ai-assistant" ? null : activeConversationId,
  );
  const { data: userResumesData, isLoading: isLoadingSystemResumes } =
    useGetUserResumes(
      !!activeConversationId && activeConversationId !== "ai-assistant",
    );

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

  const aiConversation: Conversation | null = useMemo(() => {
    if (!aiSession) return null;
    return {
      _id: "ai-assistant",
      companyId: {
        _id: "ai-bot",
        name: "AI Assistant",
        logo: "https://cdn-icons-png.flaticon.com/512/8943/8943377.png",
      },
      candidateId: user?._id || "guest",
      jobId: {
        _id: aiSession.jobId,
        title: { vi: aiSession.jobTitle, en: aiSession.jobTitle },
      },
      lastMessage:
        aiMessages.length > 0 ? aiMessages[aiMessages.length - 1] : null,
      unreadCompany: 0,
      unreadCandidate: 0,
      createdAt: new Date(aiSession.timestamp).toISOString(),
      updatedAt:
        aiMessages.length > 0
          ? aiMessages[aiMessages.length - 1].createdAt
          : new Date(aiSession.timestamp).toISOString(),
    } as any;
  }, [aiSession, aiMessages, user]);

  const allConversations = useMemo(() => {
    if (aiConversation) return [aiConversation, ...conversations];
    return conversations;
  }, [aiConversation, conversations]);

  const currentWindowMessages = useMemo(() => {
    if (activeConversationId === "ai-assistant") return aiMessages;
    return displayMessages;
  }, [activeConversationId, aiMessages, displayMessages]);

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
      setInputText("");
    }
    setActiveConversationId(id);
    setIsMobileSidebarOpen(false);
  };

  useEffect(() => {
    //- Luôn gọi API để lấy lịch sử chat AI từ server
    aiApiRequest
      .getChatHistory()
      .then((res) => {
        const data = res?.data;
        const queryJobId = searchParams.get("jobId");
        const queryJobTitle = searchParams.get("jobTitle");

        //- jobId active: uu tien tu URL (user vua click "Hoi them" cho job cu the)
        //- neu khong co URL params thi dung jobId tu history server
        const activeJobId = queryJobId || data?.jobId;
        const activeJobTitle = queryJobTitle
          ? decodeURIComponent(queryJobTitle)
          : data?.jobTitle || "Vị trí tuyển dụng";

        if (activeJobId) {
          setAiSession({
            userId: user?._id || "",
            jobId: activeJobId,
            jobTitle: activeJobTitle,
            timestamp: Date.now(),
          });
        }

        //- Luon hien thi toan bo history cu (ca cac job truoc do) de user doi chieu
        if (data?.history && data.history.length > 0) {
          const historyMsgs = data.history.map((msg: any, index: number) => ({
            _id: `ai_hist_${Date.now()}_${index}`,
            conversationId: "ai-assistant",
            senderId:
              msg.role === "ai"
                ? {
                    _id: "ai-bot",
                    name: "AI Assistant",
                    avatar:
                      "https://cdn-icons-png.flaticon.com/512/8943/8943377.png",
                    email: "",
                  }
                : {
                    _id: user?._id || "guest",
                    name: user?.name || "You",
                    avatar: user?.avatar || "",
                    email: user?.email || "",
                  },
            senderType:
              msg.role === "ai"
                ? envConfig.NEXT_PUBLIC_ROLE_RECRUITER
                : envConfig.NEXT_PUBLIC_ROLE_CANDIDATE,
            type: "TEXT",
            content: msg.content,
            isRead: true,
            createdAt: new Date(
              Date.now() - (data.history.length - index) * 1000,
            ).toISOString(),
            updatedAt: new Date(
              Date.now() - (data.history.length - index) * 1000,
            ).toISOString(),
          }));
          setAiMessages(historyMsgs);
        } else {
          setAiMessages([]);
        }

        //- Prefill input chi khi den tu nut "Hoi them" (co queryJobTitle tren URL)
        if (queryJobId && queryJobTitle) {
          const decodedTitle = decodeURIComponent(queryJobTitle);
          setInputText(`Tôi muốn hỏi thêm thông tin về vị trí ${decodedTitle}`);
        }

        //- Nếu URL yêu cầu chat AI hoặc default conversation là ai-assistant
        if (
          searchParams.get("ai") === "true" ||
          defaultConversationId === "ai-assistant"
        ) {
          setActiveConversationId("ai-assistant");
        }
      })
      .catch((e) => console.log("Failed to load AI history", e));
  }, [searchParams, defaultConversationId, user]);

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

  //- nhận textOverride từ ChatWindow gửi lên để tránh lag re-render khi gõ phím
  const handleSendMessage = async (
    e: React.FormEvent,
    textOverride?: string,
  ) => {
    e.preventDefault();
    if (!activeConversationId) return;

    const currentInputText =
      textOverride !== undefined ? textOverride : inputText;

    if (activeConversationId === "ai-assistant" && aiSession) {
      const trimmedText = currentInputText.trim();
      if (!trimmedText && !pendingJobReference) return;
      const textToSend =
        trimmedText ||
        `Tôi muốn biết thêm thông tin về vị trí ${aiSession.jobTitle}`;
      setInputText("");
      setPendingJobReference(null);

      const userMsg: ChatMessage = {
        _id: `msg_${Date.now()}`,
        conversationId: "ai-assistant",
        senderId: {
          _id: user?._id || "guest",
          name: user?.name || "You",
          avatar: user?.avatar || "",
          email: user?.email || "",
        },
        senderType: (envConfig.NEXT_PUBLIC_ROLE_CANDIDATE ||
          "role_candidate") as any,
        type: "TEXT",
        content: textToSend,
        isRead: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const aiMsgId = `ai_msg_${Date.now()}`;
      const aiMsg: ChatMessage = {
        _id: aiMsgId,
        conversationId: "ai-assistant",
        senderId: {
          _id: "ai-bot",
          name: "AI Assistant",
          avatar: "https://cdn-icons-png.flaticon.com/512/8943/8943377.png",
          email: "",
        },
        senderType: (envConfig.NEXT_PUBLIC_ROLE_RECRUITER ||
          "role_company") as any,
        type: "TEXT",
        content: "",
        isRead: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setAiMessages((prev) => [...prev, userMsg, aiMsg]);
      setIsAiStreaming(true);

      const isTunnel =
        typeof window !== "undefined" &&
        window.location.hostname.includes("devtunnels.ms");
      const baseSSEUrl = isTunnel
        ? envConfig.NEXT_PUBLIC_API_URL_SERVER_TUNNEL
        : envConfig.NEXT_PUBLIC_API_URL_SERVER;

      //- tạo url kết nối sse, dùng window.location.origin nếu url tương đối
      const url = baseSSEUrl.startsWith("http")
        ? new URL(`${baseSSEUrl}/ai/chat/stream`)
        : new URL(`${baseSSEUrl}/ai/chat/stream`, window.location.origin);
      const token = localStorage.getItem("access_token");
      if (token) url.searchParams.append("token", token);
      url.searchParams.append("jobId", aiSession.jobId);
      url.searchParams.append("question", textToSend);

      const eventSource = new EventSource(url.toString());

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.done) {
          eventSource.close();
          setIsAiStreaming(false);
        } else if (data.text) {
          setAiMessages((prev) => {
            const newMsgs = [...prev];
            const lastIdx = newMsgs.length - 1;
            if (newMsgs[lastIdx]._id === aiMsgId) {
              newMsgs[lastIdx] = {
                ...newMsgs[lastIdx],
                content: newMsgs[lastIdx].content + data.text,
              };
            }
            return newMsgs;
          });
        }
      };

      eventSource.onerror = () => {
        eventSource.close();
        setIsAiStreaming(false);
        SoftDestructiveSonner("Đã có lỗi xảy ra khi chat với AI.");
      };
      return;
    }

    const trimmedText = currentInputText.trim();
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
    <div className="flex h-[calc(100vh-100px)] w-full bg-gradient-to-br from-primary/15 via-primary/5 to-indigo-50/20 border border-primary/10 rounded-xl overflow-hidden shadow-sm">
      {/*- đặt nền gradient giống khối tin tức nổi bật cho toàn bộ khung chat */}
      {/* Desktop Sidebar - ẩn trên mobile */}
      <ConversationSidebar
        conversations={allConversations}
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
            conversations={allConversations}
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
        messages={currentWindowMessages}
        activeConversationId={activeConversationId}
        inputText={inputText}
        onSendMessage={handleSendMessage}
        isSending={
          sendMessageMutation.isPending ||
          isSendingPendingFiles ||
          isAiStreaming
        }
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
