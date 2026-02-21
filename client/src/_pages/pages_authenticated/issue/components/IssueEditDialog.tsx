import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  issueUpdate,
  IssueUpdateType,
  IssueResType,
} from "@/schemasvalidation/issue";
import { ISSUE_TYPE_OPTIONS } from "@/lib/constant";
import { useUpdateIssue } from "@/queries/useIssue";
import { uploadToCloudinary } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Loader2, X, Upload, Paperclip } from "lucide-react";
import SoftSuccessSonner from "@/components/shadcn-studio/sonner/SoftSuccessSonner";
import SoftDestructiveSonner from "@/components/shadcn-studio/sonner/SoftDestructiveSonner";
import Image from "next/image";

interface IssueEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  issue: IssueResType;
}

export default function IssueEditDialog({
  open,
  onOpenChange,
  issue,
}: IssueEditDialogProps) {
  const [isUploading, setIsUploading] = useState(false);
  const updateMutation = useUpdateIssue();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<IssueUpdateType>({
    resolver: zodResolver(issueUpdate),
    defaultValues: {
      title: issue.title.vi,
      description: issue.description.vi,
      type: issue.type,
      attachments: issue.attachments || [],
    },
  });

  //- Update form values when issue changes
  useEffect(() => {
    if (open && issue) {
      reset({
        title: issue.title.vi,
        description: issue.description.vi,
        type: issue.type,
        attachments: issue.attachments || [],
      });
    }
  }, [open, issue, reset]);

  const attachments = watch("attachments") || [];

  const handleUploadImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      setIsUploading(true);
      const uploadedUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const url = await uploadToCloudinary(file);
        if (url) {
          uploadedUrls.push(url);
        }
      }

      const currentAttachments = watch("attachments") || [];
      setValue("attachments", [...currentAttachments, ...uploadedUrls]);
    } catch (error) {
      console.error(error);
      SoftDestructiveSonner("Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const removeAttachment = (index: number) => {
    const currentAttachments = watch("attachments") || [];
    const newAttachments = [...currentAttachments];
    newAttachments.splice(index, 1);
    setValue("attachments", newAttachments);
  };

  const onSubmit = async (data: IssueUpdateType) => {
    try {
      await updateMutation.mutateAsync({ id: issue._id, payload: data });
      SoftSuccessSonner("Cập nhật vấn đề thành công");
      onOpenChange(false);
    } catch (error) {
      SoftDestructiveSonner("Cập nhật thất bại");
      console.error(error);
    }
  };

  const isPending = updateMutation.isPending || isUploading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa vấn đề</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Tiêu đề</Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="Nhập tiêu đề vấn đề"
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Loại vấn đề</Label>
            <Select
              onValueChange={(value) => setValue("type", value as any)}
              defaultValue={issue.type}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn loại vấn đề" />
              </SelectTrigger>
              <SelectContent>
                {ISSUE_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label.vi}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-red-500">{errors.type.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Mô tả chi tiết</Label>
            <Textarea
              id="description"
              className="min-h-[150px]"
              {...register("description")}
              placeholder="Mô tả chi tiết vấn đề của bạn..."
            />
            {errors.description && (
              <p className="text-sm text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Đính kèm</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {attachments.map((url, index) => {
                const isImage = url.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) || url.includes('cloudinary');
                return (
                  <div
                    key={index}
                    className="relative group border rounded-md overflow-hidden h-20 w-20"
                  >
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center w-full h-full bg-muted text-xs hover:underline"
                    >
                      {isImage ? (
                        <Image
                          src={url}
                          width={200}
                          height={200}
                          alt={`Attachment ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-1 p-2 text-center">
                          <Paperclip className="h-4 w-4" />
                          <span className="text-[10px] break-all line-clamp-2">File {index + 1}</span>
                        </div>
                      )}
                    </a>
                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl-md opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="relative">
              <Button
                type="button"
                variant="outline"
                disabled={isUploading}
                className="w-full"
                onClick={() => document.getElementById("file-upload")?.click()}
              >
                {isUploading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                Tải lên tệp đính kèm
              </Button>
              <input
                id="file-upload"
                type="file"
                multiple
                className="hidden"
                onChange={handleUploadImages}
                accept="image/*,.pdf,.doc,.docx"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
