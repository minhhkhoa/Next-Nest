"use client";

import type React from "react";
import { useState, useEffect } from "react";
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
import {
  permissionCreate,
  PermissionCreateType,
  PermissionResType,
} from "@/schemasvalidation/permission";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { HTTP_METHODS } from "@/lib/constant";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useCreatePermission, useUpdatePermission } from "@/queries/permission";
import SoftDestructiveSonner from "@/components/shadcn-studio/sonner/SoftDestructiveSonner";
import SoftSuccessSonner from "@/components/shadcn-studio/sonner/SoftSuccessSonner";

interface PermissionDialogProps {
  onClose: () => void;
  permission: PermissionResType | undefined;
  listModules: string[];
}

export function PermissionDialogForm({
  onClose,
  permission,
  listModules,
}: PermissionDialogProps) {
  const form = useForm<PermissionCreateType>({
    resolver: zodResolver(permissionCreate),
    defaultValues: {
      name: "",
      apiPath: "",
      method: "GET",
      module: "",
    },
  });

  const {} = form;

  const { mutateAsync: createPermissionMutation, isPending: isCreating } =
    useCreatePermission();
  const { mutateAsync: updatePermissionMutation, isPending: isUpdating } =
    useUpdatePermission();

  const handleSubmit = async (values: PermissionCreateType) => {
    // 1. Tạo payload mới, đảm bảo apiPath luôn có tiền tố "api/"
    // Chúng ta dùng replace để tránh trường hợp bị lặp "api/api/" nếu có lỗi logic ở đâu đó
    const finalPayload = {
      ...values,
      apiPath: values.apiPath.startsWith("api/")
        ? values.apiPath
        : `api/${values.apiPath.replace(/^\//, "")}`, // replace(/^\//, "") để bỏ dấu / dư thừa nếu user nhập "/users"
    };
    try {
      if (permission) {
        const res = await updatePermissionMutation({
          id: permission._id,
          payload: finalPayload,
        });

        if (res.isError)
          SoftDestructiveSonner("Có lỗi xảy ra khi chỉnh sửa quyền hạn");

        SoftSuccessSonner(res.message);
      } else {
        const res = await createPermissionMutation(finalPayload);

        if (res.isError)
          SoftDestructiveSonner("Có lỗi xảy ra khi Thêm mới quyền hạn");

        SoftSuccessSonner(res.message);
      }
    } catch (error) {
      SoftDestructiveSonner("Có lỗi xảy ra");
      console.log("error handle submit permission: ", error);
    }
  };

  useEffect(() => {
    if (permission) {
      form.reset({
        name: permission.name.vi,
        // Loại bỏ api/ khi đưa vào input để tránh hiển thị thành api/api/users
        apiPath: permission.apiPath.replace(/^api\//, ""),
        method: permission.method,
        module: permission.module,
      });
    }
  }, [permission, form]);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {permission ? "Chỉnh sửa quyền hạn" : "Thêm mới quyền hạn"}
          </DialogTitle>
          <DialogDescription>
            {permission
              ? "Điền đầy đủ thông tin để chỉnh sửa quyền hạn hệ thống"
              : "Điền đầy đủ thông tin để tạo mới quyền hạn hệ thống"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên quyền hạn</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập tên quyền hạn" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="apiPath"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Api path</FormLabel>
                  <FormControl>
                    <div className="relative flex items-center">
                      {/* Tiền tố cố định */}
                      <span className="absolute left-3 text-muted-foreground text-sm font-medium select-none">
                        api/
                      </span>
                      <Input
                        placeholder="users"
                        {...field}
                        // Đẩy padding-left vào để không đè lên chữ api/
                        className="pl-10"
                        onChange={(e) => {
                          let value = e.target.value;
                          // Ngăn người dùng nhập lại api/ nếu họ copy-paste cả cụm
                          if (value.startsWith("api/")) {
                            value = value.replace("api/", "");
                          }
                          field.onChange(value);
                        }}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chọn phương thức</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger id="method" className="mt-2 w-full">
                        <SelectValue placeholder="Chọn phương thức" />
                      </SelectTrigger>
                      <SelectContent>
                        <ScrollArea className="max-h-52">
                          {HTTP_METHODS.map((method) => (
                            <SelectItem key={method} value={method}>
                              {method}
                            </SelectItem>
                          ))}
                        </ScrollArea>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* modules */}
            <FormField
              control={form.control}
              name="module"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chọn module</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger id="module" className="mt-2 w-full">
                        <SelectValue placeholder="Chọn phương thức" />
                      </SelectTrigger>
                      <SelectContent>
                        <ScrollArea>
                          {listModules?.map((module) => {
                            const replaceNameModule = module
                              .replace("Module", "")
                              .toLocaleUpperCase();
                            return (
                              <SelectItem
                                key={replaceNameModule}
                                value={replaceNameModule}
                              >
                                {replaceNameModule}
                              </SelectItem>
                            );
                          })}
                        </ScrollArea>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                ) : permission ? (
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
