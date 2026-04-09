"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useCreateConversationMutation } from "@/queries/useChat";
import { useAppStore } from "@/components/TanstackProvider";
import { useRouter } from "next/navigation";
import SoftDestructiveSonner from "@/components/shadcn-studio/sonner/SoftDestructiveSonner";
import { envConfig } from "../../config";
import { JobResType } from "@/schemasvalidation/job";
import { CircleHelp } from "lucide-react";

export const CHAT_JOB_REFERENCE_DRAFT_STORAGE_KEY = "chat_job_reference_draft";

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

  const handleAskMore = async () => {
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

  return (
    <Button
      {...props}
      variant={variant}
      size={size}
      className={className}
      onClick={handleAskMore}
      disabled={createConversationMutation.isPending || props.disabled}
    >
      <CircleHelp className="w-4 h-4" />
      {createConversationMutation.isPending ? "Đang chuẩn bị..." : label}
    </Button>
  );
}
