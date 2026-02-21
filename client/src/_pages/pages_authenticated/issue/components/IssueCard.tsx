import React from "react";
import { IssueResType } from "@/schemasvalidation/issue";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Calendar,
  Trash2,
  Edit,
  Paperclip,
  MessageSquareReply,
  MoreVertical,
} from "lucide-react";
import { ISSUE_STATUS_OPTIONS, ISSUE_TYPE_OPTIONS } from "@/lib/constant";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";

interface IssueCardProps {
  issue: IssueResType;
  onEdit: (issue: IssueResType) => void;
  onDelete: (id: string) => void;
}

export default function IssueCard({ issue, onEdit, onDelete }: IssueCardProps) {
  const isPending = issue.status === "PENDING";

  const getStatusInfo = (status: string) => {
    const option = ISSUE_STATUS_OPTIONS.find((opt) => opt.value === status);
    let color = "bg-gray-500";
    switch (status) {
      case "PENDING":
        color = "bg-yellow-500 hover:bg-yellow-600";
        break;
      case "PROCESSING":
        color = "bg-blue-500 hover:bg-blue-600";
        break;
      case "RESOLVED":
        color = "bg-green-500 hover:bg-green-600";
        break;
      case "CLOSED":
        color = "bg-slate-500 hover:bg-slate-600";
        break;
      case "REJECTED":
        color = "bg-red-500 hover:bg-red-600";
        break;
    }
    return { label: option?.label.vi || status, color };
  };

  const statusInfo = getStatusInfo(issue.status);
  const typeLabel =
    ISSUE_TYPE_OPTIONS.find((opt) => opt.value === issue.type)?.label.vi ||
    issue.type;

  return (
    <Card className="h-full flex flex-col transition-all duration-200 hover:shadow-md border-neutral-200 dark:border-neutral-800">
      <CardHeader className="pb-3 relative">
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-1.5 break-words w-[85%]">
            <div className="flex items-center gap-2 flex-wrap pt-4">
              <Badge variant="outline" className="text-xs font-normal">
                {typeLabel}
              </Badge>
              <Badge
                className={`${statusInfo.color} border-transparent text-white`}
              >
                {statusInfo.label}
              </Badge>
            </div>
            <CardTitle className="text-lg font-semibold leading-tight line-clamp-2">
              <span className="font-normal text-muted-foreground mr-1">
                Tiêu đề:
              </span>
              {issue.title?.vi || "Không có tiêu đề"}
            </CardTitle>
          </div>

          {isPending && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => onEdit(issue)}
                  className="cursor-pointer"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Chỉnh sửa
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(issue._id)}
                  className="cursor-pointer text-red-600 focus:text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Xóa
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <ScrollArea className="max-h-50">
        <CardContent className="flex-1 pb-3 text-sm text-muted-foreground space-y-4">
          <div className="line-clamp-3 whitespace-pre-line">
            <span className="font-semibold text-foreground mr-1">Mô tả:</span>
            {issue.description?.vi}
          </div>

          {issue.attachments && issue.attachments.length > 0 && (
            <div className="pt-2">
              <div className="flex items-center gap-2 text-xs text-blue-500 mb-2">
                <Paperclip className="h-3.5 w-3.5" />
                <span>{issue.attachments.length} đính kèm</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {issue.attachments.map((url, index) => (
                  <div
                    key={index}
                    className="relative group border rounded-md overflow-hidden h-16 w-16"
                  >
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="block w-full h-full"
                    >
                      <Image
                        width={200}
                        height={200}
                        src={url}
                        alt={`Attachment ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {issue.adminResponse && (
            <div className="bg-muted/50 p-3 rounded-md mt-3 border border-border">
              <div className="flex items-center gap-2 mb-1 font-medium text-foreground text-xs uppercase tracking-wide">
                <MessageSquareReply className="h-3.5 w-3.5" />
                Phản hồi từ Admin
              </div>
              <p className="text-xs italic pl-5 border-l-2 border-primary/20">
                &quot;{issue.adminResponse.content?.vi}&quot;
              </p>
              <div className="text-[10px] text-muted-foreground text-right mt-1">
                {format(
                  new Date(issue.adminResponse.repliedAt),
                  "HH:mm dd/MM/yyyy",
                )}
              </div>
            </div>
          )}
        </CardContent>
      </ScrollArea>

      <CardFooter className="pt-0 text-xs text-muted-foreground border-t bg-muted/20 p-3 mt-auto">
        <div className="flex items-center gap-1.5 w-full">
          <Calendar className="h-3.5 w-3.5 opacity-70" />
          <span>
            {format(new Date(issue.createdAt), "HH:mm dd/MM/yyyy", {
              locale: vi,
            })}
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}
