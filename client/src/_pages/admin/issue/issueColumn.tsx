"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Trash2, MoreVertical, Pen } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { IssueResType } from "@/schemasvalidation/issue";

export const getIssueColumns = (
  onEdit: (issue: IssueResType) => void,
  onDelete: (issue: IssueResType) => void,
): ColumnDef<IssueResType>[] => [
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
  // NAME
  {
    id: "name",
    header: () => <span className="!ml-5">Tên vấn đề</span>,
    cell: ({ row }) => {
      const nameIssue = row.original.title.vi;
      return (
        <span className="text-sm text-foreground truncate max-w-[180px] !ml-5">
          {nameIssue}
        </span>
      );
    },
  },

  // ADDRESS
  {
    id: "description",
    header: "Mô tả vấn đề",
    cell: ({ row }) => {
      const description = row.original.description;

      return (
        <span className="inline-block rounded max-w-[350px] whitespace-normal truncate text-foreground">
          {description.vi}
        </span>
      );
    },
  },

  // Trạng thái
  {
    id: "isActived",
    header: "Trạng thái",
    cell: ({ row }) => {
      const isActived = row.original.status;

      return (
        <span
          className={`inline-block rounded px-2 py-1 text-xs font-semibold ${
            isActived
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {isActived ? "Hoạt động" : "Dừng hoạt động"}
        </span>
      );
    },
  },

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
      const permission = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(permission)}>
              <div className="flex gap-3 items-center">
                <Pen className="mr-2 h-4 w-4" />
                Chỉnh sửa
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="hover:!bg-red-500 text-red-500"
              onClick={() => onDelete(permission)}
            >
              <div className="flex gap-3 items-center ">
                <Trash2 className="mr-2 h-4 w-4 hover:text-white" />
                Xóa
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
