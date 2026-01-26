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
  Crown,
  CheckCheck,
  CircleX,
  Check,
  Trash2, // Thêm Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import dayjs from "dayjs";
import { MemberTableSkeleton } from "@/components/skeletons/company-skeleton";
import { useApproveJoinRequestMutate } from "@/queries/useUser";
import SoftSuccessSonner from "@/components/shadcn-studio/sonner/SoftSuccessSonner";
import { envConfig } from "../../../../../config";

export default function PageMemberCompany() {
  const { data: listMemberCompany, isLoading: isLoadingMemberCompany } =
    useGetMemberCompany();
  const { mutateAsync: approveMutation, isPending: isApproving } =
    useApproveJoinRequestMutate();

  // Giả sử Khoa có mutation xóa thành viên
  // const { mutateAsync: deleteMember, isPending: isDeleting } = useDeleteMemberMutate();

  const handleAction = async (userId: string, action: "ACCEPT" | "REJECT") => {
    try {
      const res = await approveMutation({ targetUserId: userId, action });
      if (res?.isError) return;
      SoftSuccessSonner(
        action === "ACCEPT" ? "Đã chấp nhận thành viên" : "Đã từ chối yêu cầu",
      );
    } catch (error) {
      console.log("error handle approve request: ", error);
    }
  };

  const handleDelete = async (userId: string) => {
    // Logic xác nhận trước khi xóa (Window confirm hoặc Dialog)
    if (confirm("Bạn có chắc chắn muốn xóa thành viên này khỏi công ty?")) {
      try {
        console.log("Xóa user ID:", userId);
        // await deleteMember(userId);
        SoftSuccessSonner("Xóa thành viên thành công");
      } catch (error) {
        console.log("error delete member: ", error);
      }
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case envConfig.NEXT_PUBLIC_ROLE_RECRUITER_ADMIN:
        return (
          <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Thành viên công ty
          </h1>
          <p className="text-muted-foreground">
            Quản lý danh sách nhân sự và phân quyền
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Danh sách nhân sự ({listMemberCompany?.data?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[280px]">Thành viên</TableHead>
                <TableHead>Vai trò</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày gia nhập</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listMemberCompany?.data?.map((member: any) => {
                const isPending = member.employerInfo?.userStatus !== "ACTIVE";
                const isAdmin =
                  member.roleID?.name?.vi ===
                  envConfig.NEXT_PUBLIC_ROLE_RECRUITER_ADMIN;

                return (
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
                          <span className="font-medium flex items-center gap-1 text-sm">
                            {member.name}
                            {member.employerInfo?.isOwner && (
                              <Crown
                                className="w-3 h-3 text-amber-500"
                                fill="currentColor"
                              />
                            )}
                          </span>
                          <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                            <Mail className="inline-block w-3 h-3 mr-1" />
                            {member.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {isAdmin && (
                        <ShieldCheck className="inline-block w-3 h-3 mr-1 text-amber-600" />
                      )}
                      {getRoleBadge(member.roleID?.name?.vi)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={!isPending ? "outline" : "secondary"}
                        className={
                          !isPending
                            ? "bg-green-500/10 text-green-600 border-green-500/20"
                            : ""
                        }
                      >
                        {!isPending ? "Đang hoạt động" : "Chờ xác nhận"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      <Calendar className="inline-block w-3 h-3 mr-1" />
                      {dayjs(member.createdAt).format("DD/MM/YYYY")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end items-center gap-1">
                        {isPending ? (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 text-green-600 hover:bg-green-50"
                              onClick={() => handleAction(member._id, "ACCEPT")}
                              disabled={isApproving}
                            >
                              <CheckCheck className="mr-1 h-4 w-4" /> Chấp nhận
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 text-destructive hover:bg-red-50"
                              onClick={() => handleAction(member._id, "REJECT")}
                              disabled={isApproving}
                            >
                              <CircleX className="mr-1 h-4 w-4" /> Từ chối
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-green-600"
                            >
                              <Check className="w-4 h-4" />
                            </Button>

                            {/* Chỉ hiện nút Xóa nếu không phải Admin */}
                            {!isAdmin && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-red-50"
                                onClick={() => handleDelete(member._id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
