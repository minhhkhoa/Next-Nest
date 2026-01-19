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
import {
  useCreateCategoryNewsMutation,
  useUpdateCategoryNewsMutation,
} from "@/queries/useNewsCategory";
import { Category } from "@/schemasvalidation/NewsCategory";
import { Spinner } from "@/components/ui/spinner";
import SoftSuccessSonner from "@/components/shadcn-studio/sonner/SoftSuccessSonner";

interface CategoryModalProps {
  category?: Category;
  onClose: () => void;
}

export function CategoryModal({ category, onClose }: CategoryModalProps) {
  const isEditing = !!category?._id;
  const [formData, setFormData] = useState<Category>({
    name: {
      vi: "",
      en: "",
    },
    summary: {
      vi: "",
      en: "",
    },
  });
  const [error, setError] = useState({
    name: false,
    summary: false,
  });

  const { mutateAsync: createCateNewsMutation, isPending: isCreating } =
    useCreateCategoryNewsMutation();

  const { mutateAsync: updateCateNewsMutation, isPending: isUpdating } =
    useUpdateCategoryNewsMutation();

  useEffect(() => {
    if (category) {
      setFormData(category);
    }
  }, [category]);

  const handleSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      if (!formData.name.vi || !formData.summary.vi) {
        setError({ name: !formData.name.vi, summary: !formData.summary.vi });
        return;
      }

      const payload = {
        name: formData.name.vi,
        summary: formData.summary.vi,
      };

      if (isEditing) {
        const resUpdate = await updateCateNewsMutation({
          id: category?._id || "",
          payload,
        });
        if (resUpdate.isError) return;

        SoftSuccessSonner(resUpdate.message);
      } else {
        const resCreate = await createCateNewsMutation(payload);
        if (resCreate.isError) return;

        setFormData({
          name: { vi: "", en: "" },
          summary: { vi: "", en: "" },
        });
        setError({ name: false, summary: false });

        SoftSuccessSonner(resCreate.message);
      }
    } catch (error) {
      console.log("error handleSubmit CategoryNews: ", error);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            {/* Name */}
            <div>
              <Label className="mb-2" htmlFor="name">
                Tên danh mục
              </Label>
              <Input
                id="name"
                placeholder="Nhập tên danh mục"
                value={formData.name.vi}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    name: { ...formData.name, vi: e.target.value },
                  })
                }
                className={error.name ? "border-destructive" : ""}
              />
              {error.name && (
                <span className="text-sm text-destructive pl-1">
                  Vui lọc nhập tên danh mục
                </span>
              )}
            </div>

            {/* Summary */}
            <div>
              <Label className="mb-2" htmlFor="summary">
                Tóm tắt
              </Label>
              <Textarea
                id="summary"
                placeholder="Nhập tóm tắt danh mục"
                value={formData.summary.vi}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    summary: { ...formData.summary, vi: e.target.value },
                  })
                }
                className={error.summary ? "border-destructive" : ""}
                rows={3}
              />
              {error.summary && (
                <span className="text-sm text-destructive pl-1">
                  Vui lọc nhập tóm tắt danh mục
                </span>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button disabled={isCreating || isUpdating} type="submit">
              {(isCreating || isUpdating) && <Spinner />}
              {isEditing ? "Cập Nhật" : "Thêm Danh Mục"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
