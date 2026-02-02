"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import SoftSuccessSonner from "@/components/shadcn-studio/sonner/SoftSuccessSonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { JobResType } from "@/schemasvalidation/job";
import { useUpdateJob } from "@/queries/useJob";
import { Switch } from "@/components/ui/switch";
import { calculateRemainingDays } from "@/lib/utils";

const statusFilters = [
  { label: "Đang hoạt động", value: "active" },
  { label: "Dừng hoạt động", value: "inactive" },
];

interface JobDialogFormProps {
  onClose: () => void;
  data: JobResType | undefined;
}

export function JobDialogForm({ onClose, data }: JobDialogFormProps) {
  const form = useForm({
    defaultValues: {
      name: data?.company?.name,
      title: data?.title.vi,
      status: data?.status,
      isActive: data?.isActive,

      // Lấy từ data.isHot (object ở DB) để map vào 2 field của DTO
      isHot: data?.isHot?.isHotJob || false,
      hotDays: calculateRemainingDays(data?.isHot?.hotUntil) || 0,
    },
  });

  const { mutateAsync: updateJobMutation, isPending: isUpdatingJob } =
    useUpdateJob();

  const handleSubmit = async (values: any) => {
    const payload = {
      status: values.status,
      isActive: values.isActive,
      isHot: values.isHot,
      // Nếu bật hot thì gửi số ngày, không thì thôi
      hotDays: values.isHot ? Number(values.hotDays) : undefined,
    };
    try {
      const res = await updateJobMutation({
        id: data?._id || "",
        payload,
      });

      if (res?.isError) return;

      SoftSuccessSonner(res?.message);
      onClose();
    } catch (error) {
      console.log("error submit form job: ", error);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Quản lý công việc</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin công việc và trạng thái hoạt động
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <ScrollArea className="h-[65vh] pr-4 scroll-auto">
              <div className="space-y-4">
                {/* Tên công ty - Read Only */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên công ty</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          readOnly
                          className="bg-muted focus-visible:ring-0"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Tên công việc - Read Only */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên công việc</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          readOnly
                          className="bg-muted focus-visible:ring-0"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Tạo bởi */}
                <div className="rounded-lg border bg-muted/30 p-4">
                  <p className="mb-3 text-sm font-medium text-muted-foreground">
                    Tạo bởi
                  </p>

                  <div className="flex items-start gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10 border border-border">
                        <AvatarImage
                          src={data?.createdBy?.avatar || undefined}
                        />
                        <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                          {data?.createdBy?.name
                            ? data?.createdBy?.name?.charAt(0)
                            : "N/A"}
                        </AvatarFallback>
                      </Avatar>
                    </div>

                    {/* Thông tin */}
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {data?.createdBy?.name || "N/A"}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {data?.createdBy?.email || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Trạng thái status */}
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                      <FormLabel>Trạng thái hoạt động</FormLabel>
                      <FormControl>
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
                            {statusFilters?.map((status) => (
                              <SelectItem
                                key={status.value}
                                value={status.value}
                              >
                                {status.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Trạng thái isActive */}
                <FormField
                  control={form.control}
                  name="isActive" // Dùng biến isActive đã khai báo ở defaultValues
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Trạng thái hoạt động</FormLabel>
                        <FormDescription>
                          {field.value
                            ? "Công việc đã được kích hoạt."
                            : "Công việc đang chờ duyệt."}
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Trạng thái Tin Hot */}
                {/* Phần quản lý Hot Job cho Super Admin */}
                <div className="rounded-lg border border-orange-200 bg-orange-50/10 p-4 shadow-sm space-y-4">
                  <FormField
                    control={form.control}
                    name="isHot"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between">
                        <div className="space-y-0.5">
                          <FormLabel className="text-orange-600 font-bold flex items-center gap-1">
                            Tin tuyển dụng HOT
                          </FormLabel>
                          <FormDescription>
                            Đánh dấu tin nổi bật trên trang chủ.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Chỉ hiện khi Switch isHot bật */}
                  {form.watch("isHot") && (
                    <FormField
                      control={form.control}
                      name="hotDays"
                      render={({ field }) => (
                        <FormItem className="animate-in zoom-in-95 duration-200">
                          <FormLabel>Số ngày duy trì trạng thái HOT</FormLabel>
                          <FormControl>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                {...field}
                                min={1}
                                className="w-24 focus:border-orange-500"
                                onChange={(e) =>
                                  field.onChange(parseInt(e.target.value))
                                }
                              />
                              <span className="text-sm text-muted-foreground">
                                ngày
                              </span>
                            </div>
                          </FormControl>
                          <FormDescription>
                            Hệ thống sẽ tự động tính toán ngày hết hạn dựa trên
                            số ngày này.
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </div>
            </ScrollArea>

            <DialogFooter className="relative">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isUpdatingJob}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isUpdatingJob}>
                {isUpdatingJob ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  "Lưu thay đổi"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
