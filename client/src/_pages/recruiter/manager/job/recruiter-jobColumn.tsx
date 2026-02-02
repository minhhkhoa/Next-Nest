"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Trash2, MoreVertical, Pen, RefreshCw, CheckCheck } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { JobResType } from "@/schemasvalidation/job";

export const getRecruiterJobColumns = (
  onEdit?: (job: JobResType) => void,
  onDelete?: (job: JobResType) => void,
  onVerifyJob?: (jobID: string, action: "ACCEPT" | "REJECT") => void,
): ColumnDef<JobResType>[] => [
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

  //- tên công việc
  {
    id: "title",
    header: () => <span>Tên công việc</span>,
    cell: ({ row }) => {
      const titleJob = row.original.title.vi;
      return (
        <p className="text-sm font-medium text-foreground max-w-[200px] whitespace-normal">
          {titleJob}
        </p>
      );
    },
  },

  //- mức lương của công việc
  {
    id: "salary",
    header: () => <span>Mức lương</span>,
    cell: ({ row }) => {
      const min = row.original.salary.min;
      const max = row.original.salary.max;
      const currency = row.original.salary.currency;
      return (
        <p className="text-sm font-medium text-foreground">
          {min.toLocaleString("vi-VN")} - {max.toLocaleString("vi-VN")}{" "}
          {currency}
        </p>
      );
    },
  },

  //- ngày tạo và hết hạn
  {
    id: "dates",
    header: "Ngày tạo / Hết hạn",
    cell: ({ row }) => {
      const createdAt = new Date(row.original.createdAt);
      const endDate = new Date(row.original.endDate);
      return (
        <p className="text-sm font-medium text-foreground">
          {createdAt.toLocaleDateString("vi-VN")} -{" "}
          {endDate.toLocaleDateString("vi-VN")}
        </p>
      );
    },
  },

  //- trạng thái của công việc
  {
    id: "status",
    header: "Trạng thái",
    cell: ({ row }) => {
      const status = row.original.status;

      return (
        <span
          className={`inline-block rounded px-2 py-1 text-xs font-semibold ${
            status === "active"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {status === "active" ? "Hoạt động" : "Dừng hoạt động"}
        </span>
      );
    },
  },

  //- cho phép hoạt động isActive
  {
    id: "isActive",
    header: "Kích hoạt",
    cell: ({ row }) => {
      const isActive = row.original.isActive;
      return (
        <span
          className={`inline-block rounded px-2 py-1 text-xs font-semibold ${
            isActive
              ? "bg-green-100 text-green-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {isActive ? "Được phép" : "Chờ duyệt"}
        </span>
      );
    },
  },

  //- Chủ sở hữu
  {
    id: "createdBy",
    header: "Tạo bởi",
    cell: ({ row }) => {
      const createdBy = row.original.createdBy;
      return (
        <>
          <div>
            <p className="text-sm font-medium text-foreground truncate">
              {createdBy.name}
            </p>
            {createdBy.email}
            <p></p>
          </div>
        </>
      );
    },
  },

  {
    id: "actions",
    header: "Thao tác",
    cell: ({ row }) => {
      const job = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onEdit && (
              <DropdownMenuItem onClick={() => onEdit && onEdit(job)}>
                <div className="flex gap-3 items-center">
                  <Pen className="mr-2 h-4 w-4" />
                  Chỉnh sửa
                </div>
              </DropdownMenuItem>
            )}

            {/* //- nếu có onVerifyJob và job chưa được kích hoạt(isActive === false) thì mới hiển thị nút duyệt bài */}
            {onVerifyJob && !job.isActive && (
              <DropdownMenuItem
                onClick={() => onVerifyJob && onVerifyJob(job._id, "ACCEPT")}
              >
                <div className="flex gap-3 items-center ">
                  <CheckCheck className="mr-2 h-4 w-4 hover:text-white" />
                  Duyệt bài
                </div>
              </DropdownMenuItem>
            )}

            {onDelete && (
              <DropdownMenuItem
                className="hover:!bg-red-500 text-red-500"
                onClick={() => onDelete && onDelete(job)}
              >
                <div className="flex gap-3 items-center ">
                  <Trash2 className="mr-2 h-4 w-4 hover:text-white" />
                  Xóa
                </div>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export const renderHotBadge = (isHotJob: boolean, hotUntil: Date | null) => {
  if (!isHotJob) {
    return (
      <span className="inline-block rounded px-2 py-1 text-xs font-medium bg-muted text-muted-foreground">
        Chưa hot
      </span>
    );
  }

  if (!hotUntil) {
    return (
      <span className="inline-block rounded px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600">
        Hết hạn
      </span>
    );
  }

  const remainingDays = Math.ceil(
    (new Date(hotUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );

  if (remainingDays <= 0) {
    return (
      <span className="inline-block rounded px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600">
        Hết hạn
      </span>
    );
  }

  return (
    <span className="inline-block rounded px-2 py-1 text-xs font-semibold bg-orange-100 text-orange-800">
      Hot · {remainingDays} ngày
    </span>
  );
};
