"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChangePasswordInput,
  changePasswordSchema,
} from "@/schemasvalidation/auth";
import { useAppStore } from "@/components/TanstackProvider";
import { useChangePassword } from "@/queries/useAuth";
import SoftSuccessSonner from "@/components/shadcn-studio/sonner/SoftSuccessSonner";

export default function ChangePasswordForm() {
  const { user } = useAppStore();
  const { mutateAsync: changePassword, isPending } = useChangePassword();

  const form = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: ChangePasswordInput) {
    try {
      const result = await changePassword({
        userID: user._id,
        oldPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      if (result.isOk) {
        SoftSuccessSonner(result.message);
        form.reset();
      } else {
        if (
          result.data?.message === "Mật khẩu hiện tại bạn nhập không chính xác"
        ) {
          form.setError("currentPassword", {
            message: result.data.message,
          });
        }
      }
    } catch (error) {
      console.log("error change password: ", error);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="pt-2">Đổi mật khẩu</CardTitle>
        <CardDescription>
          Cập nhật mật khẩu của bạn để bảo mật tài khoản
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mật khẩu hiện tại</FormLabel>
                  <Input
                    type="password"
                    placeholder="Nhập mật khẩu hiện tại"
                    disabled={isPending}
                    {...field}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mật khẩu mới</FormLabel>
                  <Input
                    type="password"
                    placeholder="Nhập mật khẩu mới (ít nhất 8 ký tự)"
                    disabled={isPending}
                    {...field}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Xác nhận mật khẩu mới</FormLabel>
                  <Input
                    type="password"
                    placeholder="Nhập lại mật khẩu mới"
                    disabled={isPending}
                    {...field}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Đang xử lý..." : "Đổi mật khẩu"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
