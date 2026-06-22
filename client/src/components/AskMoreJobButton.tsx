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
import { useTranslations } from "next-intl";

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
  label,
  ...props
}: AskMoreJobButtonProps) {
  const router = useRouter();
  const t = useTranslations("PageJobDetail.AskMoreBtn");
  const tChat = useTranslations("Candidate.Chat");
  const tCommon = useTranslations("Common");
  const displayLabel = label || t("Trigger");

  const { user } = useAppStore();
  const createConversationMutation = useCreateConversationMutation();
  const [isOpen, setIsOpen] = useState(false);

  const handleAskMoreHR = async () => {
    if (!user) {
      SoftDestructiveSonner(tCommon("StartChat.LoginRequired"));
      return;
    }

    if (user.roleCodeName !== envConfig.NEXT_PUBLIC_ROLE_CANDIDATE) {
      return;
    }

    const companyId = job.company?._id || job.companyID;
    if (!companyId) {
      SoftDestructiveSonner(t("NoCompany"));
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
        inputText: tChat("JobReferenceDefaultText"),
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
      SoftDestructiveSonner(t("PrepError"));
      console.log("error ask more about job: ", error);
    }
  };

  const handleAskMoreAI = () => {
    //- Chuẩn bị tin nhắn nháp tương tự chat HR
    const draftPayload = {
      conversationId: "ai-assistant",
      inputText: tChat("AiAskJobPrompt", { title: jobTitle }),
      type: "TEXT" as const,
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

    router.push(
      `/chat?ai=true&jobId=${job._id}&jobTitle=${encodeURIComponent(jobTitle)}`,
    );
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
          {createConversationMutation.isPending ? t("Preparing") : displayLabel}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem
          onClick={handleAskMoreHR}
          className="cursor-pointer py-3"
        >
          <MessageCircle className="mr-2 h-4 w-4" />
          <span>{t("HR")}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleAskMoreAI}
          className="cursor-pointer py-3"
        >
          <Bot className="mr-2 h-4 w-4" />
          <span>{t("AI")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
