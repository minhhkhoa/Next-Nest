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
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import SoftDestructiveSonner from "@/components/shadcn-studio/sonner/SoftDestructiveSonner";
import SoftSuccessSonner from "@/components/shadcn-studio/sonner/SoftSuccessSonner";
import { RoleResType } from "@/schemasvalidation/role";
import {
  useDeleteUser,
  useRestoreUser,
  useUpdateRoleMutate,
} from "@/queries/useUser";
import { apiUserResType } from "@/schemasvalidation/user";

interface UserDialogFormProps {
  onClose: () => void;
  data: apiUserResType;
  listRoles: RoleResType[];
}

export function UserDialogForm({
  onClose,
  data,
  listRoles,
}: UserDialogFormProps) {
  const form = useForm({
    defaultValues: {
      name: data?.user?.name || "",
      email: data?.user?.email || "",
      roleID: data?.user?.roleID?._id || "",
      isActive: data?.user?.isDeleted === false,
    },
  });

  // Khai báo các mutation và lấy trạng thái isPending
  const { mutateAsync: restoreMutation, isPending: isRestoring } =
    useRestoreUser();
  const { mutateAsync: deleteMutation, isPending: isDeleting } =
    useDeleteUser();
  const { mutateAsync: updateRoleMutation, isPending: isUpdatingRole } =
    useUpdateRoleMutate();

  // Biến tổng hợp trạng thái đang xử lý
  const isProcessing = isRestoring || isDeleting || isUpdatingRole;

  const handleSubmit = async (values: any) => {
    try {
      const actions = [];

      const currentIsDeleted = data?.user?.isDeleted;

      // Case: Admin Bật Switch (isActive: true) nhưng DB đang bị xóa (isDeleted: true) -> Gọi Restore
      if (values.isActive === true && currentIsDeleted === true) {
        actions.push(restoreMutation(data.user._id));
      }

      // Case: Admin Tắt Switch (isActive: false) nhưng DB đang hoạt động (isDeleted: false) -> Gọi Delete
      else if (values.isActive === false && currentIsDeleted === false) {
        actions.push(deleteMutation(data.user._id));
      }

      /**
       * 2. XỬ LÝ VAI TRÒ (Nếu có thay đổi)
       */
      if (values.roleID !== data?.user?.roleID?._id) {
        actions.push(
          updateRoleMutation({
            id: data.user._id,
            roleID: values.roleID,
          })
        );
      }

      // Thực thi các API đồng thời nếu có sự thay đổi
      if (actions.length > 0) {
        await Promise.all(actions);
        SoftSuccessSonner("Cập nhật thông tin quản trị thành công");
      } else {
        // Nếu nhấn Lưu mà không thay đổi gì thì chỉ cần thông báo hoặc đóng dialog
        console.log("Không có thay đổi nào được thực hiện.");
      }

      onClose(); // Đóng Dialog sau khi xử lý xong
    } catch (error: any) {
      // Trả về lỗi từ Backend (ví dụ lỗi phân quyền hoặc database)
      const errorMessage =
        error?.payload?.message || "Có lỗi xảy ra khi cập nhật";
      SoftDestructiveSonner(errorMessage);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Quản lý tài khoản người dùng</DialogTitle>
          <DialogDescription>
            Thay đổi vai trò hoặc khôi phục quyền truy cập cho tài khoản.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-4">
                {/* Họ tên - Read Only */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Họ và tên</FormLabel>
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

                {/* Email - Read Only */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
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

                {/* Chọn Role */}
                <FormField
                  control={form.control}
                  name="roleID"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vai trò hệ thống</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn vai trò" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {listRoles?.map((role) => (
                            <SelectItem key={role._id} value={role._id}>
                              {role.name.vi}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Trạng thái isDeleted */}
                <FormField
                  control={form.control}
                  name="isActive" // Dùng biến isActive đã khai báo ở defaultValues
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Trạng thái hoạt động</FormLabel>
                        <FormDescription>
                          {field.value
                            ? "Tài khoản đang được phép truy cập hệ thống."
                            : "Tài khoản đang bị khóa quyền truy cập."}
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
                disabled={isProcessing}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isProcessing}>
                {isProcessing ? (
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
