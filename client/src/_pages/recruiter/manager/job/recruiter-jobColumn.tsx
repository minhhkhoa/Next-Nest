"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Trash2, MoreVertical, Pen, CheckCheck, CircleX } from "lucide-react";
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
  t: any,
  tCommon: any,
  locale: string,
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
    header: () => <span>{t("JobTitle")}</span>,
    cell: ({ row }) => {
      const titleJob = locale === "vi" ? row.original.title.vi : row.original.title.en || row.original.title.vi;
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
    header: () => <span>{t("Salary")}</span>,
    cell: ({ row }) => {
      const min = row.original.salary.min;
      const max = row.original.salary.max;
      const currency = row.original.salary.currency;
      const loc = locale === "vi" ? "vi-VN" : "en-US";
      return (
        <p className="text-sm font-medium text-foreground">
          {min.toLocaleString(loc)} - {max.toLocaleString(loc)}{" "}
          {currency}
        </p>
      );
    },
  },

  //- ngày tạo và hết hạn
  {
    id: "dates",
    header: t("Dates"),
    cell: ({ row }) => {
      const createdAt = new Date(row.original.createdAt);
      const endDate = new Date(row.original.endDate);
      const loc = locale === "vi" ? "vi-VN" : "en-US";
      return (
        <p className="text-sm font-medium text-foreground">
          {createdAt.toLocaleDateString(loc)} -{" "}
          {endDate.toLocaleDateString(loc)}
        </p>
      );
    },
  },

  //- trạng thái của công việc
  {
    id: "status",
    header: t("Status"),
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
          {status === "active" ? t("Active") : t("Inactive")}
        </span>
      );
    },
  },

  //- cho phép hoạt động isActive
  {
    id: "isActive",
    header: t("IsActive"),
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
          {isActive ? t("Approved") : t("PendingApproval")}
        </span>
      );
    },
  },

  //- Chủ sở hữu
  {
    id: "createdBy",
    header: t("CreatedBy"),
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
    header: t("Actions"),
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
                  {t("Edit")}
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
                  {t("Approve")}
                </div>
              </DropdownMenuItem>
            )}

            {onVerifyJob && !job.isActive && (
              <DropdownMenuItem onClick={() => onVerifyJob(job._id, "REJECT")}>
                <div className="flex gap-3 items-center">
                  <CircleX className="mr-2 h-4 w-4" />
                  {t("Reject")}
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
                  {t("Delete")}
                </div>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export const renderHotBadge = (isHotJob: boolean, hotUntil: Date | null, t?: any) => {
  if (!isHotJob) {
    return (
      <span className="inline-block rounded px-2 py-1 text-xs font-medium bg-muted text-muted-foreground">
        {t ? t("NotHot") : "Chưa hot"}
      </span>
    );
  }

  if (!hotUntil) {
    return (
      <span className="inline-block rounded px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600">
        {t ? t("Expired") : "Hết hạn"}
      </span>
    );
  }

  const remainingDays = Math.ceil(
    (new Date(hotUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );

  if (remainingDays <= 0) {
    return (
      <span className="inline-block rounded px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600">
        {t ? t("Expired") : "Hết hạn"}
      </span>
    );
  }

  return (
    <span className="inline-block rounded px-2 py-1 text-xs font-semibold bg-orange-100 text-orange-800">
      {t ? t("HotRemaining", { days: remainingDays }) : `Hot · ${remainingDays} ngày`}
    </span>
  );
};
