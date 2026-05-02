"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { useGetActiveAdQuery } from "@/queries/useAdBooking";
import { useGetAdSlotByCode } from "@/queries/useAdSlot";
import { ADHorizontal, ADVertical } from "./ad";
import { cn } from "@/lib/utils";

interface AdSlotRendererProps {
  slotCode: string;
  className?: string;
  showPlaceholder?: boolean;
  forceDismissible?: boolean;
}

/**
 * Component trung tâm xử lý việc hiển thị quảng cáo cho một vị trí (Slot)
 * Tự động lấy dữ liệu booking hiện tại và cấu hình của slot để hiển thị đúng kích thước
 */
export function AdSlotRenderer({
  slotCode,
  className,
  showPlaceholder = true,
  forceDismissible = false,
}: AdSlotRendererProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  //- Lấy cấu hình slot (để lấy width/height)
  const { data: slotRes } = useGetAdSlotByCode(slotCode);
  const slot = slotRes?.data;

  //- Lấy quảng cáo đang chạy
  const { data: adRes, isLoading } = useGetActiveAdQuery(slotCode);
  const activeAd = adRes?.data;

  if (isLoading || isDismissed) return null;

  const isDismissible =
    forceDismissible || (activeAd && activeAd.adType === "DISMISSIBLE");

  //- Hàm render nút đóng
  const renderCloseButton = () => {
    if (!isDismissible) return null;
    return (
      <button
        onClick={(e) => {
          e.preventDefault();
          setIsDismissed(true);
        }}
        className={cn(
          "absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-white text-gray-800 rounded-full shadow-lg transition-all z-10",
          forceDismissible
            ? "opacity-100"
            : "opacity-0 group-hover:opacity-100",
        )}
        title="Đóng quảng cáo"
      >
        <X className="w-4 h-4" />
      </button>
    );
  };

  //- Nếu không có quảng cáo đang chạy, hiển thị Placeholder nếu được yêu cầu
  if (!activeAd) {
    if (!showPlaceholder) return null;

    return (
      <div className={cn("relative group", className)}>
        {renderCloseButton()}
        {slot && slot.height > slot.width ? <ADVertical /> : <ADHorizontal />}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative group overflow-hidden rounded-xl shadow-sm border",
        className,
      )}
      style={{
        width: slot ? `${slot.width}px` : "100%",
        maxWidth: "100%",
        aspectRatio: slot ? `${slot.width} / ${slot.height}` : "auto",
      }}
    >
      {/* Link bao quanh ảnh */}
      <Link
        href={activeAd.targetUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full h-full"
      >
        <Image
          src={activeAd.imageUrl}
          alt={`Advertisement ${slotCode}`}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </Link>

      {/* Nhãn "Quảng cáo" nhỏ */}
      <div className="absolute top-2 left-2 bg-black/40 backdrop-blur-sm text-white text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider pointer-events-none">
        Ad
      </div>

      {/* Nút đóng */}
      {renderCloseButton()}
    </div>
  );
}

//- DẠNG 1: QUẢNG CÁO CỐ ĐỊNH (Inline Banner - Không có nút đóng)
export function AdBannerInline({
  slotCode,
  className,
}: {
  slotCode: string;
  className?: string;
}) {
  //- Ép showPlaceholder = true và không có nút đóng (mặc định của NON_DISMISSIBLE)
  return <AdSlotRenderer slotCode={slotCode} className={className} />;
}

//- DẠNG 2: QUẢNG CÁO CÓ NÚT BẤM (Dismissible / Popup / Overlay)
export function AdOverlayPopup({
  slotCode,
  className,
}: {
  slotCode: string;
  className?: string;
}) {
  //- Hiển thị ở góc màn hình hoặc vị trí nổi bật, có nút đóng
  return (
    <AdSlotRenderer
      slotCode={slotCode}
      forceDismissible={true}
      className={cn(
        "fixed bottom-4 left-4 z-50 max-w-[90vw] md:max-w-[400px] animate-in slide-in-from-left duration-500",
        className,
      )}
    />
  );
}

//- DẠNG 3: QUẢNG CÁO TIÊU CHUẨN (Tự động nhận diện theo cấu hình booking)
export function AdStandard({
  slotCode,
  className,
}: {
  slotCode: string;
  className?: string;
}) {
  return <AdSlotRenderer slotCode={slotCode} className={className} />;
}
