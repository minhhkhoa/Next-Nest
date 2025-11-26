"use client";

import { MultiSelectTree } from "@/app/_pages/components/multi-select-industry";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SkillResType } from "@/schemasvalidation/skill";
import React, { useMemo, useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useCreateSkill, useUpdateSkill } from "@/queries/useSkill";
import { Spinner } from "@/components/ui/spinner";

interface Option {
  value: string;
  label: { vi: string; en: string };
}

interface SkillFormProps {
  skill?: SkillResType | null; // null = thêm mới, có dữ liệu = sửa
  onCancel: () => void;
  // onSave: (data: any) => Promise<void>; // bạn sẽ gọi API ở đây
}

export default function SkillModalForm({
  skill,
  onCancel,
}: // onSave,
SkillFormProps) {
  const isEditMode = !!skill?._id;

  // Khởi tạo formData đúng cách cho cả thêm và sửa
  const [formData, setFormData] = useState<{
    _id?: string;
    name: { vi: string; en: string };
    industryID: Array<{
      _id: string;
      name: { vi: string; en: string };
      parentId?: string | null;
    }>;
  }>({
    name: { vi: "", en: "" },
    industryID: [],
    ...(skill || {}), // nếu có skill → override, không có → giữ rỗng
  });
  const [formErrors, setFormErrors] = useState<{
    field: string;
    message: string;
  }>({
    field: "",
    message: "",
  });

  // Khi props skill thay đổi (ví dụ mở modal khác), cập nhật lại form
  useEffect(() => {
    if (skill) {
      setFormData(skill);
    } else {
      setFormData({
        name: { vi: "", en: "" },
        industryID: [],
      });
    }
  }, [skill]);

  // Chuyển industryID → Option[] để truyền vào MultiSelectTree
  const selectedIndustryOptions: Option[] = useMemo(() => {
    return formData.industryID.map((ind) => ({
      value: ind._id,
      label: ind.name,
    }));
  }, [formData.industryID]);

  // Xử lý thay đổi ngành nghề
  const handleIndustryChange = (options: Option[]) => {
    const selectedIndustries = options.map((opt) => {
      // Tìm lại thông tin đầy đủ từ formData cũ (giữ parentId nếu có)
      const existing = formData.industryID.find((i) => i._id === opt.value);
      return {
        _id: opt.value,
        name: opt.label,
        parentId: existing?.parentId || null,
      };
    });

    setFormData((prev) => ({ ...prev, industryID: selectedIndustries }));
  };

  const { mutateAsync: createSkillMutation, isPending: isCreating } =
    useCreateSkill();
  const { mutateAsync: updateSkillMutation, isPending: isUpdating } =
    useUpdateSkill();

  // Xử lý submit
  const handleSubmit = async () => {
    if (!formData.name.vi.trim()) {
      setFormErrors({ field: "name", message: "Vui lý nhập tên kỹ năng" });
      return;
    }

    const payload = {
      name: formData.name.vi.trim(),
      industryID: formData.industryID.map((ind) => ind._id), // chỉ gửi mảng ID
    };

    try {
      if (isEditMode) {
        const resUpdate = await updateSkillMutation({
          id: skill?._id || "",
          payload,
        });
        if (resUpdate.isError) return;
        toast.success(resUpdate.message);
      } else {
        const resCreate = await createSkillMutation(payload);
        if (resCreate.isError) return;
        toast.success(resCreate.message);
      }
      onCancel();
    } catch (error) {
      console.error("Lỗi khi lưu skill:", error);
    }
  };

  return (
    <Dialog open onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Chỉnh sửa kỹ năng" : "Thêm kỹ năng mới"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div>
            <Label htmlFor="name-vi" className="text-sm font-medium">
              Tên kỹ năng <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name-vi"
              value={formData.name.vi || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  name: { ...prev.name, vi: e.target.value },
                }))
              }
              placeholder="Ví dụ: ReactJS, Node.js, Thiết kế UI/UX..."
              className="mt-2"
            />
            {formErrors.field === "name" && (
              <p className="text-sm text-red-500 mt-1">{formErrors.message}</p>
            )}
          </div>

          {/* Chuyên ngành */}
          <div>
            <Label className="text-sm font-medium">Ngành nghề liên quan</Label>
            <MultiSelectTree
              selected={selectedIndustryOptions}
              onChange={handleIndustryChange}
              placeholder="Chọn một hoặc nhiều ngành nghề..."
              className="mt-2"
            />
          </div>
        </div>

        <DialogFooter className="relative">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isCreating || isUpdating}
          >
            Hủy
          </Button>
          <Button onClick={handleSubmit} type="submit">
            {isCreating || isUpdating ? (
              <>
                <Spinner className="mr-2 h-4 w-4 animate-spin" />
                Đang xử lý...
              </>
            ) : isEditMode ? (
              "Cập nhật"
            ) : (
              "Thêm mới"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
