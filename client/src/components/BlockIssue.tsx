"use client";

import React, { useState } from "react";
import Link from "next/link";
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
  BookMarked,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "./TanstackProvider";
import { IssueDialogForm } from "@/_pages/admin/issue/components/issue-modal-form";

export default function BlockIssue() {
  const { isLogin } = useAppStore();

  //- State để quản lý trạng thái mở của modal
  const [isOpen, setIsOpen] = useState(false);

  //- Chỉ hiển thị nếu người dùng đã đăng nhập
  if (!isLogin) return null;

  return (
    <div className="fixed bottom-20 right-4 z-50 flex flex-col items-end gap-3 sm:right-5">
      {/* Container cho các nút chức năng mở rộng sau này */}
      <TooltipProvider delayDuration={300}>
        {/* việc làm đã lưu, làm sau */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              asChild
              variant="secondary"
              size="icon"
              className="h-11 w-11 rounded-full shadow-lg transition-transform hover:scale-110"
            >
              <Link href="/saved-jobs">
                <BookMarked className="h-6 w-6" />
                <span className="sr-only">Việc làm đã lưu</span>
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Việc làm đã lưu</p>
          </TooltipContent>
        </Tooltip>

        {/* Nút Hỗ trợ chính */}
        <Popover>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <Button
                  size="icon"
                  className="h-11 w-11 rounded-full shadow-lg transition-transform hover:scale-110 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <MessageCircleQuestion className="h-6 w-6" />
                  <span className="sr-only">Hỗ trợ</span>
                </Button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Hỗ trợ & Đóng góp</p>
            </TooltipContent>
          </Tooltip>

          <PopoverContent
            className="w-64 p-0 shadow-xl"
            side="top"
            align="end"
            sideOffset={10}
          >
            <div className="flex flex-col border-b p-4 bg-muted/50 rounded-t-lg">
              <h4 className="font-semibold text-sm">Trung tâm hỗ trợ</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Gửi yêu cầu hoặc đóng góp ý kiến để giúp chúng tôi cải thiện.
              </p>
            </div>
            <div className="p-2 grid gap-1">
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 h-auto py-3 px-4 font-normal hover:bg-accent hover:text-accent-foreground"
                asChild
              >
                <Link href="">
                  <ListChecks className="h-4 w-4 text-blue-500" />
                  <div className="flex flex-col items-start text-left">
                    <span className="text-sm font-medium">
                      Các vấn đề đã gửi
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Theo dõi trạng thái yêu cầu
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
                  <span className="text-sm font-medium">Đóng góp thêm</span>
                  <span className="text-xs text-muted-foreground">
                    Gửi báo cáo lỗi hoặc ý kiến
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
