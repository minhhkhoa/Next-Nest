"use client";

import { useAppStore } from "@/components/TanstackProvider";
import { Separator } from "@/components/ui/separator";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import React from "react";
import { envConfig } from "../../../config";

export default function SectionRecruiter() {
  const { user } = useAppStore();

  //- ngăn nháy vì server không biết biến user nên nó sẽ show bạn là nhà tuyển dụng
  //- và khi hydrat thì thấy có user và vi phạm if isRecruiter nên tắt ==> Nháy
  if (!user?._id) {
    return null;
  }

  const isCandidate =
    user?.roleCodeName === envConfig.NEXT_PUBLIC_ROLE_CANDIDATE;

  //- các role khác thì không hiện | guest thì bị chắn trước đó rồi
  if (!isCandidate) {
    return null;
  }

  //- chỉ hiện nếu là candidate
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
