"use client";

import React, { useState } from "react";
import { Link } from "@/i18n/navigation";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  MessageCircleQuestion,
  PlusCircle,
  ListChecks,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "./TanstackProvider";
import { IssueDialogForm } from "@/_pages/admin/issue/components/issue-modal-form";

import { useTranslations } from "next-intl";

export default function BlockIssue() {
  const t = useTranslations("Common.BlockIssue");
  const { isLogin } = useAppStore();

  //- State để quản lý trạng thái mở của modal
  const [isOpen, setIsOpen] = useState(false);

  //- Chỉ hiển thị nếu người dùng đã đăng nhập
  if (!isLogin) return null;

  return (
    <div className="flex flex-col items-end gap-3 sm:right-5">
      {/* Container cho các nút chức năng mở rộng sau này */}
      <TooltipProvider delayDuration={300}>
        {/* Nút Hỗ trợ chính */}
        <Popover>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 pointer-events-auto">
                {/*- nhãn hiển thị bên cạnh icon trên mobile giúp người dùng dễ nhận biết do không có hover */}
                <span className="px-2 py-1 rounded bg-black/80 dark:bg-slate-900/90 text-white text-[11px] font-medium shadow-md pointer-events-none sm:hidden whitespace-nowrap">
                  {t("BadgeLabel")}
                </span>
                <PopoverTrigger asChild>
                  <Button
                    size="icon"
                    className="h-10 w-10 rounded-full shadow-lg transition-transform hover:scale-110 bg-primary text-primary-foreground hover:bg-primary/90 shrink-0"
                  >
                    <MessageCircleQuestion className="h-5 w-5" />
                    <span className="sr-only">{t("SrOnlyLabel")}</span>
                  </Button>
                </PopoverTrigger>
              </div>
            </TooltipTrigger>
            <TooltipContent side="left" className="hidden sm:block">
              <p>{t("TooltipLabel")}</p>
            </TooltipContent>
          </Tooltip>

          <PopoverContent
            className="w-64 p-0 shadow-xl"
            side="top"
            align="end"
            sideOffset={10}
          >
            <div className="flex flex-col border-b p-4 bg-muted/50 rounded-t-lg">
              <h4 className="font-semibold text-sm">{t("SupportCenter")}</h4>
              <p className="text-xs text-muted-foreground mt-1">
                {t("SupportCenterDesc")}
              </p>
            </div>
            <div className="p-2 grid gap-1">
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 h-auto py-3 px-4 font-normal hover:bg-accent hover:text-accent-foreground"
                asChild
              >
                <Link href="/issue">
                  <ListChecks className="h-4 w-4 text-blue-500" />
                  <div className="flex flex-col items-start text-left">
                    <span className="text-sm font-medium">
                      {t("SubmittedIssues")}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {t("TrackIssues")}
                    </span>
                  </div>
                </Link>
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 h-auto py-3 px-4 font-normal hover:bg-accent hover:text-accent-foreground"
                onClick={() => setIsOpen(true)}
              >
                <PlusCircle className="h-4 w-4 text-green-500" />
                <div className="flex flex-col items-start text-left">
                  <span className="text-sm font-medium">{t("SubmitIssue")}</span>
                  <span className="text-xs text-muted-foreground">
                    {t("SubmitIssueDesc")}
                  </span>
                </div>
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </TooltipProvider>

      <IssueDialogForm
        open={isOpen}
        onClose={() => setIsOpen(false)}
        issue={undefined}
      />
    </div>
  );
}
