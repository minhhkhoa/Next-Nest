"use client";

import { useState } from "react";
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

export function LoginForm() {
  const { theme } = useTheme();
  console.log("theme", theme);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<LoginBodyType>({
    resolver: zodResolver(LoginBody),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginBodyType) => {
    setIsLoading(true);
    console.log("[v0] Login data:", data);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
  };

  const handleSocialLogin = (provider: "google" | "facebook") => {
    console.log("[v0] Social login with:", provider);
    // Handle social login logic here
  };

  return (
    <Card className="w-full max-w-md shadow-2xl border-border/50">
      <CardHeader className="space-y-2 text-center">
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

            <Button
              type="submit"
              className="w-full select-none" //- select-none: giúp click đúp không bôi text
              disabled={isLoading}
            >
              {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
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

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={() => handleSocialLogin("google")}
            disabled={isLoading}
            className={`w-full ${theme === "dark" ? "hover:!bg-primary" : ""}`}
          >
            <Mail className="mr-2 h-4 w-4" />
            Google
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSocialLogin("facebook")}
            disabled={isLoading}
            className={`w-full ${theme === "dark" ? "hover:!bg-primary" : ""}`}
          >
            <Facebook className="mr-2 h-4 w-4"/>
            Facebook
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Chưa có tài khoản?{" "}
          <a href="#" className="text-primary font-medium hover:underline">
            Đăng ký ngay
          </a>
        </p>
      </CardFooter>
    </Card>
  );
}
