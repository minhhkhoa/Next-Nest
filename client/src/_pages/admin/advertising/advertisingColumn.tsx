"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import {
  MoreVertical,
  Eye,
  XCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { AdBookingResType } from "@/schemasvalidation/adBooking";
import { Badge } from "@/components/ui/badge";

export const getAdvertisingColumns = (
  onViewDetail?: (booking: AdBookingResType) => void,
  onCancelBooking?: (booking: AdBookingResType) => void,
): ColumnDef<AdBookingResType>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "_id",
    header: () => <span className="!ml-5">Mã Booking</span>,
    cell: ({ row }) => {
      return (
        <span className="text-xs font-medium !ml-5">
          {row.original._id.substring(row.original._id.length - 8).toUpperCase()}
        </span>
      );
    },
  },
  {
    id: "slotCode",
    header: "Vị trí",
    cell: ({ row }) => {
      return <Badge variant="secondary">{row.original.slotCode}</Badge>;
    },
  },
  {
    id: "duration",
    header: "Thời gian",
    cell: ({ row }) => {
      const start = new Date(row.original.startAt);
      const end = new Date(row.original.endAt);
      return (
        <span className="text-sm whitespace-nowrap">
          {format(start, "dd/MM/yyyy")} - {format(end, "dd/MM/yyyy")}
        </span>
      );
    },
  },
  {
    id: "company",
    header: "Khách hàng",
    cell: ({ row }) => {
      const company = row.original.companyId as any;
      return (
        <div className="truncate max-w-[150px] text-sm">
          {company?.name || "N/A"}
        </div>
      );
    },
  },
  {
    id: "status",
    header: "Trạng thái",
    cell: ({ row }) => {
      const status = row.original.status;
      switch (status) {
        case 'PENDING_PAYMENT':
          return <Badge variant="outline" className="text-yellow-600 bg-yellow-50 border-yellow-200">Chờ thanh toán</Badge>;
        case 'SCHEDULED':
          return <Badge variant="outline" className="text-blue-600 bg-blue-50 border-blue-200">Đã xếp lịch</Badge>;
        case 'RUNNING':
          return <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">Đang chạy</Badge>;
        case 'COMPLETED':
          return <Badge variant="outline" className="text-gray-600 bg-gray-50 border-gray-200">Hoàn thành</Badge>;
        case 'CANCELLED':
          return <Badge variant="outline" className="text-red-600 bg-red-50 border-red-200">Đã hủy</Badge>;
        case 'EXPIRED':
          return <Badge variant="outline" className="text-orange-600 bg-orange-50 border-orange-200">Hết hạn</Badge>;
        default:
          return <Badge variant="outline">{status}</Badge>;
      }
    },
  },
  {
    id: "actions",
    header: "Thao tác",
    cell: ({ row }) => {
      const booking = row.original;
      const status = row.original.status;
      const canCancel = status !== "CANCELLED" && status !== "EXPIRED" && status !== "COMPLETED";

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onViewDetail && (
              <DropdownMenuItem onClick={() => onViewDetail(booking)}>
                <div className="flex gap-3 items-center">
                  <Eye className="mr-2 h-4 w-4" />
                  Xem chi tiết
                </div>
              </DropdownMenuItem>
            )}

            {canCancel && onCancelBooking && (
              <DropdownMenuItem
                className="hover:!bg-red-500 text-red-500"
                onClick={() => onCancelBooking(booking)}
              >
                <div className="flex gap-3 items-center ">
                  <XCircle className="mr-2 h-4 w-4 hover:text-white" />
                  Hủy đơn
                </div>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
