"use client";

import React from "react";
import { useGetMemberCompany } from "@/queries/useCompany";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Users,
  Mail,
  ShieldCheck,
  Calendar,
  MoreHorizontal,
  UserPlus,
  Crown,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import dayjs from "dayjs";

export default function PageMemberCompany() {
  const { data: listMemberCompany, isLoading: isLoadingMemberCompany } =
    useGetMemberCompany();

  // Hàm helper để render Badge cho Role
  const getRoleBadge = (role: string) => {
    switch (role) {
      case "RECRUITER_ADMIN":
        return (
          <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-amber-500/20">
            Admin
          </Badge>
        );
      default:
        return <Badge variant="secondary">Recruiter</Badge>;
    }
  };

  if (isLoadingMemberCompany) return <MemberTableSkeleton />;

  return (
    <div className="container mx-auto py-8 max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Thành viên công ty
          </h1>
          <p className="text-muted-foreground">
            Quản lý danh sách nhân sự và phân quyền truy cập hệ thống
          </p>
        </div>
      </div>

      <Card className="gap-3">
        <CardHeader className="">
          <CardTitle className="text-lg mt-3 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Danh sách nhân sự ({listMemberCompany?.data?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[300px]">Thành viên</TableHead>
                <TableHead>Vai trò</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày gia nhập</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listMemberCompany?.data?.map((member: any) => (
                <TableRow key={member._id} className="group">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback className="bg-primary/5 text-primary">
                          {member.name.substring(0, 1).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium flex items-center gap-1">
                          {member.name}
                          {member.employerInfo?.isOwner && (
                            <Crown
                              className="w-3 h-3 text-amber-500"
                              fill="currentColor"
                            />
                          )}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {member.email}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-muted-foreground" />
                      {getRoleBadge(member.roleID?.name?.vi)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        member.employerInfo?.userStatus === "ACTIVE"
                          ? "default"
                          : "secondary"
                      }
                      className={
                        member.employerInfo?.userStatus === "ACTIVE"
                          ? "bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20"
                          : ""
                      }
                    >
                      {member.employerInfo?.userStatus === "ACTIVE"
                        ? "Đang hoạt động"
                        : "Chờ xác nhận"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {dayjs(member.createdAt).format("DD/MM/YYYY")}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// Skeleton cho trạng thái loading
function MemberTableSkeleton() {
  return (
    <div className="container mx-auto py-8 max-w-6xl space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      <Card>
        <CardContent className="p-0">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center p-4 border-b gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
