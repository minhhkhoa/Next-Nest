"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCreateConversationMutation } from "@/queries/useChat";
import { useAppStore } from "@/components/TanstackProvider";
import { useRouter } from "next/navigation";
import SoftDestructiveSonner from "@/components/shadcn-studio/sonner/SoftDestructiveSonner";
import { envConfig } from "../../config";
import { JobResType } from "@/schemasvalidation/job";
import { CircleHelp, MessageCircle, Bot } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const CHAT_JOB_REFERENCE_DRAFT_STORAGE_KEY = "chat_job_reference_draft";
export const AI_CHAT_SESSION_STORAGE_KEY = "ai_chat_session_state";

interface AskMoreJobButtonProps extends React.ComponentProps<typeof Button> {
  job: JobResType;
  jobTitle: string;
  jobSlug: string;
  label?: string;
}

export default function AskMoreJobButton({
  job,
  jobTitle,
  jobSlug,
  className,
  variant = "outline",
  size = "default",
  label = "Hỏi thêm",
  ...props
}: AskMoreJobButtonProps) {
  const router = useRouter();
  const { user } = useAppStore();
  const createConversationMutation = useCreateConversationMutation();
  const [isOpen, setIsOpen] = useState(false);

  const handleAskMoreHR = async () => {
    if (!user) {
      SoftDestructiveSonner("Bạn cần đăng nhập để thao tác");
      return;
    }

    if (user.roleCodeName !== envConfig.NEXT_PUBLIC_ROLE_CANDIDATE) {
      return;
    }

    const companyId = job.company?._id || job.companyID;
    if (!companyId) {
      SoftDestructiveSonner("Không tìm thấy công ty để bắt đầu cuộc trò chuyện");
      return;
    }

    try {
      const conversation = await createConversationMutation.mutateAsync({
        companyId,
        jobId: job._id,
      });

      const activeConversationId =
        (conversation as any)?._id ||
        (conversation as any)?.payload?._id ||
        (conversation as any)?.data?._id;

      if (!activeConversationId) {
        router.push("/chat");
        return;
      }

      const draftPayload = {
        conversationId: activeConversationId,
        inputText: "Tôi muốn biết thêm thông tin về job này",
        type: "JOB_REFERENCE" as const,
        metadata: {
          jobId: job._id,
          jobTitle,
          jobSlug,
          salary: `${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()} ${job.salary.currency}`,
          jobImage: job.company?.logo || "",
          companyName: job.company?.name || "",
          location: job.location || "",
        },
      };

      sessionStorage.setItem(
        CHAT_JOB_REFERENCE_DRAFT_STORAGE_KEY,
        JSON.stringify(draftPayload),
      );

      router.push(`/chat?conversationId=${activeConversationId}`);
    } catch (error) {
      SoftDestructiveSonner("Không thể chuẩn bị tin nhắn hỏi thêm");
      console.log("error ask more about job: ", error);
    }
  };

  const handleAskMoreAI = () => {
    // Generate a unique session ID for the guest or use user ID
    const sessionId = user?._id || `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // Save AI session config to localStorage to be picked up by ChatPage
    const aiSessionState = {
      sessionId,
      jobId: job._id,
      jobTitle,
      timestamp: Date.now()
    };
    localStorage.setItem(AI_CHAT_SESSION_STORAGE_KEY, JSON.stringify(aiSessionState));
    
    // Pre-fill a draft similar to HR chat
    const draftPayload = {
      conversationId: "ai-assistant",
      inputText: `Tôi muốn hỏi thêm thông tin về vị trí ${jobTitle}`,
      type: "TEXT" as const,
    };
    sessionStorage.setItem(
      CHAT_JOB_REFERENCE_DRAFT_STORAGE_KEY,
      JSON.stringify(draftPayload)
    );

    router.push(`/chat?ai=true`);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          {...props}
          variant={variant}
          size={size}
          className={className}
          disabled={createConversationMutation.isPending || props.disabled}
        >
          <CircleHelp className="w-4 h-4 mr-2" />
          {createConversationMutation.isPending ? "Đang chuẩn bị..." : label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={handleAskMoreHR} className="cursor-pointer py-3">
          <MessageCircle className="mr-2 h-4 w-4" />
          <span>Chat với Nhà tuyển dụng</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleAskMoreAI} className="cursor-pointer py-3">
          <Bot className="mr-2 h-4 w-4" />
          <span>Hỏi AI tư vấn</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
