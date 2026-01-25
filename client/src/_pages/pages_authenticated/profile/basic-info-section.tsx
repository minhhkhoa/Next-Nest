"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Edit2, Check, X, Upload } from "lucide-react";
import { useAppStore } from "@/components/TanstackProvider";
import { handleInitName, uploadToCloudinary } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import { useUpdateUserMutate } from "@/queries/useUser";
import SoftSuccessSonner from "@/components/shadcn-studio/sonner/SoftSuccessSonner";

export function BasicInfoSection() {
  const { mutateAsync: userUpdateMutate } = useUpdateUserMutate();
  const { user } = useAppStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(user);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);


  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setIsUploading(true);
      const file = e.target.files?.[0];
      if (!file) return;

      const url = await uploadToCloudinary(file);
      setFormData((prev) => ({ ...prev, avatar: url }));
    } catch (error) {
      console.log("Lỗi upload media: ", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const id = formData._id;
      const payload = {
        name: formData.name,
        avatar: formData.avatar,
      };

      const res = await userUpdateMutate({ id, payload });

      if (res.isError) return;

      SoftSuccessSonner(`${res.message}`);

      setIsEditing(false);
    } catch (error) {
      console.log("Save error: ", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(formData);
    setIsEditing(false);
  };

  useEffect(() => {
    if (user) setFormData(user);
  }, [user]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-foreground">
          Thông tin cơ bản
        </h2>
        {!isEditing && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="gap-2"
          >
            <Edit2 className="w-4 h-4" />
            Chỉnh sửa
          </Button>
        )}
      </div>

      <div className="space-y-6">
        {/* Avatar Section */}
        <div className="flex items-center gap-6">
          <Avatar className="w-32 h-32">
            <AvatarImage src={formData?.avatar || ""} alt={formData.name} />
            <AvatarFallback>{handleInitName(formData.name)}</AvatarFallback>
          </Avatar>

          {isEditing && (
            <div className="flex-1 space-y-3">
              <div>
                <Label htmlFor="avatar-upload" className="text-sm font-medium">
                  Tải lên Avatar
                </Label>
                <div className="mt-2 flex items-center gap-2">
                  <Input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="cursor-pointer"
                  />
                  <Upload className="w-4 h-4 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG, GIF (tối đa 2MB)
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Name and Email */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name" className="text-sm font-medium">
              Họ và tên
            </Label>
            {isEditing ? (
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="mt-2"
              />
            ) : (
              <p className="mt-2 text-foreground">{formData.name}</p>
            )}
          </div>

          <div>
            <Label htmlFor="email" className="text-sm font-medium">
              Email
            </Label>
            {isEditing ? (
              <Input
                id="email"
                type="email"
                value={
                  formData.email
                    ? formData.email
                    : "Tài khoản đăng nhập với FaceBook"
                }
                className="mt-2"
                readOnly
              />
            ) : (
              <p className="mt-2 text-foreground">
                {formData.email
                  ? formData.email
                  : "Tài khoản đăng nhập với FaceBook"}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex gap-3 pt-4 justify-end">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="gap-2 bg-transparent"
            >
              <X className="w-4 h-4" />
              Hủy
            </Button>
            <Button
              onClick={handleSave}
              className="gap-2"
              disabled={isSaving || isUploading}
            >
              {(isSaving || isUploading) && <Spinner />}
              <Check className="w-4 h-4" />
              Lưu
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
