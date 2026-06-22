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
import { useTranslations } from "next-intl";

export default function ChangePasswordForm() {
  const t = useTranslations("Auth");
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
        SoftSuccessSonner(t("ChangePasswordSuccess"));
        form.reset();
      } else {
        if (
          result.data?.message === "Mật khẩu hiện tại bạn nhập không chính xác" ||
          result.data?.message === "The current password you entered is incorrect"
        ) {
          form.setError("currentPassword", {
            message: t("CurrentPasswordIncorrect"),
          });
        } else {
          form.setError("currentPassword", {
            message: result.data?.message || t("CurrentPasswordIncorrect"),
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
        <CardTitle className="pt-2">{t("ChangePassword")}</CardTitle>
        <CardDescription>
          {t("ChangePasswordDesc")}
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
                  <FormLabel>{t("CurrentPasswordLabel")}</FormLabel>
                  <Input
                    type="password"
                    placeholder={t("CurrentPasswordPlaceholder")}
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
                  <FormLabel>{t("NewPassword")}</FormLabel>
                  <Input
                    type="password"
                    placeholder={t("NewPasswordPlaceholder")}
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
                  <FormLabel>{t("ConfirmNewPassword")}</FormLabel>
                  <Input
                    type="password"
                    placeholder={t("ConfirmPasswordPlaceholder")}
                    disabled={isPending}
                    {...field}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? t("Processing") : t("ChangePassword")}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
