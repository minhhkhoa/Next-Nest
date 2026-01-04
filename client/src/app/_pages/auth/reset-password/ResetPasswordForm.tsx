"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useSearchParams } from "next/navigation";
import { useResetPassword, useValidateResetPassword } from "@/queries/useAuth";
import Link from "next/link";
import SoftSuccessSonner from "@/components/shadcn-studio/sonner/SoftSuccessSonner";

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
    confirmPassword: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu không trùng khớp",
    path: ["confirmPassword"],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordForm() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const email = params.get("email") ?? "";

  const { data, isLoading } = useValidateResetPassword(token, email);
  const { mutateAsync: resetPassword } = useResetPassword();

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: ResetPasswordFormValues) => {
    try {
      console.log("Resetting password with:", values);
      const res = await resetPassword({
        token,
        email,
        newPassword: values.password,
      });

      if (res.isError) return;

      SoftSuccessSonner(res.message);

      form.reset();
    } catch (error) {
      console.log("error: ", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin mr-2" /> Đang kiểm tra token...
      </div>
    );
  }

  if (!data?.data?.valid) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <div className="text-center text-red-500">
          Token không hợp lệ hoặc đã hết hạn.
        </div>
        {/* quay veef login */}
        <div className="mt-4">
          <Link href="/login">
            <i className="hover:text-primary">Đăng nhập</i>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-md shadow-2xl border-border/50">
      <CardHeader>
        <CardTitle>Tạo mật khẩu mới</CardTitle>
        <CardDescription>
          Nhập mật khẩu mới của bạn. Mật khẩu phải có ít nhất 8 ký tự.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mật khẩu mới</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Nhập mật khẩu mới"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nhập lại mật khẩu</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Nhập lại mật khẩu mới"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                "Đặt lại mật khẩu"
              )}
            </Button>
          </form>
        </Form>

        <div className="text-center mt-4">
          <a href="/login" className="text-sm text-primary hover:underline">
            Quay lại đăng nhập
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
