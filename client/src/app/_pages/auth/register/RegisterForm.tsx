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
import { RegisterBody, RegisterBodyType } from "@/schemasvalidation/auth";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useTheme } from "next-themes";
import { useRegisterMutation } from "@/queries/useAuth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { envConfig } from "../../../../../config";
import { setAccessTokenToLocalStorage } from "@/lib/utils";
import { useAppStore } from "@/components/TanstackProvider";

export default function RegisterForm() {
  const { setLogin } = useAppStore();
  const [isClient, setIsClient] = useState(false);
  const { theme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const { isPending, mutateAsync: registerMutation } = useRegisterMutation();
  const form = useForm<RegisterBodyType>({
    resolver: zodResolver(RegisterBody),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });
  const router = useRouter();

  const onSubmit = async (data: RegisterBodyType) => {
    try {
      const res = await registerMutation(data);
      if (res.isError) return;

      toast.success(() => (
        <div className="flex items-center justify-center">
          <p>Chúc mừng bạn đã đăng ký tài khoản thành công🎇</p>

          <Button
            variant={"outline"}
            onClick={() => router.push("/login")}
            className="!text-white"
          >
            Đăng nhập
          </Button>
        </div>
      ));
    } catch (error) {
      console.log("error: ", error);
    } finally {
      onResetField();
    }
  };

  const handleSocialLogin = (provider: "google" | "facebook") => {
    const width = 600;
    const height = 700;
    const left = window.screenX + (window.innerWidth - width) / 2;
    const top = window.screenY + (window.innerHeight - height) / 2;

    const popup = window.open(
      `${envConfig.NEXT_PUBLIC_API_URL}/auth/${provider}`,
      "SocialLogin",
      `width=${width},height=${height},left=${left},top=${top}`
    );

    if (popup) {
      const handleMessage = (event: MessageEvent) => {
        if (event.origin !== envConfig.NEXT_PUBLIC_API_URL) return;
        const { token, error } = event.data;

        if (token) {
          console.log("[OAuth] Received token:", token);
          setAccessTokenToLocalStorage(token);
          popup.close();
          window.removeEventListener("message", handleMessage);
          setLogin(true);

          //- chuyen trang
          router.push("/");
          toast.success(`Đăng nhập với ${provider} thành công!`);
        }

        if (error) {
          console.log("error: ", error);
          popup.close();
          window.removeEventListener("message", handleMessage);
          toast.error(error);
        }
      };
      window.addEventListener("message", handleMessage);
    }
  };

  const onResetField = () => {
    form.resetField("name");
    form.resetField("email");
    form.resetField("password");
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
      <CardHeader className="space-y-2 text-center">
        <CardTitle className="text-3xl font-bold tracking-tight">
          Đăng ký
        </CardTitle>
        <CardDescription className="text-base">
          Nhập thông tin của bạn để hoàn tất đăng ký tài khoản
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên</FormLabel>
                  <FormControl>
                    <Input placeholder="Nguyễn Văn A" {...field} autoFocus />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="example@gmail.com" {...field} />
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

            <Button
              type="submit"
              className="w-full select-none" //- select-none: giúp click đúp không bôi text
              disabled={isPending}
            >
              {isPending ? "Đang đăng ký..." : "Đăng ký"}
            </Button>
          </form>
        </Form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              Hoặc đăng ký với
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
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Bạn đã có tài khoản?{" "}
          <a href="/login" className="text-primary font-medium hover:underline">
            Đăng nhập ngay
          </a>
        </p>
      </CardFooter>
    </Card>
  );
}
