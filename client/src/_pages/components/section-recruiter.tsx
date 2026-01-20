"use client";

import { useAppStore } from "@/components/TanstackProvider";
import { Separator } from "@/components/ui/separator";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import React from "react";
import { envConfig } from "../../../config";

export default function SectionRecruiter() {
  const { user } = useAppStore();
  const isRecruiter =
    user?.roleCodeName === envConfig.NEXT_PUBLIC_ROLE_RECRUITER;
  const isRecruiterAdmin =
    user?.roleCodeName === envConfig.NEXT_PUBLIC_ROLE_RECRUITER_ADMIN;

  if (isRecruiter || isRecruiterAdmin) {
    return null;
  }

  return (
    <div className="flex">
      {/* vách ngăn thêm màu xám cho nó */}
      <Separator orientation="vertical" className="hidden md:block !h-8" />

      <div className="hidden md:flex flex-col">
        <span className="text-xs">Bạn là nhà tuyển dụng?</span>
        <div className="flex items-center gap-1 text-[15px] hover:text-primary cursor-pointer hover:translate-x-1 transition-all duration-100 ease-out">
          <Link href="/recruiter/welcome">Đăng tuyển ngay</Link>
          <ArrowRight size={15} className="mt-1" />
        </div>
      </div>
    </div>
  );
}
