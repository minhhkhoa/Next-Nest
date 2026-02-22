"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Facebook, Mail, Eye, EyeClosed } from "lucide-react";
import { LoginBody, LoginBodyType } from "@/schemasvalidation/auth";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useTheme } from "next-themes";
import { useLoginMutation } from "@/queries/useAuth";
import { setAccessTokenToLocalStorage } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/components/TanstackProvider";
import Link from "next/link";
import SoftSuccessSonner from "@/components/shadcn-studio/sonner/SoftSuccessSonner";
import SoftDestructiveSonner from "@/components/shadcn-studio/sonner/SoftDestructiveSonner";
import { envConfig } from "../../../../config";

export default function LoginForm() {
  const { setLogin } = useAppStore();
  const [isClient, setIsClient] = useState(false);
  const { theme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const { isPending, mutateAsync: loginMutation } = useLoginMutation();
  const form = useForm<LoginBodyType>({
    resolver: zodResolver(LoginBody),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const router = useRouter();

  const onSubmit = async (data: LoginBodyType) => {
    try {
      const result = await loginMutation(data);
      if (result.statusCode === 201) {
        const access_token = result?.data?.access_token as string;

        //- ghi vao localStorage
        setAccessTokenToLocalStorage(access_token);
        setLogin(true);

        //- chuyen trang
        router.push("/");
        SoftSuccessSonner("Đăng nhập thành công!");
      }
    } catch (error) {
      console.log("error login: ", error);
    }
  };

  const handleSocialLogin = (provider: "google" | "facebook") => {
    const width = 600;
    const height = 700;
    const left = window.screenX + (window.innerWidth - width) / 2;
    const top = window.screenY + (window.innerHeight - height) / 2;

    const popup = window.open(
      `${envConfig.NEXT_PUBLIC_API_URL_SERVER}/auth/${provider}`,
      "SocialLogin",
      `width=${width},height=${height},left=${left},top=${top}`
    );

    if (popup) {
      const handleMessage = (event: MessageEvent) => {
        // 1. Chuyển "http://localhost:2302/api" thành "http://localhost:2302"
        const serverOrigin = new URL(envConfig.NEXT_PUBLIC_API_URL_SERVER)
          .origin;

        // 2. So sánh origin chuẩn
        if (event.origin !== serverOrigin) {
          console.warn(
            "Origin không khớp:",
            event.origin,
            "kỳ vọng:",
            serverOrigin
          );
          return;
        }

        const { token, error } = event.data;

        if (token) {
          setAccessTokenToLocalStorage(token);

          // Xử lý dọn dẹp
          popup.close();
          window.removeEventListener("message", handleMessage);

          // Cập nhật trạng thái và điều hướng
          setLogin(true);
          router.push("/");
          SoftSuccessSonner(`Đăng nhập với ${provider} thành công!`);
        }

        if (error) {
          console.log("error: ", error);
          popup.close();
          window.removeEventListener("message", handleMessage);
          SoftDestructiveSonner(error);
        }
      };
      window.addEventListener("message", handleMessage);
    }
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    //- do dùng theme trong button mà ở next-server không có theme nên nó báo lỗi
    return null;
  }

  return (
    <Card className="w-full max-w-md shadow-2xl border-border/50">
      <CardHeader className="space-y-2 text-center pt-2">
        <CardTitle className="text-3xl font-bold tracking-tight">
          Đăng nhập
        </CardTitle>
        <CardDescription className="text-base">
          Nhập thông tin của bạn để tiếp tục
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
            noValidate
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="example@gmail.com"
                      {...field}
                      autoFocus
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="relative">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="absolute top-8 right-4 flex items-center text-muted-foreground">
                {showPassword ? (
                  <EyeClosed
                    className="cursor-pointer"
                    onClick={() => setShowPassword(false)}
                    size={18}
                  />
                ) : (
                  <Eye
                    className="cursor-pointer"
                    onClick={() => setShowPassword(true)}
                    size={18}
                  />
                )}
              </div>
            </div>

            {/* quên mật khẩu */}
            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-sm text-muted-foreground hover:text-primary"
              >
                Quên mật khẩu?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full select-none" //- select-none: giúp click đúp không bôi text
              disabled={isPending}
            >
              {isPending ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>
          </form>
        </Form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              Hoặc tiếp tục với
            </span>
          </div>
        </div>

        {/* clg ra theme */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={() => handleSocialLogin("google")}
            disabled={isPending}
            className={`w-full ${theme === "dark" ? "hover:!bg-primary" : ""}`}
          >
            <Mail className="mr-2 h-4 w-4" />
            Google
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSocialLogin("facebook")}
            disabled={isPending}
            className={`w-full ${theme === "dark" ? "hover:!bg-primary" : ""}`}
          >
            <Facebook className="mr-2 h-4 w-4" />
            Facebook
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center pb-2">
        <p className="text-sm text-muted-foreground">
          Bạn chưa có tài khoản?{" "}
          <a
            href="/register"
            className="text-primary font-medium hover:underline"
          >
            Đăng ký ngay
          </a>
        </p>
      </CardFooter>
    </Card>
  );
}
