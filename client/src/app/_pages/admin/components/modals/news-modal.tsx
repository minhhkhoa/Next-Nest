"use client";

import type React from "react";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface Category {
  _id: string;
  name: string;
}

interface News {
  _id?: string;
  title: string;
  cateNewsID: string;
  description: string;
  image: string;
  summary: string;
  status: "active" | "inactive";
  isDelete: boolean;
}

interface NewsModalProps {
  news?: News;
  categories: Category[];
  onClose: () => void;
}

export function NewsModal({
  news,
  categories,
  onClose,
}: NewsModalProps) {
  const isEditing = !!news?._id;
  const [formData, setFormData] = useState<News>({
    title: "",
    cateNewsID: categories[0]?._id || "",
    description: "",
    image: "/news-image.jpg",
    summary: "",
    status: "active",
    isDelete: false,
  });

  const onSubmit = (data: News) => {};

  useEffect(() => {
    if (news) {
      setFormData(news);
    } else if (categories.length > 0) {
      setFormData((prev) => ({
        ...prev,
        cateNewsID: categories[0]._id,
      }));
    }
  }, [news, categories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.cateNewsID || !formData.summary) {
      alert("Vui lòng điền tất cả các trường bắt buộc");
      return;
    }
    onSubmit(formData);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Chỉnh Sửa Tin Tức" : "Thêm Tin Tức Mới"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            {/* Title */}
            <div>
              <Label htmlFor="title">Tiêu Đề *</Label>
              <Input
                id="title"
                placeholder="Nhập tiêu đề tin tức"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>

            {/* Category */}
            <div>
              <Label htmlFor="category">Danh Mục *</Label>
              <Select
                value={formData.cateNewsID}
                onValueChange={(value) =>
                  setFormData({ ...formData, cateNewsID: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat._id} value={cat._id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Summary */}
            <div>
              <Label htmlFor="summary">Tóm Tắt *</Label>
              <Input
                id="summary"
                placeholder="Nhập tóm tắt"
                value={formData.summary}
                onChange={(e) =>
                  setFormData({ ...formData, summary: e.target.value })
                }
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Mô Tả</Label>
              <Textarea
                id="description"
                placeholder="Nhập mô tả chi tiết"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
              />
            </div>

            {/* Image URL */}
            <div>
              <Label htmlFor="image">URL Hình Ảnh</Label>
              <Input
                id="image"
                placeholder="Nhập URL hình ảnh"
                value={formData.image}
                onChange={(e) =>
                  setFormData({ ...formData, image: e.target.value })
                }
              />
            </div>

            {/* Status */}
            <div>
              <Label htmlFor="status">Trạng Thái</Label>
              <Select
                value={formData.status}
                onValueChange={(value: "active" | "inactive") =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Hoạt Động</SelectItem>
                  <SelectItem value="inactive">Không Hoạt Động</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit">
              {isEditing ? "Cập Nhật" : "Thêm Tin Tức"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
