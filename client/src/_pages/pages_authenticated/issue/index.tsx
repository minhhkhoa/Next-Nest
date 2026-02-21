"use client";

import React, { useState } from "react";
import { useGetMyIssue, useDeleteIssue } from "@/queries/useIssue";
import IssueCard from "./components/IssueCard";
import IssueEditDialog from "./components/IssueEditDialog";
import { Input } from "@/components/ui/input";
import { Loader2, Search, ArchiveX } from "lucide-react";
import DataTablePagination from "@/components/DataTablePagination";
import { IssueResType } from "@/schemasvalidation/issue";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import SoftDestructiveSonner from "@/components/shadcn-studio/sonner/SoftDestructiveSonner";
import SoftSuccessSonner from "@/components/shadcn-studio/sonner/SoftSuccessSonner";
import { useDebounce } from "use-debounce";
import ListIssueSkeleton from "@/components/skeletons/list-issue";

export default function PageMyIssue() {
  const [page, setPage] = useState(1);
  const [searchText, setSearchText] = useState("");

  //- Debounce search input để tránh gọi API quá nhiều
  const [debouncedSearch] = useDebounce(searchText, 500);

  const { data, isLoading, isError } = useGetMyIssue({
    currentPage: page,
    pageSize: 8,
    searchText: debouncedSearch,
  });

  const deleteMutation = useDeleteIssue();
  const [editingIssue, setEditingIssue] = useState<IssueResType | undefined>(
    undefined,
  );
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [issueToDelete, setIssueToDelete] = useState<string | null>(null);

  const handleEdit = (issue: IssueResType) => {
    setEditingIssue(issue);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setIssueToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (issueToDelete) {
      try {
        await deleteMutation.mutateAsync(issueToDelete);
        SoftSuccessSonner("Đã xóa vấn đề thành công");
      } catch (e) {
        SoftDestructiveSonner("Xóa vấn đề thất bại");
      } finally {
        setDeleteDialogOpen(false);
        setIssueToDelete(null);
      }
    }
  };

  const onPageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vấn đề của tôi</h1>
          <p className="text-muted-foreground mt-1">
            Quản lý và theo dõi trạng thái các vấn đề bạn đã gửi.
          </p>
        </div>
        <div className="relative w-full md:w-auto min-w-[300px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Tìm kiếm vấn đề..."
            className="pl-9 w-full"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {isLoading ? (
          <ListIssueSkeleton />
        ) : isError ? (
          <div className="flex flex-col items-center justify-center p-8 text-center h-full">
            <ArchiveX className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-destructive">
              Đã xảy ra lỗi khi tải dữ liệu
            </h3>
            <p className="text-muted-foreground">Vui lòng thử lại sau.</p>
          </div>
        ) : !data?.data?.result || data?.data?.result.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-center border-2 border-dashed rounded-lg bg-muted/20">
            <ArchiveX className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-medium">Không tìm thấy vấn đề nào</h3>
            <p className="text-muted-foreground mt-1">
              Bạn chưa gửi vấn đề nào hoặc không tìm thấy kết quả phù hợp.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data?.data?.result.map((issue) => (
              <IssueCard
                key={issue._id}
                issue={issue}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {data?.data?.meta && data.data.meta.totalItems > 0 && (
        <DataTablePagination
          meta={{
            current: data.data.meta.current,
            pageSize: data.data.meta.pageSize,
            totalPages: data.data.meta.totalPages,
            totalItems: data.data.meta.totalItems,
          }}
          onPageChange={onPageChange}
        />
      )}

      {/* Edit Dialog */}
      {editingIssue && (
        <IssueEditDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          issue={editingIssue}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bạn có chắc chắn muốn xóa?</DialogTitle>
            <DialogDescription>
              Hành động này không thể hoàn tác. Vấn đề này sẽ bị xóa vĩnh viễn
              khỏi hệ thống.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              {deleteMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
