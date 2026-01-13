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
import { PermissionResType } from "@/schemasvalidation/permission";

export const PermissionColumns: ColumnDef<PermissionResType>[] = [
  // EMAIL
  {
    id: "name",
    header: "Tên quyền hạn",
    cell: ({ row }) => {
      const email = row.original.name;
      return (
        <span className="text-sm text-foreground truncate max-w-[200px]">
          {email.vi}
        </span>
      );
    },
  },

  // ADDRESS
  {
    id: "apiPath",
    header: "API Path",
    cell: ({ row }) => {
      const apiPath = row.original.apiPath;

      return (
        <code className="rounded bg-muted px-2 py-1 text-xs font-mono text-muted-foreground">
          {apiPath}
        </code>
      );
    },
  },

  // REGISTER TYPE (provider)
  {
    id: "method",
    header: "Phương thức",
    cell: ({ row }) => {
      const method = row.original.method;
      return (
        <span
          className={`inline-block rounded px-2 py-1 text-xs font-semibold ${getMethodBadgeColor(
            method
          )}`}
        >
          {method}
        </span>
      );
    },
  },

  {
    id: "module",
    header: "Module",
    cell: ({ row }) => {
      const moduleName = row.original.module;
      return (
        <span className="text-sm text-foreground capitalize">{moduleName}</span>
      );
    },
  },

  // Trạng thái
  {
    id: "createdBy",
    header: "Người tạo",
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
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <div className="flex gap-3 items-center">
                <Pen className="mr-2 h-4 w-4" />
                Chỉnh sửa
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem className="hover:!bg-red-500 text-red-500">
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

const getMethodBadgeColor = (method: string) => {
  const colors: Record<string, string> = {
    GET: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    POST: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    PUT: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    DELETE: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    PATCH:
      "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  };
  return colors[method] || colors.GET;
};
