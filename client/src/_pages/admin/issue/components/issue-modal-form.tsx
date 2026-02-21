"use client";

import { useEffect, useState } from "react";
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
  issueAdminUpdate,
  IssueCreateType,
  IssueAdminUpdateType,
  IssueResType,
} from "@/schemasvalidation/issue";
import { useCreateIssue, useAdminReplyIssue } from "@/queries/useIssue";
import { uploadToCloudinary } from "@/lib/utils";
import { Upload, X } from "lucide-react";
import Image from "next/image";
import ModeEditIssue from "./mode-edit";

interface IssueDialogProps {
  onClose: () => void;
  issue: IssueResType | undefined;
  open: boolean;
}

export function IssueDialogForm({ onClose, issue, open }: IssueDialogProps) {
  const isEditMode = !!issue;
  const [isUploading, setIsUploading] = useState(false);

  //- Nếu có issue -> dùng schema admin update, ngược lại dùng schema create
  const formSchema = isEditMode ? issueAdminUpdate : issueCreate;

  const form = useForm<any>({
    resolver: zodResolver(formSchema),
    defaultValues: isEditMode
      ? {
          id: issue?._id || "",
          status: issue?.status || "PENDING",
          adminReply: issue?.adminResponse?.content?.vi || "",
        }
      : {
          title: "",
          description: "",
          type: "SUPPORT",
          targetId: undefined,
          attachments: [],
        },
  });

  const { mutateAsync: createIssueMutation, isPending: isCreating } =
    useCreateIssue();
  const { mutateAsync: adminReplyMutation, isPending: isUpdating } =
    useAdminReplyIssue();

  const isLoading = isCreating || isUpdating;

  const handleUploadImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      setIsUploading(true);
      const uploadedUrls: string[] = [];

      // Loop through all selected files and upload them
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const url = await uploadToCloudinary(file);
        if (url) {
          uploadedUrls.push(url);
        }
      }

      // Add new URLs to existing attachments
      const currentAttachments = form.getValues("attachments") || [];
      form.setValue("attachments", [...currentAttachments, ...uploadedUrls]);
    } catch (error) {
      console.error("Lỗi upload media: ", error);
      SoftDestructiveSonner("Có lỗi xảy ra khi tải ảnh lên");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const currentAttachments = form.getValues("attachments") || [];
    const newAttachments = currentAttachments.filter(
      (_: string, index: number) => index !== indexToRemove,
    );
    form.setValue("attachments", newAttachments);
  };

  useEffect(() => {
    if (issue) {
      form.reset({
        id: issue._id,
        status: issue.status,
        adminReply: issue.adminResponse?.content?.vi || "",
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

  const handleSubmit = async (values: any) => {
    try {
      if (isEditMode && issue) {
        //- Admin reply
        const payload: IssueAdminUpdateType = {
          id: issue._id,
          status: values.status,
          adminReply: values.adminReply,
        };

        const res = await adminReplyMutation(payload);

        if (res.isError) {
          SoftDestructiveSonner("Có lỗi xảy ra khi phản hồi yêu cầu");
          return;
        }

        SoftSuccessSonner("Phản hồi yêu cầu thành công");
      } else {
        //- Create new issue
        const payload: IssueCreateType = {
          title: values.title,
          description: values.description,
          type: values.type,
          targetId: values.targetId === "" ? undefined : values.targetId,
          attachments: values.attachments,
        };

        const res = await createIssueMutation(payload);

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
            {isEditMode ? "Phản hồi yêu cầu" : "Thêm yêu cầu mới"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Cập nhật trạng thái và phản hồi cho yêu cầu này."
              : "Điền thông tin để tạo yêu cầu hỗ trợ hoặc báo cáo mới."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            {/* Nếu create mode -> hiện các field tạo issue */}
            {!isEditMode && (
              <>
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Tiêu đề <span className="text-destructive">*</span>
                      </FormLabel>
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
                        <FormLabel>
                          Loại yêu cầu{" "}
                          <span className="text-destructive">*</span>
                        </FormLabel>
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
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
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
                      <FormLabel>
                        Nội dung chi tiết{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
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

                {/* Upload Image Section */}
                <div className="space-y-3">
                  <FormLabel>Hình ảnh đính kèm</FormLabel>
                  <div className="flex flex-wrap gap-4">
                    {form
                      .watch("attachments")
                      ?.map((url: string, index: number) => (
                        <div
                          key={index}
                          className="relative w-24 h-24 border rounded-md overflow-hidden group hover:ring-2 hover:ring-primary/50 transition-all"
                        >
                          <Image
                            src={url}
                            alt={`Attachment ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-1 right-1 bg-black/60 hover:bg-red-500 text-white rounded-full p-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}

                    <label className="w-24 h-24 border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center rounded-md cursor-pointer hover:bg-muted/50 hover:border-primary/50 transition-all relative overflow-hidden">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={handleUploadImages}
                        disabled={isUploading}
                      />
                      {isUploading ? (
                        <div className="flex flex-col items-center animate-pulse">
                          <Upload className="w-6 h-6 text-primary mb-1" />
                          <span className="text-[10px] text-primary font-medium">
                            Updated...
                          </span>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-6 h-6 text-muted-foreground mb-1 group-hover:scale-110 transition-transform" />
                          <span className="text-[10px] text-muted-foreground font-medium">
                            Thêm ảnh
                          </span>
                        </>
                      )}
                    </label>
                  </div>
                </div>
              </>
            )}

            {/* Nếu edit mode (admin reply) -> hiện thông tin read-only và form reply */}
            {isEditMode && issue && <ModeEditIssue issue={issue} form={form} />}

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Hủy
              </Button>
              <Button type="submit" disabled={isLoading || isUploading}>
                {isLoading ? (
                  <span className="flex items-center gap-2">Đang xử lý...</span>
                ) : isEditMode ? (
                  "Cập nhật phản hồi"
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
