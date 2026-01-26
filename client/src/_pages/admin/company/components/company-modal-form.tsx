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
import { Switch } from "@/components/ui/switch";
import SoftDestructiveSonner from "@/components/shadcn-studio/sonner/SoftDestructiveSonner";
import SoftSuccessSonner from "@/components/shadcn-studio/sonner/SoftSuccessSonner";
import { CompanyResType } from "@/schemasvalidation/company";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUpdateCompany } from "@/queries/useCompany";

const statusFilters = [
  { label: "Chờ phê duyệt", value: "PENDING" },
  { label: "Đang hoạt động", value: "ACCEPT" },
  { label: "Đã từ chối", value: "REJECTED" },
];

interface CompanyDialogFormProps {
  onClose: () => void;
  data: CompanyResType | undefined;
}

export function CompanyDialogForm({ onClose, data }: CompanyDialogFormProps) {
  const form = useForm({
    defaultValues: {
      name: data?.name || "",
      taxCode: data?.taxCode || "",
      address: data?.address || "",
      status: data?.status,
    },
  });

  const { mutateAsync: updateCompanyMutation, isPending: isUpdatingCompany } =
    useUpdateCompany();

  const handleSubmit = async (values: any) => {
    try {
      const res = await updateCompanyMutation({
        id: data?._id || "",
        payload: values
      });

      if (res?.isError) return;

      SoftSuccessSonner(res?.message);
      onClose();
    } catch (error) {
      console.log("error submit form company: ", error);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Quản lý công ty</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin công ty và trạng thái hoạt động
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

                {/* Mã số thuế - Read Only */}
                <FormField
                  control={form.control}
                  name="taxCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mã số thuế</FormLabel>
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

                {/* address */}
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Địa chỉ</FormLabel>
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

                {/* Trạng thái isDeleted */}
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

              </div>
            </ScrollArea>

            <DialogFooter className="relative">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isUpdatingCompany}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isUpdatingCompany}>
                {isUpdatingCompany ? (
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
