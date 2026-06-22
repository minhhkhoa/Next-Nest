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
import { Link } from "@/i18n/navigation";
import SoftSuccessSonner from "@/components/shadcn-studio/sonner/SoftSuccessSonner";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("Auth");
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const email = params.get("email") ?? "";

  const { data: validateResetPassword, isLoading } = useValidateResetPassword(
    token,
    email,
  );
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
        <Loader2 className="animate-spin mr-2" /> {t("VerifyToken")}
      </div>
    );
  }

  if (!validateResetPassword?.data?.valid) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <div className="text-center text-red-500">
          {t("InvalidToken")}
        </div>
        {/* quay veef login */}
        <div className="mt-4">
          <Link href="/login">
            <i className="hover:text-primary">{t("Login")}</i>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-md shadow-2xl border-border/50">
      <CardHeader>
        <CardTitle>{t("CreateNewPassword")}</CardTitle>
        <CardDescription>
          {t("ResetPasswordDesc")}
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
                  <FormLabel>{t("NewPassword")}</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={t("EnterNewPassword")}
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
                  <FormLabel>{t("ConfirmNewPassword")}</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={t("EnterConfirmPassword")}
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
                  {t("Processing")}
                </>
              ) : (
                t("ResetPassword")
              )}
            </Button>
          </form>
        </Form>

        <div className="text-center mt-4">
          <Link href="/login" className="text-sm text-primary hover:underline">
            {t("BackToLogin")}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
