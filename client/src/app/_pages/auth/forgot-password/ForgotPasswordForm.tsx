"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Vui lòng nhập email");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      // if (!response.ok) {
      //   toast({
      //     title: "Lỗi",
      //     description: data.message || "Email không tồn tại trong hệ thống",
      //     variant: "destructive",
      //   });
      //   return;
      // }

      // toast({
      //   title: "Thành công",
      //   description:
      //     "Chúng tôi đã gửi liên kết đặt lại mật khẩu đến email của bạn",
      //   variant: "default",
      // });

      setEmail("");
    } catch (error) {
      // toast({
      //   title: "Lỗi",
      //   description: "Có lỗi xảy ra. Vui lòng thử lại sau",
      //   variant: "destructive",
      // });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-foreground">
          Email
        </label>
        <Input
          id="email"
          type="email"
          placeholder="Nhập email của bạn"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          className="w-full"
        />
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Đang xử lý...
          </>
        ) : (
          "Xác nhận"
        )}
      </Button>

      <div className="flex justify-between">
        <a href="/login" className="text-sm text-white hover:text-primary">
          Quay lại đăng nhập
        </a>
        <a href="/register" className="text-sm text-white hover:text-primary">
          Đăng ký tài khoản mới
        </a>
      </div>
    </form>
  );
}
