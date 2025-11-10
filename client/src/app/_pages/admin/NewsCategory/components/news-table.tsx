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
import {
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
} from "lucide-react";
import Image from "next/image";
import {
  CategoryNewsResType,
  MetaFilterType,
  NewsResFilterType,
} from "@/schemasvalidation/NewsCategory";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { envConfig } from "../../../../../../config";

const pageSize = Number(envConfig.NEXT_PUBLIC_PAGE_SIZE);

interface NewsTableProps {
  news: NewsResFilterType[];
  categories: CategoryNewsResType[];
  onEdit: (news: NewsResFilterType) => void;
  onDelete: (id: string) => void;
  metaFilter?: MetaFilterType;
  onPageChange: (page: number) => void;
}

export function NewsTable({
  news,
  categories,
  onEdit,
  onDelete,
  metaFilter,
  onPageChange,
}: NewsTableProps) {
  if (!metaFilter || metaFilter.totalItems === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Không có bài viết nào</p>
      </div>
    );
  }
  const getCategoryName = (cateId: string) => {
    return categories.find((c) => c._id === cateId)?.name || "N/A";
  };

  if (metaFilter.totalItems === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Không có bài viết nào</p>
      </div>
    );
  }

  const startIndex = (metaFilter.current - 1) * pageSize + 1;

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
                      alt={item.title.vi}
                      fill
                      className="object-cover"
                    />
                  </div>
                </TableCell>
                <TableCell className="font-medium max-w-xs truncate">
                  {item.title.vi}
                </TableCell>
                {/* <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                  {item.summary.vi}
                </TableCell> */}
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

      <div className="flex items-center justify-between py-4 px-2">
        <div className="text-sm text-muted-foreground">
          Hiển thị {metaFilter.totalItems} bài viết liên quan
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(metaFilter.current - 1)}
            disabled={metaFilter.current === 1}
          >
            <ChevronLeft className="w-4 h-4" />
            Trước
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: metaFilter.totalPages }, (_, i) => i + 1).map(
              (page) => (
                <Button
                  key={page}
                  variant={metaFilter.current === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(page)}
                  className="min-w-10"
                >
                  {page}
                </Button>
              )
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(metaFilter.current + 1)}
            disabled={metaFilter.current === metaFilter.totalPages}
          >
            Sau
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
