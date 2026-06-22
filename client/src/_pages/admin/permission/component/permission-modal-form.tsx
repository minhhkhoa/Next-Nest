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
import { useCreatePermission, useUpdatePermission } from "@/queries/usePermission";
import SoftDestructiveSonner from "@/components/shadcn-studio/sonner/SoftDestructiveSonner";
import SoftSuccessSonner from "@/components/shadcn-studio/sonner/SoftSuccessSonner";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("Admin.Permission");
  const tButtons = useTranslations("Common.Buttons");
  const form = useForm<PermissionCreateType>({
    resolver: zodResolver(permissionCreate),
    defaultValues: {
      name: "",
      code: "",
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
    const cleanPath = values.apiPath.replace(/^\//, "");
    const finalPayload = {
      ...values,
      apiPath: `/api/${cleanPath}`,
    };
    
    try {
      if (permission) {
        const res = await updatePermissionMutation({
          id: permission._id,
          payload: finalPayload,
        });

        if (res.isError)
          SoftDestructiveSonner(t("UpdateError"));

        SoftSuccessSonner(res.message);
      } else {
        const res = await createPermissionMutation(finalPayload);

        if (res.isError)
          SoftDestructiveSonner(t("CreateError"));

        SoftSuccessSonner(res.message);
      }
    } catch (error) {
      SoftDestructiveSonner(t("GeneralError"));
      console.log("error handle submit permission: ", error);
    }
  };

  useEffect(() => {
    if (permission) {
      form.reset({
        name: permission.name?.vi ?? "",
        code: permission.code ?? "",
        // Loại bỏ tiền tố /api/ hoặc api/ khi đưa vào ô Input để người dùng nhập tiếp
        apiPath: (permission.apiPath ?? "").replace(/^\/?api\//, ""),
        method: permission.method ?? "GET",
        module: permission.module ?? "",
      });
    }
  }, [permission, form]);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {permission ? t("EditTitle") : t("CreateTitle")}
          </DialogTitle>
          <DialogDescription>
            {permission ? t("EditDesc") : t("CreateDesc")}
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
                  <FormLabel>{t("PermissionName")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("PermissionNamePlaceholder")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("PermissionCode")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("PermissionCodePlaceholder")} {...field} />
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
                  <FormLabel>{t("ApiPath")}</FormLabel>
                  <FormControl>
                    <div className="relative flex items-center">
                      {/* Đổi thành /api/ */}
                      <span className="absolute left-3 text-muted-foreground text-sm font-medium select-none">
                        /api/
                      </span>
                      <Input
                        placeholder="users"
                        {...field}
                        // Tăng padding left lên một chút vì có thêm dấu /
                        className="pl-12"
                        onChange={(e) => {
                          let value = e.target.value;
                          // Xử lý nếu người dùng paste cả link vào
                          if (value.startsWith("/api/")) {
                            value = value.replace("/api/", "");
                          } else if (value.startsWith("api/")) {
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
                  <FormLabel>{t("SelectMethod")}</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger id="method" className="mt-2 w-full">
                        <SelectValue placeholder={t("SelectMethod")} />
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
                  <FormLabel>{t("SelectModule")}</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger id="module" className="mt-2 w-full">
                        <SelectValue placeholder={t("SelectModule")} />
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
                {tButtons("cancel")}
              </Button>
              <Button type="submit">
                {isCreating || isUpdating ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4 animate-spin" />
                    {t("Processing")}
                  </>
                ) : permission ? (
                  tButtons("update")
                ) : (
                  tButtons("create")
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
