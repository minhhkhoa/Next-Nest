"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import React from "react";

export default function UserSection() {
  const router = useRouter();

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          className="hidden md:block"
          onClick={() => router.push("/register")}
        >
          Đăng ký
        </Button>
        <Button onClick={() => router.push("/login")}>Đăng nhập</Button>
      </div>
    </>
  );
}
