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
import { CompanyResType } from "@/schemasvalidation/company";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const getCompanyColumns = (
  onEdit: (company: CompanyResType) => void,
  onDelete: (company: CompanyResType) => void,
): ColumnDef<CompanyResType>[] => [
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

  //- logo & name
  {
    id: "logo",
    header: () => <span className="!ml-5">Mã số thuế</span>,
    cell: ({ row }) => {
      const avatar = row?.original?.logo ?? "/avatar-default.webp";
      const name = row?.original?.name?.vi;
      return (
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10 border border-border">
            <AvatarImage src={avatar || undefined} />
            <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
              {name}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {name}
            </p>
          </div>
        </div>
      );
    },
  },

  //- taxCode
  {
    id: "taxCode",
    header: () => <span className="!ml-5">Mã số thuế</span>,
    cell: ({ row }) => {
      return (
        <span className="text-sm text-foreground truncate max-w-[180px] !ml-5">
          {row.original.taxCode}
        </span>
      );
    },
  },

  //- ADDRESS
  {
    id: "address",
    header: "Vị trí công ty",
    cell: ({ row }) => {
      const address = row.original?.address;

      return (
        <span className="inline-block rounded max-w-[350px] whitespace-normal truncate text-foreground">
          {address}
        </span>
      );
    },
  },

  {
    id: "status",
    header: "Trạng thái",
    cell: ({ row }) => {
      const status = row.original.status;

      return (
        <span
          className={`inline-block rounded px-2 py-1 text-xs font-semibold ${
            status === "ACCEPT"
              ? "bg-green-100 text-green-800"
              : status === "PENDING"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"
          }`}
        >
          {status === "ACCEPT"
            ? "Hoạt động"
            : status === "PENDING"
              ? "Chờ phê duyệt"
              : "Đã từ chối"}
        </span>
      );
    },
  },

  {
    id: "isDeleted",
    header: "Tình trạng",
    cell: ({ row }) => {
      const isDeleted = row.original.isDeleted;

      return (
        <span
          className={`inline-block rounded px-2 py-1 text-xs font-semibold ${
            isDeleted
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {isDeleted ? "Hoạt động" : "Đã xóa"}
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
