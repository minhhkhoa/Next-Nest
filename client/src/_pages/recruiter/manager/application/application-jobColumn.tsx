"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Trash2, MoreVertical, Pen, Eye } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ApplicationResType } from "@/schemasvalidation/application";

export const getApplicationColumns = (
  onView?: (application: ApplicationResType) => void,
  onEdit?: (application: ApplicationResType) => void,
  onDelete?: (application: ApplicationResType) => void,
): ColumnDef<ApplicationResType>[] => [
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
    id: "avatar",
    header: () => (
      <div className="ml-6">
        <span className="">Ứng viên</span>
      </div>
    ),
    cell: ({ row }) => {
      const user = row.original.userId;
      const name =
        typeof user === "string" ? "Người dùng đã bị xóa" : user.name;
      const avatar =
        typeof user === "string" ? null : user.avatar || "/avatar-default.webp";
      const email =
        typeof user === "string" ? "Email không xác định" : user.email;

      return (
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10 border border-border">
            <AvatarImage src={avatar || undefined} />
            <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
              {name}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex flex-col">
            <p className="text-sm font-medium text-foreground truncate">
              {name}
            </p>
            <p className="text-sm text-muted-foreground truncate">{email}</p>
          </div>
        </div>
      );
    },
  },

  //- tên công việc
  {
    id: "job",
    header: () => <span>Công việc ứng tuyển</span>,
    cell: ({ row }) => {
      const job = row.original.jobId;

      const jobTitle =
        typeof job === "string" ? "Công việc đã bị xóa" : job.title;
      const titleJob =
        typeof jobTitle === "object"
          ? jobTitle.vi || jobTitle.en || "Không có tiêu đề"
          : jobTitle;
      return (
        <p className="text-sm font-medium text-foreground max-w-[200px] whitespace-normal">
          {titleJob}
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

      return generateStatusOptions(status);
    },
  },

  //- Chủ sở hữu
  {
    id: "rating",
    header: "Mức độ tiềm năng",
    cell: ({ row }) => {
      const rating = row.original.rating!;
      return rating > 1 ? (
        generateStarRating(rating)
      ) : (
        <span className="text-sm text-muted-foreground">Chưa đánh giá</span>
      );
    },
  },

  {
    id: "actions",
    header: "Thao tác",
    cell: ({ row }) => {
      const application = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onView && (
              <DropdownMenuItem onClick={() => onView && onView(application)}>
                <div className="flex gap-3 items-center">
                  <Eye className="mr-2 h-4 w-4" />
                  Xem chi tiết
                </div>
              </DropdownMenuItem>
            )}
            {onEdit && (
              <DropdownMenuItem onClick={() => onEdit && onEdit(application)}>
                <div className="flex gap-3 items-center">
                  <Pen className="mr-2 h-4 w-4" />
                  Phản hồi
                </div>
              </DropdownMenuItem>
            )}

            {onDelete && (
              <DropdownMenuItem
                className="hover:!bg-red-500 text-red-500"
                onClick={() => onDelete && onDelete(application)}
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

export const generateStatusOptions = (status: string) => {
  switch (status) {
    case "PENDING":
      return (
        <span className="inline-block rounded px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800">
          Chờ xử lý
        </span>
      );
    case "REVIEWING":
      return (
        <span className="inline-block rounded px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800">
          {" "}
          Đang xem xét
        </span>
      );
    case "INTERVIEW":
      return (
        <span className="inline-block rounded px-2 py-1 text-xs font-semibold bg-green-100 text-green-800">
          Phỏng vấn
        </span>
      );

    case "APPROVED":
      return (
        <span className="inline-block rounded px-2 py-1 text-xs font-semibold bg-green-100 text-green-800">
          Chấp nhận
        </span>
      );

    case "REJECTED":
      return (
        <span className="inline-block rounded px-2 py-1 text-xs font-semibold bg-red-100 text-red-800">
          Từ chối
        </span>
      );

    default:
      return (
        <span className="inline-block rounded px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-800">
          Chưa xác định
        </span>
      );
  }
};

export const generateStarRating = (rating: number) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= rating) {
      stars.push(
        <svg
          key={i}
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 24 24"
          className="w-4 h-4 text-yellow-400"
        >
          <path d="M12 .587l3.668 7.431L24 9.748l-6 5.847L19.335 24 12 20.201 4.665 24 6 15.595 0 9.748l8.332-1.73z" />
        </svg>,
      );
    } else {
      stars.push(
        <svg
          key={i}
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 24 24"
          className="w-4 h-4 text-gray-300"
        >
          <path d="M12 .587l3.668 7.431L24 9.748l-6 5.847L19.335 24 12 20.201 4.665 24 6 15.595 0 9.748l8.332-1.73z" />
        </svg>,
      );
    }
  }
  return <div className="flex">{stars}</div>;
};
