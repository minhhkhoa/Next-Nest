"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SoftDestructiveSonner from "@/components/shadcn-studio/sonner/SoftDestructiveSonner";
import SoftSuccessSonner from "@/components/shadcn-studio/sonner/SoftSuccessSonner";
import { ISSUE_TYPE_OPTIONS } from "@/lib/constant";
import {
  issueCreate,
  IssueCreateType,
  IssueResType,
} from "@/schemasvalidation/issue";
import { useCreateIssue, useUpdateIssue } from "@/queries/useIssue";

interface IssueDialogProps {
  onClose: () => void;
  issue: IssueResType | undefined;
  open: boolean;
}

export function IssueDialogForm({ onClose, issue, open }: IssueDialogProps) {
  const form = useForm<IssueCreateType>({
    resolver: zodResolver(issueCreate),
    defaultValues: {
      title: "",
      description: "",
      type: "SUPPORT",
      targetId: undefined,
      attachments: [],
    },
  });

  const { mutateAsync: createIssueMutation, isPending: isCreating } =
    useCreateIssue();
  const { mutateAsync: updateIssueMutation, isPending: isUpdating } =
    useUpdateIssue();

  const isLoading = isCreating || isUpdating;

  useEffect(() => {
    if (issue) {
      form.reset({
        title: issue.title.vi,
        description: issue.description.vi,
        type: issue.type as any,
        targetId: issue.targetId || "",
        attachments: issue.attachments || [],
      });
    } else {
      form.reset({
        title: "",
        description: "",
        type: "SUPPORT",
        targetId: "",
        attachments: [],
      });
    }
  }, [issue, form, open]);

  const handleSubmit = async (values: IssueCreateType) => {
    try {
      if (issue) {
        const res = await updateIssueMutation({
          id: issue._id,
          payload: values,
        });

        if (res.isError) {
          SoftDestructiveSonner("Có lỗi xảy ra khi cập nhật yêu cầu");
          return;
        }

        SoftSuccessSonner("Cập nhật yêu cầu thành công");
      } else {
        const res = await createIssueMutation(values);

        if (res.isError) {
          SoftDestructiveSonner("Có lỗi xảy ra khi tạo yêu cầu");
          return;
        }
        SoftSuccessSonner("Tạo yêu cầu mới thành công");
      }
      onClose();
    } catch (error) {
      SoftDestructiveSonner("Có lỗi xảy ra");
      console.error("Error submitting issue form:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {issue ? "Chỉnh sửa yêu cầu" : "Tạo yêu cầu mới"}
          </DialogTitle>
          <DialogDescription>
            {issue
              ? "Cập nhật thông tin chi tiết cho yêu cầu này."
              : "Điền thông tin để tạo yêu cầu hỗ trợ hoặc báo cáo mới."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tiêu đề</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập tiêu đề yêu cầu" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                   <FormLabel>Loại yêu cầu</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn loại yêu cầu" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ISSUE_TYPE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
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
                name="targetId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ID đối tượng (Tuỳ chọn)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="ID Job, Company, User..."
                        {...field}
                         value={field.value || ""} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nội dung chi tiết</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Mô tả chi tiết vấn đề của bạn..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Hủy
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center gap-2">Đang xử lý...</span>
                ) : issue ? (
                  "Cập nhật"
                ) : (
                  "Tạo mới"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
