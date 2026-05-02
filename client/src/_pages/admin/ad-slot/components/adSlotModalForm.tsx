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
import { zodResolver } from "@hookform/resolvers/zod";
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
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import SoftSuccessSonner from "@/components/shadcn-studio/sonner/SoftSuccessSonner";
import SoftDestructiveSonner from "@/components/shadcn-studio/sonner/SoftDestructiveSonner";
import {
  AdSlotResType,
  adSlotCreate,
  adSlotUpdate,
} from "@/schemasvalidation/adSlot";
import { useCreateAdSlot, useUpdateAdSlot } from "@/queries/useAdSlot";

//- Map label hiển thị cho page
const PAGE_OPTIONS = [
  { value: "HOME", label: "Trang chủ" },
  { value: "JOB_DETAIL", label: "Chi tiết việc làm" },
  { value: "COMPANY_DETAIL", label: "Chi tiết công ty" },
];

//- Map label cho adModeAllowed
const MODE_OPTIONS = [
  { value: "NON_DISMISSIBLE", label: "Cố định (không đóng được)" },
  { value: "DISMISSIBLE", label: "Có nút đóng" },
  { value: "BOTH", label: "Hỗ trợ cả hai" },
];

interface AdSlotModalFormProps {
  onClose: () => void;
  //- undefined = tạo mới, có data = chỉnh sửa
  data?: AdSlotResType;
}

export function AdSlotModalForm({ onClose, data }: AdSlotModalFormProps) {
  const isEdit = !!data;

  const form = useForm({
    resolver: zodResolver(isEdit ? adSlotUpdate : adSlotCreate),
    defaultValues: {
      code: data?.code ?? "",
      name: data?.name ?? "",
      page: data?.page ?? "HOME",
      adModeAllowed: data?.adModeAllowed ?? "BOTH",
      width: data?.width ?? 1200,
      height: data?.height ?? 300,
      pricePerDay: data?.pricePerDay ?? 50000,
      maxDurationDays: data?.maxDurationDays ?? 14,
      isActive: data?.isActive ?? true,
    },
  });

  const { mutateAsync: createSlot, isPending: isCreating } = useCreateAdSlot();
  const { mutateAsync: updateSlot, isPending: isUpdating } = useUpdateAdSlot();
  const isPending = isCreating || isUpdating;

  const handleSubmit = async (values: any) => {
    try {
      //- Đảm bảo code luôn uppercase trước khi gửi API
      const payload = { ...values, code: values.code?.toUpperCase() };

      let res;
      if (isEdit) {
        res = await updateSlot({ id: data!._id, payload });
      } else {
        res = await createSlot(payload);
      }

      if (res?.isError) {
        SoftDestructiveSonner(res?.message ?? "Có lỗi xảy ra");
        return;
      }

      SoftSuccessSonner(res?.message ?? "Thành công");
      onClose();
    } catch (error) {
      console.log("error submit ad-slot form: ", error);
      SoftDestructiveSonner("Có lỗi xảy ra, vui lòng thử lại");
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Chỉnh sửa vị trí quảng cáo" : "Tạo vị trí quảng cáo mới"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Cập nhật thông tin slot và cấu hình giá"
              : "Định nghĩa vị trí quảng cáo mới trong hệ thống"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <ScrollArea className="h-[65vh] pr-4">
              <div className="space-y-4">
                {/* Mã slot */}
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Mã slot <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Ví dụ: HOME_TOP"
                          className=" uppercase"
                          //- Nếu edit thì không cho đổi code (để tránh break booking)
                          // readOnly={isEdit}
                          // disabled={isEdit}
                        />
                      </FormControl>
                      <FormDescription>
                        Mã duy nhất, viết hoa, không dấu (VD: HOME_TOP,
                        JOB_INLINE)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Tên hiển thị */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Tên vị trí <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Ví dụ: Banner đầu trang chủ"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Trang hiển thị + Chế độ quảng cáo */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="page"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Trang <span className="text-red-500">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn trang" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {PAGE_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
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
                    name="adModeAllowed"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Loại quảng cáo hỗ trợ</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn loại" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {MODE_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Kích thước */}
                <div className="rounded-lg border p-4 space-y-3">
                  <p className="text-sm font-medium">Kích thước banner (px)</p>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="width"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Chiều rộng <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value) || 0)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="height"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Chiều cao <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value) || 0)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Giá và số ngày */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="pricePerDay"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Giá/ngày (VNĐ)
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1000}
                            step={1000}
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          {field.value
                            ? `${field.value.toLocaleString("vi-VN")}đ/ngày`
                            : ""}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="maxDurationDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Số ngày tối đa/lần thuê</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value) || 14)
                            }
                          />
                        </FormControl>
                        <FormDescription>Mặc định 14 ngày</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Trạng thái active */}
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Kích hoạt slot</FormLabel>
                        <FormDescription>
                          {field.value
                            ? "Slot đang hoạt động và có thể nhận booking."
                            : "Slot đang bị tắt, không nhận booking mới."}
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
              </div>
            </ScrollArea>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isPending}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : isEdit ? (
                  "Lưu thay đổi"
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
