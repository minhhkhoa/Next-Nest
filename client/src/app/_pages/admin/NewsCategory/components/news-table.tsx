"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2, MoreVertical } from "lucide-react";
import Image from "next/image";
import {
  MetaFilterType,
  NewsResFilterType,
} from "@/schemasvalidation/NewsCategory";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Spinner } from "@/components/ui/spinner";

interface NewsTableProps {
  news: NewsResFilterType[];
  onEdit: (news: NewsResFilterType) => void;
  onDelete: (id: string) => void;
  newsPending: boolean;
  metaFilter?: MetaFilterType;
  onPageChange: (page: number) => void;
}

export function NewsTable({
  news,
  onEdit,
  onDelete,
  newsPending,
  metaFilter,
  onPageChange,
}: NewsTableProps) {
  if (newsPending) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Spinner className="mb-3" />
        <p className="text-muted-foreground">Đang tải...</p>
      </div>
    );
  }

  if (!metaFilter || metaFilter.totalItems === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Không có bài viết nào</p>
      </div>
    );
  }

  if (metaFilter.totalItems === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Không có bài viết nào</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary">
              <TableHead>Hình Ảnh</TableHead>
              <TableHead>Tiêu Đề</TableHead>
              <TableHead>Trạng Thái</TableHead>
              <TableHead>Ngày viết</TableHead>
              <TableHead>Tác giả</TableHead>
              <TableHead className="text-right">Hành Động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {news.map((item) => (
              <TableRow key={item._id} className="hover:bg-secondary/50">
                <TableCell>
                  <div className="relative w-16 h-16 rounded overflow-hidden">
                    <Image
                      src={item?.image || "/placeholder.svg"}
                      alt={item.title.vi || "placeholder"}
                      fill
                      className="object-cover"
                    />
                  </div>
                </TableCell>

                {/* tieu de */}
                <TableCell className="font-medium max-w-xs truncate">
                  {item.title.vi}
                </TableCell>

                {/* trang thai */}
                <TableCell>
                  <Badge
                    variant={item.status === "active" ? "default" : "secondary"}
                    className="flex items-center gap-2"
                  >
                    {/* Chấm màu */}
                    <span
                      className={`h-2 w-2 rounded-full ${
                        item.status === "active" ? "bg-green-500" : "bg-red-500"
                      }`}
                    ></span>

                    {/* Text */}
                    {item.status === "active" ? "Hoạt Động" : "Không Hoạt Động"}
                  </Badge>
                </TableCell>

                {/* ngay viet */}
                <TableCell>
                  <span>
                    {new Date(item.createdAt).toLocaleDateString("vi-VN")}
                  </span>
                </TableCell>

                {/* tac gia */}
                <TableCell>
                  <span>{item.createdBy?.name || ""}</span>
                </TableCell>

                {/* hanh dong */}
                <TableCell className="text-center">
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="group-hover:opacity-100 transition-opacity p-1.5 hover:bg-secondary rounded">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-40 p-2">
                      <div className="flex flex-col justify-items-start">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(item)}
                          className="flex gap-2 !justify-start"
                        >
                          <Edit2 className="w-4 h-4" />
                          <span>Chỉnh sửa</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(item._id)}
                          className="text-destructive hover:text-destructive flex gap-2 !justify-start"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Xóa</span>
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* pagination */}
      <div className="flex flex-col md:flex-row items-center py-4 px-2">
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          Hiển thị {news.length}/{metaFilter.totalItems} bài viết liên quan
        </span>

        <Pagination className="flex justify-center md:justify-end">
          <PaginationContent>
            {/* Nút Trước */}
            <PaginationItem>
              <PaginationPrevious
                onClick={() => onPageChange(metaFilter.current - 1)}
                aria-disabled={metaFilter.current === 1}
                className={
                  metaFilter.current === 1
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationItem>

            {/* Các trang */}
            {Array.from({ length: metaFilter.totalPages }, (_, i) => i + 1).map(
              (page) => {
                // Nếu tổng số trang lớn, hiển thị rút gọn với Ellipsis
                if (metaFilter.totalPages > 5) {
                  const firstPage = page === 1;
                  const lastPage = page === metaFilter.totalPages;
                  const nearCurrent = Math.abs(metaFilter.current - page) <= 1;

                  if (firstPage || lastPage || nearCurrent) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          isActive={metaFilter.current === page}
                          onClick={() => onPageChange(page)}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  }

                  // Dấu "..." giữa các khoảng
                  if (
                    (page === 2 && metaFilter.current > 3) ||
                    (page === metaFilter.totalPages - 1 &&
                      metaFilter.current < metaFilter.totalPages - 2)
                  ) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                  }

                  return null;
                }

                // Trường hợp ít trang
                return (
                  <PaginationItem key={page}>
                    <PaginationLink
                      isActive={metaFilter.current === page}
                      onClick={() => onPageChange(page)}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                );
              }
            )}

            {/* Nút Sau */}
            <PaginationItem>
              <PaginationNext
                onClick={() => onPageChange(metaFilter.current + 1)}
                aria-disabled={metaFilter.current === metaFilter.totalPages}
                className={
                  metaFilter.current === metaFilter.totalPages
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
