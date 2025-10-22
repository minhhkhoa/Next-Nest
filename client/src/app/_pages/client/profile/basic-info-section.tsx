"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Edit2, Check, X, Upload } from "lucide-react";

interface BasicInfoSectionProps {
  data: {
    name: string;
    email: string;
    avatar: string;
  };
  onUpdate: (data: any) => void;
}

export function BasicInfoSection({ data, onUpdate }: BasicInfoSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(data);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        handleChange("avatar", base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onUpdate(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData(data);
    setIsEditing(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

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
            <AvatarImage
              src={formData.avatar || "/placeholder.svg"}
              alt={formData.name}
            />
            <AvatarFallback>{getInitials(formData.name)}</AvatarFallback>
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
                  PNG, JPG, GIF (tối đa 5MB)
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
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="mt-2"
              />
            ) : (
              <p className="mt-2 text-foreground">{formData.email}</p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex gap-3 pt-4">
            <Button onClick={handleSave} className="gap-2">
              <Check className="w-4 h-4" />
              Lưu
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
              className="gap-2 bg-transparent"
            >
              <X className="w-4 h-4" />
              Hủy
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
