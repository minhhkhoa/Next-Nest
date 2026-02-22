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
import { Eye, EyeClosed } from "lucide-react";
import { RegisterBody, RegisterBodyType } from "@/schemasvalidation/auth";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  useLogoutMutation,
  useRecruiterRegisterMutation,
} from "@/queries/useAuth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAppStore } from "@/components/TanstackProvider";
import { useQueryClient } from "@tanstack/react-query";
import { removeTokensFromLocalStorage } from "@/lib/utils";
import Link from "next/link";

export default function RecruiterRegisterForm() {
  const { setLogin } = useAppStore();
  const { mutateAsync: mutationLogout } = useLogoutMutation();
  const queryClient = useQueryClient();

  const [isClient, setIsClient] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { isPending, mutateAsync: recruiterRegisterMutation } =
    useRecruiterRegisterMutation();
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
      const res = await recruiterRegisterMutation(data);
      if (res.isError) return;

      toast.success(() => (
        <div className="flex items-center justify-center">
          <p>Chúc mừng bạn đã đăng ký tài khoản nhà tuyển dụng thành công🎇</p>

          <Button
            variant={"outline"}
            onClick={handleLogout}
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

  const onResetField = () => {
    form.resetField("name");
    form.resetField("email");
    form.resetField("password");
  };

  const handleLogout = async () => {
    try {
      const res = await mutationLogout();
      if (res.isError) return;

      removeTokensFromLocalStorage();
      setLogin(false);

      queryClient.removeQueries({ queryKey: ["profile"] });

      router.push("/login");
      router.refresh();
    } catch (error) {
      console.log("error logout: ", error);
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
      <CardHeader className="space-y-2 text-center">
        <CardTitle className="text-3xl font-bold tracking-tight pt-2">
          Đăng ký làm nhà tuyển dụng
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
      </CardContent>
      <CardFooter className="flex justify-center pb-2">
        <p className="text-sm text-muted-foreground">
          Bạn đã có tài khoản?{" "}
          <Link
            href="/login"
            onClick={handleLogout}
            className="text-primary font-medium hover:underline"
          >
            Đăng nhập ngay
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
