import React from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IssueResType } from "@/schemasvalidation/issue";
import Image from "next/image";
import { ISSUE_STATUS_OPTIONS } from "@/lib/constant";

type ModeEditIssueProps = {
  issue: IssueResType;
  form: any;
};

export default function ModeEditIssue({ issue, form }: ModeEditIssueProps) {
  return (
    <>
      <div className="bg-muted/30 p-4 rounded-md space-y-3 text-sm border">
        <div className="grid grid-cols-[80px_1fr] gap-2">
          <span className="font-semibold text-muted-foreground">Tiêu đề:</span>
          <span className="font-medium text-foreground">{issue.title.vi}</span>
        </div>
        <div className="grid grid-cols-[80px_1fr] gap-2">
          <span className="font-semibold text-muted-foreground">Loại:</span>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary text-secondary-foreground w-fit">
            {issue.type}
          </span>
        </div>
        <div className="grid grid-cols-[80px_1fr] gap-2">
          <span className="font-semibold text-muted-foreground">
            Người gửi:
          </span>
          <span className="font-medium text-foreground ">
            {issue.createdBy.name} - {issue.createdBy.email}
          </span>
        </div>
        <div className="grid grid-cols-[80px_1fr] gap-2">
          <span className="font-semibold text-muted-foreground">Mô tả:</span>
          <span className="whitespace-pre-wrap text-foreground/90">
            {issue.description.vi}
          </span>
        </div>

        {/* Display attachments in read-only mode if exists */}
        {issue.attachments && issue.attachments.length > 0 && (
          <div className="grid grid-cols-[80px_1fr] gap-2 pt-2 border-t mt-2">
            <span className="font-semibold text-muted-foreground pt-1">
              Đính kèm:
            </span>
            <div className="flex flex-wrap gap-2">
              {issue.attachments.map((url, index) => (
                <a
                  key={index}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative w-20 h-20 border rounded-md overflow-hidden hover:opacity-80 transition-opacity block"
                >
                  <Image
                    src={url}
                    alt={`Attachment ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      <FormField
        control={form.control}
        name="status"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Trạng thái <span className="text-destructive">*</span>
            </FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
              value={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {ISSUE_STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label.vi}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="adminReply"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Nội dung phản hồi <span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="Nhập nội dung phản hồi cho người dùng..."
                className="min-h-[120px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
