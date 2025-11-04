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
import { Textarea } from "@/components/ui/textarea";

interface Category {
  _id?: string;
  name: string;
  summary: string;
  isDelete: boolean;
}

interface CategoryModalProps {
  category?: Category;
  onClose: () => void;
}

export function CategoryModal({ category, onClose }: CategoryModalProps) {
  const isEditing = !!category?._id;
  const [formData, setFormData] = useState<Category>({
    name: "",
    summary: "",
    isDelete: false,
  });

  const onSubmit = (data: Category) => {};

  useEffect(() => {
    if (category) {
      setFormData(category);
    }
  }, [category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.summary) {
      alert("Vui lòng điền tất cả các trường bắt buộc");
      return;
    }
    onSubmit(formData);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Chỉnh Sửa Danh Mục" : "Thêm Danh Mục Mới"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            {/* Name */}
            <div>
              <Label htmlFor="name">Tên Danh Mục *</Label>
              <Input
                id="name"
                placeholder="Nhập tên danh mục"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            {/* Summary */}
            <div>
              <Label htmlFor="summary">Tóm Tắt *</Label>
              <Textarea
                id="summary"
                placeholder="Nhập tóm tắt danh mục"
                value={formData.summary}
                onChange={(e) =>
                  setFormData({ ...formData, summary: e.target.value })
                }
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit">
              {isEditing ? "Cập Nhật" : "Thêm Danh Mục"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
