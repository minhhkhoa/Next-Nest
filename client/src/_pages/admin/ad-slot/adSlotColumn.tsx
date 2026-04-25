"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  MoreVertical,
  Pen,
  Trash2,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { AdSlotResType } from "@/schemasvalidation/adSlot";

//- Map page enum sang text tiếng Việt
const PAGE_LABEL: Record<string, string> = {
  HOME: "Trang chủ",
  JOB_DETAIL: "Chi tiết việc làm",
  COMPANY_DETAIL: "Chi tiết công ty",
};

//- Map adModeAllowed sang text
const MODE_LABEL: Record<string, string> = {
  NON_DISMISSIBLE: "Cố định",
  DISMISSIBLE: "Có nút đóng",
  BOTH: "Cả hai",
};

//- Map adModeAllowed sang màu badge
const MODE_COLOR: Record<string, string> = {
  NON_DISMISSIBLE: "bg-blue-100 text-blue-800",
  DISMISSIBLE: "bg-purple-100 text-purple-800",
  BOTH: "bg-teal-100 text-teal-800",
};

export const getAdSlotColumns = (
  onEdit?: (slot: AdSlotResType) => void,
  onDelete?: (slot: AdSlotResType) => void,
  onToggleActive?: (slot: AdSlotResType) => void,
  onRestore?: (slot: AdSlotResType) => void,
): ColumnDef<AdSlotResType>[] => [
  //- Mã slot
  {
    id: "code",
    header: () => <span className="font-semibold">Mã slot</span>,
    cell: ({ row }) => (
      <span className="font-mono font-semibold text-primary text-sm">
        {row.original.code}
      </span>
    ),
  },

  //- Tên hiển thị
  {
    id: "name",
    header: () => <span className="font-semibold">Tên vị trí</span>,
    cell: ({ row }) => (
      <p className="text-sm text-foreground max-w-[200px] whitespace-normal font-medium">
        {row.original.name}
      </p>
    ),
  },

  //- Trang
  {
    id: "page",
    header: () => <span className="font-semibold">Trang hiển thị</span>,
    cell: ({ row }) => (
      <span className="inline-block rounded px-2 py-1 text-xs font-medium bg-slate-100 text-slate-700">
        {PAGE_LABEL[row.original.page] ?? row.original.page}
      </span>
    ),
  },

  //- Chế độ quảng cáo
  {
    id: "adModeAllowed",
    header: () => <span className="font-semibold">Loại QC</span>,
    cell: ({ row }) => {
      const mode = row.original.adModeAllowed;
      return (
        <span
          className={`inline-block rounded px-2 py-1 text-xs font-semibold ${
            MODE_COLOR[mode] ?? "bg-gray-100 text-gray-700"
          }`}
        >
          {MODE_LABEL[mode] ?? mode}
        </span>
      );
    },
  },

  //- Kích thước
  {
    id: "size",
    header: () => <span className="font-semibold">Kích thước</span>,
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground font-mono">
        {row.original.width}×{row.original.height}px
      </span>
    ),
  },

  //- Giá / ngày
  {
    id: "pricePerDay",
    header: () => <span className="font-semibold">Giá/ngày</span>,
    cell: ({ row }) => (
      <span className="text-sm font-semibold text-emerald-600">
        {row.original.pricePerDay.toLocaleString("vi-VN")}đ
      </span>
    ),
  },

  //- Số ngày tối đa
  {
    id: "maxDurationDays",
    header: () => <span className="font-semibold">Tối đa</span>,
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">
        {row.original.maxDurationDays} ngày
      </span>
    ),
  },

  //- Trạng thái active
  {
    id: "isActive",
    header: () => <span className="font-semibold">Kích hoạt</span>,
    cell: ({ row }) => {
      const isActive = row.original.isActive;
      return (
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
            isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              isActive ? "bg-green-500" : "bg-red-500"
            }`}
          />
          {isActive ? "Đang mở" : "Đã tắt"}
        </span>
      );
    },
  },

  //- Thao tác
  {
    id: "actions",
    header: () => <span className="font-semibold">Thao tác</span>,
    cell: ({ row }) => {
      const slot = row.original;
      const isDeleted = slot.isDeleted;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Mở menu</span>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {!isDeleted && (
              <>
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(slot)}>
                    <div className="flex items-center gap-2">
                      <Pen className="h-4 w-4" />
                      Chỉnh sửa
                    </div>
                  </DropdownMenuItem>
                )}

                {onToggleActive && (
                  <DropdownMenuItem onClick={() => onToggleActive(slot)}>
                    <div className="flex items-center gap-2">
                      {slot.isActive ? (
                        <ToggleLeft className="h-4 w-4 text-orange-500" />
                      ) : (
                        <ToggleRight className="h-4 w-4 text-green-500" />
                      )}
                      {slot.isActive ? "Tắt slot" : "Bật slot"}
                    </div>
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />

                {onDelete && (
                  <DropdownMenuItem
                    className="hover:!bg-red-500 text-red-500"
                    onClick={() => onDelete(slot)}
                  >
                    <div className="flex items-center gap-2">
                      <Trash2 className="h-4 w-4" />
                      Xóa slot
                    </div>
                  </DropdownMenuItem>
                )}
              </>
            )}

            {isDeleted && onRestore && (
              <DropdownMenuItem
                className="hover:!bg-yellow-500 text-yellow-600"
                onClick={() => onRestore(slot)}
              >
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Khôi phục
                </div>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
