"use client";

import { ColumnDef } from "@tanstack/react-table";
import { apiUserResType } from "@/schemasvalidation/user";
import { Badge } from "@/components/ui/badge";
import {
  UserX,
  Mail,
  MapPin,
  MapPinOff,
  Copy,
  User,
  MoreVertical,
  Lock,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const getUserColumns = (
  onEdit: (role: apiUserResType) => void,
  onDelete: (role: apiUserResType) => void
): ColumnDef<apiUserResType>[] => [
  // AVATAR
  {
    id: "avatar",
    header: () => (
      <div className="ml-6">
        <span className="">Người dùng</span>
      </div>
    ),
    cell: ({ row }) => {
      const avatar = row.original.user?.avatar ?? "/avatar-default.png";
      const name = row.original.user?.name;
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

  // EMAIL
  {
    id: "email",
    header: "Email",
    cell: ({ row }) => {
      const email = row.original.user?.email;
      const showEmail = email?.length > 0 ? email : "Đăng ký với fb";
      return (
        <>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <span className="text-sm text-foreground truncate max-w-[200px]">
              {showEmail}
            </span>
          </div>
        </>
      );
    },
  },

  // ADDRESS
  {
    id: "address",
    header: "Địa chỉ",
    cell: ({ row }) => {
      const address = row.original.address;
      const showAddress = address.length > 0 ? address : "Chưa cung cấp";

      return (
        <>
          <div className="flex items-center gap-2">
            {showAddress !== "Chưa cung cấp" ? (
              <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            ) : (
              <MapPinOff className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            )}
            <span className="text-sm text-foreground truncate max-w-[200px]">
              {showAddress}
            </span>
          </div>
        </>
      );
    },
  },

  // REGISTER TYPE (provider)
  {
    id: "provider",
    header: "Nguồn tài khoản",
    cell: ({ row }) => {
      const provider = row.original.user?.provider;
      return (
        <div className="flex items-center gap-2">
          <ProviderIcon provider={provider} />
          <span className="text-sm text-foreground capitalize">
            {provider?.type || "Local"}
          </span>
        </div>
      );
    },
  },

  {
    id: "roleID",
    header: "Vai trò",
    cell: ({ row }) => {
      const roleName = row.original.user?.roleID.name.vi;
      return (
        <>
          <div className="flex items-center gap-2">
            <span className="text-sm text-foreground truncate max-w-[200px]">
              {roleName}
            </span>
          </div>
        </>
      );
    },
  },

  // Trạng thái
  {
    id: "isDeleted",
    header: "Trạng thái",
    cell: ({ row }) => {
      const isDeleted = row.original.user?.isDeleted;
      return isDeleted ? (
        <Badge
          variant="secondary"
          className="bg-destructive/10 text-destructive"
        >
          <UserX className="w-3 h-3 mr-1" />
          Đã khóa
        </Badge>
      ) : (
        <Badge variant="secondary" className="bg-chart-2/10 text-chart-2">
          Hoạt động
        </Badge>
      );
    },
  },

  {
    id: "actions",
    header: "Thao tác",
    cell: ({ row }) => {
      const name = row.original.user?.name;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Hành động</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(name)}
            >
              <div className="flex gap-3 items-center">
                <Copy className="mr-2 h-4 w-4" />
                Sao chép tên
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onEdit(row.original)}>
              <div className="flex gap-3 items-center">
                <User className="mr-2 h-4 w-4" />
                Chi tiết
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="hover:!bg-red-500 text-red-500"
              onClick={() => onDelete(row.original)}
            >
              <div className="flex gap-3 items-center ">
                <Lock className="mr-2 h-4 w-4 hover:text-white" />
                Khóa tài khoản
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

function ProviderIcon({
  provider,
}: {
  provider?: { type: string; id: string };
}) {
  if (!provider) {
    return (
      <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
        <Mail className="w-3 h-3 text-muted-foreground" />
      </div>
    );
  }

  if (provider.type === "google") {
    return (
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
    );
  }

  if (provider.type === "facebook") {
    return (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    );
  }

  return (
    <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
      <Mail className="w-3 h-3 text-muted-foreground" />
    </div>
  );
}
