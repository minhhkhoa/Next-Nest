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
import { Edit2, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

interface Category {
  _id: string;
  name: string;
}

interface News {
  _id: string;
  title: string;
  cateNewsID: string;
  description: string;
  image: string;
  summary: string;
  status: "active" | "inactive";
  isDelete: boolean;
}

interface NewsTableProps {
  news: News[];
  categories: Category[];
  onEdit: (news: News) => void;
  onDelete: (id: string) => void;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

export function NewsTable({
  news,
  categories,
  onEdit,
  onDelete,
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
}: NewsTableProps) {
  const getCategoryName = (cateId: string) => {
    return categories.find((c) => c._id === cateId)?.name || "N/A";
  };

  if (totalItems === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Không có bài viết nào</p>
      </div>
    );
  }

  const itemsPerPage = 10;
  const startIndex = (currentPage - 1) * itemsPerPage + 1;

  return (
    <div className="space-y-4">
      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary">
              <TableHead>Hình Ảnh</TableHead>
              <TableHead>Tiêu Đề</TableHead>
              <TableHead>Danh Mục</TableHead>
              <TableHead>Tóm Tắt</TableHead>
              <TableHead>Trạng Thái</TableHead>
              <TableHead className="text-right">Hành Động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {news.map((item) => (
              <TableRow key={item._id} className="hover:bg-secondary/50">
                <TableCell>
                  <div className="relative w-16 h-16 rounded overflow-hidden">
                    <Image
                      src={item.image || "/placeholder.svg"}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                </TableCell>
                <TableCell className="font-medium max-w-xs truncate">
                  {item.title}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {getCategoryName(item.cateNewsID)}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                  {item.summary}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={item.status === "active" ? "default" : "secondary"}
                  >
                    {item.status === "active" ? "Hoạt Động" : "Không Hoạt Động"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(item)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(item._id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between py-4 px-2">
        <div className="text-sm text-muted-foreground">
          Hiển thị {startIndex}-
          {Math.min(startIndex + news.length - 1, totalItems)} trong{" "}
          {totalItems} bài viết
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4" />
            Trước
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(page)}
                className="min-w-10"
              >
                {page}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Sau
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
