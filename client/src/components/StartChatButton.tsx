"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { useCreateConversationMutation } from "@/queries/useChat";
import { useAppStore } from "@/components/TanstackProvider";
import { useRouter } from "next/navigation";
import SoftDestructiveSonner from "@/components/shadcn-studio/sonner/SoftDestructiveSonner";
import { envConfig } from "../../config";

interface StartChatButtonProps {
  /**
   * Truyền vào ID của người muốn chat cùng.
   * - Nếu là Ứng viên: Truyền ID của Công ty.
   * - Nếu là Nhà tuyển dụng/HR: Truyền ID của Ứng viên.
   */
  receiverId: string;
  jobReferenceId?: string; // Tùy chọn truyền vào ID công việc nếu chat từ trang Job Detail
  className?: string;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  label?: string;
}

export default function StartChatButton({
  receiverId,
  jobReferenceId,
  className,
  variant = "default",
  label = "Liên hệ",
}: StartChatButtonProps) {
  const router = useRouter();
  const { user } = useAppStore();
  const createConversationMutation = useCreateConversationMutation();

  const handleStartChat = async () => {
    if (!user) {
      SoftDestructiveSonner("Bạn cần đăng nhập để thao tác");
      return;
    }

    if (!receiverId) return;

    try {
      const payload: any = {};

      //- Dựa vào vai trò user hiện tại để map đúng trường cho backend
      if (user.roleCodeName === envConfig.NEXT_PUBLIC_ROLE_CANDIDATE) {
        payload.companyId = receiverId;
      } else {
        payload.candidateId = receiverId;
      }

      if (jobReferenceId) {
        payload.jobId = jobReferenceId;
      }

      // Gọi API tạo mới hoặc lấy cuộc trò chuyện đã có
      const res = await createConversationMutation.mutateAsync(payload);

      // Tạo thành công sẽ điều hướng sang trang chat
      const activeConvId =
        (res as any)?._id ||
        (res as any)?.payload?._id ||
        (res as any)?.data?._id;
      if (activeConvId) {
        router.push(`/chat?conversationId=${activeConvId}`);
      } else {
        router.push("/chat");
      }
    } catch (error) {
      SoftDestructiveSonner("Có lỗi xảy ra khi tạo cuộc trò chuyện");
      console.log("error create conversation: ", error);
    }
  };

  return (
    <Button
      variant={variant}
      className={className}
      onClick={handleStartChat}
      disabled={createConversationMutation.isPending}
    >
      <MessageSquare className="w-4 h-4 mr-2" />
      {createConversationMutation.isPending ? "Đang kết nối..." : label}
    </Button>
  );
}
