"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Layout, Clock, Monitor, Plus } from "lucide-react";
import { AdSlotResType } from "@/schemasvalidation/adSlot";

interface AdSlotCardProps {
  slot: AdSlotResType;
  onSelect: (slot: AdSlotResType) => void;
}

export default function AdSlotCard({ slot, onSelect }: AdSlotCardProps) {
  return (
    <Card className="overflow-hidden border-2 hover:border-primary/50 transition-all group flex flex-col shadow-sm hover:shadow-md">
      <div className="h-40 bg-muted relative overflow-hidden flex items-center justify-center p-4 border-b">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/20 group-hover:opacity-100 transition-opacity" />
        <div className="relative z-10 text-center space-y-2">
          <Layout className="w-10 h-10 mx-auto text-primary opacity-40 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-mono text-muted-foreground bg-white/80 px-2 py-0.5 rounded border">
            {slot.width} x {slot.height} px
          </span>
        </div>
      </div>

      <CardHeader>
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-lg group-hover:text-primary transition-colors">
            {slot.name}
          </CardTitle>
          <Badge
            variant="secondary"
            className="bg-primary/10 text-primary border-none shrink-0"
          >
            {slot.page === "HOME" ? "Trang chủ" : slot.page}
          </Badge>
        </div>
        <CardDescription className="line-clamp-2">
          Vị trí hiển thị nổi bật giúp doanh nghiệp tiếp cận ứng viên tiềm năng
          nhanh chóng.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-primary">
            {slot.pricePerDay.toLocaleString("vi-VN")}
          </span>
          <span className="text-xs text-muted-foreground font-medium">
            VND / ngày
          </span>
        </div>

        <div className="space-y-2 pt-2 border-t text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            Tối đa {slot.maxDurationDays} ngày
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Monitor className="w-4 h-4" />
            Hỗ trợ: {slot.adModeAllowed}
          </div>
        </div>
      </CardContent>

      <CardFooter className="pb-4">
        <Button
          onClick={() => onSelect(slot)}
          className="w-full group-hover:shadow-lg transition-all gap-2"
        >
          <Plus className="w-4 h-4" /> Chọn vị trí này
        </Button>
      </CardFooter>
    </Card>
  );
}
