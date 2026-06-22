"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Trash2, MoreVertical, Pen, RefreshCw } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { JobResType } from "@/schemasvalidation/job";

export const getJobColumns = (
  t: any,
  tCommon: any,
  locale: string,
  onEdit?: (job: JobResType) => void,
  onDelete?: (job: JobResType) => void,
  onRestoreJob?: (jobID: string) => void,
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

  //- cty
  {
    id: "nameCompany",
    header: () => <span className="!ml-5">{t("CompanyName")}</span>,
    cell: ({ row }) => {
      const nameCompany = row?.original?.company?.name;
      const mst = row?.original?.company?.taxCode;
      return (
        <div>
          <p className="text-sm font-medium truncate max-w-[180px]">
            {nameCompany}
          </p>
          <p className="text-sm">{mst ? `(MST: ${mst})` : ""}</p>
        </div>
      );
    },
  },

  //- tên job
  {
    id: "title",
    header: () => <span className="!ml-5">{t("JobTitle")}</span>,
    cell: ({ row }) => {
      return (
        <span className="block text-sm text-foreground truncate max-w-[200px] !ml-5">
          {locale === "vi" ? row.original.title.vi : row.original.title.en || row.original.title.vi}
        </span>
      );
    },
  },

  //- trạng thái job
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

  //- isHot
  {
    id: "isHot",
    header: t("Hot"),
    cell: ({ row }) => {
      const { isHotJob, hotUntil } = row.original.isHot;
      return renderHotBadge(isHotJob, hotUntil, t);
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

            {onRestoreJob && (
              <DropdownMenuItem
                className="hover:!bg-yellow-500 text-yellow-500"
                onClick={() => onRestoreJob && onRestoreJob(job._id)}
              >
                <div className="flex gap-3 items-center ">
                  <RefreshCw className="mr-2 h-4 w-4 hover:text-white" />
                  {t("Restore")}
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
