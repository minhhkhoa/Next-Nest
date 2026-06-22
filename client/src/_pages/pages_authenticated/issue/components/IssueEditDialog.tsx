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
import { useTranslations, useLocale } from "next-intl";

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
  const t = useTranslations("Candidate.Issue");
  const tCommon = useTranslations("Common");
  const locale = useLocale();

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
      title: issue.title?.[locale as "vi" | "en"] || issue.title?.vi || "",
      description: issue.description?.[locale as "vi" | "en"] || issue.description?.vi || "",
      type: issue.type,
      attachments: issue.attachments || [],
    },
  });

  //- Update form values when issue changes
  useEffect(() => {
    if (open && issue) {
      reset({
        title: issue.title?.[locale as "vi" | "en"] || issue.title?.vi || "",
        description: issue.description?.[locale as "vi" | "en"] || issue.description?.vi || "",
        type: issue.type,
        attachments: issue.attachments || [],
      });
    }
  }, [open, issue, reset, locale]);

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
      SoftDestructiveSonner(t("UploadFailed"));
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
      SoftSuccessSonner(t("EditSuccess"));
      onOpenChange(false);
    } catch (error) {
      SoftDestructiveSonner(t("EditFailed"));
      console.error(error);
    }
  };

  const isPending = updateMutation.isPending || isUploading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{t("EditTitle")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">{t("Labels.title")}</Label>
            <Input
              id="title"
              {...register("title")}
              placeholder={t("Labels.enterTitle")}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">{t("Labels.type")}</Label>
            <Select
              onValueChange={(value) => setValue("type", value as any)}
              defaultValue={issue.type}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("Labels.selectType")} />
              </SelectTrigger>
              <SelectContent>
                {ISSUE_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label[locale as "vi" | "en"]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-red-500">{errors.type.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t("Labels.description")}</Label>
            <Textarea
              id="description"
              className="min-h-[150px]"
              {...register("description")}
              placeholder={t("Labels.enterDesc")}
            />
            {errors.description && (
              <p className="text-sm text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>{t("Labels.attachments")}</Label>
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
                {t("Labels.upload")}
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
              {tCommon("Buttons.cancel")}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {tCommon("Buttons.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
