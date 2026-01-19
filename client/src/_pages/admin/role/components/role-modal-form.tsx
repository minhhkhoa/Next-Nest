"use client";

import type React from "react";
import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import SoftDestructiveSonner from "@/components/shadcn-studio/sonner/SoftDestructiveSonner";
import SoftSuccessSonner from "@/components/shadcn-studio/sonner/SoftSuccessSonner";
import {
  roleCreate,
  RoleCreateType,
  RoleResType,
} from "@/schemasvalidation/role";
import { GroupedPermissionRes } from "@/schemasvalidation/permission";
import { useCreateRole, useUpdateRole } from "@/queries/role";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { PermissionSelector } from "./permissionSelector";

interface PermissionDialogProps {
  onClose: () => void;
  role: RoleResType | undefined;
  groupModules: GroupedPermissionRes;
}

export function RoleDialogForm({
  onClose,
  role,
  groupModules,
}: PermissionDialogProps) {
  const form = useForm<RoleCreateType>({
    resolver: zodResolver(roleCreate),
    defaultValues: {
      name: "",
      description: "",
      isActived: true,
      permissions: [],
    },
  });

  console.log("groupModules: ", groupModules);

  const {} = form;

  const { mutateAsync: createRoleMutation, isPending: isCreating } =
    useCreateRole();
  const { mutateAsync: updateRoleMutation, isPending: isUpdating } =
    useUpdateRole();

  const handleSubmit = async (values: RoleCreateType) => {
    try {
      if (role) {
        const res = await updateRoleMutation({
          id: role._id,
          payload: values,
        });

        if (res.isError)
          SoftDestructiveSonner("Có lỗi xảy ra khi chỉnh sửa vai trò");

        SoftSuccessSonner(res.message);
      } else {
        const res = await createRoleMutation(values);

        if (res.isError)
          SoftDestructiveSonner("Có lỗi xảy ra khi thêm mới vai trò");

        SoftSuccessSonner(res.message);
      }
    } catch (error) {
      SoftDestructiveSonner("Có lỗi xảy ra");
      console.log("error handle submit role: ", error);
    }
  };

  useEffect(() => {
    if (role) {
      form.reset({
        name: role.name.vi,
        description: role.description.vi,
        isActived: role.isActived,
        permissions: role.permissions.map((permission) => permission),
      });
    }
  }, [role, form]);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {role ? "Chỉnh sửa vai trò" : "Thêm mới vai trò"}
          </DialogTitle>
          <DialogDescription>
            {role
              ? "Điền đầy đủ thông tin để chỉnh sửa vai trò hệ thống"
              : "Điền đầy đủ thông tin để tạo mới vai trò hệ thống"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <ScrollArea className="h-[60vh] pr-4">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên vai trò</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập tên vai trò" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên vai trò</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Nhập mô tả vai trò" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* switch isActived */}
                <FormField
                  control={form.control}
                  name="isActived"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Trạng thái</FormLabel>
                        <FormDescription>
                          Đặt trạng thái hoạt động cho vai trò này.
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

                {/* select permissions */}
                <PermissionSelector
                  control={form.control}
                  groupModules={groupModules}
                />
              </div>
            </ScrollArea>

            <DialogFooter className="relative">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isCreating || isUpdating}
              >
                Hủy
              </Button>
              <Button type="submit">
                {isCreating || isUpdating ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : role ? (
                  "Cập nhật"
                ) : (
                  "Thêm mới"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
