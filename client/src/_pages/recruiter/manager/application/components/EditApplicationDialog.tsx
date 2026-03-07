"use client";

import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApplicationResType } from "@/schemasvalidation/application";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { updateApplicationSchema } from "@/schemasvalidation/application";
import { useUpdateApplication } from "@/queries/useApplication";
import SoftSuccessSonner from "@/components/shadcn-studio/sonner/SoftSuccessSonner";
import SoftDestructiveSonner from "@/components/shadcn-studio/sonner/SoftDestructiveSonner";
import { APPLICATION_STATUS } from "@/lib/constant";
import { Star } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface EditApplicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  application: ApplicationResType | null;
}

export function EditApplicationDialog({
  open,
  onOpenChange,
  application,
}: EditApplicationDialogProps) {
  const { mutateAsync, isPending } = useUpdateApplication();

  const form = useForm<z.infer<typeof updateApplicationSchema>>({
    resolver: zodResolver(updateApplicationSchema),
    defaultValues: {
      status: "PENDING",
      rating: 0,
      recruiterNote: "",
      interviewTime: "",
      rejectionReason: "",
    },
  });

  useEffect(() => {
    if (application && open) {
      form.reset({
        status: application.status,
        rating: application.rating || 0,
        recruiterNote:
          typeof application.recruiterNote === "object"
            ? application.recruiterNote?.vi
            : application.recruiterNote || "",
        interviewTime: application.interviewTime
          ? new Date(application.interviewTime).toISOString().slice(0, 16)
          : "",
        rejectionReason:
          typeof application.rejectionReason === "object"
            ? application.rejectionReason?.vi
            : application.rejectionReason || "",
      });
    }
  }, [application, open, form]);

  const onSubmit = async (values: z.infer<typeof updateApplicationSchema>) => {
    if (!application) return;

    try {
      const payload = { ...values } as any;

      if (values.status !== "INTERVIEW" || !payload.interviewTime) {
        delete payload.interviewTime;
      } else {
        payload.interviewTime = new Date(payload.interviewTime).toISOString();
      }

      if (values.status !== "REJECTED" || !payload.rejectionReason) {
        delete payload.rejectionReason;
      }

      const res = await mutateAsync({ id: application._id, payload });
      if (res.isError) {
        SoftDestructiveSonner("Có lỗi xảy ra khi cập nhật");
        return;
      }
      SoftSuccessSonner("Cập nhật thành công");
      onOpenChange(false);
    } catch (error) {
      SoftDestructiveSonner("Có lỗi xảy ra khi cập nhật");
      console.log("error: ", error);
    }
  };

  const currentStatus = form.watch("status");
  const currentRating = form.watch("rating") || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 flex flex-col max-h-[90vh] gap-0">
        <DialogHeader className="p-6 pb-4 border-b shrink-0">
          <DialogTitle>Cập nhật trạng thái ứng viên</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col flex-1 overflow-hidden"
          >
            <ScrollArea className="flex-1">
              <div className="p-6 space-y-6">
                {/* Read-only Information Section */}
                {application && (
                  <div className="bg-muted/30 p-4 rounded-lg border border-border/50 text-sm space-y-3">
                    <div className="grid grid-cols-[100px_1fr] gap-2">
                      <span className="font-semibold text-foreground">
                        Ứng viên:
                      </span>
                      <span className="text-muted-foreground break-words">
                        {typeof application.userId === "object"
                          ? application.userId.name
                          : "Người dùng ẩn"}
                      </span>
                    </div>
                    <div className="grid grid-cols-[100px_1fr] gap-2">
                      <span className="font-semibold text-foreground">
                        Email:
                      </span>
                      <span className="text-muted-foreground break-words">
                        {application.email}
                      </span>
                    </div>
                    <div className="grid grid-cols-[100px_1fr] gap-2">
                      <span className="font-semibold text-foreground">
                        Công việc ứng tuyển:
                      </span>
                      <span className="text-muted-foreground break-words line-clamp-2">
                        {typeof application.jobId === "object"
                          ? application.jobId.title?.vi ||
                            application.jobId.title?.en
                          : "Công việc đã xóa"}
                      </span>
                    </div>
                    {application.coverLetter && (
                      <div className="pt-2">
                        <span className="font-semibold text-foreground block mb-2">
                          Thư giới thiệu:
                        </span>
                        <div className="text-muted-foreground p-3 bg-background rounded-md border min-h-[60px] whitespace-pre-wrap leading-relaxed">
                          {typeof application.coverLetter === "object"
                            ? application.coverLetter.vi
                            : application.coverLetter}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Trạng thái</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn trạng thái" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {APPLICATION_STATUS.map((s) => (
                              <SelectItem key={s.value} value={s.value}>
                                {s.label}
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
                    name="rating"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Đánh giá (Mức độ tiềm năng)</FormLabel>
                        <div className="flex items-center gap-1 pt-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-6 h-6 cursor-pointer hover:text-yellow-400 transition-colors ${
                                star <= currentRating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                              onClick={() => field.onChange(star)}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {currentStatus === "INTERVIEW" && (
                  <FormField
                    control={form.control}
                    name="interviewTime"
                    render={({ field }) => {
                      const { value, ...rest } = field;
                      return (
                        <FormItem>
                          <FormLabel>Thời gian phỏng vấn</FormLabel>
                          <FormControl>
                            <Input
                              type="datetime-local"
                              {...rest}
                              value={
                                value instanceof Date
                                  ? value.toISOString().slice(0, 16)
                                  : value || ""
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                )}

                {currentStatus === "REJECTED" && (
                  <FormField
                    control={form.control}
                    name="rejectionReason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lý do từ chối</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Nhập lý do phản hồi cho ứng viên (không bắt buộc)"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="recruiterNote"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ghi chú nội bộ</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Ghi chú về ứng viên này..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </ScrollArea>

            <DialogFooter className="p-4 sm:px-6 border-t shrink-0 bg-muted/10 mt-auto">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Đang xử lý..." : "Lưu thay đổi"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
